from flask import Blueprint, jsonify
from models import Receipt
bp = Blueprint("receipts", __name__)

@bp.route("/<string:uuid>", methods=["GET"])
def get_receipt(uuid):
    r = Receipt.query.filter_by(uuid=uuid).first_or_404()
    return jsonify({"uuid":r.uuid,"payload":r.payload,"created_at":r.created_at.isoformat()}), 200
