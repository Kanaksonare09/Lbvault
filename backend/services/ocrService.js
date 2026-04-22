const vision = require('@google-cloud/vision');

// Configure the client with credentials from environment variables
const client = new vision.ImageAnnotatorClient({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
});

/**
 * Extracts text from an image or PDF using Google Cloud Vision API
 * @param {string} fileUrl - The public URL of the file (Cloudinary URL)
 * @returns {Promise<string>} - Extracted text
 */
exports.extractText = async (fileUrl) => {
    try {
        console.log(`[OCR SERVICE] Processing file with Google Cloud Vision: ${fileUrl}`);
        
        // For images, Vision API can take the URL directly
        // For PDFs, Vision API requires a more complex GCS setup, 
        // so for now we prioritize image extraction and standard text fallback for PDF
        
        const [result] = await client.textDetection(fileUrl);
        const detections = result.textAnnotations;
        
        if (!detections || detections.length === 0) {
            console.log('[OCR SERVICE] No text detected by Google Vision.');
            return "";
        }

        console.log(`[OCR SERVICE] Successfully extracted ${detections[0].description.length} characters.`);
        return detections[0].description;
    } catch (error) {
        console.error('[OCR SERVICE ERROR] Google Vision failed:', error.message);
        throw error;
    }
};
