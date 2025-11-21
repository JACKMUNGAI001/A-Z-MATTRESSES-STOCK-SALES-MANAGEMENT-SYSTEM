from extensions import db
from models.transfer import Transfer, TransferItem
from models.stock import ShopStock, StockMovement
from models.notification import Notification
from models.shop import Shop
from models.product import Item
from models.user import User
from datetime import datetime

def transfer_stock(from_shop_id, to_shop_id, items, created_by, notes=None):
    try:
        with db.session.begin_nested():
            t = Transfer(from_shop_id=from_shop_id, to_shop_id=to_shop_id, created_by=created_by, status="completed", notes=notes)
            db.session.add(t)

            from_shop = Shop.query.get(from_shop_id)
            to_shop = Shop.query.get(to_shop_id)

            for it in items:
                item_id = it.get("item_id")
                qty = int(it.get("qty", 1))

                s_from = ShopStock.query.filter_by(shop_id=from_shop_id, item_id=item_id).first()
                if not s_from or s_from.quantity < qty:
                    raise ValueError("Insufficient stock at source")

                s_from.quantity -= qty
                s_to = ShopStock.query.filter_by(shop_id=to_shop_id, item_id=item_id).first()
                if not s_to:
                    s_to = ShopStock(shop_id=to_shop_id, item_id=item_id, quantity=0, buy_price=s_from.buy_price, sell_price=s_from.sell_price)
                    db.session.add(s_to)
                
                s_to.quantity += qty

                mv_out = StockMovement(shop_id=from_shop_id, item_id=item_id, movement_type="transfer_out", qty=-qty, user_id=created_by, created_at=datetime.utcnow())
                mv_in = StockMovement(shop_id=to_shop_id, item_id=item_id, movement_type="transfer_in", qty=qty, user_id=created_by, created_at=datetime.utcnow())
                db.session.add_all([mv_out, mv_in])

                ti = TransferItem(transfer_id=t.id, item_id=item_id, qty=qty)
                db.session.add(ti)

                item = Item.query.get(item_id)
                
                # Notification for source shop attendants
                from_shop_attendants = User.query.filter_by(shop_id=from_shop_id, role='attendant').all()
                for attendant in from_shop_attendants:
                    notification_out = Notification(
                        user_id=attendant.id,
                        user_role='attendant',
                        type='stock_transfer_out',
                        message=f'{qty} x {item.name} transferred from your shop ({from_shop.name}) to {to_shop.name}.'
                    )
                    db.session.add(notification_out)

                # Notification for destination shop attendants
                to_shop_attendants = User.query.filter_by(shop_id=to_shop_id, role='attendant').all()
                for attendant in to_shop_attendants:
                    notification_in = Notification(
                        user_id=attendant.id,
                        user_role='attendant',
                        type='stock_transfer_in',
                        message=f'{qty} x {item.name} received in your shop ({to_shop.name}) from {from_shop.name}.'
                    )
                    db.session.add(notification_in)

        db.session.commit()
        return t
    except Exception as e:
        db.session.rollback()
        raise e
