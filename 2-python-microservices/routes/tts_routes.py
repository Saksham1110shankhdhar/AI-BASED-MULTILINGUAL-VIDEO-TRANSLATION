from flask import Blueprint, request, jsonify, send_from_directory
from services.tts_service import generate_tts, TTS_DIR
import os
import logging

logger = logging.getLogger("routes.tts_routes")

tts_bp = Blueprint("tts_bp", __name__)

@tts_bp.route("", methods=["POST"])
def tts():
    data = request.get_json() or {}
    text = data.get("text", "")
    lang = data.get("lang", "hi")
    voice = data.get("voice", "female")

    logger.info(
        f"TTS Request => lang={lang}, voice={voice}, text_len={len(text)}"
    )

    try:
        filename = generate_tts(text, lang, voice)
        return jsonify({"audio_url": f"/tts/audio/{filename}"})
    except Exception as e:
        logger.error(f"TTS failed: {e}")
        return jsonify({"error": str(e)}), 400


@tts_bp.route("/audio/<filename>")
def serve_audio(filename):
    return send_from_directory(TTS_DIR, filename)
