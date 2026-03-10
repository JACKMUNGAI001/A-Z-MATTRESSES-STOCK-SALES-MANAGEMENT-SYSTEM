from extensions import db
from models.transfer import Transfer, TransferItem
from models.stock import ShopStock, StockMovement, StockBatch
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
                qty_to_transfer = int(it.get("qty", 1))

                s_from = ShopStock.query.filter_by(shop_id=from_shop_id, item_id=item_id).first()
                if not s_from or s_from.quantity < qty_to_transfer:
                    raise ValueError("Insufficient stock at source")

                s_from.quantity -= qty_to_transfer
                s_to = ShopStock.query.filter_by(shop_id=to_shop_id, item_id=item_id).first()
                if not s_to:
                    s_to = ShopStock(shop_id=to_shop_id, item_id=item_id, quantity=0, buy_price=s_from.buy_price)
                    db.session.add(s_to)
                
                s_to.quantity += qty_to_transfer

                # FIFO Transfer Logic: Pull from source batches and recreate in destination
                remaining_to_pull = qty_to_transfer
                while remaining_to_pull > 0:
                    batch = StockBatch.query.filter_by(shop_id=from_shop_id, item_id=item_id) \
                        .filter(StockBatch.remaining_qty > 0) \
                        .order_by(StockBatch.created_at.asc()).first()
                    
                    if not batch:
                        # Fallback: create a generic batch in destination if source is missing batches
                        new_batch = StockBatch(
                            shop_id=to_shop_id,
                            item_id=item_id,
                            initial_qty=remaining_to_pull,
                            remaining_qty=remaining_to_pull,
                            buy_price=s_from.buy_price or 0,
                            source_type="transfer",
                            source_id=t.id,
                            created_at=datetime.utcnow()
                        )
                        db.session.add(new_batch)
                        remaining_to_pull = 0
                    else:
                        pull_qty = min(remaining_to_pull, batch.remaining_qty)
                        batch.remaining_qty -= pull_qty
                        
                        # Create matching batch in destination
                        dest_batch = StockBatch(
                            shop_id=to_shop_id,
                            item_id=item_id,
                            initial_qty=pull_qty,
                            remaining_qty=pull_qty,
                            buy_price=batch.buy_price,
                            source_type="transfer",
                            source_id=t.id,
                            created_at=datetime.utcnow()
                        )
                        db.session.add(dest_batch)
                        remaining_to_pull -= pull_qty

                mv_out = StockMovement(shop_id=from_shop_id, item_id=item_id, movement_type="transfer_out", qty=-qty_to_transfer, user_id=created_by, created_at=datetime.utcnow())
                mv_in = StockMovement(shop_id=to_shop_id, item_id=item_id, movement_type="transfer_in", qty=qty_to_transfer, user_id=created_by, created_at=datetime.utcnow())
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

def get_transfers(shop_id=None):
    query = Transfer.query.order_by(Transfer.created_at.desc())
    if shop_id:
        query = query.filter((Transfer.from_shop_id == shop_id) | (Transfer.to_shop_id == shop_id))
    
    transfers = query.all()
    out = []
    for t in transfers:
        from_shop = Shop.query.get(t.from_shop_id)
        to_shop = Shop.query.get(t.to_shop_id)
        user = User.query.get(t.created_by)
        
        items = []
        t_items = TransferItem.query.filter_by(transfer_id=t.id).all()
        for ti in t_items:
            item = Item.query.get(ti.item_id)
            items.append({
                "item_name": item.name if item else "N/A",
                "qty": ti.qty
            })
            
        out.append({
            "id": t.id,
            "from_shop_name": from_shop.name if from_shop else "N/A",
            "to_shop_name": to_shop.name if to_shop else "N/A",
            "created_by_name": user.name if user else "N/A",
            "status": t.status,
            "notes": t.notes,
            "created_at": t.created_at.isoformat(),
            "items": items
        })
    return out
