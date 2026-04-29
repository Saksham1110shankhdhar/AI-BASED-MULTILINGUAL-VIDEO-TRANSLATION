# services/tts_service.py

import asyncio
import edge_tts
import os
import uuid
import logging

logger = logging.getLogger("services.tts_service")
logger.setLevel(logging.INFO)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
TTS_OUTPUT_DIR = os.path.join(BASE_DIR, "uploads", "tts")
TTS_DIR = TTS_OUTPUT_DIR
os.makedirs(TTS_OUTPUT_DIR, exist_ok=True)

# ── Female voices ──────────────────────────────────────────────
VOICE_MAP_FEMALE = {
    "hi":  "hi-IN-SwaraNeural",
    "bn":  "bn-IN-TanishaaNeural",
    "ta":  "ta-IN-PallaviNeural",
    "te":  "te-IN-ShrutiNeural",
    "gu":  "gu-IN-DhwaniNeural",
    "mr":  "mr-IN-AarohiNeural",
    "kn":  "kn-IN-SapnaNeural",
    "ml":  "ml-IN-SobhanaNeural",
    "ur":  "ur-PK-UzmaNeural",
    "en":  "en-US-JennyNeural",
    "pa":  "ur-PK-UzmaNeural",
    "or":  "hi-IN-SwaraNeural",
    "as":  "bn-IN-TanishaaNeural",
    "ne":  "hi-IN-SwaraNeural",
    "sd":  "ur-PK-UzmaNeural",
    "sa":  "hi-IN-SwaraNeural",
    "ks":  "ur-PK-UzmaNeural",
    "kok": "mr-IN-AarohiNeural",
    "mai": "hi-IN-SwaraNeural",
    "mni": "bn-IN-TanishaaNeural",
    "doi": "hi-IN-SwaraNeural",
    "brx": "hi-IN-SwaraNeural",
    "sat": "hi-IN-SwaraNeural",
}
# ── Male voices ────────────────────────────────────────────────
VOICE_MAP_MALE = {
    "hi":  "hi-IN-MadhurNeural",
    "bn":  "bn-IN-BashkarNeural",
    "ta":  "ta-IN-ValluvarNeural",
    "te":  "te-IN-MohanNeural",
    "gu":  "gu-IN-NiranjanNeural",
    "mr":  "mr-IN-ManoharNeural",
    "kn":  "kn-IN-GaganNeural",
    "ml":  "ml-IN-MidhunNeural",
    "ur":  "ur-PK-AsadNeural",
    "en":  "en-US-GuyNeural",
    "pa":  "ur-PK-AsadNeural",
    "or":  "hi-IN-MadhurNeural",
    "as":  "bn-IN-BashkarNeural",
    "ne":  "hi-IN-MadhurNeural",
    "sd":  "ur-PK-AsadNeural",
    "sa":  "hi-IN-MadhurNeural",
    "ks":  "ur-PK-AsadNeural",
    "kok": "mr-IN-ManoharNeural",
    "mai": "hi-IN-MadhurNeural",
    "mni": "bn-IN-BashkarNeural",
    "doi": "hi-IN-MadhurNeural",
    "brx": "hi-IN-MadhurNeural",
    "sat": "hi-IN-MadhurNeural",
}


def _pick_voice(lang: str, voice_gender: str) -> str:
    gender = voice_gender.strip().lower() if voice_gender else "female"

    if gender == "male":
        voice = VOICE_MAP_MALE.get(lang)
        fallback = "hi-IN-MadhurNeural"
    else:
        voice = VOICE_MAP_FEMALE.get(lang)
        fallback = "hi-IN-SwaraNeural"

    if not voice:
        logger.warning(f"⚠️ No voice for lang={lang} gender={gender}, using fallback")
        voice = fallback

    return voice


async def _generate_tts_async(text: str, lang: str, voice_gender: str) -> str:
    if not text or not text.strip():
        raise ValueError("TTS text is empty")

    voice = _pick_voice(lang, voice_gender)
    out_path = os.path.join(TTS_OUTPUT_DIR, f"tts_{uuid.uuid4().hex}.mp3")

    logger.info(f"🎤 TTS → lang={lang}, gender={voice_gender}, voice={voice}, chars={len(text)}")

    communicate = edge_tts.Communicate(
        text=text.strip(),
        voice=voice,
        rate="+0%",
        volume="+0%"
    )
    await communicate.save(out_path)

    if not os.path.exists(out_path) or os.path.getsize(out_path) == 0:
        raise RuntimeError("Edge-TTS failed to generate audio")

    logger.info(f"✅ TTS saved: {os.path.basename(out_path)}")
    return out_path


def generate_tts(text: str, lang: str = "hi", voice: str = "female", target_duration=None) -> str:
    """
    Generate TTS audio.
    voice = "female" | "male"
    target_duration is accepted but ignored (kept for API compatibility).
    Returns filename only.
    """
    try:
        output_path = asyncio.run(_generate_tts_async(text, lang, voice))
        return os.path.basename(output_path)
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        output_path = loop.run_until_complete(_generate_tts_async(text, lang, voice))
        loop.close()
        return os.path.basename(output_path)
