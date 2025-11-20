from flask import request, jsonify
from services.product_service import create_item, list_items

def list_items_controller():
    items = list_items()
    out = []
    for it in items:
        sizes = [{"id":s.id,"label":s.label,"sell_price":float(s.sell_price or 0)} for s in it.sizes]
        out.append({"id":it.id,"name":it.name,"brand":it.brand,"category_id":it.category_id,"sizes":sizes})
    return jsonify(out), 200

def create_item_controller():
    data = request.get_json() or {}
    name = data.get("name")
    category_id = data.get("category_id")
    sizes = data.get("sizes") or []
    if not all([name, category_id]):
        return jsonify({"msg":"name and category_id required"}), 400
    it = create_item(name, category_id, brand=data.get("brand"), default_buy_price=data.get("default_buy_price"), default_sell_price=data.get("default_sell_price"), sizes=sizes)
    return jsonify({"id":it.id,"name":it.name}), 201
