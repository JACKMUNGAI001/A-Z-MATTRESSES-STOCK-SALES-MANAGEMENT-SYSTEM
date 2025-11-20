from flask import Blueprint
from controllers.expense_controller import add_expense_controller, list_expenses_controller
from flask_jwt_extended import jwt_required

bp = Blueprint("expenses", __name__)

bp.add_url_rule("/", "add_expense", add_expense_controller, methods=["POST"])
bp.add_url_rule("/", "list_expenses", list_expenses_controller, methods=["GET"])
