from flask import request, jsonify
from services.auth_service import register_user, get_user_by_email
from extensions import db
from flask_jwt_extended import create_access_token

def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    if not all([name, email, password]):
        return jsonify({"msg":"name, email, password required"}), 400
    try:
        u = register_user(name, email, password)
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
    token = create_access_token(identity={"id":u.id,"role":u.role})
    return jsonify({"access_token": token, "user": {"id":u.id,"name":u.name,"email":u.email,"role":u.role}}), 200
