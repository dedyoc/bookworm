from datetime import datetime
from typing import List, Optional

import sqlmodel
from fastapi import HTTPException, status
from sqlmodel import Session, select


from src.exceptions import NotFoundError
from src.pagination import PageResponse, PaginationParams
from src.review.models import RatingStar, Review, ReviewCreate, ReviewUpdate


def create_review(
    session: Session, review_create: ReviewCreate, user_id: int
) -> Review:
    """Creates a new review.

    Args:
        session: The database session.
        review_create: The review data for creation.
        user_id: The ID of the user creating the review.

    Returns:
        The newly created review.

    Raises:
        DuplicateReviewError: If the user has already reviewed this book.
    """
    # Check if the review already exists, but this is not needed in this case

    # get_book(session=session, book_id=review_create.book_id)

    # statement = select(Review).where(
    #     Review.book_id == review_create.book_id, Review.user_id == user_id
    # )
    # existing_review = session.exec(statement).first()
    # if existing_review:
    #     raise DuplicateReviewError()

    # Create new review with the authenticated user's ID
    review = Review.model_validate(review_create, update={"user_id": user_id})
    session.add(review)
    session.commit()
    session.refresh(review)
    return review


async def get_review(session: Session, review_id: int) -> Review:
    """Gets a review by ID.

    Args:
        session: The database session.
        review_id: The ID of the review to retrieve.

    Returns:
        The requested review.

    Raises:
        NotFoundError: If the review doesn't exist.
    """
    review = await session.get(Review, review_id)
    if not review:
        raise NotFoundError(f"Review with ID {review_id} not found")
    return review


def get_reviews(
    session: Session,
    pagination: PaginationParams,
    book_id: Optional[int] = None,
    user_id: Optional[int] = None,
    rating_star: Optional[RatingStar] = None,
    asc: Optional[bool] = False,
) -> PageResponse[Review]:
    """Gets a paginated list of reviews with optional filtering.

    Args:
        session: The database session.
        pagination: Pagination parameters.
        book_id: Optional filter by book ID.
        user_id: Optional filter by user ID.

    Returns:
        A paginated response containing reviews.
    """
    statement = select(Review)

    if book_id is not None:
        statement = statement.where(Review.book_id == book_id)
    if user_id is not None:
        statement = statement.where(Review.user_id == user_id)
    if rating_star is not None:
        statement = statement.where(Review.rating == rating_star)
    if asc:
        statement = statement.order_by(Review.review_date.asc())
    else:
        statement = statement.order_by(Review.review_date.desc())

    results = session.exec(
        statement.offset(pagination.offset).limit(pagination.page_size)
    )
    reviews = results.all()

    count_statement = select(sqlmodel.func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    return PageResponse.create(items=reviews, total=total, params=pagination)


def update_review(
    session: Session, review_id: int, review_update: ReviewUpdate, user_id: int
) -> Review:
    """Updates a review.

    Args:
        session: The database session.
        review_id: The ID of the review to update.
        review_update: The review data to update.
        user_id: The ID of the user making the update.

    Returns:
        The updated review.

    Raises:
        NotFoundError: If the review doesn't exist.
        HTTPException: If the user doesn't own the review.
    """
    review = get_review(session, review_id)

    # Check if user owns the review
    if review.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own reviews",
        )

    update_data = review_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(review, key, value)
    review.review_date = datetime.now()
    review.updated_at = datetime.now()

    session.add(review)
    session.commit()
    session.refresh(review)
    return review


async def delete_review(
    session: Session, review_id: int, user_id: int, is_admin: bool
) -> None:
    """Deletes a review.

    Args:
        session: The database session.
        review_id: The ID of the review to delete.
        user_id: The ID of the user attempting to delete.
        is_admin: Whether the user is an admin.

    Raises:
        NotFoundError: If the review doesn't exist.
        HTTPException: If the user doesn't own the review and is not an admin.
    """
    review = await get_review(session, review_id)

    if review.user_id != user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews",
        )

    await session.delete(review)
    await session.commit()
