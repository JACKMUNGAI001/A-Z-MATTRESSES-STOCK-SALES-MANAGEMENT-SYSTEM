from extensions import db
from models.product import Item

def create_item(name, category_id, sku=None, brand=None, description=None):
    it = Item(name=name, category_id=category_id, sku=sku, brand=brand, description=description)
    db.session.add(it)
    db.session.commit()
    return it

def list_items():
    return Item.query.order_by(Item.name.asc()).all()
