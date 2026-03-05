from extensions import db
from models.deposit import DepositSale, DepositPayment
from models.sale import Sale, SaleItem
from models.stock import ShopStock, StockMovement
from models.shop import Shop
from models.user import User
from models.product import Item
from services.receipt_service import create_receipt
from flask import current_app
from datetime import datetime, timedelta
from sqlalchemy import func

def _generate_deposit_receipt_html(payment, deposit, shop, attendant):
    current_app.logger.debug(f"[_generate_deposit_receipt_html] payment: {payment.id}, deposit: {deposit.id}")
    total_paid = sum([float(p.amount or 0) for p in deposit.payments])
    balance = float(deposit.selling_price or 0) - total_paid
    item = Item.query.get(deposit.item_id)
    item_name = item.name if item else "Unknown Item"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Receipt</title>
        <style>
            body {{ font-family: sans-serif; }}
            .receipt-container {{ width: 300px; margin: auto; border: 1px solid #ccc; padding: 10px; }}
            .header {{ text-align: center; }}
            .items-table {{ width: 100%; border-collapse: collapse; }}
            .items-table th, .items-table td {{ border: 1px solid #ccc; padding: 5px; }}
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <h2>{shop.name}</h2>
                <p>Deposit Receipt</p>
            </div>
            <p><strong>Customer:</strong> {deposit.buyer_name}</p>
            <p><strong>Item:</strong> {item_name}</p>
            <p><strong>Amount Paid:</strong> {payment.amount}</p>
            <p><strong>Payment Method:</strong> {'M-PESA' if payment.payment_method == 'mobile_money' else payment.payment_method}</p>
            <p><strong>Date:</strong> {payment.paid_on.strftime('%Y-%m-%d %H:%M:%S')}</p>
            <hr/>
            <p><strong>Total Paid to Date:</strong> {total_paid}</p>
            <p><strong>Balance:</strong> {balance}</p>
            <p><strong>Status:</strong> {deposit.status}</p>
        </div>
    </body>
    </html>
    """
    return html

def create_deposit(shop_id, item_id, buyer_name, buyer_phone, selling_price, created_by, amount):
    try:
        dep = DepositSale(shop_id=shop_id, item_id=item_id, buyer_name=buyer_name, 
                          buyer_phone=buyer_phone, selling_price=selling_price, created_by=created_by)
        db.session.add(dep)
        db.session.flush()

        # Create initial DepositPayment
        dp = DepositPayment(deposit_id=dep.id, amount=amount, payment_method="mobile_money", recorded_by=created_by, paid_on=datetime.utcnow())
        db.session.add(dp)
        db.session.flush()

        shop = Shop.query.get(shop_id)
        attendant = User.query.get(created_by)
        
        # Generate receipt for the initial payment
        receipt_html = _generate_deposit_receipt_html(dp, dep, shop, attendant)
        receipt = create_receipt(payload=receipt_html)
        dp.receipt_uuid = receipt.uuid
        
        # Check stock availability but DO NOT decrease quantity yet
        stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id).first()
        if not stock or stock.quantity < 1:
            raise ValueError("Insufficient stock to start a deposit")
            
        db.session.commit()
        return dep
    except Exception as e:
        db.session.rollback()
        raise e

def add_deposit_payment(deposit_id, amount, payment_method, recorded_by):
    if amount is None or str(amount).strip() == "":
        raise ValueError("Payment amount is required")
    try:
        amount_float = float(amount)
        if amount_float <= 0:
            raise ValueError("Payment amount must be greater than zero")
    except ValueError:
        raise ValueError("Invalid payment amount")

    try:
        dep = DepositSale.query.get_or_404(deposit_id)
        
        # Check balance before adding payment
        total_paid_before = db.session.query(func.sum(DepositPayment.amount)).filter(DepositPayment.deposit_id == deposit_id).scalar() or 0
        balance_before = float(dep.selling_price) - float(total_paid_before)
        if float(amount) > (balance_before + 0.01):
            raise ValueError(f"Payment amount (KES {amount}) exceeds the remaining balance (KES {balance_before})")

        dp = DepositPayment(deposit_id=deposit_id, amount=amount, payment_method=payment_method, recorded_by=recorded_by, paid_on=datetime.utcnow())
        db.session.add(dp)
        db.session.flush()

        shop = Shop.query.get(dep.shop_id)
        attendant = User.query.get(recorded_by)
        
        total_paid = db.session.query(func.sum(DepositPayment.amount)).filter(DepositPayment.deposit_id == deposit_id).scalar() or 0
        
        # Generate deposit receipt HTML content
        receipt_html = _generate_deposit_receipt_html(dp, dep, shop, attendant)
        receipt = create_receipt(payload=receipt_html)
        dp.receipt_uuid = receipt.uuid

        if float(total_paid) >= (float(dep.selling_price) - 0.01):
            dep.status = "complete"
            stock = ShopStock.query.filter_by(shop_id=dep.shop_id, item_id=dep.item_id).first()
            if not stock: raise ValueError("Stock record not found.")
            
            sale = Sale(shop_id=dep.shop_id, user_id=recorded_by, total_amount=dep.selling_price, payment_type=payment_method)
            db.session.add(sale)
            db.session.flush()
            
            si = SaleItem(sale_id=sale.id, item_id=dep.item_id, qty=1, unit_price=dep.selling_price, unit_cost=stock.buy_price)
            db.session.add(si)
            
            if stock.quantity < 1: raise ValueError("Insufficient stock to complete the sale")
            stock.quantity -= 1
            mv = StockMovement(shop_id=dep.shop_id, item_id=dep.item_id, movement_type="sale", qty=-1, user_id=recorded_by, created_at=datetime.utcnow())
            db.session.add(mv)

        db.session.commit()
        return dp
    except Exception as e:
        db.session.rollback()
        raise e

def get_todays_deposit_payments(shop_id=None):
    now = datetime.utcnow()
    start = datetime.combine(now.date(), datetime.min.time())
    query = DepositPayment.query.filter(DepositPayment.paid_on >= start)
    if shop_id:
        query = query.join(DepositSale).filter(DepositSale.shop_id == shop_id)
    return [_serialize_payment(p) for p in query.all()]

def get_weeks_deposit_payments(shop_id=None):
    now = datetime.utcnow()
    start = datetime.combine(now.date() - timedelta(days=now.weekday()), datetime.min.time())
    query = DepositPayment.query.filter(DepositPayment.paid_on >= start)
    if shop_id:
        query = query.join(DepositSale).filter(DepositSale.shop_id == shop_id)
    return [_serialize_payment(p) for p in query.all()]

def get_months_deposit_payments(shop_id=None):
    now = datetime.utcnow()
    start = datetime(now.year, now.month, 1)
    query = DepositPayment.query.filter(DepositPayment.paid_on >= start)
    if shop_id:
        query = query.join(DepositSale).filter(DepositSale.shop_id == shop_id)
    return [_serialize_payment(p) for p in query.all()]

def get_years_deposit_payments(shop_id=None):
    now = datetime.utcnow()
    start = datetime(now.year, 1, 1)
    query = DepositPayment.query.filter(DepositPayment.paid_on >= start)
    if shop_id:
        query = query.join(DepositSale).filter(DepositSale.shop_id == shop_id)
    return [_serialize_payment(p) for p in query.all()]

def _serialize_payment(p):
    dep = DepositSale.query.get(p.deposit_id)
    shop = Shop.query.get(dep.shop_id) if dep else None
    item = Item.query.get(dep.item_id) if dep else None
    return {
        "id": p.id,
        "deposit_id": p.deposit_id,
        "buyer_name": dep.buyer_name if dep else "N/A",
        "item_name": item.name if item else "N/A",
        "shop_name": shop.name if shop else "N/A",
        "amount": float(p.amount),
        "payment_method": p.payment_method,
        "paid_on": p.paid_on.isoformat(),
        "receipt_uuid": p.receipt_uuid
    }

def _serialize_deposit(deposit):
    shop = Shop.query.get(deposit.shop_id)
    attendant = User.query.get(deposit.created_by)
    item = Item.query.get(deposit.item_id)
    total_paid = sum([float(p.amount or 0) for p in deposit.payments])
    selling_price = float(deposit.selling_price or 0)
    balance = selling_price - total_paid
    return {
        "id": deposit.id,
        "uuid": deposit.uuid,
        "shop_id": deposit.shop_id,
        "item_id": deposit.item_id,
        "shop_name": shop.name if shop else "N/A",
        "item_name": item.name if item else "N/A",
        "buyer_name": deposit.buyer_name,
        "buyer_phone": deposit.buyer_phone,
        "selling_price": selling_price,
        "total_paid": total_paid,
        "balance": balance,
        "status": deposit.status,
        "created_at": deposit.created_at.isoformat(),
        "attendant_name": attendant.name if attendant else "N/A",
        "payments": [{"id": p.id, "amount": float(p.amount or 0), "payment_method": p.payment_method, 
                      "paid_on": p.paid_on.isoformat() if p.paid_on else None, "receipt_uuid": p.receipt_uuid} for p in deposit.payments]
    }

def get_all_deposits():
    deposits = DepositSale.query.order_by(DepositSale.created_at.desc()).all()
    return [_serialize_deposit(dep) for dep in deposits]

def get_deposits_by_shop_id(shop_id):
    deposits = DepositSale.query.filter_by(shop_id=shop_id).order_by(DepositSale.created_at.desc()).all()
    return [_serialize_deposit(dep) for dep in deposits]

def get_deposit_customers_count(shop_id=None):
    query = DepositSale.query.filter(DepositSale.status == 'active')
    if shop_id:
        query = query.filter(DepositSale.shop_id == shop_id)
    return {"count": query.count()}

def get_deposit_customers(shop_id=None):
    query = DepositSale.query.filter(DepositSale.status == 'active')
    if shop_id:
        query = query.filter(DepositSale.shop_id == shop_id)
    deposits = query.all()
    return [_serialize_deposit(dep) for dep in deposits]

def delete_deposit(deposit_id):
    dep = DepositSale.query.get(deposit_id)
    if not dep:
        raise ValueError("Deposit record not found")
    
    # Delete associated payments first
    DepositPayment.query.filter_by(deposit_id=deposit_id).delete()
    db.session.delete(dep)
    db.session.commit()
    return True
