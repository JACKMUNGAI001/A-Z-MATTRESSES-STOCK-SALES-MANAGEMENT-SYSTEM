from flask import Blueprint
from controllers.shop_controller import list_shops, create_shop

bp = Blueprint("shops", __name__)

bp.add_url_rule("/", "list_shops", list_shops, methods=["GET"])
bp.add_url_rule("/", "create_shop", create_shop, methods=["POST"])
