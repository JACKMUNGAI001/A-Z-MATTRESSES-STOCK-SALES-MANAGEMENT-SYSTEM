from extensions import db
from models.sale import Sale, SaleItem
from models.deposit import DepositPayment
from models.expense import Expense
from models.stock import ShopStock
from models.deposit import DepositSale
from sqlalchemy import func
from datetime import datetime, timedelta


def get_global_financial_overview():
    try:
        total_sales = db.session.query(func.sum(Sale.total_amount)).scalar() or 0
        total_deposit_collections = db.session.query(func.sum(DepositPayment.amount)).scalar() or 0
        total_expenses = db.session.query(func.sum(Expense.amount)).scalar() or 0
        
        total_profit = 0
        sales = Sale.query.all()
        for sale in sales:
            for item in sale.items:
                # Ensure unit_price and unit_cost are not None
                up = float(item.unit_price or 0)
                uc = float(item.unit_cost or 0)
                qty = item.qty or 0
                total_profit += (up - uc) * qty

        combined_stock_value = 0
        stocks = ShopStock.query.all()
        for stock in stocks:
            # Ensure buy_price and quantity are not None
            bp = float(stock.buy_price or 0)
            qty = stock.quantity or 0
            combined_stock_value += bp * qty

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
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Error in get_global_financial_overview: {e}", exc_info=True)
        raise e

def get_pnl_report(year, month=None, shop_id=None):
    if month:
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
    else:
        # Yearly report
        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1)

    sales_query = db.session.query(func.sum(Sale.total_amount)).filter(
        Sale.created_at >= start_date,
        Sale.created_at < end_date
    )

    cogs_query = db.session.query(func.sum(SaleItem.unit_cost * SaleItem.qty)).join(Sale).filter(
        Sale.created_at >= start_date,
        Sale.created_at < end_date
    )

    expenses_query = db.session.query(func.sum(Expense.amount)).filter(
        Expense.created_at >= start_date,
        Expense.created_at < end_date
    )

    if shop_id:
        sales_query = sales_query.filter(Sale.shop_id == shop_id)
        cogs_query = cogs_query.filter(Sale.shop_id == shop_id)
        expenses_query = expenses_query.filter(Expense.shop_id == shop_id)

    total_sales = float(sales_query.scalar() or 0)
    total_cogs = float(cogs_query.scalar() or 0)
    total_expenses = float(expenses_query.scalar() or 0)

    gross_profit = total_sales - total_cogs
    net_profit = gross_profit - total_expenses

    return {
        "year": year,
        "month": month,
        "shop_id": shop_id,
        "total_sales": total_sales,
        "total_cogs": total_cogs,
        "gross_profit": gross_profit,
        "total_expenses": total_expenses,
        "net_profit": net_profit
    }

def get_daily_sales(shop_id=None):
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    query = db.session.query(func.sum(Sale.total_amount)).filter(
        Sale.created_at >= start_of_day,
        Sale.created_at <= end_of_day
    )
    if shop_id:
        query = query.filter(Sale.shop_id == shop_id)

    total_sales_today = query.scalar() or 0
    return {"total_sales": float(total_sales_today)}

def get_sales_summary(shop_id=None):
    now = datetime.utcnow()
    today_start = datetime.combine(now.date(), datetime.min.time())
    
    # Base queries
    today_query = db.session.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= today_start)
    
    start_of_week = today_start - timedelta(days=now.weekday())
    week_query = db.session.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= start_of_week)
    
    start_of_month = datetime(now.year, now.month, 1)
    month_query = db.session.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= start_of_month)
    
    start_of_year = datetime(now.year, 1, 1)
    year_query = db.session.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= start_of_year)

    if shop_id:
        today_query = today_query.filter(Sale.shop_id == shop_id)
        week_query = week_query.filter(Sale.shop_id == shop_id)
        month_query = month_query.filter(Sale.shop_id == shop_id)
        year_query = year_query.filter(Sale.shop_id == shop_id)

    return {
        "today": float(today_query.scalar() or 0),
        "week": float(week_query.scalar() or 0),
        "month": float(month_query.scalar() or 0),
        "year": float(year_query.scalar() or 0)
    }

def get_deposits_summary(shop_id=None):
    now = datetime.utcnow()
    today_start = datetime.combine(now.date(), datetime.min.time())
    
    # Base queries
    today_q = db.session.query(func.sum(DepositPayment.amount)).filter(DepositPayment.paid_on >= today_start)
    
    start_of_week = today_start - timedelta(days=now.weekday())
    week_q = db.session.query(func.sum(DepositPayment.amount)).filter(DepositPayment.paid_on >= start_of_week)
    
    start_of_month = datetime(now.year, now.month, 1)
    month_q = db.session.query(func.sum(DepositPayment.amount)).filter(DepositPayment.paid_on >= start_of_month)
    
    start_of_year = datetime(now.year, 1, 1)
    year_q = db.session.query(func.sum(DepositPayment.amount)).filter(DepositPayment.paid_on >= start_of_year)

    if shop_id:
        # Join with DepositSale to filter by shop_id
        today_q = today_q.join(DepositSale).filter(DepositSale.shop_id == shop_id)
        week_q = week_q.join(DepositSale).filter(DepositSale.shop_id == shop_id)
        month_q = month_q.join(DepositSale).filter(DepositSale.shop_id == shop_id)
        year_q = year_q.join(DepositSale).filter(DepositSale.shop_id == shop_id)

    return {
        "today": float(today_q.scalar() or 0),
        "week": float(week_q.scalar() or 0),
        "month": float(month_q.scalar() or 0),
        "year": float(year_q.scalar() or 0)
    }


