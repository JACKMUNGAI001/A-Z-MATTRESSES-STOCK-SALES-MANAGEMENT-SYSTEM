from flask import request, jsonify
from services.sale_service import create_sale
from flask_jwt_extended import get_jwt_identity

def create_sale_controller():
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    items = data.get("items", [])
    payment_type = data.get("payment_type", "cash")
    user = get_jwt_identity()
    try:
        sale = create_sale(shop_id=shop_id, user_id=user.get("id"), items=items, payment_type=payment_type)
        return jsonify({"msg":"sale recorded","sale_id":sale.id}), 201
    except ValueError as e:
        return jsonify({"msg":str(e)}), 400
