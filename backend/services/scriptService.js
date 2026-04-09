/**
 * CONVERSATIONAL SCRIPT GENERATOR
 * Builds a clean, TTS-ready voice script from the empathetically rewritten summary.
 * Structured for clarity: Greeting → Explanation → Tips → Closing
 * Optimized for ~50-60 seconds of audio.
 */

const GREETINGS = {
    en: "Hello! I've looked at your recent health report and I want to explain it to you in simple words.",
    hi: "नमस्ते! मैंने आपकी हाल की स्वास्थ्य जाँच देखी है और आपको आसान भाषा में समझाना चाहता हूँ।",
    mr: "नमस्कार! मी तुमचा अलीकडचा आरोग्य अहवाल पाहिला आहे आणि तो सोप्या भाषेत सांगतो.",
    te: "హలో! మీ తాజా ఆరోగ్య నివేదికను చూశాను మరియు సులభమైన మాటల్లో వివరిస్తాను."
};

const CLOSINGS = {
    en: "Remember, small healthy changes every day make a big difference over time. You are doing great by staying on top of your health. Take care!",
    hi: "याद रखें, हर दिन छोटे-छोटे स्वस्थ बदलाव बड़ा फर्क लाते हैं। अपना ख्याल रखें, स्वस्थ रहें!",
    mr: "लक्षात ठेवा, दररोजचे छोटे-छोटे बदल मोठा फरक करतात. स्वतःची काळजी घ्या, निरोगी राहा!",
    te: "గుర్తుంచుకోండి, రోజువారీ చిన్న ఆరోగ్యకరమైన మార్పులు పెద్ద తేడా చేస్తాయి. మీ ఆరోగ్యాన్ని జాగ్రత్తగా చూసుకోండి!"
};

/**
 * Builds a clean voice script from the empathetically rewritten summary.
 * Strips markdown, structures content for TTS with greeting and closing.
 * @param {string} empatheticText - rewritten by rewriteService
 * @param {string} language - ISO language code
 * @returns {string} - clean voice script ready for TTS
 */
exports.buildVoiceScript = (empatheticText, language = 'en') => {
    const langMap = {
        'english': 'en', 'en': 'en',
        'hindi': 'hi',   'hi': 'hi',
        'marathi': 'mr', 'mr': 'mr',
        'telugu': 'te',  'te': 'te',
    };
    const langCode = langMap[String(language).toLowerCase()] || 'en';

    const greeting = GREETINGS[langCode] || GREETINGS['en'];
    const closing = CLOSINGS[langCode] || CLOSINGS['en'];

    // Strip all markdown formatting for clean TTS
    const cleanBody = empatheticText
        .replace(/\*\*/g, '')            // Remove bold markers
        .replace(/#{1,6}\s/g, '')        // Remove heading markers
        .replace(/^[•\-\*]\s*/gm, '')    // Remove bullet points
        .replace(/Simple Tips For You:/gi, 'Here are some simple tips for you.') // Convert header to spoken sentence
        .replace(/\n{2,}/g, '. ')        // Paragraph breaks → pause
        .replace(/\n/g, ' ')             // Single newlines → space
        .replace(/\s{2,}/g, ' ')         // Collapse multiple spaces
        .replace(/\.{2,}/g, '.')         // Clean up multiple dots
        .trim();

    // Compose: Greeting → Body → Closing
    const script = `${greeting} ${cleanBody} ${closing}`;

    // Allow up to 900 characters (~55-60 seconds of audio) to fit tips
    if (script.length > 900) {
        // Trim cleanly at a sentence boundary
        const trimmed = script.substring(0, 897);
        const lastPeriod = trimmed.lastIndexOf('.');
        return lastPeriod > 600 ? trimmed.substring(0, lastPeriod + 1) : trimmed + '...';
    }

    return script;
};
