from flask import Blueprint, request
from controllers.deposit_controller import create_deposit_controller, add_deposit_payment_controller
from flask_jwt_extended import jwt_required

bp = Blueprint("deposits", __name__)

bp.add_url_rule("/", "create_deposit", create_deposit_controller, methods=["POST"])

@bp.route("/<int:deposit_id>/payments", methods=["POST"])
@jwt_required()
def payments(deposit_id):
    return add_deposit_payment_controller(deposit_id)
