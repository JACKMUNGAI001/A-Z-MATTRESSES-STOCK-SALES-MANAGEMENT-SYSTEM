from datetime import datetime
from extensions import db

class ShopStock(db.Model):
    __tablename__ = "shop_stocks"
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey("shops.id"), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    buy_price = db.Column(db.Numeric(10,2))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint("shop_id", "item_id", name="uq_shop_item"),)

class StockMovement(db.Model):
    __tablename__ = "stock_movements"
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer)
    item_id = db.Column(db.Integer)
    movement_type = db.Column(db.String(50))  # purchase_in, sale, transfer_in, transfer_out, adjustment, reserve
    qty = db.Column(db.Integer)
    unit_buy_price = db.Column(db.Numeric(10,2))
    unit_sell_price = db.Column(db.Numeric(10,2))
    user_id = db.Column(db.Integer)
    reference = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
