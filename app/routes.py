from flask import Blueprint, jsonify, request, current_app
from .module import allowed_file, preprocess, getModel, upload_image_to_gcs
import numpy as np
import os

bp = Blueprint('facialrecognition', __name__)

@bp.route("/upload100image", methods=['POST'])
def upload():
    if 'files[]' not in request.files:
        return jsonify({"error": "No file part"}), 400

    files = request.files.getlist('files[]')
    customer_id = request.form.get('customer_id')

    uploaded_files = []

    for file in files:
        if file and allowed_file(file.filename):
            try:
                filename = file.filename
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                uploaded_files.append(filename)

                upload_image_to_gcs(current_app.config['VERIFICATION_IMG_BUCKET'], file_path, customer_id)
                os.remove(file_path)
            except Exception as e:
                return jsonify({"error": f"Failed to upload {file.filename}: {str(e)}"}), 500

    return jsonify({"uploaded_files": uploaded_files})

@bp.route("/predict", methods=["POST"])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        img = request.files['file']

        if img.filename == '':
            return jsonify({"error": "No selected file"}), 400

        input_image_path = 'temp_input.jpg'

        try:
            img.save(input_image_path)

            # Adjust threshold for testing
            detection_threshold = 0.6
            verification_threshold = 0.7

            results = []
            model = getModel()
            for image in os.listdir(current_app.config['UPLOAD_FOLDER']):
                print(current_app.config['UPLOAD_FOLDER'])
                input_img = preprocess(input_image_path)
                validation_img = preprocess(os.path.join(current_app.config['UPLOAD_FOLDER'], image))
                result = model.predict([np.expand_dims(input_img, axis=0), np.expand_dims(validation_img, axis=0)])
                print(result)
                results.append(result)

            detection = np.sum(np.array(results) > detection_threshold)
            verification = detection / len(os.listdir(current_app.config['UPLOAD_FOLDER']))
            verified = verification > verification_threshold

            print("Results per image:", results)
            print("Detection score:", detection)
            print("Verification score:", verification)
            print("Verified:", verified)

            response = {
                "verified": bool(verified),
                "verification_score": float(verification)
            }
            return jsonify(response)

        finally:
            if os.path.exists(input_image_path):
                os.remove(input_image_path)

    except Exception as e:
        error_message = str(e).encode('utf-8', 'ignore').decode('utf-8')
        return jsonify({"error": error_message}), 500