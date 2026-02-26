from flask import Blueprint, request
from controllers.deposit_controller import (
    create_deposit_controller, add_deposit_payment_controller, 
    list_deposits_controller, get_shop_deposits_controller, 
    deposit_customers_count_controller, deposit_customers_controller,
    todays_deposits_controller, weeks_deposits_controller,
    months_deposits_controller, years_deposits_controller
)
from flask_jwt_extended import jwt_required

bp = Blueprint("deposits", __name__)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_deposit():
    return create_deposit_controller()

@bp.route("/", methods=["GET"])
@jwt_required()
def list_deposits():
    return list_deposits_controller()

@bp.route("/shop/<int:shop_id>", methods=["GET"])
@jwt_required()
def get_shop_deposits(shop_id):
    return get_shop_deposits_controller(shop_id)

@bp.route("/customers_count", methods=["GET"])
@jwt_required()
def customers_count():
    return deposit_customers_count_controller()

@bp.route("/customers", methods=["GET"])
@jwt_required()
def customers():
    return deposit_customers_controller()

@bp.route("/today", methods=["GET"])
@jwt_required()
def todays_deposits():
    return todays_deposits_controller()

@bp.route("/week", methods=["GET"])
@jwt_required()
def weeks_deposits():
    return weeks_deposits_controller()

@bp.route("/month", methods=["GET"])
@jwt_required()
def months_deposits():
    return months_deposits_controller()

@bp.route("/year", methods=["GET"])
@jwt_required()
def years_deposits():
    return years_deposits_controller()

@bp.route("/<int:deposit_id>/payments", methods=["POST"])
@jwt_required()
def payments(deposit_id):
    return add_deposit_payment_controller(deposit_id)
