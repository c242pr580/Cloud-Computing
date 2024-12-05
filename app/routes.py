from flask import Blueprint, jsonify, request
from .module import *
import os
import pickle

bp = Blueprint('facialrecognition', __name__)

@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
def handle_unmatched(path):
    return jsonify({"Message":"Hello world! This is SerabutInn Facial Recognition ML API."})

@bp.route("/upload-verification-image", methods=['POST'])
def upload():
    try:
        if 'verification_image' not in request.files:
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

        verification_image = request.files['verification_image']
        customer_id = request.form.get('customer_id')
        
        if input_image.filename == '':
            response = {
                "status": 400,
                "message": "No selected image.",
                "error": True
            }
            return jsonify(response), 400
        
        if customer_id == '':
            response = {
                "status": 400,
                "message": "No customer_id provided.",
                "error": True
            }
            return jsonify(response), 400
        
        if verification_image and allowed_file_extension(verification_image.filename) and not file_too_large(verification_image):
            try:
                verification_image_name = customer_id

                verification_image.save(verification_image_name)

                keypoints = get_keypoints(verification_image_name)
                
                keypoints_path = f"keypoints_face_{verification_image_name}.pkl"
                with open(keypoints_path, 'wb') as file:
                    pickle.dump(keypoints, file)

                upload_to_gcs(keypoints_path)

                if os.path.exists(verification_image_name):
                    os.remove(verification_image_name)
                if os.path.exists(keypoints_path):
                    os.remove(keypoints_path)
            except Exception as e:
                response = {
                    "status": 500,
                    "message": f"Failed to upload {verification_image.filename}: {str(e)}",
                    "error": True
                }
                return jsonify(response), 500
            finally:
                if os.path.exists(verification_image_name):
                    os.remove(verification_image_name)
                if os.path.exists(keypoints_path):
                    os.remove(keypoints_path)
        else:
            response = {
                "status": 400,
                "message": f"Failed to upload {verification_image.filename}. Please upload a jpg/jpeg image no bigger than 1MB",
                "error": True
            }
            return jsonify(response), 400

        response = {
            "status": 201,
            "message": "Uploaded verification image successfully",
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
        if 'input_image' not in request.files:
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

        input_image = request.files['input_image']
        customer_id = request.form.get('customer_id')
        
        if input_image.filename == '':
            response = {
                "status": 400,
                "message": "No selected image.",
                "error": True
            }
            return jsonify(response), 400
        
        if customer_id == '':
            response = {
                "status": 400,
                "message": "No customer_id provided.",
                "error": True
            }
            return jsonify(response), 400
        
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

        input_image_path = customer_id

        try:
            input_image.save(input_image_path)
            input_keypoints = get_keypoints(input_image_path)
            verification_keypoints = get_verification_keypoints(customer_id)
            
            print(input_keypoints)
            print(verification_keypoints)

            verification_score = face_similarity(input_keypoints, verification_keypoints)
            
            threshold=0.1981
            verified = verification_score < threshold

            response = {
                "status": 200,
                "message": "Model predicted successfully",
                "data": {
                    "verified": bool(verified),
                    "verification_score": float(verification_score),
                    "threshold": float(threshold)
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
            if os.path.exists(f"keypoints_face_{customer_id}.pkl"):
                os.remove(f"keypoints_face_{customer_id}.pkl")

    except Exception as e:
        error_message = str(e).encode('utf-8', 'ignore').decode('utf-8')
        response = {
            "status": 500,
            "message": error_message,
            "error": True
        }
        return jsonify(response), 500