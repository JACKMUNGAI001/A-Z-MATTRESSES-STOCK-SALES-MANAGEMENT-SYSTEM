from flask import Blueprint
from controllers.sale_controller import create_sale_controller
from flask_jwt_extended import jwt_required

bp = Blueprint("sales", __name__)

bp.add_url_rule("/", "create_sale", create_sale_controller, methods=["POST"])
