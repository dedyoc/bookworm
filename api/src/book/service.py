from datetime import datetime
from typing import List, Optional

import sqlmodel
from sqlmodel import Session, select

from src.book.models import Book, BookCreate, BookUpdate
from src.exceptions import NotFoundError
from src.pagination import PageResponse, PaginationParams


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

    # Apply filters if provided
    if category_id is not None:
        statement = statement.where(Book.category_id == category_id)
    if author_id is not None:
        statement = statement.where(Book.author_id == author_id)

    # Apply ordering
    statement = statement.order_by(Book.book_title)

    # Execute with pagination
    results = session.exec(
        statement.offset(pagination.offset).limit(pagination.page_size)
    )
    books = results.all()

    # Get total count for pagination
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
