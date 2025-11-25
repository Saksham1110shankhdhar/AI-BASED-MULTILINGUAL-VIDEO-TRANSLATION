from flask import Flask, jsonify
from routes.tts_routes import tts_bp
from flask_cors import CORS
from routes.transcribe_routes import transcribe_bp
from routes.translate_routes import translate_bp

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Register Blueprint (routes)
app.register_blueprint(transcribe_bp)
app.register_blueprint(translate_bp)
app.register_blueprint(tts_bp, url_prefix="/tts")


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Python microservice is running OK"})

# Debug: List all routes
@app.route("/routes", methods=["GET"])
def list_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            "endpoint": rule.endpoint,
            "methods": list(rule.methods),
            "path": str(rule)
        })
    return jsonify({"routes": routes})

if __name__ == "__main__":
    app.run(port=8000, debug=True)
