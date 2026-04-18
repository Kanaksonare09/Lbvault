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
2. Use a BULLET POINT LIST to explain their key results. Each point should look like this:
   - • [Biomarker]: [Simple, plain-language explanation of what it means].
3. For ABNORMAL values, explain why they matter (e.g. "it's too high/low, which means...")
4. For NORMAL values, simply state they are in a "healthy range".
5. Add a section called "Simple Tips For You:" with 3-4 specific, practical bullet points.
6. Use simple everyday language — avoid medical jargon entirely.
7. NEVER use scary words like dangerous, severe, or life-threatening.
8. Keep the total response under 200 words.
9. End with an encouraging closing line.
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

/**
 * CLINICAL REWRITE ENGINE (Doctor-Facing)
 * Generates a concise, structured clinical voice brief for a doctor dashboard.
 * Follows strict medical tone rules — no emotional language, no diagnosis.
 * Target: 10–25 seconds of spoken audio.
 */
exports.rewriteAsClinical = async (summaryText, patientName = 'the patient', biomarkers = [], langCode = 'en') => {
    try {
        // Build a compact biomarker block (top 5 abnormals only)
        const abnormals = biomarkers
            .filter(b => b.isAbnormal)
            .slice(0, 5)
            .map(b => `${b.biomarkerName}: ${b.value} ${b.unit} (Ref: ${b.referenceMin}–${b.referenceMax}) [${b.severity}]`)
            .join(', ');

        const biomarkerBlock = abnormals
            ? `Key abnormal findings: ${abnormals}.`
            : 'No critical abnormalities detected.';

        const prompt = `You are an AI medical assistant generating a **voice summary for a doctor dashboard**.

RULES (strictly follow):
1. Begin with: "Patient ${patientName}…"
2. Highlight ONLY key abnormal findings with their severity (Mild / Moderate / Critical).
3. Mention trend direction if relevant (e.g., "TSH has been increasing across recent reports").
4. Keep total response to 2–4 short sentences (10–25 seconds when spoken aloud).
5. Professional and neutral tone — NO emotional or reassuring language.
6. Do NOT address the patient. Do NOT diagnose. Do NOT use scary language.
7. Focus ONLY on clinically relevant data.

Biomarker Data:
${biomarkerBlock}

AI Summary Context:
"""\n${summaryText.slice(0, 600)}\n"""

Output ONLY the spoken clinical summary. No labels. No markdown. No headers.`;

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        const useGroq = GROQ_API_KEY && !GROQ_API_KEY.includes('your_groq');

        let response;
        if (useGroq) {
            response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 120
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
                temperature: 0.3,
                max_tokens: 120
            }, { headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
        }

        return response.data.choices[0].message.content.trim();
    } catch (err) {
        console.error('[CLINICAL REWRITE ERROR]', err.message);
        // Fallback: compact clinical statement
        return `Patient ${patientName} shows findings requiring clinical review. Please refer to the detailed biomarker report for specifics.`;
    }
};
/**
 * LONGITUDINAL REWRITE ENGINE
 * Summarizes entire patient history across multiple reports for a "big picture" overview.
 */
exports.rewriteAsLongitudinal = async (patientName, trends = [], langCode = 'en') => {
    try {
        const trendSummary = trends.map(t => {
            const latest = t.values[t.values.length - 1];
            const start = t.values[0];
            return `${t.parameter}: ${start.value} ${start.unit} -> ${latest.value} ${latest.unit} (${latest.isAbnormal ? 'abnormal' : 'normal'})`;
        }).join(', ');

        const prompt = `You are an AI medical assistant. Generate a longitudinal clinical summary for a doctor.
            
            PATIENT: ${patientName}
            HISTORICAL TRENDS: ${trendSummary}
            
            RULES:
            1. Begin with: "Patient ${patientName}..."
            2. Highight trends over time and repeated abnormalities.
            3. Mention the overall risk level (low / moderate / high).
            4. Tone: Professional and neutral.
            5. Length: 15-30 seconds of speech (approx 50-80 words).
            6. Language: ${langCode === 'mr' ? 'Marathi' : langCode === 'hi' ? 'Hindi' : 'English'}
            
            OUTPUT: A single cohesive paragraph of plain text.`;

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        let response;

        if (GROQ_API_KEY) {
            response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 200
            }, { 
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                timeout: 10000 
            });
        } else {
            response = await axios.post('http://127.0.0.1:11434/v1/chat/completions', {
                model: 'llama3.2',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 200
            }, { headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
        }

        return response.data.choices[0].message.content.trim();
    } catch (err) {
        console.error('[LONGITUDINAL REWRITE ERROR]', err.message);
        return `Patient ${patientName} demonstrates a history of ${trends.length} clinical markers. Please review the detailed trend analytics for comprehensive risk assessment.`;
    }
};
