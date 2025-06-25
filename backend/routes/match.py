from flask import Blueprint, request, jsonify, current_app, send_from_directory
import cv2
import os
import uuid

from utils.file_utils import save_file
from utils.face_utils import compare_faces, crop_face_from_image, extract_face
from utils.image_analysis import analyze_blur_and_lighting

match_bp = Blueprint('match_bp', __name__)


@match_bp.route('/verify-match', methods=['POST'])
def verify_face_match():
    aadhaar = request.files.get('aadhaar')
    selfie = request.files.get('selfie')

    if not aadhaar or not selfie:
        return jsonify({"error": "Both Aadhaar and Selfie files are required."}), 400

    # --------------------------------------
    # Get Aadhaar analysis values (from EasyOCR pipeline)
    # --------------------------------------
    dob = request.form.get('aadhaar_dob')
    age = request.form.get('aadhaar_age')
    gender = request.form.get('aadhaar_gender')
    name = request.form.get('aadhaar_name')
    aadhaar_blur = float(request.form.get('aadhaar_blur', 0))
    aadhaar_brightness = float(request.form.get('aadhaar_brightness', 0))
    ocr_score = int(request.form.get('aadhaar_ocr_score', 0))

    # --------------------------------------
    # Save uploaded files
    # --------------------------------------
    aadhaar_path = save_file(aadhaar, current_app.config['UPLOAD_FOLDER'])
    selfie_path = save_file(selfie, current_app.config['UPLOAD_FOLDER'])

    aadhaar_img = cv2.imread(aadhaar_path)
    selfie_img = cv2.imread(selfie_path)

    # --------------------------------------
    # Aadhaar Face Extraction (HaarCascade)
    # --------------------------------------
    aadhaar_faces = crop_face_from_image(aadhaar_img)
    if len(aadhaar_faces) == 0:
        return jsonify({"error": "No face detected in Aadhaar image."}), 400

    aadhaar_face_img = extract_face(aadhaar_img, aadhaar_faces)

    # --------------------------------------
    # Selfie Image Analysis
    # --------------------------------------
    selfie_blur, selfie_brightness = analyze_blur_and_lighting(selfie_img)

    # --------------------------------------
    # Save Face Crops for UI
    # --------------------------------------
    face_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'faces')
    os.makedirs(face_folder, exist_ok=True)

    aadhaar_face_filename = f"{uuid.uuid4().hex}_aadhaar.jpg"
    selfie_face_filename = f"{uuid.uuid4().hex}_selfie.jpg"
    aadhaar_face_path = os.path.join(face_folder, aadhaar_face_filename)
    selfie_face_path = os.path.join(face_folder, selfie_face_filename)

    cv2.imwrite(aadhaar_face_path, aadhaar_face_img)
    cv2.imwrite(selfie_face_path, selfie_img)

    aadhaar_face_url = f"{request.host_url}faces/{aadhaar_face_filename}"
    selfie_face_url = f"{request.host_url}faces/{selfie_face_filename}"

    # --------------------------------------
    # DeepFace Comparison (ArcFace)
    # --------------------------------------
    confidence, match = compare_faces(aadhaar_face_path, selfie_face_path, model_name="ArcFace")
    match_threshold = 40
    match = confidence >= match_threshold
    status = "verified" if match else "not_verified"

    warnings = []
    if not match:
        warnings.append("Faces do not match with high enough confidence.")

    return jsonify({
        "confidence": confidence,
        "match": match,
        "match_threshold": match_threshold,
        "status": status,
        "warnings": warnings,
        "aadhaar_analysis": {
            "dob": dob,
            "gender": gender,
            "name": name,
            "age": int(age) if age and age.isdigit() else None,
            "blur": aadhaar_blur,
            "brightness": aadhaar_brightness,
            "ocr_score": ocr_score
        },
        "selfie_analysis": {
            "blur": selfie_blur,
            "brightness": selfie_brightness
        },
        "face_images": {
            "aadhaar_face": aadhaar_face_url,
            "selfie_face": selfie_face_url
        }
    })


@match_bp.route('/faces/<filename>')
def serve_face_image(filename):
    face_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'faces')
    return send_from_directory(face_folder, filename)
