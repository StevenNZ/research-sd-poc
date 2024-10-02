import evaluate
import huggingface_hub
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import inflect
import re


whisper_small_ft = "ashe194/700-fine-tuned-whisper-small-full"
audio_path = "moltin_noi_fem_mix_28_full.wav"

wer_metric = evaluate.load("wer")
cer_metric = evaluate.load("cer")

model = AutoModelForSpeechSeq2Seq.from_pretrained(
    whisper_small_ft, low_cpu_mem_usage=True, use_safetensors=True
)

processor = AutoProcessor.from_pretrained(whisper_small_ft)

p = inflect.engine

chars_to_ignore_regex = r'[\,\?\.\!\;\:\"[\]\(\)\/\-\’]'

pipe = pipeline(
    "automatic-speech-recognition",
    model=whisper_small_ft,
    chunk_length_s=30,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
)


def replace_percent_symbol(text):
    # Replace "%" symbol with the word "percent"
    return text.replace('%', ' percent')


def remove_special_characters(text):
    # Remove special characters and convert to uppercase
    cleaned_text = re.sub(chars_to_ignore_regex, '', text).lower()

    # Replace "%" with "percent"
    cleaned_text = replace_percent_symbol(cleaned_text)

    cleaned_text = cleaned_text.replace('-', ' ')

    return cleaned_text.lower()


def flatten_dialogue(json_data):
    dialogue_text = ""
    for entry in json_data:
        dialogue_text += " ".join(entry["dialogue"]) + " "
    return dialogue_text.strip()


# ground_truth = flatten_dialogue(json_data)
# print("Ground Truth:", ground_truth)


def run_asr(audio_path):
    prediction_with_text = pipe(audio_path, batch_size=8, return_timestamps=True, generate_kwargs={"language": "english"})[
        'chunks']
    return prediction_with_text

# Evaluation Stuff
# prediction = pipe(audio_path, batch_size=8, return_timestamps=True, generate_kwargs={"language": "english"})['text']
# # Calculate normalised WER and CER
# normalised_pred = remove_special_characters(prediction)
# normalised_ref = remove_special_characters(ground_truth)
#
# wer = wer_metric.compute(predictions=[prediction], references=[ground_truth])
# cer = cer_metric.compute(predictions=[prediction], references=[ground_truth])
# print(f"Word Error Rate (WER): {100 * wer}")
# print(f"Word Error Rate (CER): {100 * cer}")
#
# normalised_wer = wer_metric.compute(predictions=[normalised_pred], references=[normalised_ref])
# print(f"Word Error Rate (WER): {100 * normalised_wer}")
