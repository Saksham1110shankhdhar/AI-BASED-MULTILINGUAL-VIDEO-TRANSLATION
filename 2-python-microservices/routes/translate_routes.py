from flask import Blueprint, request, jsonify
from services.translate_service import translate_text

translate_bp = Blueprint("translate_bp", __name__)

@translate_bp.route("/translate", methods=["POST"])
def translate():
    print("[Flask] /translate route called")
    try:
        data = request.get_json()
        print(f"[Flask] Received data: text length={len(data.get('text', ''))}, source_lang={data.get('source_lang')}, target_lang={data.get('target_lang')}")
        text = data.get("text", "")
        source_lang = data.get("source_lang", "en")
        target_lang = data.get("target_lang", "hi")

        if not text or not text.strip():
            return jsonify({"error": "No text provided"}), 400

        translated_text = translate_text(text, source_lang, target_lang)
        return jsonify({"translated_text": translated_text}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Translation route error: {error_details}")
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500



