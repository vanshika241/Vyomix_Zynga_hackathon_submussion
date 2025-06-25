# utils/image_analysis.py

import cv2
import numpy as np

def analyze_blur_and_lighting(img):
    """
    Calculates the blur level and brightness of an image.

    Enhances the image slightly before measuring to reduce false negatives.
    """
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Slight Gaussian blur to reduce noise (optional)
    enhanced = cv2.GaussianBlur(gray, (3, 3), 0)

    # Brightness = mean pixel value
    brightness = np.mean(enhanced)

    # Blur = variance of Laplacian (how much edges vary)
    blur = cv2.Laplacian(enhanced, cv2.CV_64F).var()

    return blur, brightness


def crop_aadhaar_section(img):
    """
    Crops the central Aadhaar region assuming a horizontal card orientation.

    Adjust as needed based on actual Aadhaar layout.
    """
    height, width = img.shape[:2]

    # Loosened crop window
    x1, y1 = int(0.08 * width), int(0.18 * height)
    x2, y2 = int(0.92 * width), int(0.82 * height)

    return img[y1:y2, x1:x2]



