import whisper
import os

# Cache models globally to avoid reloading on every request
_cached_models = {}

def get_model(model_size="base"):
    """Get or create cached Whisper model"""
    # Validate model size
    valid_sizes = ["tiny", "base", "small", "medium", "large"]
    if model_size not in valid_sizes:
        print(f"Invalid model size: {model_size}, defaulting to 'base'")
        model_size = "base"
    
    # Return cached model if available
    if model_size in _cached_models:
        print(f"Using cached model: {model_size}")
        return _cached_models[model_size]
    
    # Load new model
    print(f"Loading Whisper model: {model_size}...")
    try:
        _cached_models[model_size] = whisper.load_model(model_size)
        print(f"[Info] Model '{model_size}' loaded successfully")
        return _cached_models[model_size]
    except Exception as e:
        print(f"[Error] Failed to load model '{model_size}': {e}")
        # Fallback to base model
        if model_size != "base":
            print("Falling back to 'base' model")
            if "base" in _cached_models:
                return _cached_models["base"]
            _cached_models["base"] = whisper.load_model("base")
            return _cached_models["base"]
        raise e

def transcribe_file(file_path, language="auto", model_size="base"):
    """
    Transcribe audio/video file with optional language selection and model size.
    If language='auto', it detects the spoken language automatically.
    
    Args:
        file_path: Path to audio/video file
        language: Language code (e.g., 'hi', 'en', 'auto')
        model_size: Model size ('tiny', 'base', 'small', 'medium', 'large')
    """
    model = get_model(model_size)

    # Step 1: Load and preprocess audio
    audio = whisper.load_audio(file_path)
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio).to(model.device)

    # Step 2: Detect language if auto
    detected_lang = None
    if language and language.lower() in ["auto", ""]:
        try:
            _, probs = model.detect_language(mel)
            detected_lang = max(probs, key=probs.get)
            print(f"[Info] Detected language: {detected_lang}")
            language = detected_lang  # Use detected language for transcription
        except Exception as e:
            print(f"[Warning] Language detection failed: {e}, using auto mode")
            language = None

    # Step 3: Transcribe with optimized parameters
    try:
        transcribe_options = {
            "task": "transcribe",
            "verbose": False,  # Reduce logging
        }
        
        if language:
            transcribe_options["language"] = language
        
        result = model.transcribe(file_path, **transcribe_options)
        print(f"[Info] Transcription completed successfully")
        
        return {
            "detected_language": detected_lang if detected_lang else (language if language else "unknown"),
            "transcription": result["text"]}
    except Exception as e:
        print(f"[Error] Transcription failed: {e}")
        raise e
