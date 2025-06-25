from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from routes.aadhaar import aadhaar_bp
from routes.selfie import selfie_bp
from routes.match import match_bp
from utils.file_utils import allowed_file, save_file
import os

# ---------------- CONFIGURATION ---------------- #
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

# Optional: set max file size (e.g., 10MB)
# from werkzeug.exceptions import RequestEntityTooLarge
# MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB

# ---------------- INITIALIZE APP ---------------- #
app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ---------------- BLUEPRINT ROUTES ---------------- #
app.register_blueprint(aadhaar_bp)
app.register_blueprint(selfie_bp)
app.register_blueprint(match_bp)

# ---------------- FILE SERVING ---------------- #
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ---------------- UNIVERSAL UPLOAD ROUTE (Optional) ---------------- #
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        try:
            file_path = save_file(file, app.config['UPLOAD_FOLDER'], prefix="universal")
            return jsonify({'message': 'File uploaded', 'path': file_path})
        except Exception as e:
            return jsonify({'error': f'File saving failed: {str(e)}'}), 500

    return jsonify({'error': 'File type not allowed'}), 400

# ---------------- ERROR HANDLING (Optional) ---------------- #
# @app.errorhandler(RequestEntityTooLarge)
# def file_too_large(e):
#     return jsonify({'error': 'File too large'}), 413

# ---------------- START SERVER ---------------- #
if __name__ == '__main__':
    app.run(debug=True)
