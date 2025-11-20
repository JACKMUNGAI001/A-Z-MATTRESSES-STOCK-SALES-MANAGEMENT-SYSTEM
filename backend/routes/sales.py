from flask import Blueprint, request, jsonify
from extensions import db
from models import Sale, SaleItem, ShopStock, StockMovement
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

bp = Blueprint("sales", __name__)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_sale():
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    user = get_jwt_identity()
    items = data.get("items", [])
    payment_type = data.get("payment_type","cash")
    if not items:
        return jsonify({"msg":"no items"}), 400

    total = 0
    sale = Sale(shop_id=shop_id, user_id=user.get("id"), total_amount=0, payment_type=payment_type)
    db.session.add(sale)
    db.session.commit()
    for it in items:
        item_id = it.get("item_id")
        size_id = it.get("item_size_id")
        qty = int(it.get("qty",1))
        unit_price = it.get("unit_price")
        # validate stock
        stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id, item_size_id=size_id).first()
        if not stock or stock.quantity < qty:
            db.session.rollback()
            return jsonify({"msg":"insufficient stock", "item_id": item_id}), 400
        stock.quantity -= qty
        db.session.commit()
        # create sale item
        si = SaleItem(sale_id=sale.id, item_id=item_id, item_size_id=size_id, qty=qty, unit_price=unit_price, unit_cost=0)
        db.session.add(si)
        total += float(unit_price) * qty
        # record movement
        mv = StockMovement(shop_id=shop_id, item_id=item_id, item_size_id=size_id, movement_type="sale", qty=-qty, user_id=user.get("id"))
        db.session.add(mv)
    sale.total_amount = total
    db.session.commit()
    return jsonify({"msg":"sale recorded","sale_id":sale.id}), 201
