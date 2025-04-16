from datetime import datetime
from enum import Enum
from typing import List, Optional

import sqlmodel
from sqlmodel import Session, select

from src.review.models import Review
from src.discount.models import Discount
from src.book.models import Book, BookCreate, BookUpdate
from src.exceptions import NotFoundError
from src.pagination import PageResponse, PaginationParams

# Give me state to choose 4 different sort mode from: on sale, popularity, price low to high, price high to low


class SortMode(Enum):
    ON_SALE = "on_sale"
    POPULARITY = "popularity"
    PRICE_LOW_TO_HIGH = "price_low_to_high"
    PRICE_HIGH_TO_LOW = "price_high_to_low"


def create_book(session: Session, book_create: BookCreate) -> Book:
    """Creates a new book.

    Args:
        session: The database session.
        book_create: The book data for creation.

    Returns:
        The newly created book.
    """
    book = Book.model_validate(book_create)
    session.add(book)
    session.commit()
    session.refresh(book)
    return book


def get_book(session: Session, book_id: int) -> Book:
    """Gets a book by ID.

    Args:
        session: The database session.
        book_id: The ID of the book to retrieve.

    Returns:
        The requested book.

    Raises:
        NotFoundError: If the book doesn't exist.
    """
    book = session.get(Book, book_id)
    if not book:
        raise NotFoundError(f"Book with ID {book_id} not found")
    return book


def get_books(
    session: Session,
    pagination: PaginationParams,
    category_id: Optional[int] = None,
    author_id: Optional[int] = None,
    sort_mode: Optional[SortMode] = None,
) -> PageResponse[Book]:
    """Gets a paginated list of books with optional filtering.

    Args:
        session: The database session.
        pagination: Pagination parameters.
        category_id: Optional filter by category ID.
        author_id: Optional filter by author ID.

    Returns:
        A paginated response containing books.
    """
    statement = select(Book)
    if sort_mode == SortMode.ON_SALE:
        statement = statement.join(Discount)
        statement = statement.order_by(
            (Book.book_price - Discount.discount_price).desc(),
            Book.book_price.asc(),
        )
    elif sort_mode == SortMode.POPULARITY:
        statement = statement.join(Review)
        statement = statement.order_by(
            sqlmodel.func.count().desc(),
            Book.book_price.asc(),
        ).group_by(Book.id)
    elif sort_mode == SortMode.PRICE_LOW_TO_HIGH:
        statement = statement.order_by(Book.book_price.asc())
    elif sort_mode == SortMode.PRICE_HIGH_TO_LOW:
        statement = statement.order_by(Book.book_price.desc())
    else:
        statement = statement.order_by(Book.book_title.asc())
    if category_id is not None:
        statement = statement.where(Book.category_id == category_id)
    if author_id is not None:
        statement = statement.where(Book.author_id == author_id)

    statement = statement.order_by(Book.book_title)

    results = session.exec(
        statement.offset(pagination.offset).limit(pagination.page_size)
    )
    books = results.all()

    count_statement = select(sqlmodel.func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    return PageResponse.create(items=books, total=total, params=pagination)


def update_book(session: Session, book_id: int, book_update: BookUpdate) -> Book:
    """Updates a book.

    Args:
        session: The database session.
        book_id: The ID of the book to update.
        book_update: The book data to update.

    Returns:
        The updated book.

    Raises:
        NotFoundError: If the book doesn't exist.
    """
    book = get_book(session, book_id)

    update_data = book_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(book, key, value)
    book.updated_at = datetime.now()
    session.add(book)
    session.commit()
    session.refresh(book)
    return book


def delete_book(session: Session, book_id: int) -> None:
    """Deletes a book.

    Args:
        session: The database session.
        book_id: The ID of the book to delete.

    Raises:
        NotFoundError: If the book doesn't exist.
    """
    book = get_book(session, book_id)
    session.delete(book)
    session.commit()


def get_top_discounted_books(session: Session, limit: int = 10) -> List[Book]:
    """Gets the top discounted books.

    Args:
        session: The database session.
        limit: The maximum number of books to retrieve.

    Returns:
        A list of the top discounted books.
    """
    statement = (
        select(Book)
        .join(Discount)
        .order_by((Book.book_price - Discount.discount_price).desc())
        .limit(limit)
    )
    results = session.exec(statement)
    books = results.all()

    count_statement = select(sqlmodel.func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    return PageResponse.create(
        items=books, total=total, params=PaginationParams(page_size=limit, page=1)
    )
