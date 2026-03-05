from flask import request, jsonify
from services.transfer_service import transfer_stock, get_transfers
from flask_jwt_extended import get_jwt_identity
from utils.auth_utils import get_shop_id_for_attendant

def create_transfer_controller():
    data = request.get_json() or {}
    user = get_jwt_identity()
    items = data.get("items", [])
    notes = data.get("notes")
    try:
        t = transfer_stock(from_shop_id=data.get("from_shop_id"), to_shop_id=data.get("to_shop_id"), items=items, created_by=user.get("id"), notes=notes)
        return jsonify({"msg":"transfer completed","transfer_id":t.id}), 201
    except Exception as e:
        return jsonify({"msg":str(e)}), 400

def list_transfers_controller():
    user_identity = get_jwt_identity()
    user_role = user_identity.get("role")
    
    shop_id = None
    if user_role == "attendant":
        shop_id = get_shop_id_for_attendant()
        
    transfers = get_transfers(shop_id=shop_id)
    return jsonify(transfers), 200
