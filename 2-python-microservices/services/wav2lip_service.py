import os
import sys
import uuid
import shutil
import subprocess
import tempfile
import logging
from pydub import AudioSegment

from services.ffmpeg_service import ensure_ffmpeg_path
from services.video_utils import (
    get_video_fps,
    get_video_duration,
    match_audio_to_video,
)

logger = logging.getLogger("services.wav2lip_service")
logger.setLevel(logging.INFO)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WAV2LIP_DIR = os.path.join(BASE_DIR, "wav2lip")
MODELS_DIR = os.path.join(BASE_DIR, "models", "wav2lip")

OUTPUT_DIR = os.path.join(BASE_DIR, "uploads", "dubbed")
TEMP_DIR = os.path.join(BASE_DIR, "temp")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# ------------------------------------------------------------
# MODEL DISCOVERY
# ------------------------------------------------------------
POSSIBLE_MODEL_PATHS = [
    os.path.join(WAV2LIP_DIR, "checkpoints", "wav2lip_gan.pth"),
    os.path.join(MODELS_DIR, "wav2lip_gan.pth"),
]

WAV2LIP_MODEL = None
for p in POSSIBLE_MODEL_PATHS:
    if os.path.exists(p):
        WAV2LIP_MODEL = p
        break

if not WAV2LIP_MODEL:
    raise FileNotFoundError("wav2lip_gan.pth not found")

os.makedirs(os.path.join(WAV2LIP_DIR, "checkpoints"), exist_ok=True)
dst = os.path.join(WAV2LIP_DIR, "checkpoints", "wav2lip_gan.pth")
if not os.path.exists(dst):
    shutil.copy2(WAV2LIP_MODEL, dst)

# ------------------------------------------------------------
# AUDIO
# ------------------------------------------------------------
def convert_audio_to_wav(inp, out):
    ffmpeg = ensure_ffmpeg_path()
    cmd = [
        ffmpeg, "-y",
        "-i", inp,
        "-ar", "16000",
        "-ac", "1",
        "-acodec", "pcm_s16le",
        out
    ]
    subprocess.run(cmd, check=True)
    return out

# ------------------------------------------------------------
# VIDEO PREP (LOWER COST)
# ------------------------------------------------------------
def prepare_video(video, out, fps):
    ffmpeg = ensure_ffmpeg_path()
    cmd = [
        ffmpeg, "-y",
        "-i", video,
        "-vf", "scale=iw/2:ih/2",
        "-r", str(fps),
        "-pix_fmt", "yuv420p",
        "-vsync", "cfr",
        out
    ]
    subprocess.run(cmd, check=True)
    return out

# ------------------------------------------------------------
# WAV2LIP
# ------------------------------------------------------------
def run_wav2lip(video, audio):
    python = sys.executable
    infer = os.path.join(WAV2LIP_DIR, "inference.py")

    out = os.path.join(OUTPUT_DIR, f"dubbed_{uuid.uuid4().hex}.mp4")

    cmd = [
        python, infer,
        "--checkpoint_path", WAV2LIP_MODEL,
        "--face", os.path.abspath(video),
        "--audio", os.path.abspath(audio),
        "--outfile", os.path.abspath(out),

        "--pads", "0", "20", "0", "0",
        "--face_det_batch_size", "1",
        "--wav2lip_batch_size", "4",
        "--resize_factor", "2",
        "--nosmooth"
    ]

    logger.info("Running Wav2Lip...")
    result = subprocess.run(
        cmd,
        cwd=WAV2LIP_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr[-1500:])

    return out

# ------------------------------------------------------------
# FINAL MERGE
# ------------------------------------------------------------
def merge(video, audio, out, fps):
    ffmpeg = ensure_ffmpeg_path()
    cmd = [
        ffmpeg, "-y",
        "-i", video,
        "-i", audio,
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        out
    ]
    subprocess.run(cmd, check=True)
    return out

# ------------------------------------------------------------
# PUBLIC API
# ------------------------------------------------------------
def create_dubbed_video(video_path, audio_path, out_name=None):
    temp = tempfile.mkdtemp(dir=TEMP_DIR)

    try:
        fps = get_video_fps(video_path)

        wav = os.path.join(temp, "audio.wav")
        convert_audio_to_wav(audio_path, wav)

        matched = os.path.join(temp, "matched.wav")
        match_audio_to_video(wav, video_path, matched)

        prep = os.path.join(temp, "video.mp4")
        prepare_video(video_path, prep, fps)

        try:
            out = run_wav2lip(prep, matched)
        except Exception as e:
            logger.error("Wav2Lip failed, falling back to audio-only merge")
            out = os.path.join(OUTPUT_DIR, f"fallback_{uuid.uuid4().hex}.mp4")
            merge(prep, matched, out, fps)

        if out_name:
            final = os.path.join(OUTPUT_DIR, out_name)
            shutil.move(out, final)
            return final

        return out

    finally:
        shutil.rmtree(temp, ignore_errors=True)
