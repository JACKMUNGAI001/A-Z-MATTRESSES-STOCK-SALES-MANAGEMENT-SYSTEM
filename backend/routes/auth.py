from flask import Blueprint, request, jsonify
from extensions import db, jwt
from models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

bp = Blueprint("auth", __name__)

@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    if not all([name, email, password]):
        return jsonify({"msg":"name, email, password required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"msg":"email already exists"}), 400
    u = User(name=name, email=email)
    u.set_password(password)
    u.is_verified = False
    db.session.add(u)
    db.session.commit()
    return jsonify({"msg":"registered. await admin verification"}), 201

@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    if not all([email, password]):
        return jsonify({"msg":"email and password required"}), 400
    u = User.query.filter_by(email=email).first()
    if not u or not u.check_password(password):
        return jsonify({"msg":"invalid credentials"}), 401
    if u.role == "attendant" and not u.is_verified:
        return jsonify({"msg":"account not verified by admin"}), 403
    token = create_access_token(identity={"id":u.id,"role":u.role})
    return jsonify({"access_token": token, "user": {"id":u.id,"name":u.name,"email":u.email,"role":u.role}}), 200

@bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    ident = get_jwt_identity()
    return jsonify(ident), 200
