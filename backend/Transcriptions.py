output = []

from TranscriptionSummarise import classify_speakers_with_context


# Function to find speaker for a given timestamp range
def find_speaker(timestamp, diarization_segments, transcription, recording_duration):
    temp = {}
    start, end = timestamp

    if end is None:
        end = recording_duration
    total_duration = end - start
    speakers = []
    speaker_ids = []
    for seg_start, seg_end, speaker in diarization_segments:
        # Check if the ASR timestamp overlaps with the diarization segment
        if not (end < seg_start or start > seg_end):
            speakers.append((speaker, seg_start, seg_end, timestamp))
            speaker_ids.append(speaker)

    # If not multiple speakers, append to output
    if (len(set(speaker_ids))) < 2:
        temp['speaker'] = speakers[0][0]
        temp['timestamp'] = timestamp
        temp['transcription'] = transcription
        output.append(temp)
        return

    ## variables to track, multiple splits
    splitList = []
    proportion_sum = 0
    proportion_id = set()
    transcription_list = transcription.split(" ")
    # else this means that there is multiple speakers in that portion
    for index, (s_id, speaker_start, speaker_end, asr_timestamp) in enumerate(speakers):

        ## make sure the end doesn't exceed the asr time
        if end < speaker_end:
            speaker_end = end

        speaker_duration = speaker_end - speaker_start

        ## speaks for > whole duration, give it the entire section and skip
        if speaker_duration >= total_duration:
            temp['speaker'] = s_id
            temp['timestamp'] = timestamp
            temp['transcription'] = transcription
            output.append(temp)
            break

        proportion = speaker_duration / total_duration
        proportion_sum += proportion
        if proportion > 0:
            splitList.append((s_id, speaker_start, speaker_end, proportion))
            proportion_id.add(s_id)

    ## proportion is zero, so speaker isn't speaking at all
    if not splitList:
        return

    ## if only 2 speakers, add remaining to max
    if len(proportion_id) == 2:
        prop_sum = sum(tup[-1] for tup in splitList)
        max_tuple = max(splitList, key=lambda x: x[3])
        max_tuple_list = list(max_tuple)
        extra_ratio = 1 - proportion_sum

        max_tuple_list[3] += extra_ratio
        updated_max_tuple = tuple(max_tuple_list)
        index = splitList.index(max_tuple)
        splitList[index] = updated_max_tuple

    # only one speaker in this section, so just change proportion to 1
    if len(proportion_id) == 1:
        max_tuple = max(splitList, key=lambda x: x[3])
        max_tuple_list = list(max_tuple)
        max_tuple_list[3] = 1
        updated_max_tuple = tuple(max_tuple_list)
        splitList.clear()
        splitList.append(updated_max_tuple)

    ## more than 2 speakers, just add it to end
    if len(proportion_id) > 2:
        prop_sum = sum(tup[-1] for tup in splitList)
        extra_ratio = (1 - prop_sum)

        last_tuple = splitList[-1]
        updated_last_tuple = (
            last_tuple[0],  # Speaker ID
            last_tuple[1],  # Speaker start
            last_tuple[2],  # Speaker end
            last_tuple[3] + extra_ratio  # Updated ratio
        )

        # Update the last tuple in splitList
        splitList[-1] = updated_last_tuple

    total_length = len(transcription_list)
    for s_id, speaker_start, speaker_end, ratio in splitList:
        num_words = int(round(total_length * ratio))

        # there is at least one word
        if not num_words:
            continue
        # Extract the words for the current speaker
        speaker_words = transcription_list[:num_words]
        temp['speaker'] = s_id
        temp['timestamp'] = (speaker_start, speaker_end)
        temp['transcription'] = " ".join(speaker_words)
        output.append(temp)
        temp = {}
        # Remove the extracted words from the transcription_list
        transcription_list = transcription_list[num_words:]

    return


def cleanup_output(transcriptions):
    i = 0
    final_transcriptions = []
    flag = False

    while i < len(transcriptions):
        j = i + 1

        temp = [transcriptions[i]['transcription']]

        ## loop until window no longer unique
        while j < len(transcriptions) and transcriptions[i]['speaker'] == transcriptions[j]['speaker']:
            ## append transcriptions
            temp.append(transcriptions[j]['transcription'])
            j = j + 1

        if j >= len(transcriptions):
            flag = True

        # create timestamp

        timestamp = [
            transcriptions[i]['timestamp'][0],  # Start time is always from `transcriptions[i]`
            transcriptions[i]['timestamp'][1] if j == i + 1 else (
                transcriptions[-1]['timestamp'][1] if flag else transcriptions[j - 1]['timestamp'][1])
        ]

        # timestamp either is i's timestamp if j unchanged
        # otherwise will be i's first timestamp and j's second timestamp to take first and last point
        # transcription will be just list joined
        final_transcriptions.append({
            "speaker": transcriptions[i]['speaker'],
            "timestamp": timestamp,
            "transcription": " ".join(temp)
        })

        i = j

    return final_transcriptions


def correct_tags(uncleaned_transcriptions):
    return classify_speakers_with_context(uncleaned_transcriptions)


def generate_transcription(asr_transcriptions, speaker_diarization, recording_duration):
    for asr in asr_transcriptions:
        find_speaker(asr['timestamp'], speaker_diarization, asr['text'], recording_duration)

    tagged_output = correct_tags(output)
    cleaned_output = cleanup_output(tagged_output)
    return cleaned_output
