output = []


# Function to find speaker for a given timestamp range
def find_speaker(timestamp, diarization_segments, transcription):
    temp = {}
    start, end = timestamp
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


def generate_transcription(asr_transcriptions, speaker_diarization):
    for asr in asr_transcriptions:
        find_speaker(asr['timestamp'], speaker_diarization, asr['text'])

    return output
