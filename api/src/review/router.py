from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.database import get_session
from src.pagination import PageResponse, PaginationParams
from src.review.models import ReviewCreate, ReviewResponse, ReviewUpdate
from src.review.service import (
    create_review,
    delete_review,
    get_review,
    get_reviews,
    update_review,
)

router = APIRouter(prefix="/reviews", tags=["reviews"])
"""Review related routes."""


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review_endpoint(
    review_in: ReviewCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Creates a new review.

    Args:
        review_in: The review data for creation.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The created review.
    """
    return create_review(
        session=session, review_create=review_in, user_id=current_user.id
    )


@router.get("/", response_model=PageResponse[ReviewResponse])
def read_reviews(
    pagination: PaginationParams = Depends(),
    book_id: Optional[int] = Query(None, description="Filter by book ID"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    session: Session = Depends(get_session),
) -> Any:
    """Gets a paginated list of reviews with optional filtering.

    Args:
        pagination: The pagination parameters dependency.
        book_id: Optional filter by book ID.
        user_id: Optional filter by user ID.
        session: The database session dependency.

    Returns:
        A paginated response containing reviews.
    """
    return get_reviews(
        session=session,
        pagination=pagination,
        book_id=book_id,
        user_id=user_id,
    )


@router.get("/{review_id}", response_model=ReviewResponse)
def read_review(
    review_id: int,
    session: Session = Depends(get_session),
) -> Any:
    """Gets a specific review by ID.

    Args:
        review_id: The ID of the review to retrieve.
        session: The database session dependency.

    Returns:
        The requested review.
    """
    return get_review(session=session, review_id=review_id)


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review_endpoint(
    review_id: int,
    review_in: ReviewUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Updates a review.

    Users can only update their own reviews.

    Args:
        review_id: The ID of the review to update.
        review_in: The review data to update.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The updated review.
    """
    return update_review(
        session=session,
        review_id=review_id,
        review_update=review_in,
        user_id=current_user.id,
    )


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review_endpoint(
    review_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    """Deletes a review.

    Users can only delete their own reviews, but admins can delete any review.

    Args:
        review_id: The ID of the review to delete.
        session: The database session dependency.
        current_user: The authenticated user dependency.
    """
    delete_review(
        session=session,
        review_id=review_id,
        user_id=current_user.id,
        is_admin=current_user.admin,
    )
