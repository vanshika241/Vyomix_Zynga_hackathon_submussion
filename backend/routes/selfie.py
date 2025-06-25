from flask import Blueprint, request, jsonify
import cv2
import numpy as np
from deepface import DeepFace

selfie_bp = Blueprint('selfie_bp', __name__)

# Load Haar cascade for eye detection once (globally)
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

@selfie_bp.route('/selfie-check', methods=['POST'])
def selfie_check():
    if 'selfie' not in request.files:
        return jsonify({'error': 'No selfie provided'}), 400

    try:
        file = request.files['selfie']
        img_array = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'Invalid image'}), 400

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Blur detection
        blur = cv2.Laplacian(gray, cv2.CV_64F).var()

        # Brightness detection
        brightness = np.mean(gray)

        # Eye detection
        eyes = eye_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        num_eyes = len(eyes)
        print("DEBUG - Eyes Detected:", num_eyes)

        # Face detection using DeepFace
        try:
            detections = DeepFace.extract_faces(img_path=img, enforce_detection=True, detector_backend='opencv')
        except Exception as e:
            return jsonify({'error': 'No clear or visible face detected. Please upload an unobstructed selfie.'}), 400

        if len(detections) == 0:
            return jsonify({'error': 'Face not detected clearly. Ensure face is unobstructed and well-lit.'}), 400

        # Obstruction check: Face size
        face_obj = detections[0]
        region = face_obj.get("facial_area", {})
        if not region or (region['w'] < 50 or region['h'] < 50):
            return jsonify({'error': 'Face too small or obstructed. Please upload a clearer image.'}), 400

        # Lighting condition
        lighting = "Good"
        if brightness < 60:
            lighting = "Too Dim"
        elif brightness > 190:
            lighting = "Too Bright"

        # Clarity
        if blur > 40:
            face_clarity = "Very Clear"
        elif blur > 25:
            face_clarity = "Clear"
        elif blur > 15:
            face_clarity = "Slightly Blurry"
        else:
            face_clarity = "Blurry"

        # Status and warnings
        status = "pass"
        warnings = []

        if blur < 15:
            warnings.append("Image is too blurry.")
            status = "fail"

        if lighting != "Good":
            warnings.append(f"Lighting is {lighting.lower()}.")

        if num_eyes < 2:
            warnings.append("Both eyes not clearly visible.")
            status = "fail"

        return jsonify({
            "status": status,
            "face_clarity": face_clarity,
            "lighting": lighting,
            "faces_detected": len(detections),
            "eyes_detected": num_eyes,
            "blur": blur,
            "brightness": brightness,
            "warnings": warnings
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
