from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.database import get_session
from src.order.models import OrderCreate, OrderResponse
from src.order.service import (
    create_order,
    get_order,
    get_orders,
)
from src.pagination import PageResponse, PaginationParams

router = APIRouter(prefix="/orders", tags=["orders"])
"""Order related routes."""


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order_endpoint(
    order_in: OrderCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Creates a new order.

    Validates item quantities before creation.

    Args:
        order_in: The order data for creation.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Raises:
        HTTPException: If any item quantity is invalid (not between 1 and 8).

    Returns:
        The created order.
    """
    # Validate item quantities
    for item in order_in.items:
        if not (1 <= item.quantity <= 8):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid quantity for book ID {item.book_id}. Quantity must be between 1 and 8.",
            )

    return create_order(session=session, order_create=order_in, user_id=current_user.id)


@router.get("/", response_model=PageResponse[OrderResponse])
def read_orders(
    pagination: PaginationParams = Depends(),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Gets a paginated list of orders with optional filtering.

    For regular users, only returns their own orders.
    For admins, can return all orders or filter by user_id.

    Args:
        pagination: The pagination parameters dependency.
        status: Optional filter by order status.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        A paginated response containing orders.
    """
    user_id = None

    # Non-admin users can only see their own orders
    if not current_user.admin:
        user_id = current_user.id

    return get_orders(
        session=session,
        pagination=pagination,
        user_id=user_id,
        status=status,
        is_admin=current_user.admin,
    )


@router.get("/{order_id}", response_model=OrderResponse)
def read_order(
    order_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Gets a specific order by ID.

    Users can only access their own orders, but admins can access any order.

    Args:
        order_id: The ID of the order to retrieve.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The requested order.
    """
    return get_order(
        session=session,
        order_id=order_id,
        user_id=current_user.id,
        is_admin=current_user.admin,
    )


# @router.put("/{order_id}", response_model=OrderResponse)
# def update_order_endpoint(
#     order_id: int,
#     order_in: OrderUpdate,
#     session: Session = Depends(get_session),
#     current_user: User = Depends(get_current_user),
# ) -> Any:
#     """Updates an order.

#     Only admins can update orders.

#     Args:
#         order_id: The ID of the order to update.
#         order_in: The order data to update.
#         session: The database session dependency.
#         current_user: The authenticated user dependency.

#     Returns:
#         The updated order.
#     """
#     return update_order(
#         session=session,
#         order_id=order_id,
#         order_update=order_in,
#         user_id=current_user.id,
#         is_admin=current_user.admin,
#     )


# @router.post("/{order_id}/cancel", response_model=OrderResponse)
# def cancel_order_endpoint(
#     order_id: int,
#     session: Session = Depends(get_session),
#     current_user: User = Depends(get_current_user),
# ) -> Any:
#     """Cancels an order.

#     Users can cancel their own orders if they haven't been shipped yet.
#     Admins can cancel any order that hasn't been delivered.

#     Args:
#         order_id: The ID of the order to cancel.
#         session: The database session dependency.
#         current_user: The authenticated user dependency.

#     Returns:
#         The cancelled order.
#     """
#     return cancel_order(
#         session=session,
#         order_id=order_id,
#         user_id=current_user.id,
#         is_admin=current_user.admin,
#     )
