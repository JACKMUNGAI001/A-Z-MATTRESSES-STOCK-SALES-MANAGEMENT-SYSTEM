from flask import request, jsonify
from services.expense_service import create_expense, list_expenses, get_expense_by_id, update_expense, delete_expense

def add_expense_controller():
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    title = data.get("title")
    amount = data.get("amount")
    recurring = data.get("recurring", False)
    frequency = data.get("frequency")
    if not all([title, amount]):
        return jsonify({"msg":"title and amount required"}), 400
    e = create_expense(shop_id=shop_id, title=title, amount=amount, description=data.get("description"), recurring=recurring, frequency=frequency)
    return jsonify({"id": e.id, "msg":"expense added"}), 201

def list_expenses_controller():
    shop_id = request.args.get("shop_id")
    es = list_expenses(shop_id)
    out = [{"id":e.id,"title":e.title,"amount":float(e.amount),"recurring":e.recurring} for e in es]
    return jsonify(out), 200

def get_expense_controller(expense_id):
    e = get_expense_by_id(expense_id)
    if not e:
        return jsonify({"msg": "Expense not found"}), 404
    return jsonify({"id":e.id,"title":e.title,"amount":float(e.amount),"recurring":e.recurring, "shop_id": e.shop_id, "description": e.description, "frequency": e.frequency}), 200

def update_expense_controller(expense_id):
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    title = data.get("title")
    amount = data.get("amount")
    recurring = data.get("recurring", False)
    frequency = data.get("frequency")
    if not all([title, amount]):
        return jsonify({"msg":"title and amount required"}), 400
    e = update_expense(expense_id, shop_id=shop_id, title=title, amount=amount, description=data.get("description"), recurring=recurring, frequency=frequency)
    if not e:
        return jsonify({"msg": "Expense not found"}), 404
    return jsonify({"id": e.id, "msg":"expense updated"}), 200

def delete_expense_controller(expense_id):
    e = delete_expense(expense_id)
    if not e:
        return jsonify({"msg": "Expense not found"}), 404
    return jsonify({"msg": "Expense deleted"}), 200
