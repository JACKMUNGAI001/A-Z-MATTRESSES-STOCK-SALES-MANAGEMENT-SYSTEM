from flask import request, jsonify
from services.deposit_service import create_deposit, add_deposit_payment, get_deposit_customers_count, get_deposit_customers, get_all_deposits, get_deposits_by_shop_id
from models.deposit import DepositSale
from flask_jwt_extended import get_jwt_identity

def create_deposit_controller():
    data = request.get_json() or {}
    user = get_jwt_identity()
    try:
        dep = create_deposit(shop_id=data.get("shop_id"), item_id=data.get("item_id"),
                             buyer_name=data.get("buyer_name"), buyer_phone=data.get("buyer_phone"), selling_price=data.get("selling_price"),
                             created_by=user.get("id"), amount=data.get("amount"))
        return jsonify({"msg":"deposit created","deposit_id":dep.id,"uuid":dep.uuid}), 201
    except ValueError as e:
        print(f"DEBUG: ValueError in create_deposit_controller: {str(e)}")
        return jsonify({"msg":str(e)}), 400
    except Exception as e:
        print(f"DEBUG: Exception in create_deposit_controller: {str(e)}")
        return jsonify({"msg":"Internal Server Error"}), 500

def add_deposit_payment_controller(deposit_id):
    data = request.get_json() or {}
    user = get_jwt_identity()
    try:
        dp = add_deposit_payment(deposit_id=deposit_id, amount=data.get("amount"), payment_method=data.get("payment_method"), recorded_by=user.get("id"))
        return jsonify({"msg":"payment recorded","payment_id":dp.id, "receipt_uuid": dp.receipt_uuid}), 201
    except Exception as e:
        print(f"DEBUG: Error in add_deposit_payment_controller: {str(e)}")
        return jsonify({"msg":str(e)}), 400

def list_deposits_controller():
    deposits = get_all_deposits()
    return jsonify(deposits), 200

def get_shop_deposits_controller(shop_id):
    deposits = get_deposits_by_shop_id(shop_id)
    return jsonify(deposits), 200

def deposit_customers_count_controller():
    count = get_deposit_customers_count()
    return jsonify(count), 200

def deposit_customers_controller():
    customers = get_deposit_customers()
    return jsonify(customers), 200

