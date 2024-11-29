from flask import Blueprint, jsonify, request, current_app
from .module import allowed_file, preprocess, getModel, upload_image_to_gcs, download_images_from_gcs_folder, file_too_large
import numpy as np
import uuid
import os

bp = Blueprint('facialrecognition', __name__)

@bp.route("/upload-verification-images", methods=['POST'])
def upload():
    try:
        if 'images[]' not in request.files:
            response = {
                "status": 400,
                "message": "No images provided",
                "error": True
            }
            return jsonify(response), 400

        if 'customer_id' not in request.files:
            response = {
                "status": 400,
                "message": "No customer_id provided",
                "error": True
            }
            return jsonify(response), 400

        images = request.files.getlist('images[]')
        customer_id = request.form.get('customer_id')

        uploaded_images = []

        for image in images:
            if image and allowed_file(image.filename) and not file_too_large(image):
                try:
                    unique_id = uuid.uuid4().hex
                    filename = image.filename
                    image_name = unique_id + "-" + filename
                    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_name)
                    image.save(file_path)

                    preprocessed_img = preprocess(file_path)
                    os.remove(file_path)

                    preprocessed_img.save(file_path)

                    upload_image_to_gcs(current_app.config['VERIFICATION_IMG_BUCKET'], file_path, customer_id)
                    uploaded_images.append(filename)

                    os.remove(file_path)
                except Exception as e:
                    response = {
                        "status": 500,
                        "message": f"Failed to upload {filename}: {str(e)}",
                        "error": True
                    }
                    return jsonify(response), 500

        response = {
            "status": 201,
            "message": "Uploaded verification images successfully successfully",
            "data": {
                "uploaded_images": uploaded_images,
            },
            "error": False,
        }
        return jsonify(response)
    except Exception as e:
        error_message = str(e).encode('utf-8', 'ignore').decode('utf-8')
        response = {
            "status": 500,
            "message": error_message,
            "error": True
        }
        return jsonify(response), 500

@bp.route("/predict", methods=["POST"])
def predict():
    try:
        if 'image' not in request.files:
            response = {
                "status": 400,
                "message": "No image provided",
                "error": True
            }
            return jsonify(response), 400
        
        if 'customer_id' not in request.files:
            response = {
                "status": 400,
                "message": "No customer_id provided",
                "error": True
            }
            return jsonify(response), 400

        img = request.files['image']
        customer_id = request.form.get('customer_id')
        
        if file_too_large(img):
            response = {
                "status": 400,
                "message": "File too large.",
                "error": True
            }
            return jsonify(response), 400

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

        input_image_path = img.filename

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

            detection = np.sum(np.array(results) > detection_threshold)
            verification = detection / len(os.listdir(current_app.config['UPLOAD_FOLDER']))
            verified = verification > verification_threshold
            
            files = os.listdir(current_app.config['UPLOAD_FOLDER'])

            for file_name in files:
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_name)

                if os.path.isfile(file_path):
                    os.remove(file_path)

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

        except Exception as e:
            error_message = str(e).encode('utf-8', 'ignore').decode('utf-8')
            response = {
                "status": 500,
                "message": error_message,
                "error": True
            }
            return jsonify(response), 500

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