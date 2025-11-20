from flask import Blueprint, request, jsonify
from extensions import db
from models import ShopStock, Item, ItemSize, Shop, StockMovement
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

bp = Blueprint("stocks", __name__)

@bp.route("/<int:shop_id>", methods=["GET"])
def get_shop_stocks(shop_id):
    stocks = ShopStock.query.filter_by(shop_id=shop_id).all()
    return jsonify([{"id":s.id,"item_id":s.item_id,"size_id":s.item_size_id,"qty":s.quantity} for s in stocks]), 200

@bp.route("/adjust", methods=["POST"])
@jwt_required()
def adjust_stock():
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    item_id = data.get("item_id")
    size_id = data.get("item_size_id")
    qty = int(data.get("qty",0))
    movement_type = data.get("movement_type","adjustment")
    user = get_jwt_identity()
    stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id, item_size_id=size_id).first()
    if not stock:
        stock = ShopStock(shop_id=shop_id, item_id=item_id, item_size_id=size_id, quantity=0)
        db.session.add(stock)
    stock.quantity += qty
    stock.updated_at = datetime.utcnow()
    db.session.commit()
    # record movement
    mv = StockMovement(shop_id=shop_id, item_id=item_id, item_size_id=size_id, movement_type=movement_type, qty=qty, user_id=user.get("id"))
    db.session.add(mv)
    db.session.commit()
    return jsonify({"msg":"adjusted","qty":stock.quantity}), 200
