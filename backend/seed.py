from app import create_app
from extensions import db
from models.user import User
from models.shop import Shop
from models.product import Category

app = create_app()
app.app_context().push()

def run():
    if not User.query.filter_by(email="pius@a-zmattresses.com").first():
        u = User(name="Pius Chege", email="pius@a-zmattresses.com", role="admin", is_verified=True)
        u.set_password("password123")  # change in production
        db.session.add(u)

    if not User.query.filter_by(email="manager@a-zmattresses.com").first():
        m = User(name="Test Manager", email="manager@a-zmattresses.com", role="manager", is_verified=True)
        m.set_password("manager123")
        db.session.add(m)

    shops_data = [
        {"name": "Umoja", "address": "Umoja Estate, Nairobi"},
        {"name": "Mutindwa", "address": "Mutindwa Market, Nairobi"},
        {"name": "Kabati", "address": "Kabati Town, Muranga"}
    ]
    for s_data in shops_data:
        if not Shop.query.filter_by(name=s_data["name"]).first():
            db.session.add(Shop(name=s_data["name"], address=s_data["address"]))
    
    categories_data = ["Mattress", "Pillow", "Duvet"]
    for c_name in categories_data:
        if not Category.query.filter_by(name=c_name).first():
            db.session.add(Category(name=c_name))

    db.session.commit()
    print("Seeded admin, shops, and categories")

if __name__ == "__main__":
    run()
