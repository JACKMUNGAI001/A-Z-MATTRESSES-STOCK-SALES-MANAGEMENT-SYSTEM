from flask import Blueprint, request, jsonify
from extensions import db
from models import Item, Category, ItemSize

bp = Blueprint("items", __name__)

@bp.route("/", methods=["GET"])
def list_items():
    items = Item.query.all()
    out = []
    for it in items:
        sizes = [{"id":s.id,"label":s.label,"sell_price":str(s.sell_price)} for s in it.sizes]
        out.append({"id":it.id,"name":it.name,"brand":it.brand,"category_id":it.category_id,"sizes":sizes})
    return jsonify(out), 200

@bp.route("/", methods=["POST"])
def create_item():
    data = request.get_json() or {}
    name = data.get("name")
    category_id = data.get("category_id")
    if not all([name, category_id]):
        return jsonify({"msg":"name and category_id required"}), 400
    it = Item(name=name, category_id=category_id, brand=data.get("brand"),
              default_buy_price=data.get("default_buy_price"), default_sell_price=data.get("default_sell_price"))
    db.session.add(it)
    db.session.commit()
    sizes = data.get("sizes") or []
    for s in sizes:
        item_size = ItemSize(item_id=it.id, label=s.get("label"), buy_price=s.get("buy_price"), sell_price=s.get("sell_price"))
        db.session.add(item_size)
    db.session.commit()
    return jsonify({"id":it.id,"name":it.name}), 201
