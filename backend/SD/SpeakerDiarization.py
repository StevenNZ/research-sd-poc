import torch
from pyannote.audio import Model, Pipeline
from pyannote.metrics.diarization import DiarizationErrorRate
from pyannote.audio.pipelines import SpeakerDiarization

# Load the original architecture
model = Model.from_pretrained("pyannote/segmentation-3.0", use_auth_token=True)

# Load your fine-tuned weights from the pytorch_model.bin file
model.load_state_dict(torch.load("pytorch_model.bin"))

# Put the model in evaluation mode
model.eval()

# Initialize the pyannote pipeline
pretrained_pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    use_auth_token=True)

finetuned_pipeline = SpeakerDiarization(
    segmentation=model,
    embedding=pretrained_pipeline.embedding,
    embedding_exclude_overlap=pretrained_pipeline.embedding_exclude_overlap,
    clustering=pretrained_pipeline.klustering,
)

finetuned_pipeline.load_params("config.yaml")

if torch.cuda.is_available():
    gpu = torch.device("cuda:1")
    finetuned_pipeline.to(gpu)
    print("gpu: ", torch.cuda.get_device_name(gpu))
else:
    print("Please switch to (free) T4 GPU runtime.")

diarization = finetuned_pipeline(
    "multi4_anavaawi_mix_mix_47_full.wav")

for speech_turn, track, speaker in diarization.itertracks(yield_label=True):
    print(f"{speech_turn.start:4.1f} {speech_turn.end:4.1f} {speaker}")
