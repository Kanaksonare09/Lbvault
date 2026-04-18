const axios = require('axios');
const path = require('path');
const fs = require('fs');
const pdfParseLib = require('pdf-parse');
const pdfParse = typeof pdfParseLib === 'function' ? pdfParseLib : (pdfParseLib.PDFParse || pdfParseLib.default || pdfParseLib);

const { GoogleGenerativeAI } = require('@google/generative-ai');

const FormData = require('form-data');

exports.extractBiomarkersFromDocument = async (filePath) => {
    try {
        console.log(`[OCR PIPELINE] Pushing document to Refactored Python OCR Service: ${filePath}`);
        let extractedText = 'No text cleanly extracted from this file type.';

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));
            formData.append('enable_preprocessing', 'true');

            // Send multipart request to the Refactored Python OCR Service
            const response = await axios.post('http://127.0.0.1:5001/ocr/process', formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });

            if (response.data && response.data.status === 'success') {
                extractedText = response.data.text;
                console.log(`[OCR PIPELINE] Received OCR text. Length: ${response.data.length}`);
            } else {
                throw new Error("Python OCR service failed or returned error structure.");
            }
        } catch (apiErr) {
            console.error('[OCR PIPELINE ERROR] Python Service failed:', apiErr.message);
            // Fallback for native text PDF parsing if service fails
            if (filePath.toLowerCase().endsWith('.pdf')) {
                console.log('[OCR PIPELINE] Falling back to pdf-parse for native PDF text extraction...');
                const dataBuffer = fs.readFileSync(filePath);
                try {
                    const pdfData = await pdfParse(dataBuffer);
                    if (pdfData && pdfData.text) extractedText = pdfData.text;
                } catch (pdfErr) {
                    console.error('[OCR PIPELINE ERROR] pdf-parse failed:', pdfErr.message);
                }
            }
        }

        console.log(`[OCR PIPELINE] Extracted ${extractedText.length} characters. Routing to Unified AI Engine...`);

        // Force 'en' fallback if result is poor
        const result = await exports.analyzeReportUniversal(extractedText, 'en');

        return {
            rawOcrText: extractedText,
            biomarkers: result.biomarkers || [],
            summary: result.summary || 'AI Analysis was unable to generate a summary from this document.'
        };
    } catch (error) {
        console.error('[EXTRACTION FATAL EXCEPTION]', error.message);
        return {
            rawOcrText: 'Native parsing failed.',
            biomarkers: [],
            summary: 'We were unable to analyze this document structure. Please upload a high-quality PDF or Image.'
        };
    }
};

exports.analyzeReportUniversal = async (ocrText, language = 'en') => {
    try {
        let safeText = String(ocrText || '').substring(0, 4000);
        if (safeText.trim().length === 0) {
            return {
                biomarkers: [],
                summary: 'No valid text found in report.'
            };
        }

        // Build language-specific instruction
        const langInstructions = {
            hi: `LANGUAGE RULE (CRITICAL): Write the ENTIRE summary in Hindi (हिंदी). 
Every sentence, every phrase, every word MUST be in Hindi script (Devanagari).
ONLY keep these in English: medical test names (Hemoglobin, ALT, AST, HbA1c, etc.), units (mg/dL, g/dL, U/L), and numeric values.
Example of correct style: "आपके **Hemoglobin** का स्तर 10.5 g/dL है, जो सामान्य से थोड़ा कम है।"
DO NOT mix random English words. All explanations, all advice, all headings must be in Hindi.`,
            mr: `LANGUAGE RULE (CRITICAL): संपूर्ण सारांश मराठी भाषेत लिहा.
प्रत्येक वाक्य, प्रत्येक शब्द मराठीत असणे आवश्यक आहे.
फक्त हे इंग्रजीत ठेवा: वैद्यकीय चाचणीची नावे (Hemoglobin, ALT, AST), एकके (mg/dL, g/dL), आणि संख्यात्मक मूल्ये.
उदाहरण: "तुमच्या **Hemoglobin** ची पातळी 10.5 g/dL आहे, जी सामान्यपेक्षा थोडी कमी आहे."
इतर सर्व स्पष्टीकरण, सल्ला आणि शीर्षके मराठीत असावीत.`,
            te: `LANGUAGE RULE (CRITICAL): మొత్తం సారాంశాన్ని తెలుగులో రాయండి.
ప్రతి వాక్యం, ప్రతి మాట తెలుగులో ఉండాలి.
ఇవి మాత్రమే ఇంగ్లీషులో ఉంచండి: వైద్య పరీక్ష పేర్లు (Hemoglobin, ALT, AST), యూనిట్లు (mg/dL), మరియు సంఖ్యా విలువలు.
ఉదాహరణ: "మీ **Hemoglobin** స్థాయి 10.5 g/dL గా ఉంది, ఇది సాధారణం కంటే కొంచెం తక్కువ."
మిగిలిన అన్ని వివరణలు, సూచనలు తెలుగులో రాయండి.`,
            en: `LANGUAGE RULE: Write the summary in clear, simple English. Use emojis and bold headers.`
        };

        const langCode = String(language).toLowerCase().substring(0, 2);
        const langRule = langInstructions[langCode] || langInstructions['en'];

        const prompt = `You are a Universal Medical Intelligence Engine.
Your task is to analyze the following medical report OCR text and perform TWO tasks in one pass:
1. Extract ALL measurable parameters/biomarkers as a JSON array.
2. Generate a patient-friendly summary with emojis and actionable steps.

Output strictly a valid JSON object with this exact structure:
{
  "biomarkers": [
    {
      "name": "string",
      "value": number,
      "unit": "string",
      "min": number,
      "max": number,
      "severity": "Normal|Mild|Moderate|Critical",
      "interpretation": "string",
      "confidence": number
    }
  ],
  "summary": "string (formatted with **bold** for headers and emojis, exactly 3-4 paragraphs with an Actionable Steps section at the end)"
}

${langRule}

General Rules:
- DO NOT hallucinate common tests (like Hemoglobin or Blood) if the OCR text belongs to a different test (like Liver, Urine, or Radiology).
- IF THE OCR TEXT IS UNREADABLE or missing core markers, set parameters to empty and include "No clear medical data detected in this scan" in the summary.
- If reference ranges (min/max) are missing, use your internal medical knowledge for severity/interpretation.
- Output ONLY the JSON object.

Report text (STRICT DATA SOURCE - DO NOT GUESS): ${safeText}`;

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        const useGroq = GROQ_API_KEY && !GROQ_API_KEY.includes('your_groq');

        console.log(`[AI ENGINE] Single-pass analysis starting for ${safeText.length} chars via ${useGroq ? 'Groq ☁️' : 'Ollama 🦙'}...`);

        let response;
        if (useGroq) {
            response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                timeout: 20000
            });
        } else {
            response = await axios.post('http://127.0.0.1:11434/v1/chat/completions', {
                model: 'llama3.2',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            });
        }

        const rawContent = response.data.choices[0].message.content;

        let parsed;
        try {
            parsed = JSON.parse(rawContent);
        } catch (jsonErr) {
            console.error('[AI ENGINE] JSON Fixup Required:', jsonErr.message);
            // Fallback: If JSON is malformed, try to extract summary via regex as a safety net
            const summaryMatch = rawContent.match(/"summary"\s*:\s*"(.*)"/s);
            parsed = {
                biomarkers: [],
                summary: summaryMatch ? summaryMatch[1].replace(/\\n/g, '\n') : 'Analysis completed, but data formatting failed. Please try again.'
            };
        }

        return {
            biomarkers: Array.isArray(parsed.biomarkers) ? parsed.biomarkers : [],
            summary: parsed.summary || 'Summary generation failed.'
        };
    } catch (error) {
        console.error('[AI ENGINE ERROR]', error.message);
        return {
            biomarkers: [],
            summary: 'The medical analysis engine is currently busy. Please consult your doctor directly.'
        };
    }
};

const googleTTS = require('google-tts-api');

exports.generateAudio = async (textSummary, language = 'en') => {
    try {
        const langMap = {
            'english': 'en',
            'hindi': 'hi',
            'marathi': 'mr',
            'telugu': 'te'
        };
        const isoCode = langMap[language.toLowerCase()] || language.toLowerCase() || 'en';

        console.log(`[AI Service] Generating free TTS audio in language code: ${isoCode} (Original: ${language})`);

        // Remove empty lines and limit size
        const cleanText = textSummary.replace(/\n/g, ' ').substring(0, 1000);

        // getAllAudioBase64 handles text chunking (Google TTS native limit is 200 chars)
        const chunks = await googleTTS.getAllAudioBase64(cleanText, {
            lang: isoCode,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        });

        // Combine dynamically generated MP3 base64 chunks into a single readable buffer
        const audioBuffers = chunks.map(chunk => Buffer.from(chunk.base64, 'base64'));
        const combinedBuffer = Buffer.concat(audioBuffers);

        return combinedBuffer;
    } catch (error) {
        console.error('Free TTS Error:', error.message);
        // Fallback to silent WAV string if TTS fails
        return Buffer.from("UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAwA=", 'base64');
    }
};
