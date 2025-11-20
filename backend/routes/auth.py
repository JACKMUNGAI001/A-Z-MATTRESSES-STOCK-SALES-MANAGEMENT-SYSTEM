from flask import Blueprint
from controllers.auth_controller import register, login

bp = Blueprint("auth", __name__)

bp.add_url_rule("/register", "register", register, methods=["POST"])
bp.add_url_rule("/login", "login", login, methods=["POST"])
