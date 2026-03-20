from flask import request, jsonify
from services.report_service import get_global_financial_overview, get_pnl_report, get_daily_sales, get_sales_summary, get_deposits_summary, get_stock_summary_by_category
from datetime import datetime
from flask_jwt_extended import get_jwt_identity
from utils.auth_utils import get_shop_id_for_attendant

def global_financial_overview_controller():
    overview = get_global_financial_overview()
    return jsonify(overview), 200

def pnl_report_controller():
    year = request.args.get('year', type=int, default=datetime.utcnow().year)
    month = request.args.get('month', type=int) # Now optional for yearly report
    shop_id = request.args.get('shop_id', type=int) # Optional for global report
    period = request.args.get('period') # e.g. today, this_week
    
    user_identity = get_jwt_identity()
    if user_identity.get("role") == "attendant":
        shop_id = get_shop_id_for_attendant()
    
    report = get_pnl_report(year, month, shop_id, period)
    return jsonify(report), 200

def daily_sales_report_controller():
    shop_id = request.args.get('shop_id', type=int)
    user_identity = get_jwt_identity()
    if user_identity.get("role") == "attendant":
        shop_id = get_shop_id_for_attendant()
    daily_sales = get_daily_sales(shop_id)
    return jsonify(daily_sales), 200

def sales_summary_controller():
    shop_id = request.args.get('shop_id', type=int)
    user_identity = get_jwt_identity()
    if user_identity.get("role") == "attendant":
        shop_id = get_shop_id_for_attendant()
    summary = get_sales_summary(shop_id)
    return jsonify(summary), 200

def deposits_summary_controller():
    shop_id = request.args.get('shop_id', type=int)
    user_identity = get_jwt_identity()
    if user_identity.get("role") == "attendant":
        shop_id = get_shop_id_for_attendant()
    summary = get_deposits_summary(shop_id)
    return jsonify(summary), 200

def stock_summary_by_category_controller():
    shop_id = request.args.get('shop_id', type=int)
    
    user_identity = get_jwt_identity()
    if user_identity.get("role") == "attendant":
        shop_id = get_shop_id_for_attendant()
    
    summary = get_stock_summary_by_category(shop_id)
    return jsonify(summary), 200
