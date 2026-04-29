# services/xtts_service.py
# XTTS v2 service for all Indian languages - ONLY TTS engine used

import os
import uuid
import logging
import tempfile
import torch
from pydub import AudioSegment
from services.ffmpeg_service import ensure_ffmpeg_path

logger = logging.getLogger("services.xtts_service")
logger.setLevel(logging.INFO)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
TTS_DIR = os.path.join(BASE_DIR, "uploads", "tts")
os.makedirs(TTS_DIR, exist_ok=True)

# XTTS v2 model cache
_xtts_model = None
_xtts_device = None

def _get_device():
    """Get the best available device for XTTS"""
    global _xtts_device
    if _xtts_device is None:
        if torch.cuda.is_available():
            _xtts_device = "cuda"
            logger.info("Using CUDA for XTTS v2")
        else:
            _xtts_device = "cpu"
            logger.info("Using CPU for XTTS v2")
    return _xtts_device

def _load_xtts_model():
    """Load XTTS v2 model (lazy loading)"""
    global _xtts_model
    if _xtts_model is None:
        try:
            from TTS.api import TTS
            
            device = _get_device()
            logger.info("Loading XTTS v2 model...")
            logger.info("This may take a few minutes on first run (downloading model)...")
            
            # Initialize XTTS v2
            # XTTS v2 supports multiple languages including Indian languages
            # Model will be downloaded automatically on first use
            _xtts_model = TTS(
                model_name="tts_models/multilingual/multi-dataset/xtts_v2",
                progress_bar=True,
                gpu=(device == "cuda")
            )
            
            logger.info("✅ XTTS v2 model loaded successfully")
        except ImportError as e:
            logger.error("TTS library not installed.")
            logger.error("Install with: pip install TTS")
            logger.error("Note: TTS requires Python 3.9-3.11. For Python 3.12+, use: pip install TTS --no-deps")
            raise RuntimeError(
                "XTTS v2 requires TTS library. Install with: pip install TTS\n"
                "For Python 3.12+: pip install TTS --no-deps (then install dependencies manually)"
            )
        except Exception as e:
            logger.error(f"Failed to load XTTS v2 model: {e}")
            raise RuntimeError(f"Failed to load XTTS v2 model: {e}")
    
    return _xtts_model

# Language code mapping for XTTS v2
# XTTS v2 supports: en, es, fr, de, it, pt, pl, tr, ru, nl, cs, ar, zh-cn, ja, hu, ko, hi, th, sv, uk, el, ca, fi, vi, he, id, nn, bg, hr, ro, cs, sk, sl, sr, ta, ml, te, kn, gu, pa, bn, or, as, ne, mr, hi
XTTS_LANG_MAP = {
    # Indian languages
    "hi": "hi",  # Hindi
    "bn": "bn",  # Bengali
    "ta": "ta",  # Tamil
    "te": "te",  # Telugu
    "gu": "gu",  # Gujarati
    "mr": "mr",  # Marathi
    "kn": "kn",  # Kannada
    "ml": "ml",  # Malayalam
    "ur": "ur",  # Urdu (use hi as closest)
    "pa": "pa",  # Punjabi
    "or": "or",  # Odia
    "as": "as",  # Assamese
    "ne": "ne",  # Nepali
    "sd": "hi",  # Sindhi (use hi as closest)
    "sa": "hi",  # Sanskrit (use hi as closest)
    "ks": "ur",  # Kashmiri (use ur/hi as closest)
    "kok": "mr", # Konkani (use mr as closest)
    "mai": "hi", # Maithili (use hi as closest)
    "mni": "bn", # Manipuri (use bn as closest)
    "doi": "hi", # Dogri (use hi as closest)
    "brx": "hi", # Bodo (use hi as closest)
    "sat": "hi", # Santhali (use hi as closest)
    # Other languages
    "en": "en",  # English
}

def _get_xtts_lang(lang):
    """Get XTTS v2 language code"""
    return XTTS_LANG_MAP.get(lang, "en")

def generate_xtts(text, lang="hi", voice="female", target_duration=None):
    """
    Generate TTS using XTTS v2 model for all Indian languages.
    This is the ONLY TTS engine used in the pipeline.
    """
    ensure_ffmpeg_path()
    
    logger.info(f"Generating XTTS v2: lang={lang}, voice={voice}, target_duration={target_duration}s")
    
    filename = f"{lang}_{uuid.uuid4().hex}.wav"
    path = os.path.join(TTS_DIR, filename)
    
    try:
        # Load XTTS v2 model
        tts = _load_xtts_model()
        device = _get_device()
        
        # Get XTTS language code
        xtts_lang = _get_xtts_lang(lang)
        logger.info(f"Using XTTS language code: {xtts_lang} (input: {lang})")
        
        # Generate speech
        # XTTS v2 uses speaker_wav for voice cloning, but we can use language parameter
        # For now, we'll use the default voice with language specification
        logger.info("Generating speech with XTTS v2...")
        
        # Create temporary output file
        temp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_wav.close()
        
        # Generate TTS
        # XTTS v2 API: tts.tts_to_file(text, speaker_wav=None, language=lang, file_path=output_path)
        # For multilingual support, we specify the language
        # Note: XTTS v2 requires speaker_wav for voice cloning, but we can use language parameter for multilingual TTS
        try:
            tts.tts_to_file(
                text=text,
                language=xtts_lang,
                file_path=temp_wav.name
            )
        except TypeError:
            # If language parameter not supported, try without it (will use default)
            logger.warning(f"Language parameter not supported, using default language")
            tts.tts_to_file(
                text=text,
                file_path=temp_wav.name
            )
        
        logger.info("XTTS v2 generation completed, processing audio...")
        
        # Load and process audio
        audio = AudioSegment.from_wav(temp_wav.name)
        audio = audio.normalize()
        
        # Match duration to video if specified
        if target_duration and target_duration > 0:
            current_duration = len(audio) / 1000.0
            logger.info(f"Audio duration: {current_duration:.2f}s, Target: {target_duration:.2f}s")
            
            if abs(current_duration - target_duration) > 0.5:  # More than 0.5s difference
                speed_factor = current_duration / target_duration
                logger.info(f"Adjusting speed by factor: {speed_factor:.3f}")
                
                if speed_factor > 1.0:
                    # Speed up (make shorter)
                    audio = audio.speedup(playback_speed=speed_factor)
                else:
                    # Slow down (make longer) - use frame rate adjustment
                    new_frame_rate = int(audio.frame_rate / speed_factor)
                    audio = audio._spawn(audio.raw_data, overrides={"frame_rate": new_frame_rate})
                    audio = audio.set_frame_rate(audio.frame_rate)
                
                final_duration = len(audio) / 1000.0
                logger.info(f"Final audio duration: {final_duration:.2f}s")
        
        # Export as WAV (better quality for Wav2Lip, and required format)
        # Wav2Lip expects WAV format
        audio.export(path, format="wav")
        
        # Cleanup temp file
        try:
            os.unlink(temp_wav.name)
        except:
            pass
        
        file_size_kb = os.path.getsize(path) / 1024
        logger.info(f"✅ XTTS v2 file created: {filename} ({file_size_kb:.2f} KB)")
        logger.info(f"✅ Audio duration matched: {len(audio) / 1000.0:.2f}s")
        return filename
        
    except ImportError as e:
        logger.error(f"TTS library not installed: {e}")
        logger.error("Install with: pip install TTS")
        raise RuntimeError("XTTS v2 requires TTS library. Install with: pip install TTS")
    except Exception as e:
        logger.error(f"XTTS v2 generation failed: {e}", exc_info=True)
        raise RuntimeError(f"XTTS v2 generation failed: {str(e)}")
