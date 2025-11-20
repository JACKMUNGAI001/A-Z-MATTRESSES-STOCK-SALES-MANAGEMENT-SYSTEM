from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Shop
from extensions import db

bp = Blueprint("admin", __name__)

def admin_only(identity):
    return identity and identity.get("role") == "admin"

@bp.route("/attendants/pending", methods=["GET"])
@jwt_required()
def pending_attendants():
    if not admin_only(get_jwt_identity()):
        return jsonify({"msg":"admin only"}), 403
    users = User.query.filter_by(role="attendant", is_verified=False).all()
    out = [{"id":u.id,"name":u.name,"email":u.email,"created_at":u.created_at.isoformat()} for u in users]
    return jsonify(out), 200

@bp.route("/attendants/<int:user_id>/verify", methods=["PATCH"])
@jwt_required()
def verify_attendant(user_id):
    if not admin_only(get_jwt_identity()):
        return jsonify({"msg":"admin only"}), 403
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    u = User.query.get_or_404(user_id)
    u.is_verified = True
    if shop_id:
        u.shop_id = shop_id
    db.session.commit()
    return jsonify({"msg":"verified"}), 200
