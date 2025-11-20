from extensions import db
from models.stock import ShopStock, StockMovement
from datetime import datetime

def adjust_stock(shop_id, item_id, item_size_id, qty, movement_type="adjustment", user_id=None, buy_price=None, sell_price=None):
    stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id, item_size_id=item_size_id).first()
    if not stock:
        stock = ShopStock(shop_id=shop_id, item_id=item_id, item_size_id=item_size_id, quantity=0, buy_price=buy_price, sell_price=sell_price)
        db.session.add(stock)
    stock.quantity += qty
    stock.updated_at = datetime.utcnow()
    db.session.commit()

    mv = StockMovement(shop_id=shop_id, item_id=item_id, item_size_id=item_size_id, movement_type=movement_type, qty=qty, unit_buy_price=buy_price, unit_sell_price=sell_price, user_id=user_id, reference=None, created_at=datetime.utcnow())
    db.session.add(mv)
    db.session.commit()
    return stock

def check_low_stock(threshold=2):
    return ShopStock.query.filter(ShopStock.quantity <= threshold).all()
