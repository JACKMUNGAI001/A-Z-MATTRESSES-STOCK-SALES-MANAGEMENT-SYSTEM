from flask import request, jsonify
from services.sale_service import create_sale, get_todays_sales, get_current_weeks_sales, get_current_months_sales, get_current_years_sales, get_all_sales, get_sales_by_shop, delete_sale
from models.sale import Sale, SaleItem
from extensions import db
from flask_jwt_extended import get_jwt_identity
from utils.auth_utils import get_shop_id_for_attendant

def create_sale_controller():
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    items = data.get("items", [])
    payment_type = data.get("payment_type", "mobile_money")
    user = get_jwt_identity()
    try:
        sale = create_sale(shop_id=shop_id, user_id=user.get("id"), items=items, payment_type=payment_type)
        return jsonify({"msg":"sale recorded","sale_id":sale.id, "receipt_uuid": sale.receipt_uuid}), 201
    except ValueError as e:
        return jsonify({"msg":str(e)}), 400

def get_all_sales_controller():
    shop_id = get_shop_id_for_attendant()
    if shop_id:
        sales = get_sales_by_shop(shop_id)
    else:
        sales = get_all_sales()
    return jsonify(sales), 200

def get_shop_sales_controller(shop_id):
    sales = get_sales_by_shop(shop_id)
    return jsonify(sales), 200

def todays_sales_controller():
    shop_id = get_shop_id_for_attendant()
    sales = get_todays_sales(shop_id)
    return jsonify(sales), 200

def current_weeks_sales_controller():
    shop_id = get_shop_id_for_attendant()
    sales = get_current_weeks_sales(shop_id)
    return jsonify(sales), 200

def current_months_sales_controller():
    shop_id = get_shop_id_for_attendant()
    sales = get_current_months_sales(shop_id)
    return jsonify(sales), 200

def current_years_sales_controller():
    shop_id = get_shop_id_for_attendant()
    sales = get_current_years_sales(shop_id)
    return jsonify(sales), 200

def delete_sale_controller(sale_id):
    user_identity = get_jwt_identity()
    if user_identity.get("role") != "admin":
        return jsonify({"msg": "Admin privilege required"}), 403
    try:
        delete_sale(sale_id, user_identity.get("id"))
        return jsonify({"msg": "Sale deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 404
    except Exception as e:
        return jsonify({"msg": "Internal Server Error"}), 500
