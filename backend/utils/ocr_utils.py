import cv2
import pytesseract
import re
from datetime import datetime

# Path to Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


def extract_dob_name_gender(image_path):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # OCR: Extract full text
    text = pytesseract.image_to_string(gray)
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # ------------------------
    # Extract DOB (Format: dd/mm/yyyy or dd-mm-yyyy)
    dob_match = re.search(r'\d{2}[/-]\d{2}[/-]\d{4}', text)
    dob = dob_match.group() if dob_match else None

    # ------------------------
    # Extract Gender
    gender = None
    for g in ['MALE', 'FEMALE', 'FEMAL', 'OTHER']:
        if g in text.upper():
            gender = 'FEMALE' if g.startswith('FEMAL') else g
            break

    # ------------------------
    # Extract Name
    # Heuristic: First ALL CAPS line (not containing keywords like GOVT, UIDAI, YEAR)
    name = None
    ignore_words = ['GOVT', 'GOVERNMENT', 'UIDAI', 'INDIA', 'YEAR', 'DOB', 'FEMALE', 'MALE', 'OTHER']

    for line in lines:
        if line.isupper() and not any(word in line for word in ignore_words):
            if 3 <= len(line.split()) <= 5:  # likely a name
                name = line.title()
                break

    return {
        "dob": dob,
        "gender": gender,
        "name": name,
        "full_text": text
    }


def calculate_age(dob):
    try:
        dob_date = datetime.strptime(dob, "%d/%m/%Y")
    except:
        try:
            dob_date = datetime.strptime(dob, "%d-%m-%Y")
        except:
            return None

    today = datetime.today()
    return today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))

