from flask import Flask
from .routes import bp
from app.module import getModel

def create_app():
    getModel()

    app = Flask(__name__)

    app.config.from_object('config.Config')

    app.register_blueprint(bp)

    return app