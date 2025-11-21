from datetime import datetime
from extensions import db

class Sale(db.Model):
    __tablename__ = "sales"
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer)
    user_id = db.Column(db.Integer)
    total_amount = db.Column(db.Numeric(12,2))
    payment_type = db.Column(db.String(50))  # cash, mobile_money
    receipt_uuid = db.Column(db.String(64), db.ForeignKey("receipts.uuid"), nullable=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship("SaleItem", backref="sale", lazy=True)

class SaleItem(db.Model):
    __tablename__ = "sale_items"
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey("sales.id"))
    item_id = db.Column(db.Integer)
    qty = db.Column(db.Integer)
    unit_price = db.Column(db.Numeric(10,2))  # selling
    unit_cost = db.Column(db.Numeric(10,2))   # buying
