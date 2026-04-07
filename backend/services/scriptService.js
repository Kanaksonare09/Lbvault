/**
 * STEP 3: CONVERSATIONAL SCRIPT GENERATOR
 * Transforms an empathetic rewrite into a structured 6-part voice script.
 * Optimized for under 40 seconds of audio.
 */

const GREETINGS = {
    en: "Hello, I've reviewed your recent health report and here's a simple explanation for you.",
    hi: "नमस्ते, मैंने आपकी हाल की स्वास्थ्य रिपोर्ट देखी है। आइए इसे सरल भाषा में समझते हैं।",
    mr: "नमस्कार, मी आपला अलीकडचा आरोग्य अहवाल पाहिला आहे. चला तो सोप्या भाषेत समजून घेऊया.",
    te: "హలో, మీ తాజా ఆరోగ్య నివేదికను నేను సమీక్షించాను. దానిని సులభంగా అర్థం చేసుకుందాం."
};

const CLOSINGS = {
    en: "Take care of yourself, follow the recommendations, and don't hesitate to reach out to your doctor. Stay healthy!",
    hi: "अपना ख्याल रखें, दिए गए सुझावों का पालन करें और अपने डॉक्टर से संपर्क करने में संकोच न करें। स्वस्थ रहें!",
    mr: "स्वतःची काळजी घ्या, दिलेल्या सल्ल्यांचे पालन करा आणि आपल्या डॉक्टरशी संपर्क साधण्यास अजिबात संकोच करू नका. निरोगी राहा!",
    te: "మీ ఆరోగ్యాన్ని జాగ్రత్తగా చూసుకోండి, సిఫార్సులను పాటించండి మరియు మీ వైద్యుడిని సంప్రదించడానికి సంకోచించకండి. ఆరోగ్యంగా ఉండండి!"
};

/**
 * Builds a clean voice script from the empathetically rewritten summary.
 * The script is optimized for TTS: short sentences, no markdown, under 150 words.
 * @param {string} empatheticText - already rewritten by rewriteService
 * @param {string} language - ISO language code
 * @returns {string} - clean voice script
 */
exports.buildVoiceScript = (empatheticText, language = 'en') => {
    // Normalize: accept both 'hi' and 'Hindi', 'mr' and 'Marathi', etc.
    const langMap = {
        'english': 'en', 'en': 'en',
        'hindi': 'hi',   'hi': 'hi',
        'marathi': 'mr', 'mr': 'mr',
        'telugu': 'te',  'te': 'te',
    };
    const langCode = langMap[String(language).toLowerCase()] || 'en';

    const greeting = GREETINGS[langCode] || GREETINGS['en'];
    const closing = CLOSINGS[langCode] || CLOSINGS['en'];

    // Strip all markdown (bold **, bullets •, headers ##, emojis in specific contexts)
    const cleanBody = empatheticText
        .replace(/\*\*/g, '')           // Remove bold markers
        .replace(/#{1,6}\s/g, '')       // Remove heading markers
        .replace(/^[•\-\*]\s*/gm, '')   // Remove bullet points
        .replace(/\n{2,}/g, ' ')        // Collapse multi-newlines to space
        .replace(/\n/g, ' ')            // Single newlines to space
        .replace(/\s{2,}/g, ' ')        // Collapse multiple spaces
        .trim();

    // Compose the structured script: Greeting → Body → Closing
    const script = `${greeting} ${cleanBody} ${closing}`;

    // Trim to ~600 characters to ensure audio stays under 40 seconds
    if (script.length > 600) {
        return script.substring(0, 597) + '...';
    }

    return script;
};
