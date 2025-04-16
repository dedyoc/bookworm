from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional

from sqlalchemy import BigInteger, Numeric
from sqlmodel import Field, Relationship, SQLModel

from src.auth.models import User
from src.book.models import Book
from src.models import TimestampModel


class OrderStatus(str, Enum):
    """Enum for order status values."""

    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderItemBase(SQLModel):
    """Base order item model with common fields.

    Attributes:
        order_id: The ID of the order this item belongs to.
        book_id: The ID of the book being ordered.
        quantity: The quantity of books ordered.
        price: The price of the book at the time of order.
    """

    order_id: int = Field(sa_type=BigInteger, foreign_key="order.id")
    book_id: int = Field(sa_type=BigInteger, foreign_key="book.id")
    quantity: int = Field(ge=1)
    price: Decimal = Field(sa_type=Numeric(10, 2), ge=0)


class OrderItem(OrderItemBase, TimestampModel, table=True):
    """Database model for an order item.

    Attributes:
        id: The primary key of the order item.
        book: Relationship to the book being ordered.
        order: Relationship to the parent order.
    """

    id: Optional[int] = Field(sa_type=BigInteger, default=None, primary_key=True)

    book: Book = Relationship()
    order: "Order" = Relationship(back_populates="items")


class OrderBase(SQLModel):
    """Base order model with common fields.

    Attributes:
        user_id: The ID of the user who placed the order.
        order_date: The date and time when the order was placed.
        order_amount: The total amount of the order.
        status: The current status of the order.
    """

    user_id: int = Field(sa_type=BigInteger, foreign_key="user.id")
    order_date: datetime = Field(default_factory=datetime.now)
    order_amount: Decimal = Field(sa_type=Numeric(10, 2), ge=0)
    status: OrderStatus = Field(default=OrderStatus.PENDING)


class Order(OrderBase, TimestampModel, table=True):
    """Database model for an order.

    Attributes:
        id: The primary key of the order.
        user: Relationship to the user who placed the order.
        items: Relationship to the order items.
    """

    id: Optional[int] = Field(sa_type=BigInteger, default=None, primary_key=True)

    user: User = Relationship()
    items: List[OrderItem] = Relationship(back_populates="order")


class OrderItemCreate(SQLModel):
    """Model for creating a new order item.

    Attributes:
        book_id: The ID of the book being ordered.
        quantity: The quantity of books ordered.
    """

    book_id: int
    quantity: int = Field(ge=1)


class OrderCreate(SQLModel):
    """Model for creating a new order.

    Attributes:
        items: The list of items to include in the order.
    """

    items: List[OrderItemCreate]


class OrderItemResponse(OrderItemBase):
    """Response model for order item information.

    Attributes:
        id: The ID of the order item.
    """

    id: int


class OrderResponse(OrderBase):
    """Response model for order information.

    Attributes:
        id: The ID of the order.
        items: The list of items in the order.
    """

    id: int
    items: List[OrderItemResponse]


class OrderUpdate(SQLModel):
    """Model for updating an existing order.

    All fields are optional to allow partial updates.

    Attributes:
        status: The new status of the order.
    """

    status: Optional[OrderStatus] = None
