from flask import url_for, current_app
from models import Receipt
from extensions import db
import json

def create_receipt(payload_dict):
    r = Receipt(payload=json.dumps(payload_dict))
    db.session.add(r)
    db.session.commit()
    return r.uuid

def receipt_url(uuid):
    return f"{current_app.config.get('FRONTEND_URL').rstrip('/')}/receipt/{uuid}"
