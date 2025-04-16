from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.database import get_session
from src.discount.models import (
    Discount,
    DiscountCreate,
    DiscountResponse,
    DiscountUpdate,
)
from src.discount.service import (
    create_discount,
    delete_discount,
    get_discount,
    get_discounts,
    update_discount,
)
from src.pagination import PageResponse, PaginationParams

router = APIRouter(prefix="/discounts", tags=["discounts"])
"""Discount related routes."""


@router.post("/", response_model=DiscountResponse, status_code=status.HTTP_201_CREATED)
def create_discount_endpoint(
    discount_in: DiscountCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Creates a new discount.

    Only admins can create discounts.

    Args:
        discount_in: The discount data for creation.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The created discount.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return create_discount(session=session, discount_create=discount_in)


@router.get("/", response_model=PageResponse[DiscountResponse])
def read_discounts(
    pagination: PaginationParams = Depends(),
    book_id: Optional[int] = Query(None, description="Filter by book ID"),
    active_only: bool = Query(False, description="Show only active discounts"),
    session: Session = Depends(get_session),
) -> Any:
    """Gets a paginated list of discounts with optional filtering.

    Args:
        pagination: The pagination parameters dependency.
        book_id: Optional filter by book ID.
        active_only: If True, only returns currently active discounts.
        session: The database session dependency.

    Returns:
        A paginated response containing discounts.
    """
    return get_discounts(
        session=session,
        pagination=pagination,
        book_id=book_id,
        active_only=active_only,
    )


@router.get("/{discount_id}", response_model=DiscountResponse)
def read_discount(
    discount_id: int,
    session: Session = Depends(get_session),
) -> Any:
    """Gets a specific discount by ID.

    Args:
        discount_id: The ID of the discount to retrieve.
        session: The database session dependency.

    Returns:
        The requested discount.
    """
    return get_discount(session=session, discount_id=discount_id)


@router.put("/{discount_id}", response_model=DiscountResponse)
def update_discount_endpoint(
    discount_id: int,
    discount_in: DiscountUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Updates a discount.

    Only admins can update discounts.

    Args:
        discount_id: The ID of the discount to update.
        discount_in: The discount data to update.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The updated discount.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return update_discount(
        session=session, discount_id=discount_id, discount_update=discount_in
    )


@router.delete("/{discount_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_discount_endpoint(
    discount_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    """Deletes a discount.

    Only admins can delete discounts.

    Args:
        discount_id: The ID of the discount to delete.
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

    delete_discount(session=session, discount_id=discount_id)
