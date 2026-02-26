from extensions import db
from models.stock import ShopStock, StockMovement
from models.product import Item
from models.shop import Shop
from datetime import datetime

def adjust_stock(shop_id, item_id, qty, movement_type="adjustment", user_id=None, buy_price=None, sell_price=None):
    stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id).first()
    if not stock:
        stock = ShopStock(shop_id=shop_id, item_id=item_id, quantity=0, buy_price=buy_price, sell_price=sell_price)
        db.session.add(stock)
    stock.quantity += qty
    stock.updated_at = datetime.utcnow()
    db.session.commit()

    mv = StockMovement(shop_id=shop_id, item_id=item_id, movement_type=movement_type, qty=qty, unit_buy_price=buy_price, unit_sell_price=sell_price, user_id=user_id, reference=None, created_at=datetime.utcnow())
    db.session.add(mv)
    db.session.commit()
    return stock

def check_low_stock(threshold=2, shop_id=None):
    query = ShopStock.query.filter(ShopStock.quantity <= threshold)
    if shop_id:
        query = query.filter(ShopStock.shop_id == shop_id)
    return query.all()

def get_low_stock_count(threshold=2, shop_id=None):
    query = ShopStock.query.filter(ShopStock.quantity <= threshold)
    if shop_id:
        query = query.filter(ShopStock.shop_id == shop_id)
    return {"count": query.count()}

def get_low_stock_items(threshold=2, shop_id=None):
    query = ShopStock.query.filter(ShopStock.quantity <= threshold)
    if shop_id:
        query = query.filter(ShopStock.shop_id == shop_id)
    low_stock = query.all()
    out = []
    for s in low_stock:
        item = Item.query.get(s.item_id)
        shop = Shop.query.get(s.shop_id)
        out.append({
            "id":s.id,
            "item_id":s.item_id,
            "item_name": item.name if item else "N/A",
            "shop_id":s.shop_id,
            "shop_name": shop.name if shop else "N/A",
            "qty":s.quantity,
            "sell_price":float(s.sell_price or 0),
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
