import os
import uuid
from gtts import gTTS
from pydub import AudioSegment
import logging

logger = logging.getLogger("services.tts_service")
logger.setLevel(logging.INFO)

# Store generated audio
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
TTS_DIR = os.path.join(BASE_DIR, "uploads", "tts")
os.makedirs(TTS_DIR, exist_ok=True)

# Supported languages for gTTS
TTS_LANG_CODES = {
    "en": "en",
    "hi": "hi",
    "bn": "bn",
    "ta": "ta",
    "te": "te",
    "mr": "mr",
    "gu": "gu",
    "kn": "kn",
    "ml": "ml",
    "pa": "pa",
    "ur": "ur"
}

VOICE_PROFILES = {
    "female": 2,  # subtly higher pitch
    "male": -3,   # slightly deeper voice
}


def generate_tts(text: str, lang: str = "hi", voice: str = "female") -> str:
    if not text.strip():
        raise ValueError("Text is empty")

    if lang not in TTS_LANG_CODES:
        raise ValueError(f"TTS: Unsupported language '{lang}'")

    unique_file = f"{lang}_{uuid.uuid4().hex}.mp3"
    file_path = os.path.join(TTS_DIR, unique_file)

    tts = gTTS(text=text, lang=TTS_LANG_CODES[lang])
    tts.save(file_path)

    apply_voice_profile(file_path, voice)

    logger.info(f"TTS saved: {file_path} with voice={voice}")
    return unique_file


def apply_voice_profile(file_path: str, voice: str) -> None:
    semitone_shift = VOICE_PROFILES.get(voice, 0)
    if semitone_shift == 0:
        return

    audio = AudioSegment.from_file(file_path)
    new_sample_rate = int(audio.frame_rate * (2.0 ** (semitone_shift / 12.0)))
    shifted = audio._spawn(audio.raw_data, overrides={"frame_rate": new_sample_rate})
    shifted = shifted.set_frame_rate(audio.frame_rate)
    shifted.export(file_path, format="mp3")
