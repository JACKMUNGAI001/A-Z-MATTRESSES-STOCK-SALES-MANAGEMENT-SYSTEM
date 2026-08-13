"""add missing reporting indexes for performance

Revision ID: a1b2c3d4e5f6
Revises: e5f6a7b8c9d0
Create Date: 2026-08-12 10:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'e5f6a7b8c9d0'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('sales', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_sales_sale_type'), ['sale_type'], unique=False)
        batch_op.create_index(batch_op.f('ix_sales_status'), ['status'], unique=False)

    with op.batch_alter_table('shop_stocks', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_shop_stocks_quantity'), ['quantity'], unique=False)
        batch_op.create_index(batch_op.f('ix_shop_stocks_shop_id'), ['shop_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_shop_stocks_item_id'), ['item_id'], unique=False)

    with op.batch_alter_table('sale_items', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_sale_items_sale_id'), ['sale_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_sale_items_item_id'), ['item_id'], unique=False)

    with op.batch_alter_table('items', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_items_category_id'), ['category_id'], unique=False)


def downgrade():
    with op.batch_alter_table('items', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_items_category_id'))

    with op.batch_alter_table('sale_items', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_sale_items_item_id'))
        batch_op.drop_index(batch_op.f('ix_sale_items_sale_id'))

    with op.batch_alter_table('shop_stocks', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_shop_stocks_item_id'))
        batch_op.drop_index(batch_op.f('ix_shop_stocks_shop_id'))
        batch_op.drop_index(batch_op.f('ix_shop_stocks_quantity'))

    with op.batch_alter_table('sales', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_sales_status'))
        batch_op.drop_index(batch_op.f('ix_sales_sale_type'))
