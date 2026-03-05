from flask import request, jsonify
from services.product_service import create_item, list_items
from models.product import Category, Item
from extensions import db

def list_items_controller():
    items = list_items()
    out = []
    for it in items:
        out.append({
            "id":it.id,
            "sku": it.sku,
            "name":it.name,
            "brand":it.brand,
            "category_id":it.category_id,
            "buy_price": float(it.buy_price or 0),
            "description": it.description,
        })
    return jsonify(out), 200

def create_item_controller():
    data = request.get_json() or {}
    name = data.get("name")
    category_id = data.get("category_id")
    if not all([name, category_id]):
        return jsonify({"msg":"name and category_id required"}), 400
    it = create_item(name, category_id, sku=data.get("sku"), brand=data.get("brand"), buy_price=data.get("buy_price"), description=data.get("description"))
    return jsonify({"id":it.id,"name":it.name}), 201

def list_categories_controller():
    categories = Category.query.all()
    out = [{"id":c.id,"name":c.name} for c in categories]
    return jsonify(out), 200

def update_item_controller(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"msg": "Item not found"}), 404
    data = request.get_json() or {}
    item.sku = data.get("sku", item.sku)
    item.name = data.get("name", item.name)
    item.category_id = data.get("category_id", item.category_id)
    item.brand = data.get("brand", item.brand)
    item.buy_price = data.get("buy_price", item.buy_price)
    item.description = data.get("description", item.description)
    db.session.commit()
    return jsonify({"msg": "Item updated", "id": item.id}), 200

def delete_item_controller(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"msg": "Item not found"}), 404
    
    # Cleanup related records to prevent "N/A" orphans
    from models.stock import ShopStock
    from models.deposit import DepositSale, DepositPayment
    
    # Handle shop stock
    ShopStock.query.filter_by(item_id=item_id).delete()
    
    # Handle deposits: Delete payments first then the sales
    deposits = DepositSale.query.filter_by(item_id=item_id).all()
    for d in deposits:
        DepositPayment.query.filter_by(deposit_id=d.id).delete()
        db.session.delete(d)

    db.session.delete(item)
    db.session.commit()
    return jsonify({"msg": "Item and associated records deleted"}), 200
