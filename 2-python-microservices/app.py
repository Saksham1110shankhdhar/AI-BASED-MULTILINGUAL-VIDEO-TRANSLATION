import sys
sys.stdout.reconfigure(line_buffering=True)

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import os
from datetime import datetime

from routes.transcribe_routes import transcribe_bp
from routes.translate_routes import translate_bp
from routes.tts_routes import tts_bp
from routes.dub_routes import dub_bp

app = Flask(__name__)
CLIENT_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CLIENT_ORIGIN", "http://localhost:3000").split(",")
    if origin.strip()
]
CORS(app, origins=CLIENT_ORIGINS)

logging.basicConfig(
    level=logging.INFO,
     format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)  # 👈 force terminal output
    ],
    force=True
)

@app.before_request
def log_request():
    print("\n" + "=" * 80, flush=True)
    print(f"📥 REQUEST {request.method} {request.path}", flush=True)
    if request.files:
        print(f"📎 Files: {list(request.files.keys())}", flush=True)
    if request.form:
        print(f"📝 Form: {dict(request.form)}", flush=True)
    print("=" * 80, flush=True)

@app.after_request
def log_response(res):
    print(f"📤 RESPONSE {res.status_code}", flush=True)
    return res

app.register_blueprint(transcribe_bp)
app.register_blueprint(translate_bp)
app.register_blueprint(tts_bp, url_prefix="/tts")
app.register_blueprint(dub_bp, url_prefix="/dub")

@app.route("/")
def health():
    return jsonify({"status": "OK"})

@app.route("/health")
def health_check():
    return jsonify({"status": "OK"})

print("REGISTERED ROUTES:")
print(app.url_map)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 8000)), debug=False, threaded=True)


