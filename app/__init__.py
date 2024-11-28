from flask import Flask
from .routes import bp
from app.module import getModel
import os

def create_app():
    getModel()

    app = Flask(__name__)

    app.config.from_object('config.Config')

    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    app.register_blueprint(bp)

    return app