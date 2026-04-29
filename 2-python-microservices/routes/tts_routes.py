from flask import Blueprint, request, jsonify, send_from_directory
from services.tts_service import generate_tts, TTS_DIR
import os
import logging

logger = logging.getLogger("routes.tts_routes")

tts_bp = Blueprint("tts_bp", __name__)

@tts_bp.route("", methods=["POST"])
def tts():
    """
    Generate TTS audio from text.
    
    Request body (JSON):
    {
        "text": "Text to convert to speech",
        "lang": "hi",  # Language code
        "voice": "female",  # Voice type (optional)
        "target_duration": 10.5  # Target duration in seconds (optional)
    }
    """
    data = request.get_json() or {}
    text = data.get("text", "")
    lang = data.get("lang", "hi")
    voice = data.get("voice", "female")
    target_duration = data.get("target_duration")  # Optional

    if not text:
        return jsonify({"error": "Text is required"}), 400

    logger.info(
        f"TTS Request => lang={lang}, voice={voice}, text_len={len(text)}, duration={target_duration}"
    )

    try:
        filename = generate_tts(text, lang=lang, voice=voice, target_duration=target_duration)
        return jsonify({
            "success": True,
            "audio_url": f"/tts/audio/{filename}",
            "filename": filename
        })
    except Exception as e:
        logger.error(f"TTS failed: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 400


@tts_bp.route("/audio/<filename>")
def serve_audio(filename):
    """Serve TTS audio files"""
    if not os.path.exists(os.path.join(TTS_DIR, filename)):
        return jsonify({"error": "Audio file not found"}), 404
    return send_from_directory(TTS_DIR, filename)
