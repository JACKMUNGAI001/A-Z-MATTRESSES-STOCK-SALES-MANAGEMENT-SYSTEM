from flask import jsonify, request
from models.user import User
from models.shop import Shop
from extensions import db
from sqlalchemy.orm import joinedload

def pending_attendants(identity):
    if identity.get("role") != "admin":
        return jsonify({"msg":"admin only"}), 403
    users = User.query.filter_by(role="attendant", is_verified=False).order_by(User.name.asc()).all()
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

def list_all_attendants_controller(identity):
    if identity.get("role") != "admin":
        return jsonify({"msg":"admin only"}), 403
    attendants = User.query.filter_by(role="attendant").options(joinedload(User.shop)).order_by(User.name.asc()).all()
    out = []
    for att in attendants:
        shop_name = None
        if att.shop:
            shop_name = att.shop.name
        out.append({
            "id": att.id,
            "name": att.name,
            "email": att.email,
            "is_verified": att.is_verified,
            "shop_id": att.shop_id,
            "shop_name": shop_name,
            "created_at": att.created_at.isoformat()
        })
    return jsonify(out), 200

def delete_attendant_controller(user_id, identity):
    if identity.get("role") != "admin":
        return jsonify({"msg":"admin only"}), 403
    attendant = User.query.filter_by(id=user_id, role="attendant").first()
    if not attendant:
        return jsonify({"msg": "Attendant not found"}), 404
    db.session.delete(attendant)
    db.session.commit()
    return jsonify({"msg": "Attendant deleted"}), 200

def list_managers_controller(identity):
    if identity.get("role") != "admin":
        return jsonify({"msg": "admin only"}), 403
    managers = User.query.filter_by(role="manager").order_by(User.name.asc()).all()
    return jsonify([{
        "id": manager.id,
        "name": manager.name,
        "email": manager.email,
        "can_restock": bool(manager.can_restock),
    } for manager in managers]), 200

def set_manager_restock_permission(user_id, data, identity):
    if identity.get("role") != "admin":
        return jsonify({"msg": "admin only"}), 403
    manager = User.query.filter_by(id=user_id, role="manager").first()
    if not manager:
        return jsonify({"msg": "Manager not found"}), 404
    # Accept the former key during rolling deployments, when an older browser
    # build may still be using the gas-only permission endpoint.
    manager.can_restock = bool(data.get("can_restock", data.get("can_restock_gas", False)))
    db.session.commit()
    return jsonify({"msg": "Restock permission updated", "can_restock": manager.can_restock}), 200

def my_restock_permission(identity):
    user = User.query.get(identity.get("id"))
    return jsonify({"can_restock": bool(user and user.role == "manager" and user.can_restock)}), 200
