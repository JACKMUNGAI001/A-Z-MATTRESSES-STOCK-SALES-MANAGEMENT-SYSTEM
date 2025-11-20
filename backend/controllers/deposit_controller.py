from flask import request, jsonify
from services.deposit_service import create_deposit, add_deposit_payment
from flask_jwt_extended import get_jwt_identity

def create_deposit_controller():
    data = request.get_json() or {}
    user = get_jwt_identity()
    try:
        dep = create_deposit(shop_id=data.get("shop_id"), item_id=data.get("item_id"), item_size_id=data.get("item_size_id"),
                             buyer_name=data.get("buyer_name"), buyer_phone=data.get("buyer_phone"), selling_price=data.get("selling_price"),
                             created_by=user.get("id"))
        return jsonify({"msg":"deposit created","deposit_id":dep.id,"uuid":dep.uuid}), 201
    except ValueError as e:
        return jsonify({"msg":str(e)}), 400

def add_deposit_payment_controller(deposit_id):
    data = request.get_json() or {}
    user = get_jwt_identity()
    try:
        dp = add_deposit_payment(deposit_id=deposit_id, amount=data.get("amount"), payment_method=data.get("payment_method"), recorded_by=user.get("id"))
        return jsonify({"msg":"payment recorded","payment_id":dp.id}), 201
    except Exception as e:
        return jsonify({"msg":str(e)}), 400
