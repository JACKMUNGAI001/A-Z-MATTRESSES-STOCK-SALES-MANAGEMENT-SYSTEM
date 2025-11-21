from flask import request, jsonify
from services.transfer_service import transfer_stock
from flask_jwt_extended import get_jwt_identity

def create_transfer_controller():
    data = request.get_json() or {}
    user = get_jwt_identity()
    items = data.get("items", [])
    notes = data.get("notes")
    try:
        t = transfer_stock(from_shop_id=data.get("from_shop_id"), to_shop_id=data.get("to_shop_id"), items=items, created_by=user.get("id"), notes=notes)
        return jsonify({"msg":"transfer completed","transfer_id":t.id}), 201
    except Exception as e:
        return jsonify({"msg":str(e)}), 400
