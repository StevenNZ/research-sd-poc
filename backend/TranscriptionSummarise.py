import json

from openai import OpenAI
import os


def format_transcript_for_summary(transcript):
    """
    Converts the transcript data into a readable format for summarization.
    """
    formatted_text = ""
    for entry in transcript:
        formatted_text += f"{entry['speaker']} ({entry['timestamp'][0]} - {entry['timestamp'][1]}): {entry['transcription']}\n"
    return formatted_text


def summarise_transcript(transcript):
    client = OpenAI(
        api_key='')

    formatted_transcript = format_transcript_for_summary(transcript)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You will be provided with a transcript of a doctor-patient conversation, "
                           "including the speaker id, timestamp and what they spole. "
                           "Your task is to summarize the meeting as follows:\n"
                           "- Overall summary of conversation\n"
                           "- Action items (important information the doctors would need for future visits)\n "
                           " Please make sure you include both"
            },
            {
                "role": "user",
                "content": formatted_transcript
            }
        ],
        temperature=0,
        max_tokens=350,
        top_p=0.5
    )

    return response.choices[0].message.content


def classify_speakers_with_context(transcriptions):
    client = OpenAI(
        api_key='')

    formatted_transcript = format_transcript_for_summary(transcriptions)

    # Create the prompt with the entire conversation as context
    prompt = f"""
    You will be provided with a transcript of a doctor-patient conversation,
    including speaker IDs, timestamps, and the spoken text. 
    Your task is to analyze the conversation and identify which speaker corresponds to the Doctor.

    Please return the output as an object (dictionary) where:
    - The key is the Speaker ID (e.g., 'SPEAKER_XX')
    - The value is the label "Doctor" for the identified Doctor speaker.

    Ensure that all relevant context is considered in your analysis.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": prompt
            },
            {
                "role": "user",
                "content": formatted_transcript
            }
        ],
        temperature=0,

    )

    # Extract the revised conversation from the response
    final = response.choices[0].message.content
    print(final)

    for t in transcriptions:
        if t['speaker'] in final:
            t['speaker'] = "Doctor"
        else:
            t['speaker'] = "Patient"

    return transcriptions


# x = [{'speaker': "SPEAKER_01", 'timestamp': [10.8, 12.3], 'transcription': "Hi,"},
#      {'speaker': "SPEAKER_00", 'timestamp': [14.2, 15.6], 'transcription': "Mr."},
#      {'speaker': "SPEAKER_02", 'timestamp': [15.9, 17.8],
#       'transcription': "Jones. How are you? I'm good, Dr. Smith. Nice to see you."},
#      {'speaker': "SPEAKER_00", 'timestamp': [18, 20.7],
#       'transcription': " Nice to see you again. What brings you back?"},
#      {'speaker': "SPEAKER_02", 'timestamp': [21, 23.1], 'transcription': " Well, my back's been"},
#      {'speaker': "SPEAKER_00", 'timestamp': [23.8, 24.5], 'transcription': "hurting again."},
#      {'speaker': "SPEAKER_00", 'timestamp': [24.7, 27.4],
#       'transcription': "I've seen you a number of times for this, haven't I?"},
#      {'speaker': "SPEAKER_02", 'timestamp': [28.24, 33.12],
#       'transcription': " Well, ever since I got hurt on the job three years ago, it's something that just keeps coming back."},
#      {'speaker': "SPEAKER_02", 'timestamp': [28.2, 35.3],
#       'transcription': " It'll be fine for a while, and then I'll bend down or I'll move in a weird"},
#      {'speaker': "SPEAKER_02", 'timestamp': [36.1, 41],
#       'transcription': "way, and then, boom, it'll just go out again. Unfortunately, that can"}]
#
#
# print(classify_speakers_with_context(x))