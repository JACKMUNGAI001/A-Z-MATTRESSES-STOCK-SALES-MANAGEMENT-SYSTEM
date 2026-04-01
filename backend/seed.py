from datetime import datetime
from decimal import Decimal
from app import create_app
from extensions import db
from models.user import User
from models.shop import Shop
from models.product import Category, Item
from models.sale import Sale, SaleItem
from models.expense import Expense
from models.supplier import Supplier, SupplierInvoice, SupplierInvoiceItem
from models.deposit import DepositSale, DepositPayment

app = create_app()
app.app_context().push()

def run():
    # Admin and Manager
    admin = User.query.filter_by(email="pius@a-zmattresses.com").first()
    if not admin:
        admin = User(name="Pius Chege", email="pius@a-zmattresses.com", role="admin", is_verified=True)
        admin.set_password("password123")
        db.session.add(admin)
        db.session.commit()

    if not User.query.filter_by(email="manager@a-zmattresses.com").first():
        m = User(name="Test Manager", email="manager@a-zmattresses.com", role="manager", is_verified=True)
        m.set_password("manager123")
        db.session.add(m)

    # Shops
    shops_data = [
        {"name": "UMOJA", "address": "Nairobi"},
        {"name": "MUTINDWA", "address": "Nairobi"},
        {"name": "KABATI", "address": "Muranga"},
        {"name": "JUDAH", "address": "Nairobi"},
        {"name": "NDARACHA", "address": "Nairobi"},
        {"name": "KENOL", "address": "Muranga"},
        {"name": "UNITY", "address": "Nairobi"},
        {"name": "JESKA", "address": "Nairobi"},
        {"name": "RUIRU", "address": "Kiambu"}
    ]
    shops = {}
    for s_data in shops_data:
        shop = Shop.query.filter_by(name=s_data["name"]).first()
        if not shop:
            shop = Shop(name=s_data["name"], address=s_data["address"])
            db.session.add(shop)
            db.session.commit()
        shops[s_data["name"]] = shop
    
    # Categories and Items
    categories_data = ["Mattress", "Pillow", "Duvet", "Historical"]
    categories = {}
    for c_name in categories_data:
        cat = Category.query.filter_by(name=c_name).first()
        if not cat:
            cat = Category(name=c_name)
            db.session.add(cat)
            db.session.commit()
        categories[c_name] = cat

    hist_item = Item.query.filter_by(name="Historical Summary").first()
    if not hist_item:
        hist_item = Item(name="Historical Summary", category_id=categories["Historical"].id, sku="HIST-SUM")
        db.session.add(hist_item)
        db.session.commit()

    # Supplier for historical COGS
    old_system_supplier = Supplier.query.filter_by(name="Old System").first()
    if not old_system_supplier:
        old_system_supplier = Supplier(name="Old System")
        db.session.add(old_system_supplier)
        db.session.commit()

    # Historical Data
    historical_data = {
        "UMOJA": {
            "Jan": {"sales": 240400, "cogs": 150837, "expenses": 33000},
            "Feb": {"sales": 257700, "cogs": 165146, "expenses": 33000},
            "Mar": {"sales": 181500, "cogs": 111851, "expenses": 0},
            "pole_pole": 40700
        },
        "MUTINDWA": {
            "Jan": {"sales": 145200, "cogs": 94215, "expenses": 0},
            "Feb": {"sales": 386500, "cogs": 251794, "expenses": 0},
            "Mar": {"sales": 485350, "cogs": 307923, "expenses": 0},
            "pole_pole": 9700
        },
        "JUDAH": {
            "Jan": {"sales": 177700, "cogs": 110831, "expenses": 33000},
            "Feb": {"sales": 135600, "cogs": 85913, "expenses": 33000},
            "Mar": {"sales": 244400, "cogs": 161529, "expenses": 0},
            "pole_pole": 36200
        },
        "NDARACHA": {
            "Jan": {"sales": 71900, "cogs": 46565, "expenses": 26000},
            "Feb": {"sales": 128100, "cogs": 84199, "expenses": 26000},
            "Mar": {"sales": 213000, "cogs": 147110, "expenses": 0},
            "pole_pole": 22350
        },
        "KABATI": {
            "Jan": {"sales": 58400, "cogs": 37077, "expenses": 20000},
            "Feb": {"sales": 38100, "cogs": 25629, "expenses": 20000},
            "Mar": {"sales": 40900, "cogs": 33972, "expenses": 0},
            "pole_pole": 16500
        },
        "KENOL": {
            "Jan": {"sales": 67700, "cogs": 42482, "expenses": 47000},
            "Feb": {"sales": 43550, "cogs": 29812, "expenses": 47000},
            "Mar": {"sales": 78600, "cogs": 58252, "expenses": 0},
            "pole_pole": 54800
        },
        "UNITY": {
            "Jan": {"sales": 92550, "cogs": 57562, "expenses": 30000},
            "Feb": {"sales": 131000, "cogs": 82444, "expenses": 30000},
            "Mar": {"sales": 251100, "cogs": 160691, "expenses": 0},
            "pole_pole": 3500
        },
        "JESKA": {
            "Jan": {"sales": 231100, "cogs": 142261, "expenses": 42000},
            "Feb": {"sales": 236950, "cogs": 145129, "expenses": 42000},
            "Mar": {"sales": 308500, "cogs": 193741, "expenses": 0},
            "pole_pole": 9500
        },
        "RUIRU": {
            "Jan": {"sales": 0, "cogs": 0, "expenses": 0},
            "Feb": {"sales": 6850, "cogs": 3964, "expenses": 0},
            "Mar": {"sales": 180050, "cogs": 137445, "expenses": 0},
            "pole_pole": 0
        }
    }

    month_map = {"Jan": 1, "Feb": 2, "Mar": 3}

    for shop_name, data in historical_data.items():
        shop = shops[shop_name]
        
        # Add Sales, Expenses, and Invoices (COGS)
        for m_name, vals in data.items():
            if m_name == "pole_pole": continue
            
            month = month_map[m_name]
            # Use last day of month for the record date
            if month == 2: day = 28
            else: day = 31
            record_date = datetime(2026, month, day)

            if vals["sales"] > 0:
                # Check if already seeded
                existing_sale = Sale.query.filter_by(shop_id=shop.id, created_at=record_date).first()
                if not existing_sale:
                    sale = Sale(
                        shop_id=shop.id,
                        user_id=admin.id,
                        total_amount=Decimal(str(vals["sales"])),
                        payment_type="mobile_money",
                        created_at=record_date
                    )
                    db.session.add(sale)
                    db.session.flush()
                    
                    sale_item = SaleItem(
                        sale_id=sale.id,
                        item_id=hist_item.id,
                        qty=1,
                        unit_price=Decimal(str(vals["sales"])),
                        unit_cost=Decimal(str(vals["cogs"]))
                    )
                    db.session.add(sale_item)

                # Invoice to match Net Profit formula (Sales - Expenses - Invoices)
                # In the system, Net Profit = Sales - Expenses - Invoices.
                # In screenshots, Net Profit = Sales - Expenses - COGS.
                # So we set Invoices = COGS.
                existing_invoice = SupplierInvoice.query.filter_by(
                    invoice_number=f"HIST-{shop_name}-{m_name}",
                    supplier_id=old_system_supplier.id
                ).first()
                if not existing_invoice:
                    invoice = SupplierInvoice(
                        supplier_id=old_system_supplier.id,
                        invoice_number=f"HIST-{shop_name}-{m_name}",
                        total_amount=Decimal(str(vals["cogs"])),
                        amount_paid=Decimal(str(vals["cogs"])),
                        status="Paid",
                        received_date=record_date
                    )
                    db.session.add(invoice)
                    db.session.flush()

                    inv_item = SupplierInvoiceItem(
                        invoice_id=invoice.id,
                        item_id=hist_item.id,
                        shop_id=shop.id,
                        quantity=1,
                        unit_cost=Decimal(str(vals["cogs"])),
                        total_cost=Decimal(str(vals["cogs"]))
                    )
                    db.session.add(inv_item)

            if vals["expenses"] > 0:
                existing_expense = Expense.query.filter_by(
                    shop_id=shop.id, 
                    amount=Decimal(str(vals["expenses"])),
                    created_at=record_date
                ).first()
                if not existing_expense:
                    expense = Expense(
                        shop_id=shop.id,
                        title=f"Historical Expenses {m_name}",
                        amount=Decimal(str(vals["expenses"])),
                        created_at=record_date
                    )
                    db.session.add(expense)

        # Add Pole Pole (Deposits)
        if data["pole_pole"] > 0:
            existing_deposit = DepositSale.query.filter_by(
                shop_id=shop.id,
                buyer_name="Historical Customer"
            ).first()
            if not existing_deposit:
                deposit = DepositSale(
                    shop_id=shop.id,
                    item_id=hist_item.id,
                    buyer_name="Historical Customer",
                    buyer_phone="0000000000",
                    selling_price=Decimal(str(data["pole_pole"])),
                    created_by=admin.id,
                    status="active",
                    created_at=datetime(2026, 3, 31)
                )
                db.session.add(deposit)
                db.session.flush()

                payment = DepositPayment(
                    deposit_id=deposit.id,
                    amount=Decimal(str(data["pole_pole"])),
                    payment_method="cash",
                    recorded_by=admin.id,
                    paid_on=datetime(2026, 3, 31)
                )
                db.session.add(payment)

    db.session.commit()
    print("Seeded admin, shops, categories, and historical data from screenshots")

if __name__ == "__main__":
    run()
