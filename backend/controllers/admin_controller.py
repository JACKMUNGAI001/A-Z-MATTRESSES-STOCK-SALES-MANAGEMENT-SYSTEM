from flask import jsonify, request
from models.user import User
from extensions import db

def pending_attendants(identity):
    if identity.get("role") != "admin":
        return jsonify({"msg":"admin only"}), 403
    users = User.query.filter_by(role="attendant", is_verified=False).all()
    out = [{"id":u.id,"name":u.name,"email":u.email,"created_at":u.created_at.isoformat()} for u in users]
    return jsonify(out), 200

def verify_attendant(user_id, data):
    u = User.query.get_or_404(user_id)
    u.is_verified = True
    shop_id = data.get("shop_id")
    if shop_id:
        u.shop_id = shop_id
    db.session.commit()
    return jsonify({"msg":"verified"}), 200
