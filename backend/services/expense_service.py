from extensions import db
from models.expense import Expense
from models.shop import Shop

def create_expense(shop_id, title, amount, description=None, recurring=False, frequency=None):
    if shop_id:
        e = Expense(shop_id=shop_id, title=title, amount=amount, description=description, recurring=recurring, frequency=frequency)
        db.session.add(e)
    else:
        shops = Shop.query.all()
        for shop in shops:
            e = Expense(shop_id=shop.id, title=title, amount=amount, description=description, recurring=recurring, frequency=frequency)
            db.session.add(e)
    db.session.commit()
    return e

def list_expenses(shop_id=None):
    q = Expense.query
    if shop_id:
        q = q.filter_by(shop_id=shop_id)
    return q.all()

def get_expense_by_id(expense_id):
    return Expense.query.get(expense_id)

def update_expense(expense_id, shop_id, title, amount, description=None, recurring=False, frequency=None):
    e = get_expense_by_id(expense_id)
    if not e:
        return None
    e.shop_id = shop_id
    e.title = title
    e.amount = amount
    e.description = description
    e.recurring = recurring
    e.frequency = frequency
    db.session.commit()
    return e

def delete_expense(expense_id):
    e = get_expense_by_id(expense_id)
    if not e:
        return None
    db.session.delete(e)
    db.session.commit()
    return e
