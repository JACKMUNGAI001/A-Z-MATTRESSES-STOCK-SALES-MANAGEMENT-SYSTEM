from extensions import db
from models.sale import Sale, SaleItem
from models.stock import ShopStock, StockMovement
from datetime import datetime

def create_sale(shop_id, user_id, items, payment_type="cash"):
    total = 0
    sale = Sale(shop_id=shop_id, user_id=user_id, total_amount=0, payment_type=payment_type)
    db.session.add(sale)
    db.session.commit()
    for it in items:
        item_id = it.get("item_id")
        size_id = it.get("item_size_id")
        qty = int(it.get("qty", 1))
        unit_price = float(it.get("unit_price"))
        stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id, item_size_id=size_id).first()
        if not stock or stock.quantity < qty:
            db.session.rollback()
            raise ValueError(f"Insufficient stock for item {item_id}")
        stock.quantity -= qty
        db.session.commit()
        si = SaleItem(sale_id=sale.id, item_id=item_id, item_size_id=size_id, qty=qty, unit_price=unit_price, unit_cost=0)
        db.session.add(si)
        mv = StockMovement(shop_id=shop_id, item_id=item_id, item_size_id=size_id, movement_type="sale", qty=-qty, user_id=user_id, created_at=datetime.utcnow())
        db.session.add(mv)
        total += unit_price * qty
    sale.total_amount = total
    db.session.commit()
    return sale
