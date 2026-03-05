from extensions import db
from models.stock import ShopStock, StockMovement
from models.product import Item
from models.shop import Shop
from models.notification import Notification
from models.user import User
from datetime import datetime
from sqlalchemy import func

def adjust_stock(shop_id, item_id, qty, movement_type="adjustment", user_id=None, buy_price=None, sell_price=None):
    # Try to find existing stock record
    stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id).first()
    if not stock:
        # Check if there are any duplicates (just in case) and merge them or pick one
        # For new records, we just create one
        stock = ShopStock(shop_id=shop_id, item_id=item_id, quantity=0, buy_price=buy_price)
        db.session.add(stock)
    
    stock.quantity += qty
    if buy_price is not None: stock.buy_price = buy_price
    stock.updated_at = datetime.utcnow()
    
    # Check for low stock notification (only if quantity decreased)
    if qty < 0 and stock.quantity <= 2:
        product = Item.query.get(item_id)
        shop_obj = Shop.query.get(shop_id)
        # Notify all admins
        admins = User.query.filter_by(role='admin').all()
        for admin in admins:
            n_admin = Notification(
                user_id=admin.id,
                user_role='admin',
                type='low_stock',
                message=f'Low Stock Alert: {product.name} is down to {stock.quantity} in {shop_obj.name}.'
            )
            db.session.add(n_admin)
        
        # Notify attendants in that shop
        attendants = User.query.filter_by(shop_id=shop_id, role='attendant').all()
        for attendant in attendants:
            n_att = Notification(
                user_id=attendant.id,
                user_role='attendant',
                type='low_stock',
                message=f'Low Stock Alert: {product.name} is down to {stock.quantity} in {shop_obj.name}.'
            )
            db.session.add(n_att)

    db.session.commit()

    mv = StockMovement(shop_id=shop_id, item_id=item_id, movement_type=movement_type, qty=qty, unit_buy_price=buy_price, unit_sell_price=sell_price, user_id=user_id, reference=None, created_at=datetime.utcnow())
    db.session.add(mv)
    db.session.commit()
    return stock

def check_low_stock(threshold=2, shop_id=None):
    # Group by to handle duplicates
    query = db.session.query(
        ShopStock.shop_id, 
        ShopStock.item_id, 
        func.sum(ShopStock.quantity).label('total_qty')
    ).join(Item).group_by(ShopStock.shop_id, ShopStock.item_id).having(func.sum(ShopStock.quantity) <= threshold)
    
    if shop_id:
        query = query.filter(ShopStock.shop_id == shop_id)
    
    results = query.all()
    # Mocking ShopStock objects for compatibility with existing code if needed, 
    # but let's see if we can just return what's needed.
    return results

def get_low_stock_count(threshold=2, shop_id=None):
    # Group by to count unique items that are low on total stock
    query = db.session.query(ShopStock.item_id).join(Item)
    if shop_id:
        query = query.filter(ShopStock.shop_id == shop_id)
    
    query = query.group_by(ShopStock.shop_id, ShopStock.item_id).having(func.sum(ShopStock.quantity) <= threshold)
    return {"count": query.count()}

def get_low_stock_items(threshold=2, shop_id=None):
    query = db.session.query(
        ShopStock.item_id,
        ShopStock.shop_id,
        func.sum(ShopStock.quantity).label('qty'),
        func.max(ShopStock.buy_price).label('buy_price')
    ).join(Item).group_by(ShopStock.shop_id, ShopStock.item_id).having(func.sum(ShopStock.quantity) <= threshold)
    
    if shop_id:
        query = query.filter(ShopStock.shop_id == shop_id)
    
    low_stock = query.all()
    out = []
    for s in low_stock:
        item = Item.query.get(s.item_id)
        shop = Shop.query.get(s.shop_id)
        out.append({
            "item_id":s.item_id,
            "item_name": item.name if item else "N/A",
            "shop_id":s.shop_id,
            "shop_name": shop.name if shop else "N/A",
            "qty":int(s.qty),
            "buy_price":float(s.buy_price or 0)
        })
    return out

def delete_stock(shop_id, item_id, user_id):
    stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id).first()
    if not stock:
        raise ValueError("Stock record not found.")
    
    deleted_qty = stock.quantity
    db.session.delete(stock)
    
    mv = StockMovement(shop_id=shop_id, item_id=item_id, movement_type="deletion", qty=-deleted_qty, user_id=user_id, created_at=datetime.utcnow())
    db.session.add(mv)
    db.session.commit()
    return True
