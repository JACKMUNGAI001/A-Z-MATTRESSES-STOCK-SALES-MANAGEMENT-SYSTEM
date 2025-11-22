from extensions import db
from models.sale import Sale, SaleItem
from models.deposit import DepositPayment
from models.expense import Expense
from models.stock import ShopStock
from models.deposit import DepositSale
from sqlalchemy import func
from datetime import datetime

def get_global_financial_overview():
    total_sales = db.session.query(func.sum(Sale.total_amount)).scalar() or 0
    total_deposit_collections = db.session.query(func.sum(DepositPayment.amount)).scalar() or 0
    total_expenses = db.session.query(func.sum(Expense.amount)).scalar() or 0
    
    total_profit = 0
    sales = Sale.query.all()
    for sale in sales:
        for item in sale.items:
            total_profit += (item.unit_price - item.unit_cost) * item.qty

    combined_stock_value = 0
    stocks = ShopStock.query.all()
    for stock in stocks:
        combined_stock_value += stock.buy_price * stock.quantity

    customers_with_balances = DepositSale.query.filter(DepositSale.status == 'active').count()

    cash_sales = db.session.query(func.sum(Sale.total_amount)).filter(Sale.payment_type == 'cash').scalar() or 0
    mobile_money_sales = db.session.query(func.sum(Sale.total_amount)).filter(Sale.payment_type == 'mobile_money').scalar() or 0

    cash_deposits = db.session.query(func.sum(DepositPayment.amount)).filter(DepositPayment.payment_method == 'cash').scalar() or 0
    mobile_money_deposits = db.session.query(func.sum(DepositPayment.amount)).filter(DepositPayment.payment_method == 'mobile_money').scalar() or 0

    total_cash = cash_sales + cash_deposits
    total_mobile_money = mobile_money_sales + mobile_money_deposits

    return {
        "total_sales": float(total_sales),
        "total_profit": float(total_profit),
        "total_deposit_collections": float(total_deposit_collections),
        "total_expenses": float(total_expenses),
        "combined_stock_value": float(combined_stock_value),
        "customers_with_balances": customers_with_balances,
        "total_cash": float(total_cash),
        "total_mobile_money": float(total_mobile_money)
    }

def get_pnl_report(year, month, shop_id=None):
    sales_query = db.session.query(func.sum(Sale.total_amount)).filter(
        func.extract('year', Sale.created_at) == year,
        func.extract('month', Sale.created_at) == month
    )

    cogs_query = db.session.query(func.sum(SaleItem.unit_cost * SaleItem.qty)).join(Sale).filter(
        func.extract('year', Sale.created_at) == year,
        func.extract('month', Sale.created_at) == month
    )

    expenses_query = db.session.query(func.sum(Expense.amount)).filter(
        func.extract('year', Expense.created_at) == year,
        func.extract('month', Expense.created_at) == month
    )

    if shop_id:
        sales_query = sales_query.filter(Sale.shop_id == shop_id)
        cogs_query = cogs_query.filter(Sale.shop_id == shop_id)
        expenses_query = expenses_query.filter(Expense.shop_id == shop_id)

    total_sales = sales_query.scalar() or 0
    total_cogs = cogs_query.scalar() or 0
    total_expenses = expenses_query.scalar() or 0

    gross_profit = total_sales - total_cogs
    net_profit = gross_profit - total_expenses

    return {
        "year": year,
        "month": month,
        "shop_id": shop_id,
        "total_sales": float(total_sales),
        "total_cogs": float(total_cogs),
        "gross_profit": float(gross_profit),
        "total_expenses": float(total_expenses),
        "net_profit": float(net_profit)
    }

def get_daily_sales():
    today = datetime.utcnow().date()
    total_sales_today = db.session.query(func.sum(Sale.total_amount)).filter(
        func.extract('year', Sale.created_at) == today.year,
        func.extract('month', Sale.created_at) == today.month,
        func.extract('day', Sale.created_at) == today.day
    ).scalar() or 0
    return {"total_sales": float(total_sales_today)}
