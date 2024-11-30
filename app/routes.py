from flask import Blueprint, jsonify, request, current_app
from .module import allowed_file_extension, preprocess, getModel, upload_image_to_gcs, file_too_large
from PIL import Image
from google.cloud import storage
from google.auth import load_credentials_from_file
from google.auth.transport.requests import Request
import numpy as np
import uuid
import os

bp = Blueprint('facialrecognition', __name__)

@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
def handle_unmatched(path):
    return jsonify({"Message":"Hello world! This is SerabutInn Facial Recognition ML API."})

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

        if 'customer_id' not in request.form:
            response = {
                "status": 400,
                "message": "No customer_id provided",
                "error": True
            }
            return jsonify(response), 400

        verification_images = request.files.getlist('images[]')
        customer_id = request.form.get('customer_id')

        for image in verification_images:
            if image and allowed_file_extension(image.filename) and not file_too_large(image):
                try:
                    unique_id = uuid.uuid4().hex
                    filename = image.filename
                    image_name = customer_id + "-" + unique_id + "-" + filename

                    # file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_name)
                    # image.save(file_path)

                    image.save(image_name)

                    image = Image.open(image_name)
                    new_size = (105, 105)
                    resized_image = image.resize(new_size)

                    resized_image.save(image_name)

                    # preprocessed_img = preprocess(file_path)
                    # os.remove(file_path)
                    # preprocessed_img.save(file_path)

                    upload_image_to_gcs(current_app.config['VERIFICATION_IMG_BUCKET'], image_name, customer_id)

                    if os.path.exists(image_name):
                        os.remove(image_name)
                except Exception as e:
                    response = {
                        "status": 500,
                        "message": f"Failed to upload {filename}: {str(e)}",
                        "error": True
                    }
                    return jsonify(response), 500
                finally:
                    if os.path.exists(image_name):
                        os.remove(image_name)
            else:
                response = {
                    "status": 400,
                    "message": "Upload file gagal",
                    "error": True
                }
                return jsonify(response), 400

        response = {
            "status": 201,
            "message": "Uploaded verification images successfully",
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
        
        if 'customer_id' not in request.form:
            response = {
                "status": 400,
                "message": "No customer_id provided",
                "error": True
            }
            return jsonify(response), 400

        input_image = request.files['image']
        customer_id = request.form.get('customer_id')
        
        if file_too_large(input_image):
            response = {
                "status": 400,
                "message": "File too large. Max file size: 2MB.",
                "error": True
            }
            return jsonify(response), 400

        if not allowed_file_extension(input_image.filename):
            response = {
                "status": 400,
                "message": "Unsupported media type. Please upload jpg/jpeg image.",
                "error": True
            }
            return jsonify(response), 400

        if input_image.filename == '':
            response = {
                "status": 400,
                "message": "No selected image.",
                "error": True
            }
            return jsonify(response), 400

        input_image_path = input_image.filename

        try:
            input_image.save(input_image_path)

            detection_threshold = 0.6
            verification_threshold = 0.7

            # download_images_from_gcs_folder(current_app.config['VERIFICATION_IMG_BUCKET'], customer_id+"/")

            results = []
            
            model = getModel()

            credentials, project = load_credentials_from_file(current_app.config['GOOGLE_APPLICATION_CREDENTIALS'])

            if credentials.expired:
                credentials.refresh(Request())

            client = storage.Client(credentials=credentials, project=project)
            bucket = client.get_bucket(current_app.config['VERIFICATION_IMG_BUCKET'])

            verification_images = bucket.list_blobs(prefix=f"{customer_id}/")

            input_image_tensor = preprocess(input_image_path)
            n_verification_images = 0
            for verification_image in verification_images:
                if verification_image.name.endswith('/'):
                    continue
                verification_image_path = os.path.basename(verification_image.name)
                verification_image.download_to_filename(verification_image_path)

                verification_image_tensor = preprocess(verification_image_path)

                result = model.predict([np.expand_dims(input_image_tensor, axis=0), np.expand_dims(verification_image_tensor, axis=0)])
                results.append(result)

                if os.path.exists(verification_image_path):
                    os.remove(verification_image_path)

                n_verification_images += 1

            # for image in os.listdir(current_app.config['UPLOAD_FOLDER']):
            #     input_image_tensor = preprocess(input_image_path)
            #     verification_image_tensor = preprocess(os.path.join(current_app.config['UPLOAD_FOLDER'], image))
            #     result = model.predict([np.expand_dims(input_image_tensor, axis=0), np.expand_dims(image, axis=0)])
            #     results.append(result)

            detection = np.sum(np.array(results) > detection_threshold)
            verification = detection / n_verification_images
            verified = verification > verification_threshold
            
            # files = os.listdir(current_app.config['UPLOAD_FOLDER'])

            # for file_name in files:
            #     file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_name)

            #     if os.path.isfile(file_path):
            #         os.remove(file_path)

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