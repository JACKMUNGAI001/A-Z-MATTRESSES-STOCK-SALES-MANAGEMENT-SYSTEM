from flask import request, jsonify
from services.deposit_service import (
    create_deposit, add_deposit_payment, get_deposit_customers_count, 
    get_deposit_customers, get_all_deposits, get_deposits_by_shop_id,
    get_todays_deposit_payments, get_weeks_deposit_payments,
    get_months_deposit_payments, get_years_deposit_payments,
    delete_deposit, update_deposit
)
from models.deposit import DepositSale
from flask_jwt_extended import get_jwt_identity
from utils.auth_utils import get_shop_id_for_attendant

def create_deposit_controller():
    data = request.get_json() or {}
    user = get_jwt_identity()
    try:
        dep, receipt_uuid = create_deposit(shop_id=data.get("shop_id"), item_id=data.get("item_id"),
                             buyer_name=data.get("buyer_name"), buyer_phone=data.get("buyer_phone"), selling_price=data.get("selling_price"),
                             created_by=user.get("id"), amount=data.get("amount"))
        return jsonify({"msg":"deposit created","deposit_id":dep.id,"uuid":dep.uuid, "receipt_uuid": receipt_uuid}), 201
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
        # Enforce mobile money for all deposits
        dp = add_deposit_payment(deposit_id=deposit_id, amount=data.get("amount"), payment_method="mobile_money", recorded_by=user.get("id"))
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
    shop_id = get_shop_id_for_attendant()
    count = get_deposit_customers_count(shop_id=shop_id)
    return jsonify(count), 200

def deposit_customers_controller():
    shop_id = get_shop_id_for_attendant()
    customers = get_deposit_customers(shop_id=shop_id)
    return jsonify(customers), 200

def todays_deposits_controller():
    shop_id = get_shop_id_for_attendant()
    return jsonify(get_todays_deposit_payments(shop_id)), 200

def weeks_deposits_controller():
    shop_id = get_shop_id_for_attendant()
    return jsonify(get_weeks_deposit_payments(shop_id)), 200

def months_deposits_controller():
    shop_id = get_shop_id_for_attendant()
    return jsonify(get_months_deposit_payments(shop_id)), 200

def years_deposits_controller():
    shop_id = get_shop_id_for_attendant()
    return jsonify(get_years_deposit_payments(shop_id)), 200

def delete_deposit_controller(deposit_id):
    user_identity = get_jwt_identity()
    if user_identity.get("role") != "admin":
        return jsonify({"msg": "Admin privilege required"}), 403
    try:
        delete_deposit(deposit_id)
        return jsonify({"msg": "Deposit record deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 404

def update_deposit_controller(deposit_id):
    user_identity = get_jwt_identity()
    if user_identity.get("role") != "admin":
        return jsonify({"msg": "Admin privilege required"}), 403
    
    data = request.get_json() or {}
    try:
        dep = update_deposit(
            deposit_id=deposit_id,
            buyer_name=data.get("buyer_name"),
            buyer_phone=data.get("buyer_phone"),
            selling_price=data.get("selling_price"),
            item_id=data.get("item_id")
        )
        return jsonify({"msg": "Deposit updated successfully", "deposit_id": dep.id}), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": "Internal Server Error"}), 500
