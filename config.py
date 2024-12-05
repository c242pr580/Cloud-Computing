import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    HOST = os.getenv('HOST')
    PORT = os.getenv('PORT_FACE')
    MODEL_URL = os.getenv('MODEL_URL')
    LOCAL_MODEL_PATH = os.getenv('LOCAL_MODEL_PATH')
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    VERIFICATION_IMG_BUCKET = os.getenv('VERIFICATION_IMG_BUCKET')

    ALLOWED_EXTENSIONS = {'jpg', 'jpeg'}