from flask import Blueprint
from controllers.item_controller import (
    list_items_controller, 
    create_item_controller, 
    list_categories_controller, 
    create_category_controller,
    delete_category_controller,
    update_item_controller, 
    delete_item_controller
)
from flask_jwt_extended import jwt_required

bp = Blueprint("items", __name__)

bp.add_url_rule("/", "list_items", jwt_required()(list_items_controller), methods=["GET"])
bp.add_url_rule("/", "create_item", jwt_required()(create_item_controller), methods=["POST"])
bp.add_url_rule("/categories", "list_categories", jwt_required()(list_categories_controller), methods=["GET"])
bp.add_url_rule("/categories", "create_category", jwt_required()(create_category_controller), methods=["POST"])
bp.add_url_rule("/categories/<int:category_id>", "delete_category", jwt_required()(delete_category_controller), methods=["DELETE"])
bp.add_url_rule("/<int:item_id>", "update_item", jwt_required()(update_item_controller), methods=["PUT"])
bp.add_url_rule("/<int:item_id>", "delete_item", jwt_required()(delete_item_controller), methods=["DELETE"])
