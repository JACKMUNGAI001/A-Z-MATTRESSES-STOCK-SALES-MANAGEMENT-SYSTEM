from flask import Blueprint
from controllers.item_controller import list_items_controller, create_item_controller

bp = Blueprint("items", __name__)

bp.add_url_rule("/", "list_items", list_items_controller, methods=["GET"])
bp.add_url_rule("/", "create_item", create_item_controller, methods=["POST"])
