"""add manager gas restock permission

Revision ID: d4e5f6a7b8c9
Revises: c7e1a3f9d2b4
"""
from alembic import op
import sqlalchemy as sa

revision = 'd4e5f6a7b8c9'
down_revision = 'c7e1a3f9d2b4'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('can_restock_gas', sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('can_restock_gas')
