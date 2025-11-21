from flask import request, jsonify
from services.report_service import get_global_financial_overview, get_pnl_report
from datetime import datetime

def global_financial_overview_controller():
    overview = get_global_financial_overview()
    return jsonify(overview), 200

def pnl_report_controller():
    year = request.args.get('year', type=int, default=datetime.utcnow().year)
    month = request.args.get('month', type=int, default=datetime.utcnow().month)
    shop_id = request.args.get('shop_id', type=int)
    
    report = get_pnl_report(year, month, shop_id)
    return jsonify(report), 200
