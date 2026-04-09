const axios = require('axios');

/**
 * EMPATHETIC REWRITE ENGINE
 * Transforms clinical lab values into a simple, friendly patient explanation
 * with plain-language explanations and actionable lifestyle tips.
 */
exports.rewriteAsEmpathetic = async (summary, language = 'en') => {
    try {
        const langInstructions = {
            hi: `भाषा नियम (अनिवार्य): पूरा संदेश हिंदी में लिखें।
हर वाक्य देवनागरी लिपि में होना चाहिए।
केवल ये अंग्रेजी में रखें: टेस्ट के नाम (Cholesterol, Hemoglobin आदि), इकाइयाँ (mg/dL) और संख्याएँ।
सलाह सरल हिंदी में दें जैसे: "तला हुआ खाना कम खाएं", "रोज 30 मिनट चलें"।`,
            mr: `भाषा नियम (अनिवार्य): संपूर्ण संदेश मराठीत लिहा।
सरळ मराठी वापरा. फक्त चाचणीची नावे आणि एकके इंग्रजीत ठेवा.
टिप्स मराठीत द्या: "तळलेले पदार्थ टाळा", "दररोज 30 मिनिटे चाला".`,
            te: `భాషా నియమం (తప్పనిసరి): మొత్తం సందేశాన్ని తెలుగులో రాయండి.
సాదా తెలుగు వాడండి. పరీక్ష పేర్లు మాత్రమే ఇంగ్లీషులో ఉంచండి.
చిట్కాలు తెలుగులో ఇవ్వండి: "వేయించిన ఆహారం తగ్గించండి", "రోజూ 30 నిమిషాలు నడవండి".`,
            en: `Language: Write entirely in simple English that anyone can understand. No medical jargon.`
        };

        const langCode = String(language).toLowerCase().substring(0, 2);
        const langRule = langInstructions[langCode] || langInstructions['en'];

        const prompt = `You are a friendly family doctor explaining a patient's lab report in simple everyday language.
The patient may not know any medical terms — your job is to make them understand their results clearly and tell them what they can do.

STRICT RULES:
1. Start with "Hello," — address the patient warmly and directly.
2. Explain what each ABNORMAL value means in plain everyday words:
   - Example: Instead of "Your LDL is elevated", say "LDL is the bad fat in your blood — yours is a bit high, which can clog blood vessels over time."
   - Example: Instead of "Triglycerides 210 mg/dL", say "Your blood fat level (Triglycerides) is slightly above the safe limit of 150."
3. For NORMAL values, just say they are "healthy" or "in a good range" — don't dwell on them.
4. Add a section called "Simple Tips For You:" with 3 specific, practical actions the patient can take TODAY based on their results. Examples:
   - Reduce fried and oily foods
   - Walk 30 minutes every day
   - Eat more fruits, vegetables, and whole grains
   - Avoid sugary drinks and sweets
   - Get a follow-up blood test in 3 months
5. NEVER use scary words: dangerous, severe, critical, life-threatening, emergency.
6. Use phrases like: "There's no need to panic", "Small changes go a long way", "You're doing the right thing by checking regularly".
7. Keep total response under 200 words — concise and clear.
8. End with an encouraging closing line.
9. ${langRule}

Lab Report Data:
"""
${summary}
"""

Output ONLY the patient-friendly message. No JSON. No labels. No headers.`;

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        const useGroq = GROQ_API_KEY && !GROQ_API_KEY.includes('your_groq');

        let response;
        if (useGroq) {
            response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 400
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                timeout: 15000
            });
        } else {
            response = await axios.post('http://127.0.0.1:11434/v1/chat/completions', {
                model: 'llama3.2',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 400
            }, { headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
        }

        return response.data.choices[0].message.content.trim();
    } catch (err) {
        console.error('[REWRITE SERVICE ERROR]', err.message);
        // Fallback: clean up the summary and add generic tips
        const clean = summary
            .replace(/\*\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/^[•\-\*]\s*/gm, '')
            .replace(/\n{2,}/g, ' ')
            .replace(/\n/g, ' ')
            .trim();
        return `Hello! I've reviewed your health report. ${clean} Simple Tips For You: Eat more fruits and vegetables, reduce fried and oily foods, walk 30 minutes every day, and stay well hydrated. Please consult your doctor for personalized advice. You are taking a great step for your health — stay positive and keep it up!`;
    }
};
