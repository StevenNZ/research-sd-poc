from flask import Flask, request, jsonify 

app = Flask(__name__)

@app.route("/")
def home():
    return "Home"

@app.route("/create-transcription", methods =["POST"])
def create_transcription():
    data = request.get_json()
    
    return jsonify(data), 201

if __name__ == "__main__":
    app.run(debug=True)