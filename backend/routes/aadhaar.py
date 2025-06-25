from flask import Blueprint, request, jsonify, current_app
import cv2
import os
import base64
from pdf2image import convert_from_path

from utils.file_utils import allowed_file, save_file
from utils.image_analysis import analyze_blur_and_lighting, crop_aadhaar_section
from utils.ocr_utils import extract_dob_name_gender, calculate_age
from utils.face_utils import crop_face_from_image

aadhaar_bp = Blueprint('aadhaar_bp', __name__)

def encode_image_to_base64(img):
    _, buffer = cv2.imencode('.jpg', img)
    return base64.b64encode(buffer).decode('utf-8')

@aadhaar_bp.route('/aadhaar-check', methods=['POST'])
def verify_aadhaar():
    if 'aadhaar' not in request.files:
        return jsonify({"error": "Aadhaar file missing."}), 400

    aadhaar = request.files['aadhaar']
    if not allowed_file(aadhaar.filename):
        return jsonify({"error": "Invalid Aadhaar file format."}), 400

    aadhaar_path = save_file(aadhaar, current_app.config['UPLOAD_FOLDER'])

    # Convert PDF to image
    if aadhaar.filename.lower().endswith('.pdf'):
        pages = convert_from_path(aadhaar_path, 300)
        if not pages:
            return jsonify({"error": "Unable to read PDF file."}), 400
        img_path = aadhaar_path.replace(".pdf", ".jpg")
        pages[0].save(img_path, 'JPEG')
    else:
        img_path = aadhaar_path

    # Read and crop Aadhaar image
    img = cv2.imread(img_path)
    cropped_img = crop_aadhaar_section(img)
    cv2.imwrite(img_path, cropped_img)  # overwrite with cropped version if needed

    aadhaar_base64 = encode_image_to_base64(cropped_img)

    # Image analysis
    blur, brightness = analyze_blur_and_lighting(cropped_img)
    ocr_result = extract_dob_name_gender(img_path)
    dob = ocr_result.get('dob')
    name = ocr_result.get('name')
    gender = ocr_result.get('gender')
    full_text = ocr_result.get('full_text', '')
    age = calculate_age(dob) if dob else None
    faces = crop_face_from_image(cropped_img)
    ocr_score = min(100, len(full_text.strip()) // 5)  # crude proxy

    warnings = []
    status = "pass"

    # DOB check
    if not dob:
        warnings.append("Date of birth could not be detected.")
        if ocr_score < 8:
            status = "fail"

    # Face count check
    if len(faces) > 1:
        warnings.append("Multiple faces detected. Only one should be visible.")
        status = "fail"
    elif len(faces) == 0:
        warnings.append("No face detected. Ensure the face is visible.")

    # Blur check
    if blur < 40:
        warnings.append("Image is very blurry. Try uploading a clearer image.")
        status = "fail"
    elif blur < 120:
        warnings.append("Image is slightly blurry but acceptable.")

    # Brightness check
    if brightness < 40:
        warnings.append("Image is very dark. Ensure better lighting.")
        status = "fail"
    elif brightness > 240:
        warnings.append("Image is very bright. Avoid overexposed lighting.")
        status = "fail"
    elif brightness < 70:
        warnings.append("Image is slightly dim but acceptable.")
    elif brightness > 190:
        warnings.append("Image is slightly bright but acceptable.")

    # OCR quality check
    if ocr_score < 8:
        warnings.append("OCR score is very low. Text might be unreadable.")
        status = "fail"
    elif ocr_score < 20:
        warnings.append("OCR score is a bit low. Make sure details are readable.")

    return jsonify({
        "name": name,
        "gender": gender,
        "dob": dob,
        "age": age,
        "faces_detected": len(faces),
        "blur": blur,
        "brightness": brightness,
        "ocr_score": ocr_score,
        "aadhaar_base64": aadhaar_base64,
        "status": status,
        "warnings": warnings
    })
