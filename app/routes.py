from flask import Blueprint, jsonify, request, current_app
from .module import allowed_file_extension, preprocess, getModel, upload_image_to_gcs, file_too_large, clear_gcs_folder
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
    return jsonify({"Message":"Hello world! This is Backend Model Facial Recognition API SerabutInn."})

# @bp.route("/upload-verification-images", methods=['POST'])
# def upload():
#     try:
#         if 'images[]' not in request.files:
#             response = {
#                 "status": 400,
#                 "message": "No images provided",
#                 "error": True
#             }
#             return jsonify(response), 400

#         if 'customer_id' not in request.form:
#             response = {
#                 "status": 400,
#                 "message": "No customer_id provided",
#                 "error": True
#             }
#             return jsonify(response), 400

#         verification_images = request.files.getlist('images[]')
#         customer_id = request.form.get('customer_id')
        
#         clear_gcs_folder(current_app.config['VERIFICATION_IMG_BUCKET'], customer_id)

#         for image in verification_images:
#             if image and allowed_file_extension(image.filename) and not file_too_large(image):
#                 try:
#                     unique_id = uuid.uuid4().hex
#                     filename = image.filename
#                     image_name = customer_id + "-" + unique_id + "-" + filename

#                     image.save(image_name)

#                     image = Image.open(image_name)
#                     new_size = (105, 105)
#                     resized_image = image.resize(new_size)

#                     resized_image.save(image_name)

#                     upload_image_to_gcs(current_app.config['VERIFICATION_IMG_BUCKET'], image_name, customer_id)

#                     if os.path.exists(image_name):
#                         os.remove(image_name)
#                 except Exception as e:
#                     clear_gcs_folder(current_app.config['VERIFICATION_IMG_BUCKET'], customer_id)
#                     response = {
#                         "status": 500,
#                         "message": f"Failed to upload {filename}: {str(e)}",
#                         "error": True
#                     }
#                     return jsonify(response), 500
#                 finally:
#                     if os.path.exists(image_name):
#                         os.remove(image_name)
#             else:
#                 response = {
#                     "status": 400,
#                     "message": f"Failed to upload {image.filename}. Please upload a jpg/jpeg image no bigger than 2MB",
#                     "error": True
#                 }
#                 return jsonify(response), 400

#         response = {
#             "status": 201,
#             "message": "Uploaded verification images successfully",
#             "error": False,
#         }
#         return jsonify(response)
#     except Exception as e:
#         error_message = str(e).encode('utf-8', 'ignore').decode('utf-8')
#         response = {
#             "status": 500,
#             "message": error_message,
#             "error": True
#         }
#         return jsonify(response), 500

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
        
        # Clear previous verification images in GCS folder
        clear_gcs_folder(current_app.config['VERIFICATION_IMG_BUCKET'], customer_id)

        for image in verification_images:
            if image and allowed_file_extension(image.filename) and not file_too_large(image):
                try:
                    unique_id = uuid.uuid4().hex
                    filename = image.filename
                    image_name = filename

                    image.save(image_name)

                    # Open the image using PIL
                    image = Image.open(image_name)
                    
                    # Resize image or create 300 variations (You can add other image processing logic here)
                    new_size = (105, 105)  # Example resize
                    for i in range(100):  # Duplicate image 300 times
                        resized_image = image.resize(new_size)

                        # Create a unique name for each duplicated image
                        resized_image_name = f"{customer_id}-{unique_id}-{i}-{filename}"
                        resized_image.save(resized_image_name)

                        # Upload the resized image to GCS
                        upload_image_to_gcs(current_app.config['VERIFICATION_IMG_BUCKET'], resized_image_name, customer_id)

                        # Clean up the local resized image
                        if os.path.exists(resized_image_name):
                            os.remove(resized_image_name)

                    # Clean up the original image after processing
                    if os.path.exists(image_name):
                        os.remove(image_name)

                except Exception as e:
                    # If any error occurs, clear the GCS folder and return error
                    clear_gcs_folder(current_app.config['VERIFICATION_IMG_BUCKET'], customer_id)
                    response = {
                        "status": 500,
                        "message": f"Failed to upload {filename}: {str(e)}",
                        "error": True
                    }
                    return jsonify(response), 500
            else:
                response = {
                    "status": 400,
                    "message": f"Failed to upload {image.filename}. Please upload a jpg/jpeg image no bigger than 2MB",
                    "error": True
                }
                return jsonify(response), 400

        response = {
            "status": 201,
            "message": "Uploaded 300 verification images successfully",
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
                "message": "File too large. Max file size: 1MB.",
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

            detection_threshold = 0.4
            verification_threshold = 0.5

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
                print(f"Prediction result: {result}")
                results.append(result)

                if os.path.exists(verification_image_path):
                    os.remove(verification_image_path)

                n_verification_images += 1

            detection = np.sum(np.array(results) > detection_threshold)
            verification = detection / n_verification_images
            verified = verification > verification_threshold
            print(f"Results: {results}")
            print(f"Detection sum: {detection}")
            print(f"Verification score: {verification}")

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