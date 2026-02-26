from flask import request, jsonify
from services.report_service import get_global_financial_overview, get_pnl_report, get_daily_sales, get_sales_summary, get_deposits_summary
from datetime import datetime
from flask_jwt_extended import get_jwt_identity

def global_financial_overview_controller():
    overview = get_global_financial_overview()
    return jsonify(overview), 200

def pnl_report_controller():
    year = request.args.get('year', type=int, default=datetime.utcnow().year)
    month = request.args.get('month', type=int) # Now optional for yearly report
    shop_id = request.args.get('shop_id', type=int) # Optional for global report
    
    user = get_jwt_identity()
    if user.get("role") == "attendant":
        shop_id = user.get("shop_id")
    
    report = get_pnl_report(year, month, shop_id)
    return jsonify(report), 200

def daily_sales_report_controller():
    user = get_jwt_identity()
    shop_id = user.get("shop_id") if user.get("role") == "attendant" else None
    daily_sales = get_daily_sales(shop_id)
    return jsonify(daily_sales), 200

def sales_summary_controller():
    user = get_jwt_identity()
    shop_id = user.get("shop_id") if user.get("role") == "attendant" else None
    summary = get_sales_summary(shop_id)
    return jsonify(summary), 200

def deposits_summary_controller():
    user = get_jwt_identity()
    shop_id = user.get("shop_id") if user.get("role") == "attendant" else None
    summary = get_deposits_summary(shop_id)
    return jsonify(summary), 200
