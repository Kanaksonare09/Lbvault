import io
import os
import re
import logging

logger = logging.getLogger(__name__)

def generate_tts_audio(text: str, language: str = 'en') -> io.BytesIO:
    """
    Cross-platform TTS fallback using gTTS (Google Text-to-Speech).
    This is ONLY called if the Node.js google-tts-api fails.
    Works on: Windows, Linux, macOS — no native dependencies.
    Requires: internet connection (uses Google Translate TTS endpoint).
    """
    # Normalize language code
    lang_map = {
        'en': 'en', 'english': 'en',
        'hi': 'hi', 'hindi': 'hi',
        'mr': 'mr', 'marathi': 'mr',
        'te': 'te', 'telugu': 'te',
        'ta': 'ta', 'tamil': 'ta',
        'pa': 'pa', 'punjabi': 'pa',
    }
    lang_code = lang_map.get(language.lower(), 'en')

    # Clean text for TTS
    clean = re.sub(r'\*+', '', text)
    clean = re.sub(r'#{1,6}\s', '', clean)
    clean = re.sub(r'[•▪◦\-]\s*', '', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()

    # Limit length to keep audio under 45 seconds
    if len(clean) > 900:
        clean = clean[:897] + '...'

    logger.info(f"[Python TTS Fallback] gTTS | language: {lang_code} | chars: {len(clean)}")

    try:
        from gtts import gTTS
        tts = gTTS(text=clean, lang=lang_code, slow=False)
        buffer = io.BytesIO()
        tts.write_to_fp(buffer)
        buffer.seek(0)
        logger.info(f"[Python TTS Fallback] gTTS generation successful")
        return buffer
    except Exception as e:
        logger.error(f"[Python TTS Fallback] gTTS failed: {str(e)}")
        raise Exception(f"Python TTS (gTTS) failed: {str(e)}")
