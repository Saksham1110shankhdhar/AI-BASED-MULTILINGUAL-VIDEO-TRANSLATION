import whisper

# Cache models globally (important for performance)
_MODEL_CACHE = {}

VALID_MODEL_SIZES = ["tiny", "base", "small", "medium", "large", "large-v2"]

def get_model(model_size: str = "base"):
    """Load and cache Whisper models safely"""
    if model_size not in VALID_MODEL_SIZES:
        print(f"[WARN] Invalid model_size='{model_size}', falling back to 'base'")
        model_size = "base"

    if model_size in _MODEL_CACHE:
        return _MODEL_CACHE[model_size]

    print(f"Loading Whisper model: {model_size}...")
    model = whisper.load_model(model_size)
    _MODEL_CACHE[model_size] = model
    print(f"[OK] Whisper model '{model_size}' loaded")

    return model


def transcribe_file(file_path: str, model_size: str = "base", language: str = None):
    """
    Transcribe audio/video using Whisper with:
    - Optional forced language
    - Native-script output
    - Proper language detection
    """

    model = get_model(model_size)

    args = {
        "task": "transcribe",
        "fp16": False,
        "verbose": False,
        "condition_on_previous_text": False
    }

    # Only force language if explicitly given
    if language:
        args["language"] = language

    result = model.transcribe(file_path, **args)

    detected_language = result.get("language", None)

    if not detected_language:
        print("[WARN] Language detection failed, setting 'unknown'")
        detected_language = "unknown"

    print(f"[FINAL] Whisper detected language: {detected_language}")

    return {
        "text": result["text"],
        "segments": result.get("segments", []),
        "detected_language": detected_language
    }
