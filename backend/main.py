import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from ASRSDCombined import combine_asr_sd
from Transcriptions import generate_transcription
from TranscriptionSummarise import summarise_transcript

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify(message="Home"), 200


@app.route("/create-summary", methods=["POST"])
def create_summary():
    data = request.get_json()

    if not data:
        return jsonify(message="Incorrect Data!!!"), 400

    summary = summarise_transcript(data['transcription'])

    return jsonify(summary), 200


@app.route("/create-transcription", methods=["POST"])
def create_transcription():
    data = request.get_json()

    if not data:
        return jsonify(message="Incorrect Data!!!"), 400

    asr_transcriptions = data['asr_sd']['asr']
    sd_transcriptions = data['asr_sd']['sd']
    duration = data['duration']

    transcription = generate_transcription(asr_transcriptions, sd_transcriptions, duration)

    return jsonify(transcription), 200


@app.route("/create-asr-sd", methods=["POST"])
def create_asr_sd():
    try:
        data = request.get_json()

        if not data or not data['audio_file_path'] or not data['audio_file_path']['file_path']:
            return jsonify("Incorrect path"), 400
        audio_path = data['audio_file_path']['file_path']

        if audio_path not in os.listdir():
            return jsonify("No file uploaded to server"), 400

        asr_sd_separate = combine_asr_sd(audio_path)

        return jsonify(asr_sd_separate), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/upload-audio", methods=["POST"])
def upload_audio():
    try:
        uploaded_files = request.files

        # Check if there are any files
        if not uploaded_files:
            return jsonify({"message": "No audio file provided"}), 400

        # Access the specific file, assuming it has the key 'file'
        audio_file = uploaded_files.get('file')

        print(audio_file)

        # Check if the file is valid
        if not (audio_file and audio_file.filename):
            return jsonify({"message": "No audio file provided"}), 400

        audio_file_path = f'ASR-SD_{audio_file.filename}'
        audio_file.save(audio_file_path)

        return jsonify({"file_path": audio_file_path}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
