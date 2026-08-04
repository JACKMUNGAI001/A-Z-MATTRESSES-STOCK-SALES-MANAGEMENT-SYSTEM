"""add credit sale tracking

Revision ID: b4f8c2d1e6a9
Revises: 6f601b2ecbac
Create Date: 2026-08-04 15:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "b4f8c2d1e6a9"
down_revision = "6f601b2ecbac"
branch_labels = None
depends_on = None


def _sales_column_names():
    return {column["name"] for column in sa.inspect(op.get_bind()).get_columns("sales")}


def upgrade():
    # Older production databases may have received one or more of these
    # columns from the previous runtime bootstrap, so make this migration
    # idempotent while bringing every database to the same schema.
    columns = _sales_column_names()
    additions = (
        ("sale_type", sa.Column("sale_type", sa.String(length=50), nullable=False, server_default="standard")),
        ("paid_amount", sa.Column("paid_amount", sa.Numeric(precision=12, scale=2), nullable=False, server_default="0")),
        ("status", sa.Column("status", sa.String(length=32), nullable=False, server_default="unpaid")),
        ("profit_amount", sa.Column("profit_amount", sa.Numeric(precision=12, scale=2), nullable=False, server_default="0")),
        ("profit_recognized", sa.Column("profit_recognized", sa.Boolean(), nullable=False, server_default=sa.false())),
    )
    for name, column in additions:
        if name not in columns:
            op.add_column("sales", column)

    inspector = sa.inspect(op.get_bind())
    if not inspector.has_table("sale_payments"):
        op.create_table(
            "sale_payments",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("sale_id", sa.Integer(), sa.ForeignKey("sales.id"), nullable=False),
            sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
            sa.Column("recorded_by", sa.Integer(), nullable=True),
            sa.Column("recorded_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        )
        op.create_index("ix_sale_payments_sale_id", "sale_payments", ["sale_id"], unique=False)


def downgrade():
    inspector = sa.inspect(op.get_bind())
    if inspector.has_table("sale_payments"):
        op.drop_table("sale_payments")

    columns = _sales_column_names()
    for name in ("profit_recognized", "profit_amount", "status", "paid_amount", "sale_type"):
        if name in columns:
            op.drop_column("sales", name)
