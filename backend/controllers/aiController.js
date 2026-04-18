const axios = require('axios');
const ReportAiAnalysis = require('../models/ReportAiAnalysis');
const ReportBiomarker = require('../models/ReportBiomarker');
const Report = require('../models/Report');

/**
 * POST /api/ai/ask
 * Accepts { reportId, question, history[] } and returns an AI answer
 * grounded in the patient's actual report data.
 */
exports.askAI = async (req, res) => {
    try {
        const { reportId, question, history = [] } = req.body;

        if (!question?.trim()) {
            return res.status(400).json({ message: 'Question is required.' });
        }

        // --- Build context from the patient's report ---
        let contextBlock = '';

        if (reportId) {
            const [report, analysis, biomarkers] = await Promise.all([
                Report.findById(reportId).lean(),
                ReportAiAnalysis.findOne({ reportId }).lean(),
                ReportBiomarker.find({ reportId }).lean()
            ]);

            if (report) {
                contextBlock += `Report Name: ${report.reportName || 'Unknown'}\n`;
                contextBlock += `Test Type: ${report.testType || 'Unknown'}\n`;
            }
            if (analysis?.summaryEn) {
                contextBlock += `\nAI Summary:\n${analysis.summaryEn}\n`;
            }
            if (biomarkers.length > 0) {
                contextBlock += `\nExtracted Biomarkers:\n`;
                biomarkers.forEach(b => {
                    contextBlock += `- ${b.biomarkerName}: ${b.value} ${b.unit || ''}`
                        + (b.referenceMin != null ? ` (ref: ${b.referenceMin}–${b.referenceMax})` : '')
                        + ` → ${b.severity}`
                        + (b.interpretation ? ` | ${b.interpretation}` : '')
                        + '\n';
                });
            }
        }

        // --- Build conversation messages for Llama ---
        const systemPrompt = `You are LabVault AI, a helpful and empathetic medical assistant.
You are answering a patient's questions about their medical report.
Always be warm, clear, and non-alarming. Use simple language — avoid jargon.
Never diagnose. Always recommend consulting a doctor for serious concerns.
${contextBlock ? `\nPATIENT'S REPORT CONTEXT:\n${contextBlock}` : ''}
Answer ONLY based on the context provided. If something is not in the context, say you don't have that information.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            // Include recent history (max last 6 messages to stay within token limit)
            ...history.slice(-6).map((h) => ({
                role: h.role,
                content: h.content
            })),
            { role: 'user', content: question.trim() }
        ];

        console.log(`[Ask AI] Question: "${question}" | reportId: ${reportId || 'none'}`);

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        let answer = '';

        if (GROQ_API_KEY) {
            // HIGH-PERFORMANCE CLOUD AI (Groq)
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.1-8b-instant',
                messages,
                temperature: 0.4,
                max_tokens: 500
            }, {
                headers: { 
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json' 
                },
                timeout: 20000 
            });
            answer = response.data.choices?.[0]?.message?.content?.trim();
        } else {
            // LOCAL FALLBACK (Ollama)
            const response = await axios.post('http://127.0.0.1:11434/v1/chat/completions', {
                model: 'llama3.2',
                messages,
                temperature: 0.4,
                max_tokens: 400
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            });
            answer = response.data.choices?.[0]?.message?.content?.trim();
        }

        if (!answer) answer = 'I could not generate an answer. Please try again.';

        console.log(`[Ask AI] Answer generated (${answer.length} chars)`);
        res.status(200).json({ answer });

    } catch (error) {
        console.error('[Ask AI Error]', error.message);
        res.status(500).json({
            message: 'AI is currently unavailable. Please ensure Ollama is running.'
        });
    }
};
