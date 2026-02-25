from extensions import db
from models.deposit import DepositSale, DepositPayment
from models.sale import Sale, SaleItem
from models.stock import ShopStock, StockMovement
from models.shop import Shop
from models.user import User
from models.product import Item
from services.receipt_service import create_receipt
from flask import current_app
from datetime import datetime
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
        <title>Deposit Receipt</title>
        <style>
            body {{ font-family: sans-serif; }}
            .receipt-container {{ width: 300px; margin: auto; border: 1px solid #ccc; padding: 10px; }}
            .header {{ text-align: center; }}
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <h2>{shop.name if shop else 'A-Z Mattresses'}</h2>
                <p>Deposit Payment Receipt</p>
            </div>
            <p><strong>Attendant:</strong> {attendant.name if attendant else 'N/A'}</p>
            <p><strong>Date:</strong> {payment.paid_on.strftime('%Y-%m-%d %H:%M:%S') if payment.paid_on else 'N/A'}</p>
            <p><strong>Item:</strong> {item_name}</p>
            <p><strong>Amount Paid:</strong> {float(payment.amount or 0)}</p>
            <p><strong>Total Paid:</strong> {total_paid}</p>
            <p><strong>Balance:</strong> {balance}</p>
            <p><strong>Payment Type:</strong> {payment.payment_method}</p>
        </div>
    </body>
    </html>
    """
    return html

def _generate_sale_receipt_html(sale, shop, attendant, items):
    item_rows = []
    for i in items:
        it = Item.query.get(i.item_id)
        name = it.name if it else "Unknown Item"
        item_rows.append(f'<div class="item-row"><span>{name} x {i.qty}</span><span>{float(i.unit_price or 0) * i.qty}</span></div>')

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Sale Receipt</title>
        <style>
            body {{ font-family: sans-serif; font-size: 14px; }}
            .receipt-container {{ width: 300px; margin: auto; border: 1px solid #ccc; padding: 10px; }}
            .header {{ text-align: center; margin-bottom: 10px; }}
            .item-row {{ display: flex; justify-content: space-between; margin-bottom: 5px; }}
            .total {{ border-top: 1px solid #eee; padding-top: 5px; margin-top: 10px; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <h2>{shop.name if shop else 'A-Z Mattresses'}</h2>
                <p>Official Sale Receipt</p>
                <p>{shop.address if shop else ''}</p>
            </div>
            <p><strong>Date:</strong> {sale.created_at.strftime('%Y-%m-%d %H:%M:%S') if sale.created_at else 'N/A'}</p>
            <p><strong>Attendant:</strong> {attendant.name if attendant else 'N/A'}</p>
            <div class="items">
                {"".join(item_rows)}
            </div>
            <div class="total">
                <div class="item-row"><span>TOTAL</span><span>{float(sale.total_amount or 0)}</span></div>
            </div>
            <p>Payment: {sale.payment_type}</p>
        </div>
    </body>
    </html>
    """
    return html

def create_deposit(shop_id, item_id, buyer_name, buyer_phone, selling_price, created_by, amount):
    if not shop_id:
        raise ValueError("Shop ID is required")
    if not item_id:
        raise ValueError("Item ID is required")
    if not buyer_name:
        raise ValueError("Buyer name is required")
    if not selling_price or float(selling_price) <= 0:
        raise ValueError("Selling price must be greater than zero")
    if not amount or float(amount) <= 0:
        raise ValueError("Initial deposit amount must be greater than zero")
    
    try:
        dep = DepositSale(shop_id=shop_id, item_id=item_id, buyer_name=buyer_name, buyer_phone=buyer_phone, selling_price=selling_price, created_by=created_by)
        db.session.add(dep)
        db.session.flush() # Flush to get the deposit ID before creating payment

        # Create initial DepositPayment
        dp = DepositPayment(deposit_id=dep.id, amount=amount, payment_method="cash", recorded_by=created_by, paid_on=datetime.utcnow())
        db.session.add(dp)
        
        if current_app.config.get("RESERVE_ON_DEPOSIT", True):
            stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id).first()
            if not stock or stock.quantity < 1:
                raise ValueError("Insufficient stock to reserve")
            stock.quantity -= 1
            mv = StockMovement(shop_id=shop_id, item_id=item_id, movement_type="reserve", qty=-1, user_id=created_by, created_at=datetime.utcnow())
            db.session.add(mv)
            
        db.session.commit()
        return dep
    except Exception as e:
        db.session.rollback()
        raise e

def add_deposit_payment(deposit_id, amount, payment_method, recorded_by):
    print(f"DEBUG: add_deposit_payment received: deposit_id={deposit_id}, amount={amount}, type={type(amount)}")
    if amount is None or str(amount).strip() == "":
        raise ValueError("Payment amount is required")
    try:
        amount_float = float(amount)
        if amount_float <= 0:
            raise ValueError("Payment amount must be greater than zero")
    except ValueError:
        raise ValueError("Invalid payment amount")

    current_app.logger.debug(f"[add_deposit_payment] Starting for deposit_id: {deposit_id}, amount: {amount}")
    try:
        current_app.logger.debug(f"[add_deposit_payment] Inside transaction block.")
        dep = DepositSale.query.get_or_404(deposit_id)
        current_app.logger.debug(f"[add_deposit_payment] Fetched deposit sale: {dep.id}")

        dp = DepositPayment(deposit_id=deposit_id, amount=amount, payment_method=payment_method, recorded_by=recorded_by, paid_on=datetime.utcnow())
        db.session.add(dp)
        db.session.flush() # Ensure dp has an ID for receipt generation
        current_app.logger.debug(f"[add_deposit_payment] Added deposit payment: {dp.id}")

        shop = Shop.query.get(dep.shop_id)
        attendant = User.query.get(recorded_by)
        
        # Instead of refresh, just append the payment for sum calculation if relationship is loaded
        # or calculate total paid by querying payments
        db.session.flush() 
        total_paid = db.session.query(func.sum(DepositPayment.amount)).filter(DepositPayment.deposit_id == deposit_id).scalar() or 0
        current_app.logger.debug(f"[add_deposit_payment] Total paid calculated from DB: {total_paid}")
        print(f"DEBUG: add_deposit_payment total_paid={total_paid}, selling_price={dep.selling_price}")
        
        # Generate deposit receipt HTML content
        deposit_receipt_html_content = _generate_deposit_receipt_html(dp, dep, shop, attendant)
        current_app.logger.debug(f"[add_deposit_payment] Generated deposit receipt HTML.")
        
        sale_receipt_html_content = None # Initialize to None

        if float(total_paid) >= float(dep.selling_price):
            current_app.logger.debug(f"[add_deposit_payment] Total paid ({total_paid}) >= selling price ({dep.selling_price}). Marking as complete.")
            dep.status = "complete"
            
            stock = ShopStock.query.filter_by(shop_id=dep.shop_id, item_id=dep.item_id).first()
            if not stock:
                raise ValueError("Stock record not found for this item.")
            current_app.logger.debug(f"[add_deposit_payment] Fetched stock: {stock.id}, quantity: {stock.quantity}")

            sale = Sale(shop_id=dep.shop_id, user_id=recorded_by, total_amount=dep.selling_price, payment_type=payment_method)
            db.session.add(sale)
            db.session.flush() # Ensure sale has an ID for SaleItem
            current_app.logger.debug(f"[add_deposit_payment] Created final sale: {sale.id}")
            
            si = SaleItem(sale_id=sale.id, item_id=dep.item_id, qty=1, unit_price=dep.selling_price, unit_cost=stock.buy_price)
            db.session.add(si)
            current_app.logger.debug(f"[add_deposit_payment] Added sale item: {si.id}")

            if not current_app.config.get("RESERVE_ON_DEPOSIT", True):
                stock.quantity -= 1
                mv = StockMovement(shop_id=dep.shop_id, item_id=dep.item_id, movement_type="sale", qty=-1, user_id=recorded_by, created_at=datetime.utcnow())
                db.session.add(mv)
                current_app.logger.debug(f"[add_deposit_payment] Updated stock and added stock movement.")

            # Notify admin
            from models.notification import Notification
            admins = User.query.filter_by(role='admin').all()
            item = Item.query.get(dep.item_id)
            item_name = item.name if item else "Unknown Item"
            for admin in admins:
                notification = Notification(
                    user_id=admin.id,
                    user_role='admin',
                    type='deposit_completed',
                    message=f'Deposit for {item_name} by {dep.buyer_name} has been completed.'
                )
                db.session.add(notification)
            current_app.logger.debug(f"[add_deposit_payment] Added admin notifications.")
            
            # Generate sale receipt HTML for the final sale
            sale_receipt_html_content = _generate_sale_receipt_html(sale, shop, attendant, [si])
            current_app.logger.debug(f"[add_deposit_payment] Generated final sale receipt HTML.")

        # Create receipts and assign UUIDs
        deposit_receipt = create_receipt(payload=deposit_receipt_html_content)
        dp.receipt_uuid = deposit_receipt.uuid
        current_app.logger.debug(f"[add_deposit_payment] Created deposit receipt with UUID: {dp.receipt_uuid}")

        if sale_receipt_html_content:
            final_sale_receipt = create_receipt(payload=sale_receipt_html_content)
            sale.receipt_uuid = final_sale_receipt.uuid
            current_app.logger.debug(f"[add_deposit_payment] Created final sale receipt with UUID: {sale.receipt_uuid}")

        db.session.commit()
        current_app.logger.debug(f"[add_deposit_payment] Final transaction committed. Returning dp: {dp.id}")
        return dp
    except Exception as e:
        current_app.logger.error(f"[add_deposit_payment] An error occurred: {e}", exc_info=True)
        db.session.rollback() # Rollback on error
        raise e

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
        "payments": [
            {
                "id": p.id,
                "amount": float(p.amount or 0),
                "payment_method": p.payment_method,
                "paid_on": p.paid_on.isoformat() if p.paid_on else None,
                "receipt_uuid": p.receipt_uuid
            } for p in deposit.payments
        ]
    }

def get_all_deposits():
    deposits = DepositSale.query.order_by(DepositSale.created_at.desc()).all()
    return [_serialize_deposit(dep) for dep in deposits]

def get_deposits_by_shop_id(shop_id):
    deposits = DepositSale.query.filter_by(shop_id=shop_id).order_by(DepositSale.created_at.desc()).all()
    return [_serialize_deposit(dep) for dep in deposits]

def get_deposit_customers_count():
    return {"count": DepositSale.query.filter(DepositSale.status == 'active').count()}

def get_deposit_customers():
    deposits = DepositSale.query.filter(DepositSale.status == 'active').all()
    return [_serialize_deposit(dep) for dep in deposits]

