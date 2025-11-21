from extensions import db
from models.receipt import Receipt
import uuid

def create_receipt(payload):
    receipt = Receipt(uuid=str(uuid.uuid4()), payload=payload)
    db.session.add(receipt)
    db.session.commit()
    return receipt

def get_receipt_by_uuid(uuid):
    return Receipt.query.filter_by(uuid=uuid).first()
