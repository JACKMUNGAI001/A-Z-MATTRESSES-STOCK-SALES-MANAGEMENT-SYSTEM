from flask import request, jsonify
from services.sale_service import create_sale
from models.sale import Sale, SaleItem
from extensions import db
from flask_jwt_extended import get_jwt_identity

def create_sale_controller():
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    items = data.get("items", [])
    payment_type = data.get("payment_type", "cash")
    user = get_jwt_identity()
    try:
        sale = create_sale(shop_id=shop_id, user_id=user.get("id"), items=items, payment_type=payment_type)
        return jsonify({"msg":"sale recorded","sale_id":sale.id, "receipt_uuid": sale.receipt_uuid}), 201
    except ValueError as e:
        return jsonify({"msg":str(e)}), 400

def get_shop_sales_controller(shop_id):
    sales = Sale.query.filter_by(shop_id=shop_id).all()
    out = []
    for sale in sales:
        items_summary = []
        for item in sale.items:
            items_summary.append({
                "item_id": item.item_id,
                "qty": item.qty,
                "unit_price": float(item.unit_price),
                "unit_cost": float(item.unit_cost)
            })
        out.append({
            "id": sale.id,
            "shop_id": sale.shop_id,
            "user_id": sale.user_id,
            "total_amount": float(sale.total_amount),
            "payment_type": sale.payment_type,
            "created_at": sale.created_at.isoformat(),
            "items": items_summary
        })
    return jsonify(out), 200
