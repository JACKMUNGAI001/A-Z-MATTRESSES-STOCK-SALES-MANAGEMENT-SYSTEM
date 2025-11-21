from flask import request, jsonify
from models.shop import Shop
from extensions import db

def list_shops():
    shops = Shop.query.all()
    out = [{"id":s.id,"name":s.name,"address":s.address} for s in shops]
    return jsonify(out), 200

def get_shop_controller(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({"msg": "Shop not found"}), 404
    return jsonify({"id":shop.id,"name":shop.name,"address":shop.address}), 200

def create_shop():
    data = request.get_json() or {}
    name = data.get("name")
    address = data.get("address")
    if not name:
        return jsonify({"msg":"name required"}), 400
    s = Shop(name=name, address=address)
    db.session.add(s)
    db.session.commit()
    return jsonify({"id":s.id,"name":s.name}), 201

def update_shop(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({"msg": "Shop not found"}), 404
    data = request.get_json() or {}
    shop.name = data.get("name", shop.name)
    shop.address = data.get("address", shop.address)
    db.session.commit()
    return jsonify({"msg": "Shop updated", "id": shop.id}), 200

def delete_shop(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({"msg": "Shop not found"}), 404
    db.session.delete(shop)
    db.session.commit()
    return jsonify({"msg": "Shop deleted"}), 200
