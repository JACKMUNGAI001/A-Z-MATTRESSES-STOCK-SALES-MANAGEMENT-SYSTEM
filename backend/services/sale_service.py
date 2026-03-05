from extensions import db
from models.sale import Sale, SaleItem
from models.stock import ShopStock, StockMovement
from models.shop import Shop
from models.user import User
from models.product import Item
from services.receipt_service import create_receipt
from datetime import datetime
from models.notification import Notification
from sqlalchemy import func
from datetime import datetime, timedelta

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
            <p><strong>Payment Type:</strong> {'M-PESA' if sale.payment_type == 'mobile_money' else sale.payment_type}</p>
        </div>
    </body>
    </html>
    """
    return html

def create_sale(shop_id, user_id, items, payment_type="mobile_money"):
    try:
        if not items:
            raise ValueError("Cannot create a sale with no items.")

        sale_items = []
        sale = None
        
        with db.session.begin_nested():
            total = 0
            sale = Sale(shop_id=shop_id, user_id=user_id, total_amount=0, payment_type=payment_type)
            db.session.add(sale)
            db.session.flush() # Ensure sale.id is available

            for it in items:
                item_id = it.get("item_id")
                qty = int(it.get("qty", 1))
                unit_price = it.get("unit_price")

                if unit_price is None:
                    raise ValueError(f"Unit price not provided for item {item_id}")
                unit_price = float(unit_price)

                stock = ShopStock.query.filter_by(shop_id=shop_id, item_id=item_id).first()
                if not stock or stock.quantity < qty:
                    raise ValueError(f"Insufficient stock for item {item_id}")
                
                stock.quantity -= qty
                
                si = SaleItem(sale_id=sale.id, item_id=item_id, qty=qty, unit_price=unit_price, unit_cost=stock.buy_price)
                sale_items.append(si)
                
                mv = StockMovement(shop_id=shop_id, item_id=item_id, movement_type="sale", qty=-qty, user_id=user_id, created_at=datetime.utcnow())
                db.session.add(mv)
                
                total += unit_price * qty

                # Check for low stock notification
                if stock.quantity <= 2:
                    product = Item.query.get(item_id)
                    shop_obj = Shop.query.get(shop_id)
                    # Notify current attendant
                    n_attendant = Notification(
                        user_id=user_id,
                        user_role='attendant',
                        type='low_stock',
                        message=f'Low Stock Alert: {product.name} is down to {stock.quantity} in {shop_obj.name}.'
                    )
                    # Notify all admins
                    admins = User.query.filter_by(role='admin').all()
                    for admin in admins:
                        n_admin = Notification(
                            user_id=admin.id,
                            user_role='admin',
                            type='low_stock',
                            message=f'Low Stock Alert: {product.name} is down to {stock.quantity} in {shop_obj.name}.'
                        )
                        db.session.add(n_admin)
                    db.session.add(n_attendant)

            sale.total_amount = total
            db.session.add_all(sale_items)

        # After nested transaction, generate receipt and link it
        shop = Shop.query.get(shop_id)
        attendant = User.query.get(user_id)
        
        receipt_html = _generate_sale_receipt_html(sale, shop, attendant, sale_items)
        receipt = create_receipt(payload=receipt_html)
        sale.receipt_uuid = receipt.uuid

        db.session.commit()
        return sale
    except Exception as e:
        db.session.rollback()
        raise e

def _serialize_sale(sale):
    shop = Shop.query.get(sale.shop_id)
    attendant = User.query.get(sale.user_id)
    items_summary = []
    for item in sale.items:
        product = Item.query.get(item.item_id)
        items_summary.append({
            "item_id": item.item_id,
            "item_name": product.name if product else "N/A",
            "qty": item.qty,
            "unit_price": float(item.unit_price) if item.unit_price is not None else 0.0,
            "unit_cost": float(item.unit_cost) if item.unit_cost is not None else 0.0
        })
    return {
        "id": sale.id,
        "shop_id": sale.shop_id,
        "shop_name": shop.name if shop else "N/A",
        "user_id": sale.user_id,
        "attendant_name": attendant.name if attendant else "N/A",
        "total_amount": float(sale.total_amount) if sale.total_amount is not None else 0.0,
        "payment_type": sale.payment_type,
        "created_at": sale.created_at.isoformat(),
        "receipt_uuid": sale.receipt_uuid,
        "items": items_summary
    }

def get_all_sales():
    sales = Sale.query.order_by(Sale.created_at.desc()).all()
    return [_serialize_sale(sale) for sale in sales]

def get_sales_by_shop(shop_id):
    sales = Sale.query.filter_by(shop_id=shop_id).order_by(Sale.created_at.desc()).all()
    return [_serialize_sale(sale) for sale in sales]

def get_todays_sales(shop_id=None):
    today = datetime.utcnow().date()
    start_of_day = datetime(today.year, today.month, today.day)
    end_of_day = start_of_day + timedelta(days=1, microseconds=-1)
    
    query = Sale.query.filter(Sale.created_at.between(start_of_day, end_of_day))
    if shop_id:
        query = query.filter(Sale.shop_id == shop_id)
        
    sales = query.all()
    return [_serialize_sale(sale) for sale in sales]

def get_current_weeks_sales(shop_id=None):
    now = datetime.utcnow()
    # Find the start of the current week (Monday)
    start_of_week = datetime.combine(now.date() - timedelta(days=now.weekday()), datetime.min.time())
    end_of_week = start_of_week + timedelta(days=7, microseconds=-1)

    query = Sale.query.filter(Sale.created_at.between(start_of_week, end_of_week))
    if shop_id:
        query = query.filter(Sale.shop_id == shop_id)
        
    sales = query.all()
    return [_serialize_sale(sale) for sale in sales]

def get_current_months_sales(shop_id=None):
    now = datetime.utcnow()
    start_of_month = datetime(now.year, now.month, 1)
    # Calculate end of month
    if now.month == 12:
        end_of_month = datetime(now.year + 1, 1, 1) - timedelta(microseconds=1)
    else:
        end_of_month = datetime(now.year, now.month + 1, 1) - timedelta(microseconds=1)

    query = Sale.query.filter(Sale.created_at.between(start_of_month, end_of_month))
    if shop_id:
        query = query.filter(Sale.shop_id == shop_id)
        
    sales = query.all()
    return [_serialize_sale(sale) for sale in sales]

def get_current_years_sales(shop_id=None):
    now = datetime.utcnow()
    start_of_year = datetime(now.year, 1, 1)
    end_of_year = datetime(now.year, 12, 31, 23, 59, 59, 999999)

    query = Sale.query.filter(Sale.created_at.between(start_of_year, end_of_year))
    if shop_id:
        query = query.filter(Sale.shop_id == shop_id)
        
    sales = query.all()
    return [_serialize_sale(sale) for sale in sales]

def delete_sale(sale_id, user_id):
    try:
        sale = Sale.query.get(sale_id)
        if not sale:
            raise ValueError("Sale not found")

        with db.session.begin_nested():
            # Revert stock levels
            for item in sale.items:
                stock = ShopStock.query.filter_by(shop_id=sale.shop_id, item_id=item.item_id).first()
                if stock:
                    stock.quantity += item.qty
                    stock.updated_at = datetime.utcnow()
                    
                    # Record adjustment movement
                    mv = StockMovement(
                        shop_id=sale.shop_id, 
                        item_id=item.item_id, 
                        movement_type="adjustment", 
                        qty=item.qty, 
                        user_id=user_id, 
                        reference=f"Sale {sale_id} deleted",
                        created_at=datetime.utcnow()
                    )
                    db.session.add(mv)

            # Delete sale items first
            SaleItem.query.filter_by(sale_id=sale_id).delete()
            # Delete the sale
            db.session.delete(sale)

        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        raise e
