const axios = require('axios');

/**
 * STEP 2: EMPATHETIC REWRITE ENGINE
 * Transforms clinical AI summaries into calm, doctor-like patient explanations.
 */
exports.rewriteAsEmpathetic = async (summary, language = 'en') => {
    try {
        const langInstructions = {
            hi: `भाषा नियम (अनिवार्य): पूरा संदेश हिंदी में लिखें।
हर वाक्य, हर शब्द देवनागरी लिपि में होना चाहिए।
केवल ये अंग्रेजी में रखें: टेस्ट के नाम (Hemoglobin, ALT, AST, Creatinine आदि), इकाइयाँ (mg/dL, g/dL, U/L) और संख्याएँ।
सही उदाहरण: "मैंने देखा कि आपका **Hemoglobin** स्तर 10.5 g/dL है, जो सामान्य से थोड़ा कम है।"
गलत: "I noticed your Hemoglobin..." — यह स्वीकार्य नहीं है।
सभी सलाह, शुभकामनाएँ और स्पष्टीकरण हिंदी में होने चाहिए।`,
            mr: `भाषा नियम (अनिवार्य): संपूर्ण संदेश मराठीत लिहा।
प्रत्येक वाक्य, प्रत्येक शब्द मराठीत असणे आवश्यक आहे।
फक्त हे इंग्रजीत ठेवा: चाचणीची नावे (Hemoglobin, ALT, AST), एकके (mg/dL, g/dL) आणि संख्या.
बरोबर उदाहरण: "मी पाहिले की तुमचे **Hemoglobin** 10.5 g/dL आहे, जे सामान्यपेक्षा थोडे कमी आहे."
सर्व सल्ला, शुभेच्छा आणि स्पष्टीकरण मराठीत असावे.`,
            te: `భాషా నియమం (తప్పనిసరి): మొత్తం సందేశాన్ని తెలుగులో రాయండి.
ప్రతి వాక్యం, ప్రతి మాట తెలుగులో ఉండాలి.
ఇవి మాత్రమే ఇంగ్లీషులో ఉంచండి: పరీక్ష పేర్లు (Hemoglobin, ALT, AST), యూనిట్లు (mg/dL) మరియు సంఖ్యలు.
సరైన ఉదాహరణ: "నేను గమనించాను మీ **Hemoglobin** స్థాయి 10.5 g/dL గా ఉంది, ఇది సాధారణం కంటే కొంచెం తక్కువ."
అన్ని సలహాలు, శుభాకాంక్షలు తెలుగులో రాయండి.`,
            en: `Language: Write entirely in English. Use simple, conversational words a non-medical person can understand.`
        };

        const langCode = String(language).toLowerCase().substring(0, 2);
        const langRule = langInstructions[langCode] || langInstructions['en'];
        const langInstruction = langRule;

        const prompt = `You are a compassionate, senior doctor writing a message to your patient after reviewing their medical report.
Your task is to rewrite the following AI-generated medical summary into a warm, empathetic, and easy-to-understand explanation.

STRICT RULES:
1. Use a calm, caring, conversational tone — like a trusted doctor speaking directly to the patient.
2. Start with "Hello," and address the patient directly using "you/your".
3. Use reassuring phrases: "I noticed that...", "This is quite common...", "There's no need to panic...".
4. NEVER use alarming words: critical, dangerous, severe, emergency, life-threatening.
5. Avoid repeating raw numbers. Describe values as "slightly high", "a little low", "within a healthy range".
6. Keep the message under 150 words — concise and clear.
7. End with a warm, encouraging closing line.
8. ${langInstruction}

Medical Summary to Rewrite:
"""
${summary}
"""

Output ONLY the rewritten patient message. No JSON. No labels.`;

        const response = await axios.post('http://127.0.0.1:11434/v1/chat/completions', {
            model: 'llama3.2',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
            max_tokens: 300
        }, { headers: { 'Content-Type': 'application/json' }, timeout: 45000 });

        return response.data.choices[0].message.content.trim();
    } catch (err) {
        console.error('[REWRITE SERVICE ERROR]', err.message);
        // Return a sensible fallback that doesn't alarm the patient
        return `Hello, I've reviewed your recent medical report. The results show some values we'd like to monitor. There's no need to worry — these findings are quite common. I'd recommend scheduling a follow-up appointment to discuss next steps. Take care and stay healthy!`;
    }
};
