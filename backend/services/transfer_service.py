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
                            created_at=get_local_time()
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
                            created_at=get_local_time()
                        )
                        db.session.add(dest_batch)
                        remaining_to_pull -= pull_qty

                mv_out = StockMovement(shop_id=from_shop_id, item_id=item_id, movement_type="transfer_out", qty=-qty_to_transfer, user_id=created_by, created_at=get_local_time())
                mv_in = StockMovement(shop_id=to_shop_id, item_id=item_id, movement_type="transfer_in", qty=qty_to_transfer, user_id=created_by, created_at=get_local_time())
                db.session.add_all([mv_out, mv_in])

                ti = TransferItem(transfer_id=t.id, item_id=item_id, qty=qty_to_transfer)
                db.session.add(ti)

                item = Item.query.get(item_id)
                
                # Notification for source shop attendants
                from_shop_attendants = User.query.filter_by(shop_id=from_shop_id, role='attendant').all()
                for attendant in from_shop_attendants:
                    notification_out = Notification(
                        user_id=attendant.id,
                        user_role='attendant',
                        type='stock_transfer_out',
                        message=f'{qty_to_transfer} x {item.name} transferred from your shop ({from_shop.name}) to {to_shop.name}.'
                    )
                    db.session.add(notification_out)

                # Notification for destination shop attendants
                to_shop_attendants = User.query.filter_by(shop_id=to_shop_id, role='attendant').all()
                for attendant in to_shop_attendants:
                    notification_in = Notification(
                        user_id=attendant.id,
                        user_role='attendant',
                        type='stock_transfer_in',
                        message=f'{qty_to_transfer} x {item.name} received in your shop ({to_shop.name}) from {from_shop.name}.'
                    )
                    db.session.add(notification_in)

        db.session.commit()
        return t
    except Exception as e:
        db.session.rollback()
        raise e

def delete_transfer(transfer_id, user_id):
    try:
        t = Transfer.query.get(transfer_id)
        if not t:
            raise ValueError("Transfer not found")
        
        with db.session.begin_nested():
            # 1. Check if any items from this transfer have been sold
            dest_batches = StockBatch.query.filter_by(shop_id=t.to_shop_id, source_type='transfer', source_id=t.id).all()
            for db_batch in dest_batches:
                if db_batch.remaining_qty < db_batch.initial_qty:
                    raise ValueError(f"Cannot delete transfer {t.id}: some items have already been sold in the destination shop.")
            
            # 2. Revert ShopStock in both shops
            t_items = TransferItem.query.filter_by(transfer_id=t.id).all()
            for ti in t_items:
                # Source shop: add back qty
                s_from = ShopStock.query.filter_by(shop_id=t.from_shop_id, item_id=ti.item_id).first()
                if s_from:
                    s_from.quantity += ti.qty
                
                # Destination shop: subtract qty
                s_to = ShopStock.query.filter_by(shop_id=t.to_shop_id, item_id=ti.item_id).first()
                if s_to:
                    if s_to.quantity < ti.qty:
                         raise ValueError(f"Cannot delete transfer {t.id}: destination shop has insufficient total stock for item {ti.item_id}.")
                    s_to.quantity -= ti.qty

                # 3. Create restoration movements
                mv_from = StockMovement(shop_id=t.from_shop_id, item_id=ti.item_id, movement_type="adjustment", qty=ti.qty, user_id=user_id, reference=f"Transfer {t.id} deleted (restored to source)", created_at=get_local_time())
                mv_to = StockMovement(shop_id=t.to_shop_id, item_id=ti.item_id, movement_type="adjustment", qty=-ti.qty, user_id=user_id, reference=f"Transfer {t.id} deleted (removed from destination)", created_at=get_local_time())
                db.session.add_all([mv_from, mv_to])

            # 4. Restore batches in source shop using destination batch info
            for db_batch in dest_batches:
                # Restore to source: find a batch in source shop to increment OR create new one
                # To be simple and maintain FIFO order roughly, we'll create a new batch in source shop
                # with the same buy_price and marked as a reversal.
                new_batch = StockBatch(
                    shop_id=t.from_shop_id,
                    item_id=db_batch.item_id,
                    initial_qty=db_batch.initial_qty,
                    remaining_qty=db_batch.initial_qty,
                    buy_price=db_batch.buy_price,
                    source_type="transfer_reversal",
                    source_id=t.id,
                    created_at=get_local_time()
                )
                db.session.add(new_batch)
                
                # Delete the destination batch
                db.session.delete(db_batch)

            # 5. Delete TransferItems and Transfer record
            TransferItem.query.filter_by(transfer_id=t.id).delete()
            db.session.delete(t)

        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        raise e

def update_transfer(transfer_id, user_id, from_shop_id, to_shop_id, items, notes=None):
    try:
        t = Transfer.query.get(transfer_id)
        if not t:
            raise ValueError("Transfer not found")
        
        with db.session.begin_nested():
            # 1. Check if any items from CURRENT transfer state have been sold
            dest_batches = StockBatch.query.filter_by(shop_id=t.to_shop_id, source_type='transfer', source_id=t.id).all()
            for db_batch in dest_batches:
                if db_batch.remaining_qty < db_batch.initial_qty:
                    raise ValueError(f"Cannot update transfer {t.id}: some items have already been sold in the destination shop.")
            
            # 2. UNDO old transfer state (similar to delete_transfer but keep the Transfer object)
            t_items_old = TransferItem.query.filter_by(transfer_id=t.id).all()
            for ti in t_items_old:
                # Source shop: add back qty
                s_from_old = ShopStock.query.filter_by(shop_id=t.from_shop_id, item_id=ti.item_id).first()
                if s_from_old:
                    s_from_old.quantity += ti.qty
                
                # Destination shop: subtract qty
                s_to_old = ShopStock.query.filter_by(shop_id=t.to_shop_id, item_id=ti.item_id).first()
                if s_to_old:
                    s_to_old.quantity -= ti.qty

                # Create reversal movements
                mv_rev_from = StockMovement(shop_id=t.from_shop_id, item_id=ti.item_id, movement_type="adjustment", qty=ti.qty, user_id=user_id, reference=f"Transfer {t.id} updated (undoing old state)", created_at=get_local_time())
                mv_rev_to = StockMovement(shop_id=t.to_shop_id, item_id=ti.item_id, movement_type="adjustment", qty=-ti.qty, user_id=user_id, reference=f"Transfer {t.id} updated (undoing old state)", created_at=get_local_time())
                db.session.add_all([mv_rev_from, mv_rev_to])

            # Delete destination batches created by old state
            for db_batch in dest_batches:
                db.session.delete(db_batch)
            
            # Delete old TransferItems
            TransferItem.query.filter_by(transfer_id=t.id).delete()

            # 3. APPLY new transfer state (similar to transfer_stock)
            t.from_shop_id = from_shop_id
            t.to_shop_id = to_shop_id
            t.notes = notes
            t.created_by = user_id # Optionally update who last edited

            for it in items:
                item_id = it.get("item_id")
                qty_to_transfer = int(it.get("qty", 1))

                s_from = ShopStock.query.filter_by(shop_id=from_shop_id, item_id=item_id).first()
                if not s_from or s_from.quantity < qty_to_transfer:
                    raise ValueError(f"Insufficient stock at source shop for item {item_id}")

                s_from.quantity -= qty_to_transfer
                s_to = ShopStock.query.filter_by(shop_id=to_shop_id, item_id=item_id).first()
                if not s_to:
                    s_to = ShopStock(shop_id=to_shop_id, item_id=item_id, quantity=0, buy_price=s_from.buy_price)
                    db.session.add(s_to)
                
                s_to.quantity += qty_to_transfer

                # FIFO Logic
                remaining_to_pull = qty_to_transfer
                while remaining_to_pull > 0:
                    batch = StockBatch.query.filter_by(shop_id=from_shop_id, item_id=item_id) \
                        .filter(StockBatch.remaining_qty > 0) \
                        .order_by(StockBatch.created_at.asc()).first()
                    
                    if not batch:
                        new_batch = StockBatch(
                            shop_id=to_shop_id,
                            item_id=item_id,
                            initial_qty=remaining_to_pull,
                            remaining_qty=remaining_to_pull,
                            buy_price=s_from.buy_price or 0,
                            source_type="transfer",
                            source_id=t.id,
                            created_at=get_local_time()
                        )
                        db.session.add(new_batch)
                        remaining_to_pull = 0
                    else:
                        pull_qty = min(remaining_to_pull, batch.remaining_qty)
                        batch.remaining_qty -= pull_qty
                        
                        dest_batch = StockBatch(
                            shop_id=to_shop_id,
                            item_id=item_id,
                            initial_qty=pull_qty,
                            remaining_qty=pull_qty,
                            buy_price=batch.buy_price,
                            source_type="transfer",
                            source_id=t.id,
                            created_at=get_local_time()
                        )
                        db.session.add(dest_batch)
                        remaining_to_pull -= pull_qty

                mv_out = StockMovement(shop_id=from_shop_id, item_id=item_id, movement_type="transfer_out", qty=-qty_to_transfer, user_id=user_id, reference=f"Transfer {t.id} updated (new state)", created_at=get_local_time())
                mv_in = StockMovement(shop_id=to_shop_id, item_id=item_id, movement_type="transfer_in", qty=qty_to_transfer, user_id=user_id, reference=f"Transfer {t.id} updated (new state)", created_at=get_local_time())
                db.session.add_all([mv_out, mv_in])

                ti = TransferItem(transfer_id=t.id, item_id=item_id, qty=qty_to_transfer)
                db.session.add(ti)

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
                "item_id": ti.item_id,
                "item_name": item.name if item else "N/A",
                "qty": ti.qty
            })
            
        out.append({
            "id": t.id,
            "from_shop_id": t.from_shop_id,
            "from_shop_name": from_shop.name if from_shop else "N/A",
            "to_shop_id": t.to_shop_id,
            "to_shop_name": to_shop.name if to_shop else "N/A",
            "created_by": t.created_by,
            "created_by_name": user.name if user else "N/A",
            "status": t.status,
            "notes": t.notes,
            "created_at": t.created_at.isoformat(),
            "items": items
        })
    return out
rmat(),
            "items": items
        })
    return out
