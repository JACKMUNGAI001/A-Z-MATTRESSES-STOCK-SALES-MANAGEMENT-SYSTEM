from extensions import db
from models.transfer import Transfer, TransferItem
from models.stock import ShopStock, StockMovement
from datetime import datetime

def transfer_stock(from_shop_id, to_shop_id, items, created_by):
    t = Transfer(from_shop_id=from_shop_id, to_shop_id=to_shop_id, created_by=created_by, status="completed")
    db.session.add(t)
    db.session.commit()
    for it in items:
        item_id = it.get("item_id")
        size_id = it.get("item_size_id")
        qty = int(it.get("qty",1))
        s_from = ShopStock.query.filter_by(shop_id=from_shop_id, item_id=item_id, item_size_id=size_id).first()
        if not s_from or s_from.quantity < qty:
            db.session.rollback()
            raise ValueError("Insufficient stock at source")
        s_from.quantity -= qty
        s_to = ShopStock.query.filter_by(shop_id=to_shop_id, item_id=item_id, item_size_id=size_id).first()
        if not s_to:
            s_to = ShopStock(shop_id=to_shop_id, item_id=item_id, item_size_id=size_id, quantity=0)
            db.session.add(s_to)
        s_to.quantity += qty
        db.session.commit()
        mv_out = StockMovement(shop_id=from_shop_id, item_id=item_id, item_size_id=size_id, movement_type="transfer_out", qty=-qty, user_id=created_by, created_at=datetime.utcnow())
        mv_in = StockMovement(shop_id=to_shop_id, item_id=item_id, item_size_id=size_id, movement_type="transfer_in", qty=qty, user_id=created_by, created_at=datetime.utcnow())
        db.session.add_all([mv_out, mv_in])
        db.session.commit()
        ti = TransferItem(transfer_id=t.id, item_id=item_id, item_size_id=size_id, qty=qty)
        db.session.add(ti)
    db.session.commit()
    return t
