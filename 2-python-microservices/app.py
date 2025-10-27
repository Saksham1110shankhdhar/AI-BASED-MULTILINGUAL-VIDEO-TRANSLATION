from flask import Flask, jsonify
from routes.transcribe_routes import transcribe_bp

app = Flask(__name__)

# Register Blueprint (routes)
app.register_blueprint(transcribe_bp)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Python microservice is running ✅"})

if __name__ == "__main__":
    app.run(port=8000, debug=True)
