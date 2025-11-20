from flask import Flask, jsonify
from config import Config
from extensions import db, migrate, jwt, cors

def create_app():
    app = Flask(__name__, static_folder=None)
    app.config.from_object(Config)

    # init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}})

    # register routes
    from routes import register_blueprints
    register_blueprints(app)

    @app.route("/health")
    def health():
        return jsonify({"status":"ok"}), 200

    return app

app = create_app()
