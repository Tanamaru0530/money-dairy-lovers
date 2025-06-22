"""add_income_categories

Revision ID: 0fc9cf0a5617
Revises: 8eb9cc48da19
Create Date: 2025-06-19 14:13:40.567936

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0fc9cf0a5617'
down_revision: Union[str, None] = '8eb9cc48da19'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 収入カテゴリを追加
    op.execute("""
        INSERT INTO categories (id, name, icon, color, is_default, is_love_category, sort_order)
        VALUES 
        (gen_random_uuid(), '給与', '💵', '#4CAF50', true, false, 11),
        (gen_random_uuid(), 'ボーナス', '💰', '#8BC34A', true, false, 12),
        (gen_random_uuid(), '副収入', '💸', '#CDDC39', true, false, 13),
        (gen_random_uuid(), '投資収益', '📈', '#FFC107', true, false, 14),
        (gen_random_uuid(), '臨時収入', '🎁', '#FF9800', true, false, 15),
        (gen_random_uuid(), 'その他収入', '💱', '#795548', true, false, 16)
    """)


def downgrade() -> None:
    # 収入カテゴリを削除
    op.execute("""
        DELETE FROM categories 
        WHERE name IN ('給与', 'ボーナス', '副収入', '投資収益', '臨時収入', 'その他収入')
        AND is_default = true
    """)