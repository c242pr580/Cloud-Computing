from config import Config
from pathlib import Path
from google.cloud import storage
from google.auth import load_credentials_from_file
from google.auth.transport.requests import Request
import tensorflow as tf
import requests
import os
import cv2
import numpy as np
import pickle

def allowed_file_extension(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def file_too_large(file):
    file.seek(0, 2)
    file_length = file.tell()
    file.seek(0)

    return file_length > 1 * 1024 * 1024

def getModel():
    if not Path(Config.LOCAL_MODEL_PATH).is_file():
        response = requests.get(Config.MODEL_URL, stream=True)
        if response.status_code == 200:
            with open(Config.LOCAL_MODEL_PATH, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
        else:
            raise Exception(f"Failed to download model: {response.status_code}")
        
    model = tf.keras.models.load_model(Config.LOCAL_MODEL_PATH)
    return model

def load_credentials_from_file_or_env():
    credentials_json = None
    if os.path.exists(Config.GOOGLE_APPLICATION_CREDENTIALS):
        with open(Config.GOOGLE_APPLICATION_CREDENTIALS, 'r') as f:
            credentials_json = f.read()
    else:
        credentials_json = Config.GOOGLE_APPLICATION_CREDENTIALS

    credentials_dict = json.loads(credentials_json)
    credentials = Credentials.from_service_account_info(credentials_dict)
    project = credentials.project_id
    return credentials, project

def upload_to_gcs(file_path):
    credentials, project = load_credentials_from_file_or_env()
    bucket_name = Config.VERIFICATION_IMG_BUCKET

    if credentials.expired:
        credentials.refresh(Request())

    client = storage.Client(credentials=credentials, project=project)
    bucket = client.get_bucket(bucket_name)

    destination_blob_name = os.path.basename(file_path)

    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(file_path)

def preprocess_face(face):
    face_gray = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
    face_resized = cv2.resize(face_gray, (96, 96))
    face_normalized = face_resized / 255.0
    face_input = np.expand_dims(face_normalized, axis=-1)
    face_input = np.expand_dims(face_input, axis=0)
    return face_input

def get_keypoints(image_name):
    image = cv2.imread(image_name)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + '/haarcascade_frontalface_default.xml')

    if face_cascade.empty():
        raise IOError('Haar Cascade classifier file not found!')

    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    cropped_faces = []
    for (x, y, w, h) in faces:
        face = image[y:y+h, x:x+w]

        resized_face = cv2.resize(face, (96, 96))
        cropped_faces.append(resized_face)

        cv2.rectangle(image, (x, y), (x+w, y+h), (255, 0, 0), 2)
        
    model = getModel()
    
    keypoints = None
    
    for idx, cropped_face in enumerate(cropped_faces):
        face_input = preprocess_face(cropped_face)

        keypoints = model.predict(face_input)
        keypoints = keypoints.reshape(-1, 2)
        
    if keypoints is None:
        raise ValueError("No keypoints detected. Ensure that the input image contains valid faces.")
            
    return keypoints

def get_verification_keypoints(customer_id):
    keypoints_url = f"https://storage.googleapis.com/{Config.VERIFICATION_IMG_BUCKET}/keypoints_face_{customer_id}.pkl"
    response = requests.get(keypoints_url, stream=True)
    if response.status_code == 200:
        with open(f"keypoints_face_{customer_id}.pkl", 'wb') as f:
            for chunk in response.iter_content(chunk_size=128):
                f.write(chunk)
    else:
        raise Exception("Failed to download keypoints. Make sure customer_id is valid and try again.")
    
    with open(f"keypoints_face_{customer_id}.pkl", 'rb') as f:
        keypoints = pickle.load(f)
    return keypoints

def normalize_landmarks(keypoints, img_width, img_height):
    normalized = keypoints / [img_width, img_height]
    
    return normalized

def calculate_distances(landmarks):
    num_points = len(landmarks)
    distances = []
    for i in range(num_points):
        for j in range(i + 1, num_points):
            dist = np.linalg.norm(landmarks[i] - landmarks[j])
            distances.append(dist)
    
    return np.array(distances)

def face_similarity(input_keypoints, verification_keypoints):
    img_width, img_height = 96, 96
    landmarks1_normalized = normalize_landmarks(input_keypoints, img_width, img_height)
    landmarks2_normalized = normalize_landmarks(verification_keypoints, img_width, img_height)

    features1 = calculate_distances(landmarks1_normalized)
    features2 = calculate_distances(landmarks2_normalized)

    distance = np.linalg.norm(features1 - features2)
    
    return distance