def require_fields(data, fields):
    missing = [f for f in fields if f not in (data or {}) or data.get(f) in (None, "")]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")
