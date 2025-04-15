from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.book.models import Book, BookCreate, BookResponse, BookUpdate
from src.book.service import create_book, delete_book, get_book, get_books, update_book
from src.database import get_session
from src.pagination import PageResponse, PaginationParams

router = APIRouter(prefix="/books", tags=["books"])
"""Book related routes."""


@router.post("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book_endpoint(
    book_in: BookCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Creates a new book.

    Only admins can create books.

    Args:
        book_in: The book data for creation.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The created book.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return create_book(session=session, book_create=book_in)


@router.get("/", response_model=PageResponse[BookResponse])
def read_books(
    pagination: PaginationParams = Depends(),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    author_id: Optional[int] = Query(None, description="Filter by author ID"),
    session: Session = Depends(get_session),
) -> Any:
    """Gets a paginated list of books with optional filtering.

    Args:
        pagination: The pagination parameters dependency.
        category_id: Optional filter by category ID.
        author_id: Optional filter by author ID.
        session: The database session dependency.

    Returns:
        A paginated response containing books.
    """
    return get_books(
        session=session,
        pagination=pagination,
        category_id=category_id,
        author_id=author_id,
    )


@router.get("/{book_id}", response_model=BookResponse)
def read_book(
    book_id: int,
    session: Session = Depends(get_session),
) -> Any:
    """Gets a specific book by ID.

    Args:
        book_id: The ID of the book to retrieve.
        session: The database session dependency.

    Returns:
        The requested book.
    """
    return get_book(session=session, book_id=book_id)


@router.put("/{book_id}", response_model=BookResponse)
def update_book_endpoint(
    book_id: int,
    book_in: BookUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Updates a book.

    Only admins can update books.

    Args:
        book_id: The ID of the book to update.
        book_in: The book data to update.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The updated book.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return update_book(session=session, book_id=book_id, book_update=book_in)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book_endpoint(
    book_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    """Deletes a book.

    Only admins can delete books.

    Args:
        book_id: The ID of the book to delete.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    delete_book(session=session, book_id=book_id)
