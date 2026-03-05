from datetime import datetime
from extensions import db

class Category(db.Model):
    __tablename__ = "categories"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Item(db.Model):
    __tablename__ = "items"
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(64), unique=True, nullable=True)
    name = db.Column(db.String(255), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    brand = db.Column(db.String(255), nullable=True)
    buy_price = db.Column(db.Numeric(10,2), nullable=True) # Changed from default_buy_price
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
