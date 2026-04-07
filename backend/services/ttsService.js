const googleTTS = require('google-tts-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * CROSS-PLATFORM TTS SERVICE
 * 
 * Strategy (in order of preference):
 * 1. google-tts-api (Node.js) — Free, no API key, works on ALL platforms, supports 40+ languages
 * 2. Python OCR service /tts endpoint — fallback if Node TTS fails
 * 
 * Why google-tts-api?
 * - No model downloads
 * - No macOS dependency
 * - Works on Windows, Linux, Mac
 * - Supports: English, Hindi, Marathi, Telugu, and many more
 * - Fast: ~1-2 seconds
 */

// Language code mapping (from user-facing names to BCP-47 codes for Google TTS)
const LANG_MAP = {
    // Full names (from UI selector)
    'english': 'en', 'hindi': 'hi', 'marathi': 'mr', 'telugu': 'te',
    'punjabi': 'pa', 'tamil': 'ta', 'kannada': 'kn', 'gujarati': 'gu',
    // ISO codes (passed directly from backend)
    'en': 'en', 'hi': 'hi', 'mr': 'mr', 'te': 'te',
    'pa': 'pa', 'ta': 'ta', 'kn': 'kn', 'gu': 'gu',
};

/**
 * Generate audio using google-tts-api (Node.js, cross-platform, free)
 * Handles long texts by chunking automatically.
 */
const generateWithGoogleTTS = async (text, langCode) => {
    // Google TTS has a 200-char limit per chunk — getAllAudioBase64 handles this automatically
    const chunks = await googleTTS.getAllAudioBase64(text, {
        lang: langCode,
        slow: false,
        host: 'https://translate.google.com',
        timeout: 15000,
    });

    // Merge all MP3 chunks into a single Buffer
    const audioBuffers = chunks.map(chunk => Buffer.from(chunk.base64, 'base64'));
    return Buffer.concat(audioBuffers);
};

/**
 * Main entry point — called from reportController.generateVoice
 */
exports.generateAndStoreAudio = async (text, language = 'en') => {
    const langInput = String(language).toLowerCase().trim();
    const langCode = LANG_MAP[langInput] || 'en';

    // Clean text: remove markdown formatting that sounds bad when read aloud
    const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/[•▪◦\-]\s*/g, '')
        .replace(/\n+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .substring(0, 900); // Keep under ~45 seconds of audio

    console.log(`[TTS Service] Generating audio via Google TTS | language: ${langCode} | chars: ${cleanText.length}`);

    let audioBuffer;

    // STRATEGY 1: google-tts-api (cross-platform, no API key, works everywhere)
    try {
        audioBuffer = await generateWithGoogleTTS(cleanText, langCode);
        console.log(`[TTS Service] Google TTS success — ${audioBuffer.length} bytes`);
    } catch (gttsErr) {
        console.warn(`[TTS Service] Google TTS failed: ${gttsErr.message}. Trying Python TTS fallback...`);

        // STRATEGY 2: Python OCR service TTS endpoint (local fallback)
        try {
            const response = await axios.post('http://127.0.0.1:5001/tts', {
                text: cleanText,
                language: langCode
            }, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            audioBuffer = Buffer.from(response.data);
            console.log(`[TTS Service] Python TTS fallback success — ${audioBuffer.length} bytes`);
        } catch (pyErr) {
            console.error(`[TTS Service] All TTS engines failed. Python: ${pyErr.message}`);
            throw new Error('TTS generation failed. Please check your internet connection.');
        }
    }

    // Save audio file to /uploads/audio/
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'audio');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // google-tts-api returns MP3 data
    const fileName = `voice_summary_${Date.now()}_${langCode}.mp3`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, audioBuffer);

    console.log(`[TTS Service] Audio saved: ${fileName}`);
    return `/uploads/audio/${fileName}`;
};
