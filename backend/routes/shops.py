from flask import Blueprint, request, jsonify
from extensions import db
from models import Shop

bp = Blueprint("shops", __name__)

@bp.route("/", methods=["GET"])
def list_shops():
    shops = Shop.query.all()
    out = [{"id":s.id,"name":s.name,"address":s.address} for s in shops]
    return jsonify(out), 200

@bp.route("/", methods=["POST"])
def create_shop():
    data = request.get_json() or {}
    name = data.get("name")
    if not name:
        return jsonify({"msg":"name required"}), 400
    s = Shop(name=name, address=data.get("address"))
    db.session.add(s)
    db.session.commit()
    return jsonify({"id":s.id,"name":s.name}), 201
