"""Change OrderItem table name to order_item

Revision ID: d385347b4a8c
Revises: 29c9464bf0f0
Create Date: 2025-04-18 09:39:02.559340

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "d385347b4a8c"
down_revision: Union[str, None] = "29c9464bf0f0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the new table
    op.create_table(
        "order_item",
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("order_id", sa.BigInteger(), nullable=False),
        sa.Column("book_id", sa.BigInteger(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.ForeignKeyConstraint(
            ["book_id"],
            ["book.id"],
        ),
        sa.ForeignKeyConstraint(
            ["order_id"],
            ["order.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Migrate data from orderitem to order_item
    op.execute("""
        INSERT INTO order_item (id, created_at, updated_at, order_id, book_id, quantity, price)
        SELECT id, created_at, updated_at, order_id, book_id, quantity, price
        FROM orderitem
    """)

    # Drop the old table
    op.drop_table("orderitem")


def downgrade() -> None:
    """Downgrade schema."""
    # Recreate the old table
    op.create_table(
        "orderitem",
        sa.Column(
            "created_at", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.Column(
            "updated_at", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.Column("order_id", sa.BIGINT(), autoincrement=False, nullable=False),
        sa.Column("book_id", sa.BIGINT(), autoincrement=False, nullable=False),
        sa.Column("quantity", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column(
            "price",
            sa.NUMERIC(precision=10, scale=2),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column("id", sa.BIGINT(), autoincrement=True, nullable=False),
        sa.ForeignKeyConstraint(
            ["book_id"], ["book.id"], name="orderitem_book_id_fkey"
        ),
        sa.ForeignKeyConstraint(
            ["order_id"], ["order.id"], name="orderitem_order_id_fkey"
        ),
        sa.PrimaryKeyConstraint("id", name="orderitem_pkey"),
    )

    # Migrate data back from order_item to orderitem
    op.execute("""
        INSERT INTO orderitem (id, created_at, updated_at, order_id, book_id, quantity, price)
        SELECT id, created_at, updated_at, order_id, book_id, quantity, price
        FROM order_item
    """)

    # Drop the new table
    op.drop_table("order_item")
