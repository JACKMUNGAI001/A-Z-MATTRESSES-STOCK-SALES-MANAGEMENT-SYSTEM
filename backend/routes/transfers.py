from flask import Blueprint
from controllers.transfer_controller import create_transfer_controller
from flask_jwt_extended import jwt_required

bp = Blueprint("transfers", __name__)

bp.add_url_rule("/", "create_transfer", jwt_required()(create_transfer_controller), methods=["POST"])
