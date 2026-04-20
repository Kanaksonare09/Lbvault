import os
import logging
import io
from dotenv import load_dotenv
from PIL import Image

# Load environment variables
load_dotenv()

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure Gemini if API key is available
api_key = os.getenv("GOOGLE_AI_STUDIO_API_KEY", "").strip()
gemini_model = None

if api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        logger.info("Gemini AI configured successfully.")
    except Exception as e:
        logger.warning(f"Gemini setup failed: {e}. Will use fallback OCR.")
        api_key = None
else:
    logger.warning("GOOGLE_AI_STUDIO_API_KEY not set. Using local OCR fallbacks.")


def _extract_native_pdf_text(file_bytes):
    """Strategy 1: Extract native text layer from digital PDFs using pdfplumber.
    This is the BEST method for typed/digital lab reports (lipid panels, CBC, etc.)
    because it reads the actual embedded text with 100% accuracy."""
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages_text = []
            for page in pdf.pages:
                text = page.extract_text(x_tolerance=3, y_tolerance=3) or ""
                # Also try extracting tables explicitly for structured lab reports
                tables = page.extract_tables()
                if tables:
                    for table in tables:
                        for row in table:
                            if row:
                                row_text = " | ".join(cell or "" for cell in row)
                                if any(c.isdigit() for c in row_text):  # Only add rows with numbers
                                    text += "\n" + row_text
                pages_text.append(text.strip())
            
            combined = "\n\n".join(pages_text).strip()
            if combined:
                logger.info(f"[Strategy 1 - pdfplumber] Extracted {len(combined)} chars from native PDF.")
            return combined
    except ImportError:
        logger.warning("pdfplumber not installed. Skipping native text extraction.")
        return ""
    except Exception as e:
        logger.warning(f"[Strategy 1 - pdfplumber] Failed: {e}")
        # Secondary fallback for native text if pdfplumber fails
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            if len(text.strip()) > 10:
                logger.info(f"[Strategy 1 - pypdf Fallback] Extracted {len(text)} chars.")
                return text.strip()
        except:
            pass
        return ""


def _extract_with_gemini(images):
    """Strategy 2: Use Gemini Vision for scanned PDFs or images."""
    if not gemini_model:
        return ""
    try:
        logger.info("[Strategy 2 - Gemini] Using Gemini AI for high-accuracy OCR...")
        prompt = (
            "You are a clinical OCR system specializing in medical lab reports.\n"
            "Your task: Extract ALL text from this medical report image VERBATIM and COMPLETELY.\n"
            "CRITICAL RULES:\n"
            "1. Preserve every table row exactly — include test names, numeric values, units, and reference ranges.\n"
            "2. For lipid panels, CBC, LFT, KFT and similar tests: capture EVERY parameter.\n"
            "   Lipid panel parameters: Total Cholesterol, LDL Cholesterol, HDL Cholesterol, Triglycerides, VLDL, Non-HDL.\n"
            "3. Do NOT skip rows containing numbers.\n"
            "4. Preserve column headers and reference range columns (e.g. 'Desirable < 200 mg/dL').\n"
            "5. Output plain text only — no markdown, no commentary."
        )
        consolidated_payload = []
        for img in images:
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG')
            consolidated_payload.append({"mime_type": "image/jpeg", "data": img_byte_arr.getvalue()})

        response = gemini_model.generate_content(consolidated_payload + [prompt])
        text = response.text.strip()
        logger.info(f"[Strategy 2 - Gemini] Extracted {len(text)} chars.")
        return text
    except Exception as e:
        logger.warning(f"[Strategy 2 - Gemini] Failed: {e}")
        return ""


def _extract_with_tesseract(images):
    """Strategy 3: Local Tesseract OCR as final fallback."""
    try:
        import pytesseract
        from PIL import ImageFilter, ImageEnhance
        
        # Explicitly set tesseract path for Mac/Homebrew environments
        tess_path = "/opt/homebrew/bin/tesseract"
        if os.path.exists(tess_path):
            pytesseract.pytesseract.tesseract_cmd = tess_path
            
        logger.info("[Strategy 3 - Tesseract] Using local Tesseract OCR...")
        text_blocks = []
        for i, img in enumerate(images):
            logger.info(f"  Preprocessing page {i+1}...")
            img_gray = img.convert('L')
            enhancer = ImageEnhance.Contrast(img_gray)
            img_enhanced = enhancer.enhance(2.0)
            img_sharp = img_enhanced.filter(ImageFilter.SHARPEN)
            text = pytesseract.image_to_string(img_sharp, config='--psm 4 --oem 3')
            text_blocks.append(text)
        combined = "\n\n".join(text_blocks).strip()
        logger.info(f"[Strategy 3 - Tesseract] Extracted {len(combined)} chars.")
        return combined
    except ImportError:
        logger.warning("pytesseract not installed. Tesseract fallback unavailable.")
        return ""
    except Exception as e:
        logger.warning(f"[Strategy 3 - Tesseract] Failed: {e}")
        return ""


def process_file_in_memory(file_stream, filename, enable_preprocessing=True):
    """
    Smart multi-strategy OCR:
    1. pdfplumber (native text layer) — best for typed/digital PDFs like lab reports
    2. Gemini Vision — best for scanned PDFs/images (if API key set)
    3. Tesseract — local fallback for scanned documents
    """
    file_bytes = file_stream.read()
    if not file_bytes:
        logger.warning(f"Empty file stream for {filename}")
        return ""

    is_pdf = filename.lower().endswith('.pdf')
    extracted_text = ""

    # --- Strategy 1: Try native PDF text extraction first (fastest, most accurate for digital PDFs) ---
    if is_pdf:
        extracted_text = _extract_native_pdf_text(file_bytes)
        if len(extracted_text) > 500:  # Only use if we got substantial text, preventing small digital headers from hijacking scanned image pages
            logger.info(f"Strategy 1 succeeded with {len(extracted_text)} chars. Skipping image OCR.")
            return extracted_text

    # --- Strategy 2 & 3: Convert to images, then try Gemini or Tesseract ---
    try:
        images = []
        if is_pdf:
            try:
                from pdf2image import convert_from_bytes
                # Explicitly add poppler path for Mac Homebrew environments
                poppler_path = "/opt/homebrew/bin" if os.path.exists("/opt/homebrew/bin/pdftocairo") else None
                images = convert_from_bytes(file_bytes, poppler_path=poppler_path)
                logger.info(f"Converted PDF to {len(images)} images for visual OCR.")
            except Exception as pdf_err:
                logger.warning(f"pdf2image failed: {pdf_err}. Trying Tesseract directly on bytes.")
        else:
            images = [Image.open(io.BytesIO(file_bytes))]
            logger.info("Single image file loaded for OCR.")

        if images:
            # Prefer Gemini if configured, else Tesseract
            extracted_text = _extract_with_gemini(images) if api_key else ""
            if not extracted_text.strip():
                extracted_text = _extract_with_tesseract(images)

    except Exception as e:
        logger.error(f"Image conversion/OCR failed: {e}")

    if not extracted_text.strip():
        logger.warning("All OCR strategies returned empty text. File may be corrupt or unsupported.")
        return ""

    logger.info(f"Final extracted text: {len(extracted_text)} characters.")
    return extracted_text.strip()
