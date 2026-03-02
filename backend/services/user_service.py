from extensions import db
from models.user import User

def update_profile(user_id, name, email):
    user = User.query.get(user_id)
    if not user:
        return None
    user.name = name
    user.email = email
    db.session.commit()
    return user

def change_password(user_id, new_password):
    user = User.query.get(user_id)
    if not user:
        return None
    user.set_password(new_password)
    db.session.commit()
    return user
