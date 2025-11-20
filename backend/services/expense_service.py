from extensions import db
from models.expense import Expense

def create_expense(shop_id, title, amount, description=None, recurring=False, frequency=None):
    e = Expense(shop_id=shop_id, title=title, amount=amount, description=description, recurring=recurring, frequency=frequency)
    db.session.add(e)
    db.session.commit()
    return e

def list_expenses(shop_id=None):
    q = Expense.query
    if shop_id:
        q = q.filter_by(shop_id=shop_id)
    return q.all()
