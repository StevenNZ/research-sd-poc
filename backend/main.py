import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from ASRSDCombined import generate_transcription
from TranscriptionSummarise import summarise_transcript

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify(message="Home"), 200


@app.route("/create-transcription", methods=["POST"])
def create_transcription():
    try:
        # Get the uploaded audio file
        if 'audio' not in request.files:
            return jsonify({"message": "No audio file provided"}), 400

        audio_file = request.files['audio']

        if audio_file.filename == '':
            return jsonify({"message": "No selected file"}), 400

        # Save the uploaded audio file
        audio_filename = "audio.wav"
        audio_file.save(audio_filename)

        # Generate transcription output with speaker info
        transcript = generate_transcription(audio_filename)
        summary = summarise_transcript(transcript)

        # Remove the temporary audio file
        os.remove(audio_filename)

        return jsonify({"transcriptions": transcript, "summary": summary}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
