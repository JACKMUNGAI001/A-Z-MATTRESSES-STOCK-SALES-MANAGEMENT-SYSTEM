from flask import Blueprint, request, jsonify
from extensions import db
from models import Expense
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("expenses", __name__)

@bp.route("/", methods=["POST"])
@jwt_required()
def add_expense():
    data = request.get_json() or {}
    shop_id = data.get("shop_id")
    title = data.get("title")
    amount = data.get("amount")
    recurring = data.get("recurring", False)
    freq = data.get("frequency")
    if not all([title, amount]):
        return jsonify({"msg":"title and amount required"}), 400
    e = Expense(shop_id=shop_id, title=title, amount=amount, recurring=recurring, frequency=freq)
    db.session.add(e)
    db.session.commit()
    return jsonify({"msg":"expense added","id":e.id}), 201

@bp.route("/", methods=["GET"])
def list_expenses():
    shop_id = request.args.get("shop_id")
    q = Expense.query
    if shop_id:
        q = q.filter_by(shop_id=shop_id)
    es = q.all()
    return jsonify([{"id":e.id,"title":e.title,"amount":str(e.amount),"recurring":e.recurring} for e in es]), 200
