from flask import Blueprint, request
from controllers.admin_controller import pending_attendants, verify_attendant, list_all_attendants_controller, delete_attendant_controller
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("admin", __name__)

@bp.route("/attendants/pending", methods=["GET"])
@jwt_required()
def pending():
    identity = get_jwt_identity()
    return pending_attendants(identity)

@bp.route("/attendants/<int:user_id>/verify", methods=["PATCH"])
@jwt_required()
def verify(user_id):
    identity = get_jwt_identity()
    if identity.get("role") != "admin":
        return {"msg":"admin only"}, 403
    data = request.get_json() or {}
    return verify_attendant(user_id, data)

@bp.route("/attendants/all", methods=["GET"])
@jwt_required()
def all_attendants():
    identity = get_jwt_identity()
    return list_all_attendants_controller(identity)

@bp.route("/attendants/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_attendant(user_id):
    identity = get_jwt_identity()
    return delete_attendant_controller(user_id, identity)
