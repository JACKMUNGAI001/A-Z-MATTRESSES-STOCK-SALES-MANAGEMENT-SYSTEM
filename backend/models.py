from datetime import datetime
from passlib.hash import bcrypt
from extensions import db
import uuid

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default="attendant")  # admin | attendant
    is_verified = db.Column(db.Boolean, default=False)
    shop_id = db.Column(db.Integer, db.ForeignKey("shops.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    shop = db.relationship("Shop", back_populates="attendants")

    def set_password(self, password):
        self.password_hash = bcrypt.hash(password)

    def check_password(self, password):
        return bcrypt.verify(password, self.password_hash)

class Shop(db.Model):
    __tablename__ = "shops"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    attendants = db.relationship("User", back_populates="shop")
    stocks = db.relationship("ShopStock", back_populates="shop")

class Category(db.Model):
    __tablename__ = "categories"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Item(db.Model):
    __tablename__ = "items"
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(64), unique=True, nullable=True)
    name = db.Column(db.String(255), nullable=False)  # e.g., Johari 4x6x8
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    default_buy_price = db.Column(db.Numeric(10,2))
    default_sell_price = db.Column(db.Numeric(10,2))
    brand = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sizes = db.relationship("ItemSize", back_populates="item")

class ItemSize(db.Model):
    __tablename__ = "item_sizes"
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
    label = db.Column(db.String(64))  # e.g., 4x6x8
    buy_price = db.Column(db.Numeric(10,2))
    sell_price = db.Column(db.Numeric(10,2))

    item = db.relationship("Item", back_populates="sizes")

class ShopStock(db.Model):
    __tablename__ = "shop_stocks"
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey("shops.id"), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
    item_size_id = db.Column(db.Integer, db.ForeignKey("item_sizes.id"), nullable=True)
    quantity = db.Column(db.Integer, default=0)
    buy_price = db.Column(db.Numeric(10,2))
    sell_price = db.Column(db.Numeric(10,2))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    shop = db.relationship("Shop", back_populates="stocks")

class StockMovement(db.Model):
    __tablename__ = "stock_movements"
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey("shops.id"))
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"))
    item_size_id = db.Column(db.Integer)
    movement_type = db.Column(db.String(50))  # purchase_in, sale, transfer_in, transfer_out, adjustment
    qty = db.Column(db.Integer)
    unit_buy_price = db.Column(db.Numeric(10,2))
    unit_sell_price = db.Column(db.Numeric(10,2))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    reference = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Sale(db.Model):
    __tablename__ = "sales"
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey("shops.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    total_amount = db.Column(db.Numeric(12,2))
    payment_type = db.Column(db.String(50))  # cash, mobile_money
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship("SaleItem", back_populates="sale")

class SaleItem(db.Model):
    __tablename__ = "sale_items"
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey("sales.id"))
    item_id = db.Column(db.Integer)
    item_size_id = db.Column(db.Integer)
    qty = db.Column(db.Integer)
    unit_price = db.Column(db.Numeric(10,2))  # selling
    unit_cost = db.Column(db.Numeric(10,2))   # buying

    sale = db.relationship("Sale", back_populates="items")

class DepositSale(db.Model):
    __tablename__ = "deposit_sales"
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(64), default=lambda: str(uuid.uuid4()), unique=True)
    shop_id = db.Column(db.Integer)
    item_id = db.Column(db.Integer)
    item_size_id = db.Column(db.Integer)
    buyer_name = db.Column(db.String(255))
    buyer_phone = db.Column(db.String(50))
    selling_price = db.Column(db.Numeric(12,2))
    created_by = db.Column(db.Integer)
    status = db.Column(db.String(20), default="active") # active, complete, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    payments = db.relationship("DepositPayment", back_populates="deposit")

class DepositPayment(db.Model):
    __tablename__ = "deposit_payments"
    id = db.Column(db.Integer, primary_key=True)
    deposit_id = db.Column(db.Integer, db.ForeignKey("deposit_sales.id"))
    amount = db.Column(db.Numeric(12,2))
    payment_method = db.Column(db.String(50))
    recorded_by = db.Column(db.Integer)
    paid_on = db.Column(db.DateTime, default=datetime.utcnow)

    deposit = db.relationship("DepositSale", back_populates="payments")

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

class Expense(db.Model):
    __tablename__ = "expenses"
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, nullable=True)  # null = global
    title = db.Column(db.String(255))
    amount = db.Column(db.Numeric(12,2))
    description = db.Column(db.Text)
    recurring = db.Column(db.Boolean, default=False)
    frequency = db.Column(db.String(20))  # monthly
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    user_role = db.Column(db.String(50), default="admin")  # admin or attendant
    user_id = db.Column(db.Integer, nullable=True)
    type = db.Column(db.String(64))
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default="unread")  # unread, read, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Receipt(db.Model):
    __tablename__ = "receipts"
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(64), default=lambda: str(uuid.uuid4()), unique=True)
    payload = db.Column(db.Text)  # store JSON or HTML snapshot
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
