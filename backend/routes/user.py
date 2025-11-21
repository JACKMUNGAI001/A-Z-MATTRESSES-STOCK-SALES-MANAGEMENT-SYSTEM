from flask import Blueprint
from controllers.user_controller import update_profile_controller, change_password_controller
from flask_jwt_extended import jwt_required

bp = Blueprint("user", __name__)

bp.add_url_rule("/profile", "update_profile", jwt_required()(update_profile_controller), methods=["PUT"])
bp.add_url_rule("/change-password", "change_password", jwt_required()(change_password_controller), methods=["PUT"])
