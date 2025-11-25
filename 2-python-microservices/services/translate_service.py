import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import logging

logger = logging.getLogger("services.translate_service")
logger.setLevel(logging.INFO)

# Using NLLB model
model_name = "facebook/nllb-200-distilled-600M"
device = "cuda" if torch.cuda.is_available() else "cpu"

print(f"[Translation Service] Loading model: {model_name}")
print(f"[Translation Service] Using device: {device}")

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)
model = AutoModelForSeq2SeqLM.from_pretrained(
    model_name,
    use_safetensors=False  # Use pytorch_model.bin
).to(device)
model.eval()

print("[Translation Service] ✅ Model loaded successfully!")

# Language code mapping
LANG_CODE_MAP = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "bn": "ben_Beng",
    "gu": "guj_Gujr",
    "kn": "kan_Knda",
    "ml": "mal_Mlym",
    "mr": "mar_Deva",
    "or": "ory_Orya",
    "pa": "pan_Guru",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "as": "asm_Beng",
    "ur": "urd_Arab",
}

@torch.no_grad()
def translate_text(text: str, source_lang: str = "en", target_lang: str = "hi") -> str:
    """
    Translate text from source language to target language
    """
    try:
        # Validate input
        if not text or not text.strip():
            raise ValueError("Input text is empty")

        # Get language codes
        src_lang = LANG_CODE_MAP.get(source_lang)
        tgt_lang = LANG_CODE_MAP.get(target_lang)

        if not src_lang:
            raise ValueError(f"Unsupported source language: {source_lang}")
        if not tgt_lang:
            raise ValueError(f"Unsupported target language: {target_lang}")

        logger.info(f"Translating: {text[:50]}...")
        logger.info(f"From {source_lang} ({src_lang}) → {target_lang} ({tgt_lang})")

        # Set source language for tokenizer
        tokenizer.src_lang = src_lang

        # Tokenize input text
        inputs = tokenizer(
            text.strip(),
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512
        ).to(device)

        # ✅ FIX: Get target language token ID correctly
        tgt_lang_id = tokenizer.convert_tokens_to_ids(tgt_lang)

        # Generate translation
        translated_tokens = model.generate(
            **inputs,
            forced_bos_token_id=tgt_lang_id,  # ✅ Fixed line
            max_length=512,
            num_beams=5,
            early_stopping=True
        )

        # Decode the translated tokens
        translated_text = tokenizer.batch_decode(
            translated_tokens,
            skip_special_tokens=True
        )[0]

        logger.info(f"✅ Translation successful!")
        logger.info(f"Result: {translated_text[:50]}...")
        
        return translated_text.strip()

    except Exception as e:
        logger.error(f"❌ Translation error: {str(e)}", exc_info=True)
        raise RuntimeError(f"Translation failed: {str(e)}")
