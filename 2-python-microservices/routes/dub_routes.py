# routes/dub_routes.py
# STABLE dubbing pipeline (Whisper → Translate → TTS → FFmpeg)

print("🔥 dub_routes.py LOADED", flush=True)

from flask import Blueprint, request, jsonify, send_from_directory
import os, tempfile, uuid, subprocess, logging, time

from services.whisper_service import transcribe_file
from services.translate_service import translate_text, SUPPORTED_LANGS
from services.tts_service import generate_tts
from services.ffmpeg_service import ensure_ffmpeg_path

logger = logging.getLogger("dub_routes")
logger.setLevel(logging.INFO)

dub_bp = Blueprint("dub", __name__)
ffmpeg = ensure_ffmpeg_path()

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
TTS_DIR = os.path.join(UPLOAD_DIR, "tts")
DUB_DIR = os.path.join(UPLOAD_DIR, "dubbed")

os.makedirs(TTS_DIR, exist_ok=True)
os.makedirs(DUB_DIR, exist_ok=True)


@dub_bp.route("/dub", methods=["POST"])
def dub_video():
    logger.info("🎬 STABLE DUB REQUEST")

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    video_file = request.files["file"]
    target_lang = request.form.get("target_lang", "hi")
    voice = request.form.get("voice", "female")  # ✅ FIXED: read voice from request

    logger.info(f"🎙 Voice gender selected: {voice}")

    if target_lang not in SUPPORTED_LANGS:
        return jsonify({"error": f"Unsupported target language: {target_lang}"}), 400

    tmp_video = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    video_file.save(tmp_video.name)

    tmp_audio = None

    try:
        # --------------------------------------------------
        # 1️⃣ Extract audio
        # --------------------------------------------------
        logger.info("🔊 Extracting audio")
        tmp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")

        subprocess.run([
            ffmpeg, "-y",
            "-i", tmp_video.name,
            "-vn",
            "-ac", "1",
            "-ar", "16000",
            "-acodec", "pcm_s16le",
            tmp_audio.name
        ], check=True)

        # --------------------------------------------------
        # 2️⃣ Whisper transcription
        # --------------------------------------------------
        logger.info("🗣 Transcribing with Whisper")

        model_size = request.form.get("model_size", "base")
        logger.info(f"🎯 Whisper model requested: {model_size}")

        whisper_out = transcribe_file(
            tmp_audio.name,
            model_size=model_size
        )

        detected_lang = whisper_out.get("detected_language")
        segments = whisper_out.get("segments", [])

        if not detected_lang:
            raise RuntimeError("Whisper did not detect language")

        logger.info(f"Detected language: {detected_lang}")

        if not segments:
            segments = [{
                "text": whisper_out.get("text", ""),
                "start": 0,
                "end": None
            }]

        logger.info(f"Segments count: {len(segments)}")

        # --------------------------------------------------
        # 3️⃣ Translate → TTS
        # --------------------------------------------------
        audio_segments = []

        for idx, seg in enumerate(segments):
            original_text = seg.get("text", "")

            logger.info(f"🧪 RAW SEGMENT TEXT: {repr(original_text)}")

            if len(original_text) < 10:
                logger.warning(f"⚠️ Skipping meaningless transcription: {repr(original_text)}")
                continue

            logger.info(f"▶ Segment {idx+1}: {original_text[:80]}")

            # HARD FALLBACK
            if not original_text or not original_text.strip():
                original_text = whisper_out.get("text", "")

            original_text = original_text.strip()
            if not original_text:
                logger.error("❌ Empty transcription even after fallback")
                continue

            logger.info(f"▶ Segment {idx+1}: {original_text[:80]}")

            if detected_lang != target_lang:
                final_text = translate_text(
                    text=original_text,
                    source_lang=detected_lang,
                    target_lang=target_lang
                )
            else:
                final_text = original_text

            logger.info(f"🗣 FINAL TEXT FOR TTS ({target_lang}): {final_text[:80]}")

            # ✅ FIXED: voice is now passed correctly
            tts_filename = generate_tts(
                text=final_text,
                lang=target_lang,
                voice=voice
            )

            audio_segments.append(os.path.join(TTS_DIR, tts_filename))

        if not audio_segments:
            logger.warning("⚠️ No segments created, forcing single TTS fallback")

            fallback_text = whisper_out.get("text", "").strip()
            if not fallback_text:
                raise RuntimeError("No audio segments generated")

            # ✅ FIXED: voice is now passed correctly in fallback too
            tts_filename = generate_tts(
                text=fallback_text,
                lang=target_lang,
                voice=voice
            )

            audio_segments.append(os.path.join(TTS_DIR, tts_filename))

        # --------------------------------------------------
        # 4️⃣ Concatenate audio segments
        # --------------------------------------------------
        logger.info("🔗 Concatenating audio segments")

        concat_file = tempfile.NamedTemporaryFile(
            delete=False,
            mode="w",
            encoding="utf-8",
            suffix=".txt"
        )

        for path in audio_segments:
            safe_path = path.replace("\\", "/")
            concat_file.write(f"file '{safe_path}'\n")

        concat_file.close()

        final_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")

        subprocess.run([
            ffmpeg, "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_file.name,
            "-c:a", "pcm_s16le",
            final_audio.name
        ], check=True)

        # --------------------------------------------------
        # 5️⃣ Replace video audio
        # --------------------------------------------------
        output_name = f"dubbed_{uuid.uuid4().hex}.mp4"
        output_path = os.path.join(DUB_DIR, output_name)

        logger.info("🎞 Replacing video audio")

        subprocess.run([
            ffmpeg, "-y",
            "-i", tmp_video.name,
            "-i", final_audio.name,
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            output_path
        ], check=True)

        logger.info("✅ STABLE DUB COMPLETED")

        return jsonify({
            "success": True,
            "video_url": f"/dub/video/{output_name}"
        })

    except Exception as e:
        logger.exception("❌ STABLE DUB FAILED")
        return jsonify({"error": str(e)}), 500

    finally:
        time.sleep(0.2)
        for f in [tmp_video.name, tmp_audio.name if tmp_audio else None]:
            try:
                if f and os.path.exists(f):
                    os.unlink(f)
            except PermissionError:
                logger.warning(f"⚠️ Skipped cleanup (file busy): {f}")


@dub_bp.route("/video/<filename>")
def serve_dubbed_video(filename):
    return send_from_directory(DUB_DIR, filename)