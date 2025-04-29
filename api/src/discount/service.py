from datetime import date
from typing import Optional

import sqlmodel
from sqlmodel import Session, select

from src.book.service import get_book
from src.discount.exceptions import InvalidDiscountDataError, OverlappingDiscountError
from src.discount.models import Discount, DiscountCreate, DiscountUpdate
from src.exceptions import NotFoundError
from src.pagination import PageResponse, PaginationParams


def create_discount(session: Session, discount_create: DiscountCreate) -> Discount:
    """Creates a new discount.

    Args:
        session: The database session.
        discount_create: The discount data for creation.

    Returns:
        The newly created discount.

    Raises:
        NotFoundError: If the book doesn't exist.
        InvalidDiscountDataError: If the discount data is invalid.
        OverlappingDiscountError: If there's an overlapping discount period.
    """
    # Verify the book exists
    get_book(session=session, book_id=discount_create.book_id)

    if (
        discount_create.discount_start_date
        and discount_create.discount_end_date
        and discount_create.discount_start_date > discount_create.discount_end_date
    ):
        raise InvalidDiscountDataError("Start date must be before end date")

    # Check for overlapping discount periods
    check_overlapping_discounts(
        session,
        book_id=discount_create.book_id,
        start_date=discount_create.discount_start_date,
        end_date=discount_create.discount_end_date,
    )

    discount = Discount.model_validate(discount_create)
    session.add(discount)
    session.commit()
    session.refresh(discount)
    return discount


def check_overlapping_discounts(
    session: Session,
    book_id: int,
    start_date: Optional[date],
    end_date: Optional[date],
    discount_id: Optional[int] = None,
) -> None:
    """Checks for overlapping discount periods for a book.

    Args:
        session: The database session.
        book_id: The ID of the book.
        start_date: The start date of the new discount period.
        end_date: The end date of the new discount period.
        discount_id: Optional ID of the discount being updated (to exclude from check).

    Raises:
        OverlappingDiscountError: If there's an overlapping discount period.
    """
    statement = select(Discount).where(Discount.book_id == book_id)

    if discount_id is not None:
        statement = statement.where(Discount.id != discount_id)

    existing_discounts = session.exec(statement).all()

    for existing in existing_discounts:
        # Check for overlap based on different scenarios of null/non-null dates
        if is_overlapping(
            start_date,
            end_date,
            existing.discount_start_date,
            existing.discount_end_date,
        ):
            raise OverlappingDiscountError()


def is_overlapping(
    new_start: Optional[date],
    new_end: Optional[date],
    existing_start: Optional[date],
    existing_end: Optional[date],
) -> bool:
    """Determines if two date ranges overlap.

    Args:
        new_start: Start date of new range.
        new_end: End date of new range.
        existing_start: Start date of existing range.
        existing_end: End date of existing range.

    Returns:
        True if the ranges overlap, False otherwise.
    """
    # Handle null dates (representing infinity in either direction)
    if new_start is None:
        if existing_end is None:
            return True  # Both extend infinitely to the past
        return (
            True
            if existing_end is None
            else new_end is None or new_end >= existing_start
        )

    if new_end is None:
        if existing_start is None:
            return True  # Both extend infinitely to the future
        return (
            True
            if existing_start is None
            else existing_end is None or existing_end >= new_start
        )

    if existing_start is None and existing_end is None:
        return True  # Existing discount is always active
    if existing_start is None:
        return existing_end >= new_start
    if existing_end is None:
        return existing_start <= new_end

    return max(new_start, existing_start) <= min(new_end, existing_end)


def get_discount(session: Session, discount_id: int) -> Discount:
    """Gets a discount by ID.

    Args:
        session: The database session.
        discount_id: The ID of the discount to retrieve.

    Returns:
        The requested discount.

    Raises:
        NotFoundError: If the discount doesn't exist.
    """
    discount = session.get(Discount, discount_id)
    if not discount:
        raise NotFoundError(f"Discount with ID {discount_id} not found")
    return discount


def get_discounts(
    session: Session,
    pagination: PaginationParams,
    book_id: Optional[int] = None,
    active_only: bool = False,
) -> PageResponse[Discount]:
    """Gets a paginated list of discounts with optional filtering.

    Args:
        session: The database session.
        pagination: Pagination parameters.
        book_id: Optional filter by book ID.
        active_only: If True, only returns currently active discounts.

    Returns:
        A paginated response containing discounts.
    """
    statement = select(Discount)

    # Apply filters if provided
    if book_id is not None:
        statement = statement.where(Discount.book_id == book_id)

    if active_only:
        today = date.today()
        statement = statement.where(
            (
                Discount.discount_start_date.is_(None)
                | (Discount.discount_start_date <= today)
            )
            & (
                Discount.discount_end_date.is_(None)
                | (Discount.discount_end_date >= today)
            )
        )

    # Execute with pagination
    results = session.exec(
        statement.offset(pagination.offset).limit(pagination.page_size)
    )
    discounts = results.all()

    # Get total count for pagination
    count_statement = select(sqlmodel.func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    return PageResponse.create(items=discounts, total=total, params=pagination)


def update_discount(
    session: Session, discount_id: int, discount_update: DiscountUpdate
) -> Discount:
    """Updates a discount.

    Args:
        session: The database session.
        discount_id: The ID of the discount to update.
        discount_update: The discount data to update.

    Returns:
        The updated discount.

    Raises:
        NotFoundError: If the discount doesn't exist.
        InvalidDiscountDataError: If the updated discount data is invalid.
        OverlappingDiscountError: If there's an overlapping discount period.
    """
    discount = get_discount(session, discount_id)

    update_data = discount_update.model_dump(exclude_unset=True)
    if not update_data:
        return discount  # No updates to apply

    # Apply updates to a copy to validate before committing
    updated_discount = Discount.model_validate(discount)
    for key, value in update_data.items():
        setattr(updated_discount, key, value)

    # Validate dates if both are provided
    if (
        updated_discount.discount_start_date
        and updated_discount.discount_end_date
        and updated_discount.discount_start_date > updated_discount.discount_end_date
    ):
        raise InvalidDiscountDataError("Start date must be before end date")

    # Check for overlapping discount periods (excluding this discount)
    check_overlapping_discounts(
        session,
        book_id=discount.book_id,
        start_date=updated_discount.discount_start_date,
        end_date=updated_discount.discount_end_date,
        discount_id=discount_id,
    )

    # Apply updates to the actual discount object
    for key, value in update_data.items():
        setattr(discount, key, value)

    session.add(discount)
    session.commit()
    session.refresh(discount)
    return discount


def delete_discount(session: Session, discount_id: int) -> None:
    """Deletes a discount.

    Args:
        session: The database session.
        discount_id: The ID of the discount to delete.

    Raises:
        NotFoundError: If the discount doesn't exist.
    """
    discount = get_discount(session, discount_id)
    session.delete(discount)
    session.commit()


def get_active_discount_for_book(session: Session, book_id: int) -> Optional[Discount]:
    """Gets the currently active discount for a book, if any.

    Args:
        session: The database session.
        book_id: The ID of the book.

    Returns:
        The active discount if one exists, otherwise None.
    """
    today = date.today()
    statement = (
        select(Discount)
        .where(Discount.book_id == book_id)
        .where(
            (
                Discount.discount_start_date.is_(None)
                | (Discount.discount_start_date <= today)
            )
            & (
                Discount.discount_end_date.is_(None)
                | (Discount.discount_end_date >= today)
            )
        )
        .order_by(Discount.discount_price.desc() if Discount.discount_price else None)
    )

    return session.exec(statement).first()
