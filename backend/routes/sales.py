from flask import Blueprint
from controllers.sale_controller import create_sale_controller, get_shop_sales_controller, todays_sales_controller
from flask_jwt_extended import jwt_required

bp = Blueprint("sales", __name__)

bp.add_url_rule("/", "create_sale", jwt_required()(create_sale_controller), methods=["POST"])
bp.add_url_rule("/today", "todays_sales", jwt_required()(todays_sales_controller), methods=["GET"])
bp.add_url_rule("/<int:shop_id>", "get_shop_sales", jwt_required()(get_shop_sales_controller), methods=["GET"])
