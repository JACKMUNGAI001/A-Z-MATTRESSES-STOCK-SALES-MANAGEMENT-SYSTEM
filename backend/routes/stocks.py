from flask import Blueprint, request
from controllers.stock_controller import (
    get_shop_stock, adjust_stock_controller, adjust_stock_bulk_controller,
    low_stock_alerts_controller, low_stock_count_controller, 
    low_stock_items_controller, delete_stock_controller, 
    get_restock_history_controller, delete_restock_controller
)
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("stocks", __name__)

@bp.route("/history", methods=["GET"])
@jwt_required()
def restock_history():
    return get_restock_history_controller()

@bp.route("/history/<int:movement_id>", methods=["DELETE"])
@jwt_required()
def delete_restock(movement_id):
    return delete_restock_controller(movement_id)

@bp.route("/<int:shop_id>", methods=["GET"])
@jwt_required()
def get_stocks(shop_id):
    return get_shop_stock(shop_id)

@bp.route("/adjust", methods=["POST"])
@jwt_required()
def adjust():
    identity = get_jwt_identity()
    return adjust_stock_controller(identity)

@bp.route("/adjust-bulk", methods=["POST"])
@jwt_required()
def adjust_bulk():
    identity = get_jwt_identity()
    return adjust_stock_bulk_controller(identity)

@bp.route("/low", methods=["GET"])
@jwt_required()
def low():
    threshold = int(request.args.get("threshold", 2))
    return low_stock_alerts_controller(threshold)

@bp.route("/low_stock_count", methods=["GET"])
@jwt_required()
def low_stock_count():
    threshold = int(request.args.get("threshold", 2))
    return low_stock_count_controller(threshold)

@bp.route("/low_stock_items", methods=["GET"])
@jwt_required()
def low_stock_items():
    threshold = int(request.args.get("threshold", 2))
    return low_stock_items_controller(threshold)

@bp.route("/<int:shop_id>/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_shop_stock(shop_id, item_id):
    return delete_stock_controller(shop_id, item_id)

