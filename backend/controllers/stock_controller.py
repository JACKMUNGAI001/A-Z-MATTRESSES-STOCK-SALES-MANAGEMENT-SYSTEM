from flask import request, jsonify
from services.stock_service import adjust_stock, check_low_stock, get_low_stock_count, get_low_stock_items, delete_stock
from models.stock import ShopStock
from extensions import db
from flask_jwt_extended import get_jwt_identity

def get_shop_stock(shop_id):
    # Show all stock records for the shop, including those with quantity 0
    q = ShopStock.query.filter_by(shop_id=shop_id).all()
    out = []
    user_identity = get_jwt_identity()
    user_role = user_identity.get("role")

    for s in q:
        # Safety check: if the item itself was deleted from the system, skip this row
        from models.product import Item
        item = Item.query.get(s.item_id)
        if not item:
            continue

        stock_data = {
            "id":s.id,
            "item_id":s.item_id,
            "item_name": item.name,
            "qty":s.quantity,
            "sell_price":float(s.sell_price or 0)
        }
        if user_role != "attendant":
            stock_data["buy_price"] = float(s.buy_price or 0)
        out.append(stock_data)
    return jsonify(out), 200

def adjust_stock_controller(identity):
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    item_id = data.get("item_id")
    qty = int(data.get("qty",0))
    movement_type = data.get("movement_type","adjustment")
    user_id = identity.get("id")
    stock = adjust_stock(shop_id, item_id, qty, movement_type=movement_type, user_id=user_id, buy_price=data.get("buy_price"), sell_price=data.get("sell_price"))
    return jsonify({"msg":"adjusted","qty":stock.quantity}), 200

def low_stock_alerts_controller(threshold=2):
    user_identity = get_jwt_identity()
    user_role = user_identity.get("role")
    shop_id = user_identity.get("shop_id") if user_role == "attendant" else None
    
    low = check_low_stock(threshold, shop_id=shop_id)
    out = [{"shop_id":s.shop_id,"item_id":s.item_id,"qty":s.quantity} for s in low]
    return jsonify(out), 200

def low_stock_count_controller(threshold=2):
    user_identity = get_jwt_identity()
    user_role = user_identity.get("role")
    shop_id = user_identity.get("shop_id") if user_role == "attendant" else None
    
    count = get_low_stock_count(threshold, shop_id=shop_id)
    return jsonify(count), 200

def low_stock_items_controller(threshold=2):
    user_identity = get_jwt_identity()
    user_role = user_identity.get("role")
    shop_id = user_identity.get("shop_id") if user_role == "attendant" else None
    
    items = get_low_stock_items(threshold, shop_id=shop_id)
    return jsonify(items), 200

def delete_stock_controller(shop_id, item_id):
    user_identity = get_jwt_identity()
    user_id = user_identity.get("id")
    try:
        delete_stock(shop_id, item_id, user_id)
        return jsonify({"msg": "Stock record deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
