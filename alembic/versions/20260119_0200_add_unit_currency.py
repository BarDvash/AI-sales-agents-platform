"""Add unit and currency fields

Revision ID: 002_unit_currency
Revises: 001_initial
Create Date: 2026-01-19 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_unit_currency'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade():
    # Add currency column to tenants table
    op.add_column('tenants', sa.Column('currency', sa.String(), nullable=False, server_default='NIS'))

    # Add unit column to products table
    op.add_column('products', sa.Column('unit', sa.String(), nullable=False, server_default='kg'))


def downgrade():
    # Remove columns if we need to rollback
    op.drop_column('products', 'unit')
    op.drop_column('tenants', 'currency')
