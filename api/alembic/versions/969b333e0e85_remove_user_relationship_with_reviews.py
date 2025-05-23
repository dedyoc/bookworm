"""Remove user relationship with reviews

Revision ID: 969b333e0e85
Revises: 106c4373cb1c
Create Date: 2025-05-05 15:30:16.494682

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '969b333e0e85'
down_revision: Union[str, None] = '106c4373cb1c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('review', 'user_id')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('review', sa.Column('user_id', sa.BIGINT(), autoincrement=False, nullable=False))
    # ### end Alembic commands ###
