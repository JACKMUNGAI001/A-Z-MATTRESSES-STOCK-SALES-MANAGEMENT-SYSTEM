from datetime import datetime
from extensions import db

class Shop(db.Model):
    __tablename__ = "shops"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    attendants = db.relationship("User", backref="shop", lazy=True)
    stocks = db.relationship("ShopStock", backref="shop", lazy=True)
