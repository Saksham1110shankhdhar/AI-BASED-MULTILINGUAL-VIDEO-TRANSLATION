# services/translate_service.py

import logging
from argostranslate import translate as argos_translate
from deep_translator import GoogleTranslator

logger = logging.getLogger("services.translate_service")

# Languages Argos has installed (fast, offline)
ARGOS_SUPPORTED = {
    ("en", "hi"), ("hi", "en"),
    ("en", "bn"), ("bn", "en"),
    ("en", "ur"), ("ur", "en"),
}

# All 22 Indian languages supported via Google
SUPPORTED_LANGS = {
    "en", "hi", "bn", "ta", "te", "mr", "gu",
    "kn", "ml", "ur", "pa", "or", "as", "ne",
    "sd", "sa", "ks", "kok", "mai", "mni", "doi",
    "brx", "sat"
}

# Google Translate language code overrides
# (some codes differ from Whisper/Argos codes)
GOOGLE_CODE_MAP = {
    "bn": "bn",
    "hi": "hi",
    "ta": "ta",
    "te": "te",
    "mr": "mr",
    "gu": "gu",
    "kn": "kn",
    "ml": "ml",
    "ur": "ur",
    "pa": "pa",
    "or": "or",
    "as": "as",
    "ne": "ne",
    "en": "en",
    "sd": "sd",
    "sa": "sa",
    # unsupported by Google — fallback to Hindi
    "ks":  "hi",
    "kok": "mr",
    "mai": "hi",
    "mni": "bn",
    "doi": "hi",
    "brx": "hi",
    "sat": "hi",
}


def _argos(text: str, source: str, target: str) -> str:
    """Offline translation using Argos."""
    installed = argos_translate.get_installed_languages()
    src = next((l for l in installed if l.code == source), None)
    tgt = next((l for l in installed if l.code == target), None)

    if not src or not tgt:
        raise RuntimeError(f"Argos package missing: {source}→{target}")

    translation = src.get_translation(tgt)
    if not translation:
        raise RuntimeError(f"Argos no translation: {source}→{target}")

    return translation.translate(text)


def _google(text: str, source: str, target: str) -> str:
    """Online translation using Google Translate (no API key needed)."""
    src_code = GOOGLE_CODE_MAP.get(source, "en")
    tgt_code = GOOGLE_CODE_MAP.get(target, "hi")

    logger.info(f"🌍 Google Translate: {src_code} → {tgt_code}")
    translated = GoogleTranslator(source=src_code, target=tgt_code).translate(text)

    if not translated:
        raise RuntimeError(f"Google Translate returned empty: {source}→{target}")

    return translated


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text from source_lang to target_lang.
    Uses Argos (offline) if available, falls back to Google Translate.
    Non-direct pairs are bridged through English.
    """
    if not text or not text.strip():
        return text

    if source_lang == target_lang:
        return text

    source_lang = source_lang.strip().lower()
    target_lang = target_lang.strip().lower()

    logger.info(f"🌐 Translating: {source_lang} → {target_lang} | chars={len(text)}")

    try:
        # Step 1: source → English (if not already English)
        if source_lang != "en":
            if (source_lang, "en") in ARGOS_SUPPORTED:
                text = _argos(text, source_lang, "en")
                logger.info(f"✅ Argos: {source_lang} → en")
            else:
                text = _google(text, source_lang, "en")
                logger.info(f"✅ Google: {source_lang} → en")

        # Step 2: English → target (if target is not English)
        if target_lang != "en":
            if ("en", target_lang) in ARGOS_SUPPORTED:
                text = _argos(text, "en", target_lang)
                logger.info(f"✅ Argos: en → {target_lang}")
            else:
                text = _google(text, "en", target_lang)
                logger.info(f"✅ Google: en → {target_lang}")

        return text

    except Exception as e:
        logger.error(f"❌ Translation failed: {e}")
        raise
