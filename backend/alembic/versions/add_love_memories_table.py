"""Add love_memories table

Revision ID: add_love_memories
Revises: 
Create Date: 2025-01-01 00:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = 'add_love_memories'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create love_memories table
    op.create_table('love_memories',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=uuid.uuid4),
        sa.Column('partnership_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('photos', sa.Text(), server_default='[]'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['event_id'], ['love_events.id'], ),
        sa.ForeignKeyConstraint(['partnership_id'], ['partnerships.id'], ),
        sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_love_memories_partnership_id'), 'love_memories', ['partnership_id'], unique=False)
    op.create_index(op.f('ix_love_memories_created_at'), 'love_memories', ['created_at'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_love_memories_created_at'), table_name='love_memories')
    op.drop_index(op.f('ix_love_memories_partnership_id'), table_name='love_memories')
    
    # Drop table
    op.drop_table('love_memories')