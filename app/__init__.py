from flask import Flask
from .routes import bp
import os

def create_app():
    app = Flask(__name__)
    # app.config.from_object('config')

    app.config.from_object('config.Config')

    # from .routes import bp
    app.register_blueprint(bp)

    return app