from flask import Flask
from config import Config
from extensions import db, migrate, jwt, cors
import routes  # package import of routes/__init__.py

def create_app():
    app = Flask(__name__, static_folder=None)
    app.config.from_object(Config)

    # init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}})

    # register blueprints
    routes.register_blueprints(app)

    @app.route("/")
    def index():
        return {"msg": "A-Z Mattresses API"}

    return app

# expose app for flask CLI
app = create_app()
