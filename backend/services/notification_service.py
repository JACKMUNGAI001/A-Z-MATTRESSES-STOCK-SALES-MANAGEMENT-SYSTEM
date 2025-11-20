from extensions import db
from models.notification import Notification

def create_notification(user_role, message, user_id=None, type="info"):
    n = Notification(user_role=user_role, message=message, user_id=user_id, type=type)
    db.session.add(n)
    db.session.commit()
    return n

def list_notifications_for_user(role, user_id=None):
    if user_id:
        return Notification.query.filter((Notification.user_role==role) | (Notification.user_id==user_id)).all()
    return Notification.query.filter_by(user_role=role).all()
