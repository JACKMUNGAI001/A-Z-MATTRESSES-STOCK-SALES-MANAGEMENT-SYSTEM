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

def _generate_deposit_receipt_html(payment, deposit, shop, attendant):
    total_paid = sum([float(p.amount) for p in deposit.payments])
    balance = float(deposit.selling_price) - total_paid
    item = Item.query.get(deposit.item_id)

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
                <h2>{shop.name}</h2>
                <p>Deposit Payment Receipt</p>
            </div>
            <p><strong>Attendant:</strong> {attendant.name}</p>
            <p><strong>Date:</strong> {payment.paid_on.strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>Item:</strong> {item.name}</p>
            <p><strong>Amount Paid:</strong> {payment.amount}</p>
            <p><strong>Total Paid:</strong> {total_paid}</p>
            <p><strong>Balance:</strong> {balance}</p>
            <p><strong>Payment Type:</strong> {payment.payment_method}</p>
        </div>
    </body>
    </html>
    """
    return html

def create_deposit(shop_id, item_id, buyer_name, buyer_phone, selling_price, created_by):
    try:
        with db.session.begin_nested():
            dep = DepositSale(shop_id=shop_id, item_id=item_id, buyer_name=buyer_name, buyer_phone=buyer_phone, selling_price=selling_price, created_by=created_by)
            db.session.add(dep)
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
    try:
        with db.session.begin_nested():
            dep = DepositSale.query.get_or_404(deposit_id)
            dp = DepositPayment(deposit_id=deposit_id, amount=amount, payment_method=payment_method, recorded_by=recorded_by, paid_on=datetime.utcnow())
            db.session.add(dp)

            shop = Shop.query.get(dep.shop_id)
            attendant = User.query.get(recorded_by)
            
            total_paid = sum([float(p.amount) for p in dep.payments]) + float(amount)
            
            receipt_html = _generate_deposit_receipt_html(dp, dep, shop, attendant)
            receipt = create_receipt(payload=receipt_html)
            dp.receipt_uuid = receipt.uuid

            if total_paid >= float(dep.selling_price):
                dep.status = "complete"
                
                stock = ShopStock.query.filter_by(shop_id=dep.shop_id, item_id=dep.item_id).first()
                if not stock:
                    raise ValueError("Stock record not found for this item.")

                sale = Sale(shop_id=dep.shop_id, user_id=recorded_by, total_amount=dep.selling_price, payment_type=payment_method)
                db.session.add(sale)
                
                si = SaleItem(sale_id=sale.id, item_id=dep.item_id, qty=1, unit_price=dep.selling_price, unit_cost=stock.buy_price)
                db.session.add(si)

                if not current_app.config.get("RESERVE_ON_DEPOSIT", True):
                    stock.quantity -= 1
                    mv = StockMovement(shop_id=dep.shop_id, item_id=dep.item_id, movement_type="sale", qty=-1, user_id=recorded_by, created_at=datetime.utcnow())
                    db.session.add(mv)

                # Notify admin
                admins = User.query.filter_by(role='admin').all()
                item = Item.query.get(dep.item_id)
                for admin in admins:
                    notification = Notification(
                        user_id=admin.id,
                        user_role='admin',
                        type='deposit_completed',
                        message=f'Deposit for {item.name} by {dep.buyer_name} has been completed.'
                    )
                    db.session.add(notification)
                
                # Generate receipt for the final sale
                sale_receipt_html = _generate_sale_receipt_html(sale, shop, attendant, [si])
                sale.receipt_uuid = create_receipt(payload=sale_receipt_html).uuid

        db.session.commit()
        return dp
    except Exception as e:
        db.session.rollback()
        raise e

def _generate_sale_receipt_html(sale, shop, attendant, sale_items):
    items_html = ""
    for si in sale_items:
        item = Item.query.get(si.item_id)
        items_html += f"<tr><td>{item.name}</td><td>{si.qty}</td><td>{si.unit_price}</td><td>{si.qty * si.unit_price}</td></tr>"

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
                <p>Receipt</p>
            </div>
            <p><strong>Attendant:</strong> {attendant.name}</p>
            <p><strong>Date:</strong> {sale.created_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
            </table>
            <p><strong>Total Amount:</strong> {sale.total_amount}</p>
            <p><strong>Payment Type:</strong> {sale.payment_type}</p>
        </div>
    </body>
    </html>
    """
    return html

def get_deposit_customers_count():
    return {"count": DepositSale.query.filter(DepositSale.status == 'active').count()}

def get_deposit_customers():
    deposits = DepositSale.query.filter(DepositSale.status == 'active').all()
    out = []
    for dep in deposits:
        total_paid = sum([float(p.amount) for p in dep.payments])
        balance = float(dep.selling_price) - total_paid
        item = Item.query.get(dep.item_id)
        out.append({
            "id": dep.id,
            "uuid": dep.uuid,
            "shop_id": dep.shop_id,
            "item_name": item.name,
            "buyer_name": dep.buyer_name,
            "buyer_phone": dep.buyer_phone,
            "selling_price": float(dep.selling_price),
            "total_paid": total_paid,
            "balance": balance,
            "status": dep.status,
            "created_at": dep.created_at.isoformat(),
        })
    return out

