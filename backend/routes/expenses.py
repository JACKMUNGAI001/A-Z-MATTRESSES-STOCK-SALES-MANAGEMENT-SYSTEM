from flask import Blueprint
from controllers.expense_controller import (
    add_expense_controller, 
    list_expenses_controller, 
    get_expense_controller, 
    update_expense_controller, 
    delete_expense_controller
)
from flask_jwt_extended import jwt_required

bp = Blueprint("expenses", __name__)

bp.add_url_rule("/", "add_expense", jwt_required()(add_expense_controller), methods=["POST"])
bp.add_url_rule("/", "list_expenses", jwt_required()(list_expenses_controller), methods=["GET"])
bp.add_url_rule("/<int:expense_id>", "get_expense", jwt_required()(get_expense_controller), methods=["GET"])
bp.add_url_rule("/<int:expense_id>", "update_expense", jwt_required()(update_expense_controller), methods=["PUT"])
bp.add_url_rule("/<int:expense_id>", "delete_expense", jwt_required()(delete_expense_controller), methods=["DELETE"])
