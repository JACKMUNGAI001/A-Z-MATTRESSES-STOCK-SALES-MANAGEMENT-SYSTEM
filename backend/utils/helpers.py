import json
import re
from flask import current_app
from models.receipt import Receipt
from extensions import db


def create_receipt(payload: dict):
    r = Receipt(payload=json.dumps(payload))
    db.session.add(r)
    db.session.commit()
    return r.uuid


def receipt_public_url(uuid):
    base = current_app.config.get("FRONTEND_URL", "")
    return f"{base.rstrip('/')}/receipt/{uuid}"


def get_product_weight_kg(item=None, category_name=None):
    if item is None:
        item = {}

    if isinstance(item, dict):
        item_name = item.get("name") or item.get("item_name") or ""
        category_name = category_name or item.get("category_name") or ""
    else:
        item_name = getattr(item, "name", "") or getattr(item, "item_name", "") or ""
        category_name = category_name or getattr(item, "category_name", "") or ""

    search_text = f"{category_name or ''} {item_name}".lower()
    match = re.search(r"(\d+(?:\.\d+)?)\s*kg", search_text)
    if match:
        return float(match.group(1))
    return None


def calculate_total_buy_price(item=None, price=None, price_unit=None, category_name=None):
    if price is None:
        return None

    try:
        price = float(price)
    except (TypeError, ValueError):
        return None

    if price_unit == "per_kg":
        weight_kg = get_product_weight_kg(item=item, category_name=category_name)
        if weight_kg and weight_kg > 0:
            return round(price * weight_kg, 2)

    return round(price, 2)
