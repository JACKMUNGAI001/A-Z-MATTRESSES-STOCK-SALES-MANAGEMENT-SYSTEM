from math import ceil


DEFAULT_PAGE_SIZE = 25
MAX_PAGE_SIZE = 100


def parse_pagination_args(args):
    try:
        page = int(args.get("page", 1))
    except (TypeError, ValueError):
        page = 1
    try:
        per_page = int(args.get("per_page", DEFAULT_PAGE_SIZE))
    except (TypeError, ValueError):
        per_page = DEFAULT_PAGE_SIZE

    return max(page, 1), min(max(per_page, 1), MAX_PAGE_SIZE)


def paginate_query(query, page, per_page):
    total = query.order_by(None).count()
    total_pages = max(ceil(total / per_page), 1)
    page = min(page, total_pages)
    rows = query.offset((page - 1) * per_page).limit(per_page).all()
    return rows, {
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages,
    }
