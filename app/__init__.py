from flask import Flask
from .routes import bp
from app.module import getModel
import os

def create_app():
    getModel()

    app = Flask(__name__)

    app.config.from_object('config.Config')

    # if not os.path.exists(app.config['UPLOAD_FOLDER']):
    #     os.makedirs(app.config['UPLOAD_FOLDER'])
    # else:
    #     files = os.listdir(app.config['UPLOAD_FOLDER'])

    #     for file_name in files:
    #         file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)

    #         if os.path.isfile(file_path):
    #             os.remove(file_path)

    app.register_blueprint(bp)

    return app