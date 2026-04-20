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

        const prompt = `You are an empathetic Health Guide and Medical Interpreter.
Your task is to analyze the following medical report OCR text and explain it to a NON-MEDICAL person in a warm, encouraging, and clear tone.

Perform TWO tasks in one pass:
1. Extract EVERY SINGLE measurable parameter/biomarker found in the text into the JSON array. Do not miss any!
CRITICAL RULE 1: Extract ALL valid parameters (e.g., Creatinine, Urea, Sodium, Potassium, Hemoglobin, etc.) that have a measured result in the text.
CRITICAL RULE 2: ABSOLUTELY DO NOT treat the Title or Category of the report (e.g., "Kidney Function Test", "Liver Panel", "CBC", "Thyroid Profile") as a biomarker itself. A biomarker must be a specific test item with a distinct measured value. 
CRITICAL RULE 3: DO NOT generate, make up, guess, or infer any parameters that are not explicitly present in the text.
2. Generate a highly patient-friendly summary. Imagine you are talking to a concerned person at home:
   - Use simple words (e.g., instead of "Hyperlipidemia", use "Higher levels of fat or cholesterol in your blood").
   - Explain WHY a certain marker matters (e.g., "This test helps us see how well your liver is cleaning your system").
   - Use a tone that is optimistic yet cautious, providing clear next steps.

Output strictly a valid JSON object with this exact structure:
{
  "biomarkers": [
    {
      "name": "Friendly test name (e.g., Blood Sugar)",
      "clinical_name": "Exact clinical name EXACTLY AS IT APPEARS in text (e.g., HbA1c)",
      "value": number (The actual test result value exactly from the text),
      "unit": "string",
      "min": number (Extract the reference/normal range MINIMUM exactly as shown in the text. If the text does not supply a reference range, use null. DO NOT guess or hallucinate.),
      "max": number (Extract the reference/normal range MAXIMUM exactly as shown in the text. If the text does not supply a reference range, use null. DO NOT guess or hallucinate.),
      "severity": "Normal|Mild|Moderate|Critical",
      "interpretation": "A very simple 1-sentence explanation of what this result means for the user's body.",
      "confidence": number
    }
  ],
  "summary": "string (A warm, 3-4 paragraph message. Start with a greeting. Breakdown the most important results first using simple analogies. End with a clear 'Your Next Steps' section with bullet points using emojis.)"
}

${langRule}

General Rules:
- STRICT RULE ON BIOMARKERS: Only include a biomarker if it appears in the Report Text. Do NOT make "Kidney Function Test" a biomarker.
- STRICT RULE ON REFERENCE RANGES: Extract the reference ranges/normal ranges from the text itself. DO NOT use your internal knowledge to fill in reference ranges. If it's missing in the text, use null for min and max.
- AVOID complex medical jargon. If you must use a medical term, explain it immediately in brackets.
- USE analogies (e.g., "Think of your kidneys as your body's filter system").
- IF THE OCR TEXT IS UNREADABLE, include "We couldn't quite read the details of this scan clearly. Could you please upload a clearer photo?"
- Output ONLY the JSON object.

Report text (STRICT DATA SOURCE): ${safeText}`;

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
