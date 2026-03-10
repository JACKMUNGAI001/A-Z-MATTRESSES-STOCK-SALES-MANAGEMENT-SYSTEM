from extensions import db
from models.supplier import Supplier, SupplierInvoice, SupplierInvoiceItem, SupplierInvoicePayment
from models.stock import ShopStock, StockMovement
from models.product import Item
from datetime import datetime

def create_supplier(name, contact_person=None, phone=None, email=None, address=None, item_ids=None):
    s = Supplier(name=name, contact_person=contact_person, phone=phone, email=email, address=address)
    if item_ids:
        items = Item.query.filter(Item.id.in_(item_ids)).all()
        s.supplied_products = items
    db.session.add(s)
    db.session.commit()
    return s

def list_suppliers():
    return Supplier.query.all()

def update_supplier(supplier_id, **kwargs):
    s = Supplier.query.get(supplier_id)
    if not s:
        return None
    
    item_ids = kwargs.pop('item_ids', None)
    if item_ids is not None:
        items = Item.query.filter(Item.id.in_(item_ids)).all()
        s.supplied_products = items

    for k, v in kwargs.items():
        if hasattr(s, k):
            setattr(s, k, v)
    db.session.commit()
    return s

def delete_supplier(supplier_id):
    s = Supplier.query.get(supplier_id)
    if not s:
        return False
    db.session.delete(s)
    db.session.commit()
    return True

def create_supplier_invoice(supplier_id, invoice_number, items_data, status="Pending", received_date=None, due_date=None, notes=None, user_id=None):
    total_amount = 0
    for it in items_data:
        total_amount += (float(it['unit_cost']) * int(it['quantity']))
    
    if received_date and isinstance(received_date, str) and received_date.strip():
        received_date = datetime.strptime(received_date, '%Y-%m-%d')
    else:
        received_date = datetime.utcnow()

    if due_date and isinstance(due_date, str) and due_date.strip():
        due_date = datetime.strptime(due_date, '%Y-%m-%d')
    else:
        due_date = None

    inv = SupplierInvoice(
        supplier_id=supplier_id,
        invoice_number=invoice_number,
        total_amount=total_amount,
        status=status,
        received_date=received_date,
        due_date=due_date,
        notes=notes
    )
    db.session.add(inv)
    db.session.flush()

    for item_data in items_data:
        item_id = item_data['item_id']
        qty = item_data['quantity']
        unit_cost = item_data['unit_cost']
        item_shop_id = item_data.get('shop_id')
        if not item_shop_id:
            raise ValueError(f"Shop ID is required for all items")
            
        total_cost = float(unit_cost) * int(qty)

        inv_item = SupplierInvoiceItem(
            invoice_id=inv.id,
            item_id=item_id,
            shop_id=item_shop_id,
            quantity=qty,
            unit_cost=unit_cost,
            total_cost=total_cost
        )
        db.session.add(inv_item)

        # Update Stock in the specific Shop
        stock = ShopStock.query.filter_by(shop_id=item_shop_id, item_id=item_id).first()
        if stock:
            stock.quantity += int(qty)
            stock.buy_price = unit_cost
        else:
            stock = ShopStock(shop_id=item_shop_id, item_id=item_id, quantity=qty, buy_price=unit_cost)
            db.session.add(stock)

        # Create Stock Movement record for specific shop
        movement = StockMovement(
            shop_id=item_shop_id,
            item_id=item_id,
            movement_type="purchase_in",
            qty=qty,
            unit_buy_price=unit_cost,
            user_id=user_id,
            reference=f"Supplier Invoice {invoice_number}"
        )
        db.session.add(movement)

    db.session.commit()
    return inv

def list_supplier_invoices():
    return SupplierInvoice.query.all()

def get_supplier_invoice(invoice_id):
    return SupplierInvoice.query.get(invoice_id)

def update_invoice_status(invoice_id, status):
    inv = SupplierInvoice.query.get(invoice_id)
    if not inv:
        return None
    inv.status = status
    if status == "Paid":
        inv.amount_paid = inv.total_amount
    db.session.commit()
    return inv

def record_invoice_payment(invoice_id, amount, payment_method="mobile_money", notes=None):
    inv = SupplierInvoice.query.get(invoice_id)
    if not inv:
        raise ValueError("Invoice not found")
    
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        raise ValueError("Invalid amount")

    if amount <= 0:
        raise ValueError("Payment amount must be greater than zero")
    
    remaining = float(inv.total_amount) - float(inv.amount_paid or 0)
    if amount > remaining + 0.01:
        raise ValueError(f"Payment amount (KES {amount}) exceeds remaining balance (KES {remaining})")
    
    payment = SupplierInvoicePayment(
        invoice_id=invoice_id,
        amount=amount,
        payment_method=payment_method,
        notes=notes
    )
    db.session.add(payment)
    
    inv.amount_paid = float(inv.amount_paid or 0) + amount
    if float(inv.amount_paid) >= float(inv.total_amount) - 0.01:
        inv.status = "Paid"
    else:
        inv.status = "Partial"
        
    db.session.commit()
    return payment

def get_supplier_products(supplier_id):
    s = Supplier.query.get(supplier_id)
    if not s:
        return []
    return s.supplied_products
