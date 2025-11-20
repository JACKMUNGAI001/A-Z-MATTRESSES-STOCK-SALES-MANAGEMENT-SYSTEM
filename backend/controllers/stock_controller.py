from flask import request, jsonify
from services.stock_service import adjust_stock, check_low_stock
from models.stock import ShopStock

def get_shop_stock(shop_id):
    q = ShopStock.query.filter_by(shop_id=shop_id).all()
    out = [{"id":s.id,"item_id":s.item_id,"size_id":s.item_size_id,"qty":s.quantity,"buy_price":float(s.buy_price or 0),"sell_price":float(s.sell_price or 0)} for s in q]
    return jsonify(out), 200

def adjust_stock_controller(identity):
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    item_id = data.get("item_id")
    size_id = data.get("item_size_id")
    qty = int(data.get("qty",0))
    movement_type = data.get("movement_type","adjustment")
    user_id = identity.get("id")
    stock = adjust_stock(shop_id, item_id, size_id, qty, movement_type=movement_type, user_id=user_id, buy_price=data.get("buy_price"), sell_price=data.get("sell_price"))
    return jsonify({"msg":"adjusted","qty":stock.quantity}), 200

def low_stock_alerts_controller(threshold=2):
    low = check_low_stock(threshold)
    out = [{"shop_id":s.shop_id,"item_id":s.item_id,"size_id":s.item_size_id,"qty":s.quantity} for s in low]
    return jsonify(out), 200
