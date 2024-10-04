def combine_asr_sd(audio_path):
    try:

        from SD import SpeakerDiarization

        speaker_diarization = SpeakerDiarization.run_sd(audio_path)

        from ASR import ASR

        asr_transcriptions = ASR.run_asr(audio_path)

        return ({"asr": asr_transcriptions, "sd": speaker_diarization})

    except Exception as e:
        print(e)
        return
