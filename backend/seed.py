from app import create_app
from extensions import db
from models.user import User
from models.shop import Shop

app = create_app()
app.app_context().push()

def run():
    if not User.query.filter_by(email="pius@a-zmattresses.com").first():
        u = User(name="Pius Chege", email="pius@a-zmattresses.com", role="admin", is_verified=True)
        u.set_password("password123")  # change in production
        db.session.add(u)

    shops = ["Umoja", "Mutindwa", "Kabati", "Juja", "Roysambu"]
    for s in shops:
        if not Shop.query.filter_by(name=s).first():
            db.session.add(Shop(name=s))
    db.session.commit()
    print("Seeded admin and shops")

if __name__ == "__main__":
    run()
