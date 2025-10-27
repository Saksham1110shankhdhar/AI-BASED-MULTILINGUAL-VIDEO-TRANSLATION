import whisper
import os

def transcribe_file(file_path, language="auto"):
    """
    Transcribe audio/video file with optional language selection.
    If language='auto', it detects the spoken language automatically.
    """
    model = whisper.load_model("medium")

    # Step 1: Load and preprocess audio
    audio = whisper.load_audio(file_path)
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio).to(model.device)

    # Step 2: Detect language if auto
    detected_lang = None
    if language and language.lower() in ["auto", ""]:
        _, probs = model.detect_language(mel)
        detected_lang = max(probs, key=probs.get)
        language = detected_lang  # Use detected one for transcription

    # Step 3: Transcribe
    result = model.transcribe(file_path, language=language)

    return {
        "detected_language": detected_lang if detected_lang else language,
        "transcription": result["text"]
    }


