from extensions import db
from models.product import Item, ItemSize

def create_item(name, category_id, brand=None, default_buy_price=None, default_sell_price=None, sizes=None):
    it = Item(name=name, category_id=category_id, brand=brand, default_buy_price=default_buy_price, default_sell_price=default_sell_price)
    db.session.add(it)
    db.session.commit()
    if sizes:
        for s in sizes:
            item_size = ItemSize(item_id=it.id, label=s.get("label"), buy_price=s.get("buy_price"), sell_price=s.get("sell_price"))
            db.session.add(item_size)
        db.session.commit()
    return it

def list_items():
    return Item.query.all()
