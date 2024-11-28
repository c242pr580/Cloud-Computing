from flask import Flask
from .routes import bp
import os

def create_app():
    app = Flask(__name__)
    # app.config.from_object('config')

    app.config.from_object('config.Config')
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    # from .routes import bp
    app.register_blueprint(bp)

    return app