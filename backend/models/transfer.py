from datetime import datetime
from extensions import db

class Transfer(db.Model):
    __tablename__ = "transfers"
    id = db.Column(db.Integer, primary_key=True)
    from_shop_id = db.Column(db.Integer)
    to_shop_id = db.Column(db.Integer)
    created_by = db.Column(db.Integer)
    status = db.Column(db.String(20), default="completed")  # requested, approved, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class TransferItem(db.Model):
    __tablename__ = "transfer_items"
    id = db.Column(db.Integer, primary_key=True)
    transfer_id = db.Column(db.Integer, db.ForeignKey("transfers.id"))
    item_id = db.Column(db.Integer)
    item_size_id = db.Column(db.Integer)
    qty = db.Column(db.Integer)
