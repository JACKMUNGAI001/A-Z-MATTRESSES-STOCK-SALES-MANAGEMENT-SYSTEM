from flask import jsonify
from models.receipt import Receipt

def get_receipt_controller(uuid):
    r = Receipt.query.filter_by(uuid=uuid).first_or_404()
    return jsonify({"uuid": r.uuid, "payload": r.payload, "created_at": r.created_at.isoformat()}), 200
