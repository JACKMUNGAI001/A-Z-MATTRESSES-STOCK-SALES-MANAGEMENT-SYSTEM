from flask import request, jsonify
from services.expense_service import create_expense, list_expenses

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
