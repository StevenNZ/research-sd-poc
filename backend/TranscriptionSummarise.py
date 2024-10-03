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
