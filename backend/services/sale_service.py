from extensions import db
from models.sale import Sale, SaleItem
from models.stock import ShopStock, StockMovement
from models.shop import Shop
from models.user import User
from models.product import Item
from services.receipt_service import create_receipt
from datetime import datetime

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

def create_sale(shop_id, user_id, items, payment_type="cash"):
    try:
        if not items:
            raise ValueError("Cannot create a sale with no items.")

        with db.session.begin_nested():
            total = 0
            sale = Sale(shop_id=shop_id, user_id=user_id, total_amount=0, payment_type=payment_type)
            db.session.add(sale)
            db.session.flush() # Ensure sale.id is available

            sale_items = []
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

            sale.total_amount = total
            db.session.add_all(sale_items)

            shop = Shop.query.get(shop_id)
            if not shop:
                raise ValueError("Shop not found")
            attendant = User.query.get(user_id)
            if not attendant:
                raise ValueError("Attendant not found")

            receipt_html = _generate_sale_receipt_html(sale, shop, attendant, sale_items)
            receipt = create_receipt(payload=receipt_html)
            sale.receipt_uuid = receipt.uuid

        db.session.commit()
        return sale
    except Exception as e:
        db.session.rollback()
        raise e
