from datetime import datetime
from typing import Optional

from pydantic import Field, conint
from sqlalchemy import BigInteger
from sqlmodel import Field, Relationship, SQLModel

from src.auth.models import User
from src.book.models import Book
from src.models import TimestampModel


class ReviewBase(SQLModel):
    """Base review model with common fields.

    Attributes:
        book_id: The ID of the book being reviewed.
        user_id: The ID of the user who wrote the review.
        rating: The rating given (1-5 stars).
        review_title: The title of the review.
        review_details: Optional detailed review text.
        review_date: The date and time when the review was submitted.
    """

    book_id: int = Field(sa_type=BigInteger, foreign_key="book.id")
    user_id: int = Field(sa_type=BigInteger, foreign_key="user.id")
    rating: int = Field(ge=1, le=5)
    review_title: str = Field(max_length=120)
    review_details: Optional[str] = None
    review_date: datetime = Field(default_factory=datetime.now)


class Review(ReviewBase, table=True):
    """Database model for a review.

    Attributes:
        id: The primary key of the review.
        book: Relationship to the book being reviewed.
        user: Relationship to the user who wrote the review.
    """

    id: Optional[int] = Field(sa_type=BigInteger, default=None, primary_key=True)

    book: Book = Relationship()
    user: User = Relationship()


class ReviewCreate(ReviewBase):
    """Model for creating a new review."""

    pass


class ReviewUpdate(SQLModel):
    """Model for updating an existing review.

    All fields are optional to allow partial updates.
    """

    rating: Optional[int] = Field(default=None, ge=1, le=5)
    review_title: Optional[str] = Field(default=None, max_length=120)
    review_details: Optional[str] = None


class ReviewResponse(ReviewBase):
    """Response model for review information.

    Attributes:
        id: The ID of the review.
    """

    id: int
