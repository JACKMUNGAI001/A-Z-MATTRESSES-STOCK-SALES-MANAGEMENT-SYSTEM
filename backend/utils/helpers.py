import json
from flask import current_app
from models.receipt import Receipt
from extensions import db

def create_receipt(payload: dict):
    r = Receipt(payload=json.dumps(payload))
    db.session.add(r)
    db.session.commit()
    return r.uuid

def receipt_public_url(uuid):
    base = current_app.config.get("FRONTEND_URL", "")
    return f"{base.rstrip('/')}/receipt/{uuid}"
