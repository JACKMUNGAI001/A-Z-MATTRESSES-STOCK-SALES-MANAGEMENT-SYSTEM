from flask import request, jsonify
from models.shop import Shop
from extensions import db

def list_shops():
    shops = Shop.query.all()
    out = [{"id":s.id,"name":s.name,"address":s.address} for s in shops]
    return jsonify(out), 200

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
