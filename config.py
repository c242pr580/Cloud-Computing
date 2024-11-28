import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER')
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg'}
    MODEL_URL = os.getenv('MODEL_URL')
    LOCAL_MODEL_PATH = os.getenv('LOCAL_MODEL_PATH')
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    VERIFICATION_IMG_BUCKET = os.getenv('VERIFICATION_IMG_BUCKET')