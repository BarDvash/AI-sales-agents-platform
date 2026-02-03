"""add_channel_support

Revision ID: a4b0c2a94826
Revises: cec494bf4270
Create Date: 2026-02-03 06:59:39.198535+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a4b0c2a94826'
down_revision: Union[str, None] = 'cec494bf4270'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add channel column to messages table (default: telegram for existing messages)
    op.add_column(
        'messages',
        sa.Column('channel', sa.String(), nullable=True, server_default='telegram')
    )

    # Add telegram_config JSON column to tenants table
    op.add_column(
        'tenants',
        sa.Column('telegram_config', sa.JSON(), nullable=True)
    )

    # Add whatsapp_config JSON column to tenants table
    op.add_column(
        'tenants',
        sa.Column('whatsapp_config', sa.JSON(), nullable=True)
    )

    # Migrate existing bot_token to telegram_config
    # This uses raw SQL to update existing tenants
    op.execute("""
        UPDATE tenants
        SET telegram_config = jsonb_build_object('bot_token', bot_token, 'enabled', true)
        WHERE bot_token IS NOT NULL
    """)


def downgrade() -> None:
    # Remove the new columns
    op.drop_column('messages', 'channel')
    op.drop_column('tenants', 'telegram_config')
    op.drop_column('tenants', 'whatsapp_config')
