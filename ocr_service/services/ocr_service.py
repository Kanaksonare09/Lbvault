import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from pdf2image import convert_from_bytes
from PIL import Image
import io

# Load environment variables
load_dotenv()

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Poppler path is automatically handled by the system on Mac if installed via brew
POPPLER_PATH = None

# Configure Gemini
api_key = os.getenv("GOOGLE_AI_STUDIO_API_KEY")
if not api_key:
    logger.error("GOOGLE_AI_STUDIO_API_KEY not found in environment")
else:
    genai.configure(api_key=api_key)

def process_file_in_memory(file_stream, filename, enable_preprocessing=True):
    """
    Hybrid OCR: Uses local Poppler for PDF conversion to optimize 
    and Gemini 1.5 Flash for high-accuracy text extraction.
    """
    extracted_text = ""
    file_bytes = file_stream.read()
    
    if not file_bytes:
        logger.warning(f"Empty file stream provided for {filename}")
        return ""

    is_pdf = filename.lower().endswith('.pdf')
    
    # --- STEP 1: Always try to get images (OCR data) ---
    try:
        images = []
        if is_pdf:
            # Use Poppler to convert PDF to images locally
            images = convert_from_bytes(file_bytes)
        else:
            # It's an image already
            images = [Image.open(io.BytesIO(file_bytes))]
            
        logger.info(f"Loaded {len(images)} document pages for processing.")
        
        # --- STEP 2: Logic for AI vs Local OCR ---
        if api_key:
            logger.info("Using Gemini AI for high-accuracy OCR...")
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = "You are a clinical OCR system. Read this medical report and extract ALL verbatim text."
            
            consolidated_payload = []
            for img in images:
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='JPEG')
                consolidated_payload.append({"mime_type": "image/jpeg", "data": img_byte_arr.getvalue()})
            
            response = model.generate_content(consolidated_payload + [prompt])
            extracted_text = response.text
        else:
            # FALLBACK: Use Pytesseract (Local and Free)
            import pytesseract
            from PIL import ImageFilter, ImageEnhance
            logger.info("GOOGLE_API_KEY missing. Using Local Tesseract OCR Engine with preprocessing...")
            text_blocks = []
            for i, img in enumerate(images):
                logger.info(f"Preprocessing and OCR-ing page {i+1} locally...")
                # Convert to grayscale for better OCR accuracy
                img_gray = img.convert('L')
                # Enhance contrast to make text pop out from background
                enhancer = ImageEnhance.Contrast(img_gray)
                img_enhanced = enhancer.enhance(2.0)
                # Sharpen to improve character recognition
                img_sharp = img_enhanced.filter(ImageFilter.SHARPEN)
                # Run Tesseract with medical document config
                text = pytesseract.image_to_string(img_sharp, config='--psm 6 --oem 3')
                text_blocks.append(text)
            extracted_text = "\n\n".join(text_blocks)
            
            # If Tesseract returned nothing and it's a PDF, try native text layer
            if not extracted_text.strip() and is_pdf:
                import pdfplumber
                try:
                    logger.info("Tesseract empty — trying native PDF text layer via pdfplumber...")
                    import io as _io
                    with pdfplumber.open(_io.BytesIO(file_bytes)) as pdf:
                        pages_text = [page.extract_text() or "" for page in pdf.pages]
                        extracted_text = "\n\n".join(pages_text)
                except Exception as plumber_err:
                    logger.warning(f"pdfplumber fallback failed: {plumber_err}")

        if not extracted_text.strip():
            # Final fallback to standard PDF text strip if OCR fails
            logger.warning("OCR returned no text. This might be an empty scan or lacks text layer.")
            return ""

        logger.info(f"Successfully extracted {len(extracted_text)} characters.")
        return extracted_text.strip()
        
    except Exception as e:
        logger.error(f"Error during Hybrid OCR processing: {str(e)}")
        return "" # Allow backend to try native parsing if this fails too
