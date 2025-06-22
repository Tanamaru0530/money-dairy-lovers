"""add_recurring_transactions_table

Revision ID: e8f434d7c412
Revises: 0fc9cf0a5617
Create Date: 2025-06-20 12:18:32.007997

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8f434d7c412'
down_revision: Union[str, None] = '0fc9cf0a5617'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create recurring_transactions table
    op.create_table('recurring_transactions',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('category_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('transaction_type', sa.String(length=10), nullable=False),
        sa.Column('sharing_type', sa.String(length=10), nullable=False),
        sa.Column('payment_method', sa.String(length=20), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('frequency', sa.String(length=20), nullable=False),
        sa.Column('interval_value', sa.Integer(), nullable=True, default=1),
        sa.Column('day_of_month', sa.Integer(), nullable=True),
        sa.Column('day_of_week', sa.Integer(), nullable=True),
        sa.Column('next_execution_date', sa.Date(), nullable=False),
        sa.Column('last_execution_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('execution_count', sa.Integer(), nullable=True, default=0),
        sa.Column('max_executions', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.CheckConstraint('amount > 0', name='positive_recurring_amount'),
        sa.CheckConstraint("transaction_type IN ('income', 'expense')", name='valid_transaction_type'),
        sa.CheckConstraint("sharing_type IN ('personal', 'shared')", name='valid_sharing_type'),
        sa.CheckConstraint("frequency IN ('daily', 'weekly', 'monthly', 'yearly')", name='valid_frequency'),
        sa.CheckConstraint('interval_value > 0', name='positive_interval'),
        sa.CheckConstraint('day_of_month >= 1 AND day_of_month <= 31', name='valid_day_of_month'),
        sa.CheckConstraint('day_of_week >= 0 AND day_of_week <= 6', name='valid_day_of_week'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_recurring_transactions_user_id', 'recurring_transactions', ['user_id'])
    op.create_index('ix_recurring_transactions_next_execution', 'recurring_transactions', ['next_execution_date'])
    op.create_index('ix_recurring_transactions_active', 'recurring_transactions', ['is_active'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_recurring_transactions_active', table_name='recurring_transactions')
    op.drop_index('ix_recurring_transactions_next_execution', table_name='recurring_transactions')
    op.drop_index('ix_recurring_transactions_user_id', table_name='recurring_transactions')
    
    # Drop table
    op.drop_table('recurring_transactions')