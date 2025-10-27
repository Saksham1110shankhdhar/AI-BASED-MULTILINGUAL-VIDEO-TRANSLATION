from flask import Blueprint, request, jsonify
from services.whisper_service import transcribe_file
from services.ffmpeg_service import ensure_ffmpeg_path
import tempfile
import os
import time

transcribe_bp = Blueprint("transcribe", __name__)

# Ensure ffmpeg path
ensure_ffmpeg_path()

@transcribe_bp.route("/transcribe", methods=["POST"])
def transcribe_audio_or_video():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # Optional language field (can be 'auto', 'en', 'hi', etc.)
    language = request.form.get("language", "auto")

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1])
    temp_file.close()
    file.save(temp_file.name)

    try:
        result = transcribe_file(temp_file.name, language=language)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_file.name):
            try:
                os.unlink(temp_file.name)
            except PermissionError:
                time.sleep(0.1)
                if os.path.exists(temp_file.name):
                    os.unlink(temp_file.name)
