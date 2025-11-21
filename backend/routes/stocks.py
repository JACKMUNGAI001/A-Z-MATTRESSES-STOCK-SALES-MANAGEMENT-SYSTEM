from flask import Blueprint, request
from controllers.stock_controller import get_shop_stock, adjust_stock_controller, low_stock_alerts_controller
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("stocks", __name__)

@bp.route("/<int:shop_id>", methods=["GET"])
@jwt_required()
def get_stocks(shop_id):
    return get_shop_stock(shop_id)

@bp.route("/adjust", methods=["POST"])
@jwt_required()
def adjust():
    identity = get_jwt_identity()
    return adjust_stock_controller(identity)

@bp.route("/low", methods=["GET"])
@jwt_required()
def low():
    threshold = int(request.args.get("threshold", 2))
    return low_stock_alerts_controller(threshold)
