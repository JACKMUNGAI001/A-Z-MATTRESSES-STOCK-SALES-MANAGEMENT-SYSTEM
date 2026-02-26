from flask import Blueprint
from controllers.receipt_controller import get_receipt_controller, get_deposit_receipts_controller

bp = Blueprint("receipts", __name__)

bp.add_url_rule("/deposit/<int:deposit_id>", "get_deposit_receipts", get_deposit_receipts_controller, methods=["GET"])
bp.add_url_rule("/<string:uuid>", "get_receipt", get_receipt_controller, methods=["GET"])
