"""add cylinder exchange tracking

Revision ID: f7a8b9c0d1e2
Revises: a1b2c3d4e5f6
Create Date: 2026-08-12 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'f7a8b9c0d1e2'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None

def upgrade():
    bind = op.get_bind()
    tables = sa.inspect(bind).get_table_names()
    if 'empty_cylinder_stocks' not in tables:
        op.create_table('empty_cylinder_stocks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('shop_id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['shop_id'], ['shops.id']),
        sa.ForeignKeyConstraint(['item_id'], ['items.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('shop_id', 'item_id', name='uq_empty_cylinder_shop_item'))
    if 'sale_cylinder_returns' not in tables:
        op.create_table('sale_cylinder_returns',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sale_id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('sold_qty', sa.Integer(), nullable=False),
        sa.Column('returned_qty', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['sale_id'], ['sales.id']),
        sa.ForeignKeyConstraint(['item_id'], ['items.id']),
        sa.PrimaryKeyConstraint('id'))
        op.create_index('ix_sale_cylinder_returns_sale_id', 'sale_cylinder_returns', ['sale_id'])
        op.create_index('ix_sale_cylinder_returns_item_id', 'sale_cylinder_returns', ['item_id'])

def downgrade():
    tables = sa.inspect(op.get_bind()).get_table_names()
    if 'sale_cylinder_returns' in tables:
        op.drop_index('ix_sale_cylinder_returns_item_id', table_name='sale_cylinder_returns')
        op.drop_index('ix_sale_cylinder_returns_sale_id', table_name='sale_cylinder_returns')
        op.drop_table('sale_cylinder_returns')
    if 'empty_cylinder_stocks' in tables:
        op.drop_table('empty_cylinder_stocks')
