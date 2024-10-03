from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify(message="Home"), 200


@app.route("/create-transcription", methods=["POST"])
def create_transcription():
    data = request.get_json()

    return jsonify(data), 201


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
