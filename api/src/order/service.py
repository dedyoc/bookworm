from datetime import datetime
from decimal import Decimal
from typing import List, Optional

import sqlmodel
from sqlmodel import Session, select

from src.book.service import get_book
from src.discount.service import get_active_discount_for_book
from src.exceptions import NotFoundError
from src.order.exceptions import (
    EmptyOrderError,
    InvalidOrderDataError,
    OrderAccessDeniedError,
)
from src.order.models import (
    Order,
    OrderCreate,
    OrderItem,
    OrderItemCreate,
    OrderStatus,
    OrderUpdate,
)
from src.pagination import PageResponse, PaginationParams


def create_order(session: Session, order_create: OrderCreate, user_id: int) -> Order:
    """Creates a new order.

    Args:
        session: The database session.
        order_create: The order data for creation.
        user_id: The ID of the user placing the order.

    Returns:
        The newly created order.

    Raises:
        EmptyOrderError: If the order contains no items.
        InvalidOrderDataError: If the order data is invalid.
    """
    if not order_create.items:
        raise EmptyOrderError()

    # Calculate total order amount and create order items
    total_amount = Decimal("0.00")
    order_items = []

    for item_create in order_create.items:
        book = get_book(session=session, book_id=item_create.book_id)

        # Check for active discount
        discount = get_active_discount_for_book(session=session, book_id=book.id)
        price = discount.discount_price if discount else book.book_price

        item_total = price * Decimal(str(item_create.quantity))
        total_amount += item_total

        order_item = OrderItem(
            book_id=book.id,
            quantity=item_create.quantity,
            price=price,
            # order_id will be set after creating the order
        )
        order_items.append(order_item)

    # Create the order
    order = Order(
        user_id=user_id,
        order_date=datetime.now(),
        order_amount=total_amount,
        status=OrderStatus.PENDING,
    )

    session.add(order)
    session.flush()  # Flush to get the order ID

    # Set the order_id for each item and add to session
    for item in order_items:
        item.order_id = order.id
        session.add(item)

    session.commit()
    session.refresh(order)
    return order


def get_order(session: Session, order_id: int, user_id: int, is_admin: bool) -> Order:
    """Gets an order by ID.

    Args:
        session: The database session.
        order_id: The ID of the order to retrieve.
        user_id: The ID of the user making the request.
        is_admin: Whether the user is an admin.

    Returns:
        The requested order.

    Raises:
        NotFoundError: If the order doesn't exist.
        OrderAccessDeniedError: If the user doesn't own the order and is not an admin.
    """
    order = session.get(Order, order_id)
    if not order:
        raise NotFoundError(f"Order with ID {order_id} not found")

    # Check if user has permission to view this order
    if order.user_id != user_id and not is_admin:
        raise OrderAccessDeniedError()

    return order


def get_orders(
    session: Session,
    pagination: PaginationParams,
    user_id: Optional[int] = None,
    status: Optional[OrderStatus] = None,
    is_admin: bool = False,
) -> PageResponse[Order]:
    """Gets a paginated list of orders with optional filtering.

    Args:
        session: The database session.
        pagination: Pagination parameters.
        user_id: Optional filter by user ID.
        status: Optional filter by order status.
        is_admin: Whether the user is an admin.

    Returns:
        A paginated response containing orders.
    """
    statement = select(Order)

    # Apply filters
    if user_id is not None:
        statement = statement.where(Order.user_id == user_id)

    if status is not None:
        statement = statement.where(Order.status == status)

    # Non-admin users can only see their own orders
    if not is_admin and user_id is not None:
        statement = statement.where(Order.user_id == user_id)

    # Order by most recent first
    statement = statement.order_by(Order.order_date.desc())

    # Execute with pagination
    results = session.exec(
        statement.offset(pagination.offset).limit(pagination.page_size)
    )
    orders = results.all()

    # Get total count for pagination
    count_statement = select(sqlmodel.func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    return PageResponse.create(items=orders, total=total, params=pagination)


def update_order(
    session: Session,
    order_id: int,
    order_update: OrderUpdate,
    user_id: int,
    is_admin: bool,
) -> Order:
    """Updates an order.

    Args:
        session: The database session.
        order_id: The ID of the order to update.
        order_update: The order data to update.
        user_id: The ID of the user making the update.
        is_admin: Whether the user is an admin.

    Returns:
        The updated order.

    Raises:
        NotFoundError: If the order doesn't exist.
        OrderAccessDeniedError: If the user doesn't own the order and is not an admin.
        InvalidOrderDataError: If the order data is invalid.
    """
    order = get_order(session, order_id, user_id, is_admin)

    if not is_admin:
        raise OrderAccessDeniedError("Only administrators can update orders")

    update_data = order_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(order, key, value)
    order.updated_at = datetime.now()
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


def cancel_order(
    session: Session, order_id: int, user_id: int, is_admin: bool
) -> Order:
    """Cancels an order.

    Args:
        session: The database session.
        order_id: The ID of the order to cancel.
        user_id: The ID of the user making the request.
        is_admin: Whether the user is an admin.

    Returns:
        The cancelled order.

    Raises:
        NotFoundError: If the order doesn't exist.
        OrderAccessDeniedError: If the user doesn't own the order and is not an admin.
        InvalidOrderDataError: If the order cannot be cancelled.
    """
    order = get_order(session, order_id, user_id, is_admin)

    # Check if the order can be cancelled
    if order.status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
        raise InvalidOrderDataError(f"Cannot cancel order with status {order.status}")

    order.status = OrderStatus.CANCELLED
    session.add(order)
    session.commit()
    session.refresh(order)
    return order
