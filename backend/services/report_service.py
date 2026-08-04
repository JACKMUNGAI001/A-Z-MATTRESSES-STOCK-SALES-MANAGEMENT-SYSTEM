from extensions import db
from models.sale import Sale, SaleItem
from models.deposit import DepositPayment
from models.expense import Expense
from models.stock import ShopStock
from models.deposit import DepositSale
from models.supplier import SupplierInvoice
from sqlalchemy import func
from sqlalchemy import or_
from datetime import datetime, timedelta
from utils.timezone_utils import get_local_time


def get_global_financial_overview():
    try:
        # Exclude unpaid credit (BAADAYE) sales from totals until paid
        total_sales = db.session.query(func.sum(Sale.total_amount)).filter(
            or_(Sale.sale_type != 'credit', Sale.status == 'paid')
        ).scalar() or 0
        total_deposit_collections = db.session.query(func.sum(DepositPayment.amount)).scalar() or 0
        total_expenses = db.session.query(func.sum(Expense.amount)).scalar() or 0
        
        # Optimized: Use SQL aggregation for gross profit
        gross_profit = db.session.query(
            func.sum((SaleItem.unit_price - SaleItem.unit_cost) * SaleItem.qty)
        ).join(Sale).filter(or_(Sale.sale_type != 'credit', Sale.status == 'paid')).scalar() or 0

        # Optimized: Use SQL aggregation for combined stock value
        combined_stock_value = db.session.query(
            func.sum(ShopStock.buy_price * ShopStock.quantity)
        ).scalar() or 0

        customers_with_balances = DepositSale.query.filter(DepositSale.status == 'active').count()

        return {
            "total_sales": float(total_sales),
            "gross_profit": float(gross_profit),
            "total_deposit_collections": float(total_deposit_collections),
            "total_expenses": float(total_expenses),
            "combined_stock_value": float(combined_stock_value),
            "customers_with_balances": customers_with_balances,
        }
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Error in get_global_financial_overview: {e}", exc_info=True)
        raise e

def get_pnl_report(year, month=None, shop_id=None, period=None):
    now = get_local_time()
    
    if period == 'today':
        start_date = datetime.combine(now.date(), datetime.min.time())
        end_date = datetime.combine(now.date(), datetime.max.time())
    elif period == 'this_week':
        start_date = datetime.combine(now.date() - timedelta(days=now.weekday()), datetime.min.time())
        end_date = datetime.combine(now.date(), datetime.max.time())
    elif month:
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
        Sale.created_at <= end_date
    )
    # Exclude unpaid credit sales
    sales_query = sales_query.filter(or_(Sale.sale_type != 'credit', Sale.status == 'paid'))

    cogs_query = db.session.query(func.sum(SaleItem.unit_cost * SaleItem.qty)).join(Sale).filter(
        Sale.created_at >= start_date,
        Sale.created_at <= end_date
    )
    cogs_query = cogs_query.filter(or_(Sale.sale_type != 'credit', Sale.status == 'paid'))

    expenses_query = db.session.query(func.sum(Expense.amount)).filter(
        Expense.created_at >= start_date,
        Expense.created_at <= end_date
    )

    invoices_query = db.session.query(func.sum(SupplierInvoice.total_amount)).filter(
        SupplierInvoice.received_date >= start_date,
        SupplierInvoice.received_date <= end_date
    )

    if shop_id:
        sales_query = sales_query.filter(Sale.shop_id == shop_id)
        cogs_query = cogs_query.filter(Sale.shop_id == shop_id)
        # Include both shop-specific and global expenses
        expenses_query = expenses_query.filter((Expense.shop_id == shop_id) | (Expense.shop_id == None))
        # Note: Invoices are distributed per item to shops, but the invoice record itself doesn't have a shop_id.
        # We'll filter based on distributed items if a shop_id is provided.
        from models.supplier import SupplierInvoiceItem
        invoices_query = db.session.query(func.sum(SupplierInvoiceItem.total_cost)).join(SupplierInvoice).filter(
            SupplierInvoice.received_date >= start_date,
            SupplierInvoice.received_date <= end_date,
            SupplierInvoiceItem.shop_id == shop_id
        )

    total_sales = float(sales_query.scalar() or 0)
    total_cogs = float(cogs_query.scalar() or 0)
    total_expenses = float(expenses_query.scalar() or 0)
    total_invoices = float(invoices_query.scalar() or 0)

    # Traditional Gross Profit uses COGS (cost of items SOLD)
    gross_profit = total_sales - total_cogs
    
    # Net Profit now includes total invoice costs (purchases) as requested
    # To avoid double counting stock costs (COGS + Invoices), 
    # we use the formula: Revenue - Operating Expenses - Total Stock Purchases
    net_profit = total_sales - total_expenses - total_invoices

    return {
        "year": year,
        "month": month,
        "period": period,
        "shop_id": shop_id,
        "total_sales": total_sales,
        "total_cogs": total_cogs,
        "gross_profit": gross_profit,
        "total_expenses": total_expenses,
        "total_invoices": total_invoices,
        "net_profit": net_profit,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat()
    }

def get_daily_sales(shop_id=None):
    today = get_local_time().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    query = db.session.query(func.sum(Sale.total_amount)).filter(
        Sale.created_at >= start_of_day,
        Sale.created_at <= end_of_day
    )
    query = query.filter(or_(Sale.sale_type != 'credit', Sale.status == 'paid'))
    if shop_id:
        query = query.filter(Sale.shop_id == shop_id)

    total_sales_today = query.scalar() or 0
    return {"total_sales": float(total_sales_today)}

def get_sales_summary(shop_id=None):
    now = get_local_time()
    today_start = datetime.combine(now.date(), datetime.min.time())
    
    # Base queries
    # Exclude unpaid credit sales from summary totals
    today_query = db.session.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= today_start)
    today_query = today_query.filter(or_(Sale.sale_type != 'credit', Sale.status == 'paid'))
    
    start_of_week = today_start - timedelta(days=now.weekday())
    week_query = db.session.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= start_of_week)
    week_query = week_query.filter(or_(Sale.sale_type != 'credit', Sale.status == 'paid'))
    
    start_of_month = datetime(now.year, now.month, 1)
    month_query = db.session.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= start_of_month)
    month_query = month_query.filter(or_(Sale.sale_type != 'credit', Sale.status == 'paid'))
    
    start_of_year = datetime(now.year, 1, 1)
    year_query = db.session.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= start_of_year)
    year_query = year_query.filter(or_(Sale.sale_type != 'credit', Sale.status == 'paid'))

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
    now = get_local_time()
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

def get_stock_summary_by_category(shop_id=None):
    from models.product import Item, Category
    from models.shop import Shop
    
    query = db.session.query(
        Shop.name.label("shop_name"),
        Category.name.label("category_name"),
        func.sum(ShopStock.quantity).label("total_quantity")
    ).join(ShopStock, ShopStock.shop_id == Shop.id) \
     .join(Item, ShopStock.item_id == Item.id) \
     .join(Category, Item.category_id == Category.id)

    if shop_id:
        query = query.filter(Shop.id == shop_id)

    results = query.group_by(Shop.name, Category.name).order_by(Shop.name.asc(), Category.name.asc()).all()

    summary = {}
    for shop_name, category_name, total_quantity in results:
        if shop_name not in summary:
            summary[shop_name] = {}
        summary[shop_name][category_name] = int(total_quantity or 0)
    
    return summary


def get_outstanding_credits(shop_id=None):
    """Return list of credit sales not fully paid with remaining balance."""
    from models.sale import Sale
    query = Sale.query.filter(Sale.sale_type == 'credit').filter(Sale.status != 'paid')
    if shop_id:
        query = query.filter(Sale.shop_id == shop_id)
    results = []
    for s in query.order_by(Sale.created_at.desc()).all():
        rem = float(s.total_amount or 0) - float(s.paid_amount or 0)
        results.append({
            "id": s.id,
            "shop_id": s.shop_id,
            "shop_name": (Shop.query.get(s.shop_id).name if Shop.query.get(s.shop_id) else 'N/A'),
            "attendant_name": (User.query.get(s.user_id).name if User.query.get(s.user_id) else 'N/A'),
            "total_amount": float(s.total_amount or 0),
            "paid_amount": float(s.paid_amount or 0),
            "remaining": rem,
            "created_at": s.created_at.isoformat(),
            "receipt_uuid": s.receipt_uuid,
        })
    return results


def get_credits_summary(shop_id=None):
    """Return summary metrics for credit sales."""
    try:
        q_total_credit = db.session.query(func.sum(Sale.total_amount)).filter(Sale.sale_type == 'credit')
        q_total_outstanding = db.session.query(func.sum((Sale.total_amount - Sale.paid_amount))).filter(Sale.sale_type == 'credit', Sale.status != 'paid')
        q_outstanding_count = db.session.query(func.count(Sale.id)).filter(Sale.sale_type == 'credit', Sale.status != 'paid')
        q_paid_count = db.session.query(func.count(Sale.id)).filter(Sale.sale_type == 'credit', Sale.status == 'paid')

        if shop_id:
            q_total_credit = q_total_credit.filter(Sale.shop_id == shop_id)
            q_total_outstanding = q_total_outstanding.filter(Sale.shop_id == shop_id)
            q_outstanding_count = q_outstanding_count.filter(Sale.shop_id == shop_id)
            q_paid_count = q_paid_count.filter(Sale.shop_id == shop_id)

        total_credit = float(q_total_credit.scalar() or 0)
        total_outstanding = float(q_total_outstanding.scalar() or 0)
        outstanding_count = int(q_outstanding_count.scalar() or 0)
        paid_count = int(q_paid_count.scalar() or 0)

        return {
            "total_credit_sales": total_credit,
            "total_outstanding_amount": total_outstanding,
            "outstanding_count": outstanding_count,
            "paid_count": paid_count
        }
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Error in get_credits_summary: {e}", exc_info=True)
        raise e


def get_all_credit_sales(shop_id=None):
    """Return all credit sales (paid and unpaid) serialized for UI."""
    from models.shop import Shop
    from models.user import User
    query = Sale.query.filter(Sale.sale_type == 'credit').order_by(Sale.created_at.desc())
    if shop_id:
        query = query.filter(Sale.shop_id == shop_id)
    results = []
    for s in query.all():
        rem = float(s.total_amount or 0) - float(s.paid_amount or 0)
        shop = Shop.query.get(s.shop_id)
        user = User.query.get(s.user_id)
        results.append({
            "id": s.id,
            "shop_id": s.shop_id,
            "shop_name": shop.name if shop else 'N/A',
            "attendant_name": user.name if user else 'N/A',
            "total_amount": float(s.total_amount or 0),
            "paid_amount": float(s.paid_amount or 0),
            "remaining": rem,
            "status": s.status,
            "created_at": s.created_at.isoformat(),
            "receipt_uuid": s.receipt_uuid,
        })
    return results
    
def get_dashboard_summary(shop_id=None):
    """
    Unified dashboard summary to reduce multiple API calls on login.
    """
    from models.deposit import DepositSale
    
    # Run all summaries in parallel/batch if possible
    # For now, just call existing optimized services
    sales = get_sales_summary(shop_id)
    deposits = get_deposits_summary(shop_id)
    stock_summary = get_stock_summary_by_category(shop_id)
    
    financial = None
    if not shop_id: # Only for Admin (Global)
        financial = get_global_financial_overview()

    # Get additional metrics usually requested
    low_stock_count = 0
    from models.stock import ShopStock
    from config import Config
    
    low_stock_query = db.session.query(func.count(ShopStock.id)).filter(ShopStock.quantity <= 2)
    if shop_id:
        low_stock_query = low_stock_query.filter(ShopStock.shop_id == shop_id)
    low_stock_count = low_stock_query.scalar() or 0

    deposit_customers_count = 0
    cust_query = db.session.query(func.count(DepositSale.id)).filter(DepositSale.status == 'active')
    if shop_id:
        cust_query = cust_query.filter(DepositSale.shop_id == shop_id)
    deposit_customers_count = cust_query.scalar() or 0

    return {
        "sales": sales,
        "deposits": deposits,
        "stock_summary": stock_summary,
        "financial_overview": financial,
        "low_stock_count": int(low_stock_count),
        "deposit_customers_count": int(deposit_customers_count)
    }

def get_product_sales_analysis(year=None, month=None, shop_id=None, period=None):
    from models.product import Item
    from models.shop import Shop
    from models.sale import Sale, SaleItem
    
    now = get_local_time()
    
    if period == 'today':
        start_date = datetime.combine(now.date(), datetime.min.time())
        end_date = datetime.combine(now.date(), datetime.max.time())
    elif period == 'this_week':
        start_date = datetime.combine(now.date() - timedelta(days=now.weekday()), datetime.min.time())
        end_date = datetime.combine(now.date(), datetime.max.time())
    elif month:
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
    elif year:
        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1)
    else:
        start_date = None
        end_date = None

    query = db.session.query(
        Item.name.label("product_name"),
        Shop.name.label("shop_name"),
        func.sum(SaleItem.qty).label("total_qty"),
        func.sum(SaleItem.qty * SaleItem.unit_price).label("total_revenue")
    ).join(SaleItem, SaleItem.item_id == Item.id) \
     .join(Sale, SaleItem.sale_id == Sale.id) \
     .join(Shop, Sale.shop_id == Shop.id)

    # Exclude unpaid credit sales from product-level totals
    query = query.filter(or_(Sale.sale_type != 'credit', Sale.status == 'paid'))

    if shop_id:
        query = query.filter(Sale.shop_id == shop_id)
    
    if start_date:
        query = query.filter(Sale.created_at >= start_date)
    if end_date:
        query = query.filter(Sale.created_at <= end_date)

    results = query.group_by(Item.name, Shop.name).order_by(func.sum(SaleItem.qty).desc()).all()

    analysis = [
        {
            "product_name": row.product_name,
            "shop_name": row.shop_name,
            "total_qty": int(row.total_qty),
            "total_revenue": float(row.total_revenue)
        } for row in results
    ]

    # Overall summary (all shops combined)
    overall_query = db.session.query(
        Item.name.label("product_name"),
        func.sum(SaleItem.qty).label("total_qty"),
        func.sum(SaleItem.qty * SaleItem.unit_price).label("total_revenue")
    ).join(SaleItem, SaleItem.item_id == Item.id) \
     .join(Sale, SaleItem.sale_id == Sale.id)

    overall_query = overall_query.filter(or_(Sale.sale_type != 'credit', Sale.status == 'paid'))

    if start_date:
        overall_query = overall_query.filter(Sale.created_at >= start_date)
    if end_date:
        overall_query = overall_query.filter(Sale.created_at <= end_date)

    overall_results = overall_query.group_by(Item.name).order_by(func.sum(SaleItem.qty).desc()).all()

    overall_analysis = [
        {
            "product_name": row.product_name,
            "total_qty": int(row.total_qty),
            "total_revenue": float(row.total_revenue)
        } for row in overall_results
    ]

    return {
        "by_shop": analysis,
        "overall": overall_analysis
    }
