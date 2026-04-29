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

    # Optional language and model fields
    #  request.form.get("language", "auto")
    model_size = request.form.get("model", "base")

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1])
    temp_file.close()
    file.save(temp_file.name)

    try:
        print(f"Processing file: {file.filename} with model: {model_size}")
        result = transcribe_file(
            temp_file.name,
            model_size=model_size
        )
        print(f"Transcription completed successfully")
        return jsonify({
            "success": True,
            "transcription": result.get("text", "").strip(),
            "segments": result.get("segments", []),
            "language": result.get("detected_language")
        })

    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        return jsonify({"error": f"Transcription failed: {str(e)}"}), 500
    finally:
        if os.path.exists(temp_file.name):
            try:
                os.unlink(temp_file.name)
            except PermissionError:
                time.sleep(0.1)
                if os.path.exists(temp_file.name):
                    os.unlink(temp_file.name)
