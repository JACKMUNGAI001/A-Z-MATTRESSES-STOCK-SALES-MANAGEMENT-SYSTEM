from flask import Blueprint, request, jsonify
from extensions import db
from models import Notification
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("notifications", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def list_notifications():
    ident = get_jwt_identity()
    role = ident.get("role")
    user_id = ident.get("id")
    notes = Notification.query.filter((Notification.user_role==role) | (Notification.user_id==user_id)).all()
    return jsonify([{"id":n.id,"type":n.type,"msg":n.message,"status":n.status} for n in notes]), 200

@bp.route("/mark-read/<int:id>", methods=["POST"])
@jwt_required()
def mark_read(id):
    n = Notification.query.get_or_404(id)
    n.status = "read"
    db.session.commit()
    return jsonify({"msg":"marked read"}), 200
