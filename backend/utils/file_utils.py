# utils/file_utils.py
import os
import uuid
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, upload_folder, prefix="aadhaar"):
    # Ensure the folder exists
    os.makedirs(upload_folder, exist_ok=True)

    # Clean filename and add a UUID to avoid name collisions
    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{prefix}_{uuid.uuid4().hex[:8]}.{ext}"
    filename = secure_filename(unique_name)

    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    return file_path

