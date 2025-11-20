import uuid
from datetime import datetime
from extensions import db

class Receipt(db.Model):
    __tablename__ = "receipts"
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(64), default=lambda: str(uuid.uuid4()), unique=True)
    payload = db.Column(db.Text)  # JSON or HTML content
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
