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
    categories_data = ["Mattress", "Pillow", "Duvet"]
    categories = {}
    for c_name in categories_data:
        cat = Category.query.filter_by(name=c_name).first()
        if not cat:
            cat = Category(name=c_name)
            db.session.add(cat)
            db.session.commit()
        categories[c_name] = cat

    db.session.commit()
    print("Seeded admin, shops, and categories.")

if __name__ == "__main__":
    run()
