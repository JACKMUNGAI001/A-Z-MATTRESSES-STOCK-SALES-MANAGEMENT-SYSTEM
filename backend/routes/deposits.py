from flask import Blueprint, request
from controllers.deposit_controller import create_deposit_controller, add_deposit_payment_controller, list_deposits_controller, get_shop_deposits_controller, deposit_customers_count_controller, deposit_customers_controller
from flask_jwt_extended import jwt_required

bp = Blueprint("deposits", __name__)

bp.add_url_rule("/", "create_deposit", jwt_required()(create_deposit_controller), methods=["POST"])
bp.add_url_rule("/", "list_deposits", jwt_required()(list_deposits_controller), methods=["GET"])
bp.add_url_rule("/shop/<int:shop_id>", "get_shop_deposits", jwt_required()(get_shop_deposits_controller), methods=["GET"])

bp.add_url_rule("/customers", "deposit_customers", jwt_required()(deposit_customers_controller), methods=["GET"])
bp.add_url_rule("/customers_count", "deposit_customers_count", jwt_required()(deposit_customers_count_controller), methods=["GET"])

@bp.route("/<int:deposit_id>/payments", methods=["POST"])
@jwt_required()
def payments(deposit_id):
    return add_deposit_payment_controller(deposit_id)
