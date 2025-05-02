from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.book.models import BookCreate, BookResponse, BookUpdate
from src.book.service import (
    SortMode,
    create_book,
    delete_book,
    get_book,
    get_books,
    get_popular_book,
    get_recommended_book,
    get_top_discounted_books,
    update_book,
)
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


@router.get("/recommended", response_model=List[BookResponse])
def get_recommended_endpoint(
    session: Session = Depends(get_session),
) -> Any:
    """Gets the recommended books for the current user.

    Args:
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        A list of recommended books.
    """
    return get_recommended_book(session=session)


@router.get("/popular", response_model=List[BookResponse])
def get_popular_endpoint(
    session: Session = Depends(get_session),
) -> Any:
    """Gets the popular books.

    Args:
        session: The database session dependency.

    Returns:
        A list of popular books.
    """
    return get_popular_book(session=session)


@router.get("/top-discounted", response_model=List[BookResponse])
def get_top_discounted_endpoint(
    session: Session = Depends(get_session),
) -> Any:
    """Gets the top discounted books.

    Args:
        pagination: The pagination parameters dependency.
        session: The database session dependency.

    Returns:
        A paginated response containing the top discounted books.
    """
    return get_top_discounted_books(session=session)


@router.get("/", response_model=PageResponse[BookResponse])
def read_books(
    pagination: PaginationParams = Depends(),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    author_id: Optional[int] = Query(None, description="Filter by author ID"),
    min_rating: Optional[int] = Query(
        None, ge=1, le=5, description="Filter by min rating (1 to 5)"
    ),
    sort_mode: Optional[SortMode] = None,
    session: Session = Depends(get_session),
) -> Any:
    """Gets a paginated list of books with optional filtering.

    Args:
        pagination: The pagination parameters dependency.
        category_id: Optional filter by category ID.
        author_id: Optional filter by author ID.
        rating: Optional filter by rating (1 to 5).
        sort_mode: Optional sorting mode for books.
        session: The database session dependency.

    Returns:
        A paginated response containing books.
    """
    return get_books(
        session=session,
        pagination=pagination,
        category_id=category_id,
        author_id=author_id,
        rating=min_rating,
        sort_mode=sort_mode,
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


# Use different
# @router.get("/featured/{featured_type}", response_model=List[BookResponse])
# def get_featured_books(
#     featured_type: FeaturedBook,
#     session: Session = Depends(get_session),
# ) -> Any:
#     """Gets the featured books.

#     Args:
#         session: The database session dependency.

#     Returns:
#         A list of featured books.
#     """
#     return get_featured_book(session=session, feature=featured_type)
