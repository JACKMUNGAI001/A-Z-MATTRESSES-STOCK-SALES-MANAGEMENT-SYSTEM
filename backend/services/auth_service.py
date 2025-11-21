from extensions import db
from models.user import User

def register_user(name, email, password, role="attendant", shop_id=None):
    if User.query.filter_by(email=email).first():
        raise ValueError("Email already registered")
    u = User(name=name, email=email, role=role, shop_id=shop_id)
    u.set_password(password)
    db.session.add(u)
    db.session.commit()
    return u

def get_user_by_email(email):
    return User.query.filter_by(email=email).first()
