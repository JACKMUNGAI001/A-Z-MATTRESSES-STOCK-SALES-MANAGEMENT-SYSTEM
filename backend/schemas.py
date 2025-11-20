from marshmallow import Schema, fields, validate

# -----------------------------
# User Schema
# -----------------------------
class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    role = fields.Str(required=True, validate=validate.OneOf(["admin", "attendant"]))
    phone = fields.Str()
    created_at = fields.DateTime(dump_only=True)


# -----------------------------
# Product Schema
# -----------------------------
class ProductSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    width = fields.Float(required=True)
    length = fields.Float(required=True)
    height = fields.Float(required=True)
    description = fields.Str()
    base_price = fields.Float(required=True)
    created_at = fields.DateTime(dump_only=True)


# -----------------------------
# Stock Schema
# -----------------------------
class StockSchema(Schema):
    id = fields.Int(dump_only=True)
    product_id = fields.Int(required=True)
    quantity = fields.Int(required=True)
    low_stock_threshold = fields.Int(required=True)
    updated_at = fields.DateTime(dump_only=True)

    product = fields.Nested(ProductSchema, dump_only=True)


# -----------------------------
# Sale Schema (Normal Sale)
# -----------------------------
class SaleSchema(Schema):
    id = fields.Int(dump_only=True)
    product_id = fields.Int(required=True)
    quantity = fields.Int(required=True)
    selling_price = fields.Float(required=True)
    date_sold = fields.DateTime()

    sold_by = fields.Int(required=True)   # user_id (attendant)
    customer_name = fields.Str()
    customer_phone = fields.Str()

    product = fields.Nested(ProductSchema, dump_only=True)
    user = fields.Nested(UserSchema, dump_only=True)


# -----------------------------
# Deposit (Layaway) Schema
# -----------------------------
class DepositSchema(Schema):
    id = fields.Int(dump_only=True)
    product_id = fields.Int(required=True)
    customer_name = fields.Str(required=True)
    customer_phone = fields.Str(required=True)
    total_price = fields.Float(required=True)

    amount_paid = fields.Float()
    status = fields.Str(validate=validate.OneOf(["ongoing", "completed"]))
    created_at = fields.DateTime(dump_only=True)

    product = fields.Nested(ProductSchema, dump_only=True)


# -----------------------------
# Deposit Payment (sub-payments)
# -----------------------------
class DepositPaymentSchema(Schema):
    id = fields.Int(dump_only=True)
    deposit_id = fields.Int(required=True)
    amount = fields.Float(required=True)
    date_paid = fields.DateTime()

    deposit = fields.Nested(DepositSchema, dump_only=True)
