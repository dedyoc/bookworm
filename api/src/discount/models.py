from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import BigInteger, Numeric
from sqlmodel import Field, Relationship, SQLModel

from src.book.models import Book
from src.models import TimestampModel


class DiscountBase(SQLModel):
    """Base discount model with common fields.

    Attributes:
        book_id: The ID of the book being discounted.
        discount_price: The discounted price of the book.
        discount_start_date: Optional start date for the discount period.
        discount_end_date: Optional end date for the discount period.
    """

    book_id: int = Field(sa_type=BigInteger, foreign_key="book.id")
    discount_price: Decimal = Field(sa_type=Numeric(10, 2), ge=0)
    discount_start_date: Optional[date] = Field(default=None)
    discount_end_date: Optional[date] = Field(default=None)


class Discount(DiscountBase, TimestampModel, table=True):
    """Database model for a discount.

    Attributes:
        id: The primary key of the discount.
        book: Relationship to the book being discounted.
    """

    id: Optional[int] = Field(sa_type=BigInteger, default=None, primary_key=True)

    book: Book = Relationship()


class DiscountCreate(DiscountBase):
    """Model for creating a new discount."""

    pass


class DiscountUpdate(SQLModel):
    """Model for updating an existing discount.

    All fields are optional to allow partial updates.
    """

    discount_price: Optional[Decimal] = Field(default=None, ge=0)
    discount_start_date: Optional[date] = None
    discount_end_date: Optional[date] = None


class DiscountResponse(DiscountBase):
    """Response model for discount information.

    Attributes:
        id: The ID of the discount.
    """

    id: int
