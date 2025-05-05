from datetime import datetime
from typing import List, Optional

import sqlmodel
from fastapi import HTTPException, status
from sqlmodel import Session, select
from sqlalchemy import case, func

from src.exceptions import NotFoundError
from src.pagination import PageResponse, PaginationParams
from src.review.models import (
    BookRatingStatsResponse,
    Review,
    ReviewCreate,
    ReviewUpdate,
)


def create_review(session: Session, review_create: ReviewCreate) -> Review:
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
    review = Review.model_validate(review_create)
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
    rating_star: Optional[int] = None,
    asc: Optional[bool] = False,
) -> PageResponse[Review]:
    """Retrieves a paginated list of reviews based on optional filters.

    Args:
        session: The database session.
        pagination: Pagination parameters (page, size).
        book_id: Optional book ID to filter by.
        user_id: Optional user ID to filter by.
        rating_star: Optional rating (1-5) to filter by.
        asc: Optional boolean to sort by rating ascending. Defaults to descending.

    Returns:
        A PageResponse containing the list of reviews and pagination details.
    """
    query = select(Review)

    if book_id is not None:
        query = query.where(Review.book_id == book_id)
    if user_id is not None:
        query = query.where(Review.user_id == user_id)
    if rating_star is not None:
        query = query.where(Review.rating == rating_star)

    if asc is not None:
        order_by_column = Review.rating
        query = query.order_by(order_by_column.asc() if asc else order_by_column.desc())
    else:
        # Default sort by review_date desc
        query = query.order_by(Review.review_date.desc())

    total_count_query = select(sqlmodel.func.count()).select_from(query.subquery())
    total_count = session.exec(total_count_query).one()

    paginated_query = query.offset(pagination.offset).limit(pagination.page_size)
    results = session.exec(paginated_query).all()

    # Use the create classmethod to correctly build the PageResponse
    return PageResponse.create(items=results, total=total_count, params=pagination)


def get_book_rating_stats(session: Session, book_id: int) -> BookRatingStatsResponse:
    """Calculates rating statistics for a specific book.

    Args:
        session: The database session.
        book_id: The ID of the book.

    Returns:
        A BookRatingStatsResponse object containing the statistics.
    """
    statement = (
        select(
            func.coalesce(func.avg(Review.rating), 0.0).label("average_rating"),
            func.count(Review.id).label("total_reviews"),
            func.sum(case((Review.rating == 5, 1), else_=0)).label("five_stars"),
            func.sum(case((Review.rating == 4, 1), else_=0)).label("four_stars"),
            func.sum(case((Review.rating == 3, 1), else_=0)).label("three_stars"),
            func.sum(case((Review.rating == 2, 1), else_=0)).label("two_stars"),
            func.sum(case((Review.rating == 1, 1), else_=0)).label("one_star"),
        )
        .select_from(Review)
        .where(Review.book_id == book_id)
    )

    stats = session.exec(statement).first()

    if stats is None or stats.total_reviews == 0:
        # Return default values if no reviews or stats tuple is None
        return BookRatingStatsResponse()

    return BookRatingStatsResponse(
        average_rating=float(stats.average_rating),
        total_reviews=stats.total_reviews,
        five_stars=stats.five_stars,
        four_stars=stats.four_stars,
        three_stars=stats.three_stars,
        two_stars=stats.two_stars,
        one_star=stats.one_star,
    )


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
