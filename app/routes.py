from flask import Blueprint, jsonify, request, current_app
from .module import allowed_file, preprocess, getModel, upload_image_to_gcs, download_images_from_gcs_folder
import numpy as np
import uuid
import os

bp = Blueprint('facialrecognition', __name__)

@bp.route("/upload100image", methods=['POST'])
def upload():
    if 'files[]' not in request.files:
        response = {
            "status": 400,
            "message": "No file part",
            "error": True
        }
        return jsonify(response), 400

    files = request.files.getlist('files[]')
    customer_id = request.form.get('customer_id')

    uploaded_files = []

    for file in files:
        if file and allowed_file(file.filename):
            try:
                unique_id = uuid.uuid4().hex
                filename = unique_id + "-" + file.filename
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)

                preprocessed_img = preprocess(file_path)
                os.remove(file_path)

                preprocessed_img.save(file_path)

                upload_image_to_gcs(current_app.config['VERIFICATION_IMG_BUCKET'], file_path, customer_id)
                uploaded_files.append(file.filename)
                os.remove(file_path)
            except Exception as e:
                response = {
                    "status": 500,
                    "message": f"Failed to upload {file.filename}: {str(e)}",
                    "error": True
                }
                return jsonify(response), 500

    response = {
        "status": 201,
        "message": "Uploaded files successfully",
        "data": {
            "uploaded_files": uploaded_files,
        },
        "error": False,
    }
    return jsonify(response)

@bp.route("/predict", methods=["POST"])
def predict():
    try:
        if 'file' not in request.files:
            response = {
                "status": 400,
                "message": "No file part",
                "error": True
            }
            return jsonify(response), 400

        img = request.files['file']
        customer_id = request.form.get('customer_id')

        if not allowed_file(img):
            response = {
                "status": 400,
                "message": "Unsupported media type.",
                "error": True
            }
            return jsonify(response), 400

        if img.filename == '':
            response = {
                "status": 400,
                "message": "No selected file",
                "error": True
            }
            return jsonify(response), 400

        input_image_path = 'temp_input.jpg'

        try:
            img.save(input_image_path)

            detection_threshold = 0.6
            verification_threshold = 0.7

            download_images_from_gcs_folder(current_app.config['VERIFICATION_IMG_BUCKET'], customer_id+"/")

            results = []
            model = getModel()
            for image in os.listdir(current_app.config['UPLOAD_FOLDER']):
                input_img = preprocess(input_image_path)
                # validation_img = preprocess(os.path.join(current_app.config['UPLOAD_FOLDER'], image))
                result = model.predict([np.expand_dims(input_img, axis=0), np.expand_dims(image, axis=0)])
                results.append(result)

            files = os.listdir(current_app.config['UPLOAD_FOLDER'])

            for file_name in files:
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_name)

                if os.path.isfile(file_path):
                    os.remove(file_path)

            detection = np.sum(np.array(results) > detection_threshold)
            verification = detection / len(os.listdir(current_app.config['UPLOAD_FOLDER']))
            verified = verification > verification_threshold

            response = {
                "status": 200,
                "message": "Model predicted successfully",
                "data": {
                    "verified": bool(verified),
                    "verification_score": float(verification)
                },
                "error": False
            }
            return jsonify(response)

        finally:
            if os.path.exists(input_image_path):
                os.remove(input_image_path)

    except Exception as e:
        error_message = str(e).encode('utf-8', 'ignore').decode('utf-8')
        response = {
            "status": 500,
            "message": error_message,
            "error": True
        }
        return jsonify(response), 500