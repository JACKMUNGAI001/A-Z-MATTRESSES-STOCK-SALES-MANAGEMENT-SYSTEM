from extensions import db
from models.deposit import DepositSale, DepositPayment
from models.sale import Sale, SaleItem
from models.stock import ShopStock, StockMovement
from flask import current_app
from datetime import datetime

def create_deposit(shop_id, item_id, item_size_id, buyer_name, buyer_phone, selling_price, created_by):
    dep = DepositSale(shop_id=shop_id, item_id=item_id, item_size_id=item_size_id, buyer_name=buyer_name, buyer_phone=buyer_phone, selling_price=selling_price, created_by=created_by)
    db.session.add(dep)
    db.session.commit()
    if current_app.config.get("RESERVE_ON_DEPOSIT", True):
        stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id, item_size_id=item_size_id).first()
        if not stock or stock.quantity < 1:
            raise ValueError("Insufficient stock to reserve")
        stock.quantity -= 1
        db.session.commit()
        mv = StockMovement(shop_id=shop_id, item_id=item_id, item_size_id=item_size_id, movement_type="reserve", qty=-1, user_id=created_by, created_at=datetime.utcnow())
        db.session.add(mv)
        db.session.commit()
    return dep

def add_deposit_payment(deposit_id, amount, payment_method, recorded_by):
    dep = DepositSale.query.get_or_404(deposit_id)
    dp = DepositPayment(deposit_id=deposit_id, amount=amount, payment_method=payment_method, recorded_by=recorded_by, paid_on=datetime.utcnow())
    db.session.add(dp)
    db.session.commit()
    total_paid = sum([float(p.amount) for p in dep.payments])
    if total_paid >= float(dep.selling_price):
        dep.status = "complete"
        db.session.commit()
        sale = Sale(shop_id=dep.shop_id, user_id=recorded_by, total_amount=dep.selling_price, payment_type=payment_method)
        db.session.add(sale)
        db.session.commit()
        si = SaleItem(sale_id=sale.id, item_id=dep.item_id, item_size_id=dep.item_size_id, qty=1, unit_price=dep.selling_price, unit_cost=0)
        db.session.add(si)
        db.session.commit()
    return dp
