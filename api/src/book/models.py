from decimal import Decimal
from typing import Optional

from sqlalchemy import BigInteger, Numeric
from sqlmodel import Field, Relationship, SQLModel

from src.author.models import Author
from src.category.models import Category
from src.models import TimestampModel


class BookBase(SQLModel):
    """Base book model with common fields.

    Attributes:
        book_title: The title of the book.
        book_summary: An optional summary or description of the book.
        book_price: The price of the book.
        book_cover_photo: An optional URL or path to the book's cover image.
        category_id: The ID of the category this book belongs to.
        author_id: The ID of the book's author.
    """

    book_title: str = Field(index=True, max_length=255)
    book_summary: Optional[str] = Field(default=None)
    book_price: Decimal = Field(sa_type=Numeric(10, 2), ge=0)
    book_cover_photo: Optional[str] = Field(default=None, max_length=255)
    category_id: int = Field(sa_type=BigInteger, foreign_key="category.id")
    author_id: int = Field(sa_type=BigInteger, foreign_key="author.id")


class Book(BookBase, TimestampModel, table=True):
    """Database model for a book.

    Attributes:
        id: The primary key of the book.
        category: Relationship to the book's category.
        author: Relationship to the book's author.
    """

    id: Optional[int] = Field(sa_type=BigInteger, default=None, primary_key=True)

    category: Category = Relationship()
    author: Author = Relationship()


class BookCreate(BookBase):
    """Model for creating a new book."""

    pass


class BookUpdate(SQLModel):
    """Model for updating an existing book.

    All fields are optional to allow partial updates.
    """

    book_title: Optional[str] = Field(default=None, max_length=255)
    book_summary: Optional[str] = None
    book_price: Optional[Decimal] = Field(default=None, ge=0)
    book_cover_photo: Optional[str] = Field(default=None, max_length=255)
    category_id: Optional[int] = None
    author_id: Optional[int] = None


class BookResponse(BookBase):
    """Response model for book information.

    Attributes:
        id: The ID of the book.
    """

    id: int
