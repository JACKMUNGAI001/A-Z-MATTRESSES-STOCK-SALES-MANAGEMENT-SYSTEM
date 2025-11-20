from flask import Blueprint, request, jsonify
from extensions import db
from models import Transfer, TransferItem, ShopStock, StockMovement
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("transfers", __name__)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_transfer():
    data = request.get_json() or {}
    from_shop = data.get("from_shop_id")
    to_shop = data.get("to_shop_id")
    items = data.get("items", [])
    user = get_jwt_identity()
    t = Transfer(from_shop_id=from_shop, to_shop_id=to_shop, created_by=user.get("id"), status="completed")
    db.session.add(t)
    db.session.commit()
    for item in items:
        item_id = item.get("item_id")
        size_id = item.get("item_size_id")
        qty = int(item.get("qty",1))
        # subtract from from_shop
        s_from = ShopStock.query.filter_by(shop_id=from_shop, item_id=item_id, item_size_id=size_id).first()
        if not s_from or s_from.quantity < qty:
            db.session.rollback()
            return jsonify({"msg":"insufficient stock at source","item_id":item_id}), 400
        s_from.quantity -= qty
        # add to to_shop
        s_to = ShopStock.query.filter_by(shop_id=to_shop, item_id=item_id, item_size_id=size_id).first()
        if not s_to:
            s_to = ShopStock(shop_id=to_shop, item_id=item_id, item_size_id=size_id, quantity=0)
            db.session.add(s_to)
        s_to.quantity += qty
        db.session.commit()
        # record movement
        mv_out = StockMovement(shop_id=from_shop, item_id=item_id, item_size_id=size_id, movement_type="transfer_out", qty=-qty, user_id=user.get("id"))
        mv_in = StockMovement(shop_id=to_shop, item_id=item_id, item_size_id=size_id, movement_type="transfer_in", qty=qty, user_id=user.get("id"))
        db.session.add_all([mv_out, mv_in])
        db.session.commit()
        ti = TransferItem(transfer_id=t.id, item_id=item_id, item_size_id=size_id, qty=qty)
        db.session.add(ti)
    db.session.commit()
    return jsonify({"msg":"transfer completed","transfer_id":t.id}), 201
