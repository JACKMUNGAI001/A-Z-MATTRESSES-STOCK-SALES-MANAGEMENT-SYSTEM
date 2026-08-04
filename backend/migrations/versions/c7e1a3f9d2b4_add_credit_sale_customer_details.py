"""add credit sale customer details

Revision ID: c7e1a3f9d2b4
Revises: b4f8c2d1e6a9
Create Date: 2026-08-04 16:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "c7e1a3f9d2b4"
down_revision = "b4f8c2d1e6a9"
branch_labels = None
depends_on = None


def upgrade():
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("sales")}
    if "customer_name" not in columns:
        op.add_column("sales", sa.Column("customer_name", sa.String(length=255), nullable=True))
    if "customer_phone" not in columns:
        op.add_column("sales", sa.Column("customer_phone", sa.String(length=50), nullable=True))


def downgrade():
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("sales")}
    if "customer_phone" in columns:
        op.drop_column("sales", "customer_phone")
    if "customer_name" in columns:
        op.drop_column("sales", "customer_name")
