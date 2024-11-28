from config import Config
from tensorflow.keras.layers import Layer
from pathlib import Path
import tensorflow as tf
import requests
import os

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

# Preprocessing function
def preprocess(file_path):
    byte_img = tf.io.read_file(file_path)
    img = tf.io.decode_jpeg(byte_img)
    img = tf.image.resize(img, (105, 105))  # Resize sesuai dengan ukuran input model
    img = img / 255.0  # Normalisasi
    return img

def getModel():
    if not Path(Config.LOCAL_MODEL_PATH).is_file():
        print("Downloading model...")
    response = requests.get(Config.MODEL_URL, stream=True)
    if response.status_code == 200:
        with open(Config.LOCAL_MODEL_PATH, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
        print("Model downloaded successfully.")
    else:
        raise Exception(f"Failed to download model: {response.status_code}")

    # Load model
    model = tf.keras.models.load_model(Config.LOCAL_MODEL_PATH, custom_objects={'L1Dist': L1Dist})
    return model

class L1Dist(Layer):
    def __init__(self, **kwargs):
        super(L1Dist, self).__init__(**kwargs)

    def call(self, input_embedding, validation_embedding):
        input_embedding = input_embedding[0] if isinstance(input_embedding, list) else input_embedding
        validation_embedding = validation_embedding[0] if isinstance(validation_embedding, list) else validation_embedding
        return tf.math.abs(input_embedding - validation_embedding)