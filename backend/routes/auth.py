from flask import Blueprint
from controllers.auth_controller import register, login, get_current_user_controller
from flask_jwt_extended import jwt_required

bp = Blueprint("auth", __name__)

bp.add_url_rule("/register", "register", register, methods=["POST"])
bp.add_url_rule("/login", "login", login, methods=["POST"])
bp.add_url_rule("/me", "get_current_user", jwt_required()(get_current_user_controller), methods=["GET"])
