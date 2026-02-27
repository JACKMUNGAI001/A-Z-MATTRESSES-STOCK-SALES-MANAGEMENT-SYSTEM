from flask import request, jsonify
from services.auth_service import register_user, get_user_by_email
from extensions import db
from flask_jwt_extended import create_access_token, get_jwt_identity
from models.user import User
from models.shop import Shop

def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    shop_id = data.get("shop_id")
    if not all([name, email, password]):
        return jsonify({"msg":"name, email, password required"}), 400
    try:
        u = register_user(name, email, password, shop_id=shop_id)
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    return jsonify({"msg":"registered. await admin verification"}), 201

def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    if not all([email, password]):
        return jsonify({"msg":"email and password required"}), 400
    u = get_user_by_email(email)
    if not u or not u.check_password(password):
        return jsonify({"msg":"invalid credentials"}), 401
    if u.role == "attendant" and not u.is_verified:
        return jsonify({"msg":"account not verified by admin"}), 403
    
    shop_name = None
    if u.shop_id:
        shop = Shop.query.get(u.shop_id)
        if shop:
            shop_name = shop.name

    token = create_access_token(identity={"id":u.id,"role":u.role, "shop_id": u.shop_id})
    return jsonify({"access_token": token, "user": {"id":u.id,"name":u.name,"email":u.email,"role":u.role, "shop_id": u.shop_id, "shop_name": shop_name}}), 200

def get_current_user_controller():
    user_data = get_jwt_identity()
    user_id = user_data['id']
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    shop_name = None
    if user.shop_id:
        shop = Shop.query.get(user.shop_id)
        if shop:
            shop_name = shop.name

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "phone_number": user.phone_number,
        "shop_id": user.shop_id,
        "shop_name": shop_name
    }), 200
