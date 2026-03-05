from flask import Blueprint
from controllers.transfer_controller import create_transfer_controller, list_transfers_controller
from flask_jwt_extended import jwt_required

bp = Blueprint("transfers", __name__)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_transfer():
    return create_transfer_controller()

@bp.route("/", methods=["GET"])
@jwt_required()
def list_transfers():
    return list_transfers_controller()
