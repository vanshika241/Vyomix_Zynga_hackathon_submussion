
# FaceOfficial Backend

This is the **Flask-based backend**  – an AI-powered Age & Identity Verification System that processes Aadhaar and selfie images using OCR, face detection, and facial matching.

---

## Backend Tech Stack

| Technology         | Purpose                                      |
|--------------------|----------------------------------------------|
| Flask              | Lightweight Python web framework              |
| Tesseract OCR / EasyOCR | Extracts text (DOB) from Aadhaar images|        
| OpenCV             | Image processing, face detection, quality check |
| Flask-CORS         | Enables communication with frontend (CORS)   |

>  Python version required: **3.11**

---
## ⚙️ Getting Started

## 1. Navigate to the backend folder

```bash
cd backend
```
## 2. Create a virtual environment (optional but recommended)
```bash
python -m venv venv
```
### ▶️ Activate the virtual environment:
### On Windows
```bash
venv\Scripts\activate
```
### Mac/Linux:
```bash
source venv/bin/activate
```


## 3. Install Flask and other dependencies
```bash
pip install -r requirements.txt
```
### If requirements.txt doesn't exist, manually install:
```bash
pip install flask flask-cors opencv-python face_recognition easyocr
```


## 4. Run the Flask app

```bash
python app.py
```
### Now the server will run at:
http://localhost:5000





