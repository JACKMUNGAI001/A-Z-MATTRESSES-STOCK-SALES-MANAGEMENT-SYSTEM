from flask import request, jsonify
from models.shop import Shop
from models.stock import ShopStock
from models.product import Item, Category
from extensions import db

def shop_deposits_enabled(shop_id):
    try:
        shop_id = int(shop_id)
    except (TypeError, ValueError):
        return False
    products = db.session.query(Item.name, Category.name).select_from(ShopStock).join(
        Item, ShopStock.item_id == Item.id
    ).outerjoin(Category, Item.category_id == Category.id).filter(
        ShopStock.shop_id == shop_id
    ).distinct().all()
    gas_products = [
        "gas" in f"{item_name or ''} {category_name or ''}".lower()
        or "kg" in f"{item_name or ''} {category_name or ''}".lower()
        for item_name, category_name in products
    ]
    return not (bool(gas_products) and all(gas_products))

def list_shops():
    shops = Shop.query.order_by(Shop.name.asc()).all()
    out = []
    for shop in shops:
        out.append({"id":shop.id,"name":shop.name,"address":shop.address,"deposits_enabled":shop_deposits_enabled(shop.id)})
    return jsonify(out), 200

def get_shop_controller(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({"msg": "Shop not found"}), 404
    return jsonify({"id":shop.id,"name":shop.name,"address":shop.address,"deposits_enabled":shop_deposits_enabled(shop.id)}), 200

def create_shop():
    data = request.get_json() or {}
    name = data.get("name")
    address = data.get("address")
    if not name:
        return jsonify({"msg":"name required"}), 400
    s = Shop(name=name, address=address)
    db.session.add(s)
    db.session.commit()
    return jsonify({"id":s.id,"name":s.name}), 201

def update_shop(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({"msg": "Shop not found"}), 404
    data = request.get_json() or {}
    shop.name = data.get("name", shop.name)
    shop.address = data.get("address", shop.address)
    db.session.commit()
    return jsonify({"msg": "Shop updated", "id": shop.id}), 200

def delete_shop(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({"msg": "Shop not found"}), 404
    db.session.delete(shop)
    db.session.commit()
    return jsonify({"msg": "Shop deleted"}), 200
