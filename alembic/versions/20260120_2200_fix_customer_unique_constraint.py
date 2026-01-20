"""Fix customer unique constraint for multi-tenant

Revision ID: 003_customer_constraint
Revises: 002_unit_currency
Create Date: 2026-01-20 22:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_customer_constraint'
down_revision = '002_unit_currency'
branch_labels = None
depends_on = None


def upgrade():
    # Drop the old unique constraint on chat_id
    op.drop_constraint('customers_chat_id_key', 'customers', type_='unique')
    
    # Add new composite unique constraint on (tenant_id, chat_id)
    op.create_unique_constraint('uq_tenant_chat', 'customers', ['tenant_id', 'chat_id'])


def downgrade():
    # Drop the composite constraint
    op.drop_constraint('uq_tenant_chat', 'customers', type_='unique')
    
    # Re-add the old unique constraint on chat_id
    op.create_unique_constraint('customers_chat_id_key', 'customers', ['chat_id'])
