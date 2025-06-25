import cv2
import numpy as np
from deepface import DeepFace

# -----------------------------
# FACE DETECTION (HAAR CASCADE)
# -----------------------------

def crop_face_from_image(img):
    """
    Detects faces in the image using Haar cascades and returns bounding boxes.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    return faces


def extract_face(img, faces):
    """
    Extracts the first detected face from the image.
    """
    for (x, y, w, h) in faces:
        return img[y:y + h, x:x + w]
    return None

# -----------------------------
# FACE MATCHING (DEEPFACE + ARC-FACE)
# -----------------------------

def compare_faces(img1_path, img2_path, model_name="ArcFace", enforce_detection=True):
    """
    Compares two face images using DeepFace with ArcFace model.
    Returns: (confidence_score, match_boolean)
    """
    try:
        result = DeepFace.verify(
            img1_path, img2_path,
            model_name=model_name,
            enforce_detection=enforce_detection,
            detector_backend='opencv'  # Fastest + works well with Aadhaar quality
        )
        distance = result.get("distance", 1)
        threshold = result.get("threshold", 0.68)  # ArcFace threshold
        confidence = max(0, (1 - distance / threshold)) * 100
        match = confidence >= 85  # tuneable threshold
        return round(confidence, 2), match

    except Exception as e:
        print(f"[ERROR] DeepFace comparison failed: {e}")
        return 0.0, False

# -----------------------------
# AADHAAR CARD REGION DETECTOR (OPTIONAL)
# -----------------------------

def extract_aadhaar_card_region(img):
    """
    Attempts to extract Aadhaar card rectangle from image based on contour detection.
    """
    orig = img.copy()
    gray = cv2.cvtColor(orig, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 50, 200)

    contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    best_candidate = None
    max_area = 0
    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)

        if len(approx) == 4:  # Rectangular shape
            x, y, w, h = cv2.boundingRect(approx)
            aspect_ratio = w / float(h)
            area = w * h

            if 1.4 < aspect_ratio < 1.9 and area > max_area:
                max_area = area
                best_candidate = (x, y, w, h)

    if best_candidate:
        x, y, w, h = best_candidate
        return orig[y:y + h, x:x + w]
    else:
        return orig  # fallback to original
