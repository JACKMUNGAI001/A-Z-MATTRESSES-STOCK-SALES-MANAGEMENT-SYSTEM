from extensions import db
from models.product import Item

def create_item(name, category_id, sku=None, brand=None, buy_price=None, description=None):
    it = Item(name=name, category_id=category_id, sku=sku, brand=brand, buy_price=buy_price, description=description)
    db.session.add(it)
    db.session.commit()
    return it

def list_items():
    return Item.query.all()
