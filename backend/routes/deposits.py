from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models import DepositSale, DepositPayment, ShopStock, StockMovement, Sale, SaleItem
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

bp = Blueprint("deposits", __name__)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_deposit():
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    item_id = data.get("item_id")
    item_size_id = data.get("item_size_id")
    buyer_name = data.get("buyer_name")
    buyer_phone = data.get("buyer_phone")
    selling_price = data.get("selling_price")
    user = get_jwt_identity()

    dep = DepositSale(shop_id=shop_id, item_id=item_id, item_size_id=item_size_id, buyer_name=buyer_name,
                      buyer_phone=buyer_phone, selling_price=selling_price, created_by=user.get("id"))
    db.session.add(dep)
    db.session.commit()

    # reserve stock if configured
    if current_app.config.get("RESERVE_ON_DEPOSIT", True):
        stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id, item_size_id=item_size_id).first()
        if not stock or stock.quantity < 1:
            return jsonify({"msg":"insufficient stock to reserve"}), 400
        stock.quantity -= 1
        db.session.commit()
        mv = StockMovement(shop_id=shop_id, item_id=item_id, item_size_id=item_size_id, movement_type="reserve", qty=-1, user_id=user.get("id"))
        db.session.add(mv)
        db.session.commit()

    return jsonify({"msg":"deposit created","deposit_id":dep.id,"uuid":dep.uuid}), 201

@bp.route("/<int:deposit_id>/payments", methods=["POST"])
@jwt_required()
def add_deposit_payment(deposit_id):
    data = request.get_json() or {}
    amount = float(data.get("amount"))
    payment_method = data.get("payment_method","cash")
    user = get_jwt_identity()
    dep = DepositSale.query.get_or_404(deposit_id)
    dp = DepositPayment(deposit_id=deposit_id, amount=amount, payment_method=payment_method, recorded_by=user.get("id"))
    db.session.add(dp)
    db.session.commit()
    # compute total paid
    total_paid = sum([float(p.amount) for p in dep.payments])
    if total_paid >= float(dep.selling_price):
        # mark complete
        dep.status = "complete"
        db.session.commit()
        # if stock wasn't reserved upon creation, reduce stock now and create sale record
        # (simple approach: create Sale record to reflect completed sale)
        sale = Sale(shop_id=dep.shop_id, user_id=user.get("id"), total_amount=dep.selling_price, payment_type=payment_method)
        db.session.add(sale)
        db.session.commit()
        si = SaleItem(sale_id=sale.id, item_id=dep.item_id, item_size_id=dep.item_size_id, qty=1, unit_price=dep.selling_price, unit_cost=0)
        db.session.add(si)
        db.session.commit()
    return jsonify({"msg":"payment recorded","deposit_status":dep.status}), 201
