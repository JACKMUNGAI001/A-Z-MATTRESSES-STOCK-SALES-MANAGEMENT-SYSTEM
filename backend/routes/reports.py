from flask import Blueprint
from controllers.report_controller import global_financial_overview_controller, pnl_report_controller, daily_sales_report_controller
from flask_jwt_extended import jwt_required

bp = Blueprint("reports", __name__)

bp.add_url_rule("/financial-overview", "global_financial_overview", jwt_required()(global_financial_overview_controller), methods=["GET"])
bp.add_url_rule("/pnl", "pnl_report", jwt_required()(pnl_report_controller), methods=["GET"])
bp.add_url_rule("/daily_sales", "daily_sales_report", jwt_required()(daily_sales_report_controller), methods=["GET"])
