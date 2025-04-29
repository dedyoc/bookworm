from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.author.models import Author, AuthorCreate, AuthorResponse, AuthorUpdate
from src.author.service import (
    create_author,
    delete_author,
    get_all_authors,
    get_author,
    get_authors,
    update_author,
)
from src.database import get_session
from src.pagination import PageResponse, PaginationParams

router = APIRouter(prefix="/authors", tags=["authors"])
"""Author related routes."""


@router.post("/", response_model=AuthorResponse, status_code=status.HTTP_201_CREATED)
def create_author_endpoint(
    author_in: AuthorCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Creates a new author.

    Only admins can create authors.

    Args:
        author_in: The author data for creation.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The created author.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return create_author(session=session, author_create=author_in)


@router.get("/all", response_model=List[AuthorResponse])
def read_all_authors(session: Session = Depends(get_session)) -> Any:
    """Gets all authors.

    Args:
        session: The database session dependency.

    Returns:
        A list of all authors.
    """
    return get_all_authors(session=session)


@router.get("/", response_model=PageResponse[AuthorResponse])
def read_authors(
    pagination: PaginationParams = Depends(),
    session: Session = Depends(get_session),
) -> Any:
    """Gets a paginated list of authors.

    Args:
        pagination: The pagination parameters dependency.
        session: The database session dependency.

    Returns:
        A paginated response containing authors.
    """
    return get_authors(session=session, pagination=pagination)


@router.get("/{author_id}", response_model=AuthorResponse)
def read_author(
    author_id: int,
    session: Session = Depends(get_session),
) -> Any:
    """Gets a specific author by ID.

    Args:
        author_id: The ID of the author to retrieve.
        session: The database session dependency.

    Returns:
        The requested author.
    """
    return get_author(session=session, author_id=author_id)


@router.put("/{author_id}", response_model=AuthorResponse)
def update_author_endpoint(
    author_id: int,
    author_in: AuthorUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Updates an author.

    Only admins can update authors.

    Args:
        author_id: The ID of the author to update.
        author_in: The author data to update.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The updated author.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return update_author(session=session, author_id=author_id, author_update=author_in)


@router.delete("/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_author_endpoint(
    author_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    """Deletes an author.

    Only admins can delete authors.

    Args:
        author_id: The ID of the author to delete.
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

    delete_author(session=session, author_id=author_id)
