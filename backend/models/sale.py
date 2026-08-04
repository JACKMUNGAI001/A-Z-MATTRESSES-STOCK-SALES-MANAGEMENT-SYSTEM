from datetime import datetime
from sqlalchemy import text
from extensions import db
from utils.timezone_utils import get_local_time

class Sale(db.Model):
    __tablename__ = "sales"
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, index=True)
    user_id = db.Column(db.Integer)
    total_amount = db.Column(db.Numeric(12,2))
    payment_type = db.Column(db.String(50))  # mobile_money
    sale_type = db.Column(db.String(50), nullable=False, default="standard", server_default="standard")
    receipt_uuid = db.Column(db.String(64), db.ForeignKey("receipts.uuid"), nullable=True, index=True)
    created_at = db.Column(db.DateTime, default=get_local_time, index=True)

    items = db.relationship("SaleItem", backref="sale", lazy=True)

    # Track payments and profit recognition for credit sales
    paid_amount = db.Column(db.Numeric(12,2), nullable=False, default=0)
    status = db.Column(db.String(32), nullable=False, default="unpaid", server_default="unpaid")
    profit_amount = db.Column(db.Numeric(12,2), nullable=False, default=0)
    profit_recognized = db.Column(db.Boolean, nullable=False, default=False, server_default="0")


def ensure_sale_type_column():
    try:
        inspector = db.inspect(db.engine)
        if inspector.has_table("sales"):
            columns = [column["name"] for column in inspector.get_columns("sales")]
            if "sale_type" not in columns:
                with db.engine.begin() as connection:
                    connection.execute(text("ALTER TABLE sales ADD COLUMN sale_type VARCHAR(50) DEFAULT 'standard' NOT NULL"))
            # Add payment/profit columns if missing (for older databases)
            if "paid_amount" not in columns:
                with db.engine.begin() as connection:
                    connection.execute(text("ALTER TABLE sales ADD COLUMN paid_amount NUMERIC(12,2) DEFAULT 0 NOT NULL"))
            if "status" not in columns:
                with db.engine.begin() as connection:
                    connection.execute(text("ALTER TABLE sales ADD COLUMN status VARCHAR(32) DEFAULT 'unpaid' NOT NULL"))
            if "profit_amount" not in columns:
                with db.engine.begin() as connection:
                    connection.execute(text("ALTER TABLE sales ADD COLUMN profit_amount NUMERIC(12,2) DEFAULT 0 NOT NULL"))
            if "profit_recognized" not in columns:
                with db.engine.begin() as connection:
                    connection.execute(text("ALTER TABLE sales ADD COLUMN profit_recognized BOOLEAN DEFAULT 0 NOT NULL"))
    except Exception:
        pass

    # Ensure a payments table exists for recording partial/full payments against sales
    try:
        if not inspector.has_table("sale_payments"):
            with db.engine.begin() as connection:
                connection.execute(text(
                    """
                    CREATE TABLE IF NOT EXISTS sale_payments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        sale_id INTEGER NOT NULL,
                        amount NUMERIC(12,2) NOT NULL,
                        recorded_by INTEGER,
                        recorded_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                        FOREIGN KEY(sale_id) REFERENCES sales(id)
                    )
                    """
                ))
    except Exception:
        pass

class SaleItem(db.Model):
    __tablename__ = "sale_items"
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey("sales.id"))
    item_id = db.Column(db.Integer)
    qty = db.Column(db.Integer)
    unit_price = db.Column(db.Numeric(10,2))  # selling
    unit_cost = db.Column(db.Numeric(10,2))   # buying
    batch_id = db.Column(db.Integer, db.ForeignKey("stock_batches.id"), nullable=True)
