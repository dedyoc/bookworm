from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.category.models import (
    Category,
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)
from src.category.service import (
    create_category,
    delete_category,
    get_all_categories,
    get_categories,
    get_category,
    update_category,
)
from src.database import get_session
from src.pagination import PageResponse, PaginationParams

router = APIRouter(prefix="/categories", tags=["categories"])
"""Category related routes."""


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category_endpoint(
    category_in: CategoryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Creates a new category.

    Only admins can create categories.

    Args:
        category_in: The category data for creation.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The created category.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return create_category(session=session, category_create=category_in)


@router.get("/all", response_model=List[CategoryResponse])
def read_all_categories(session: Session = Depends(get_session)) -> Any:
    """Gets all categories.

    Args:
        session: The database session dependency.

    Returns:
        A list of all categories.
    """
    return get_all_categories(session=session)


@router.get("/", response_model=PageResponse[CategoryResponse])
def read_categories(
    pagination: PaginationParams = Depends(),
    session: Session = Depends(get_session),
) -> Any:
    """Gets a paginated list of categories.

    Args:
        pagination: The pagination parameters dependency.
        session: The database session dependency.

    Returns:
        A paginated response containing categories.
    """
    return get_categories(session=session, pagination=pagination)


@router.get("/{category_id}", response_model=CategoryResponse)
def read_category(
    category_id: int,
    session: Session = Depends(get_session),
) -> Any:
    """Gets a specific category by ID.

    Args:
        category_id: The ID of the category to retrieve.
        session: The database session dependency.

    Returns:
        The requested category.
    """
    return get_category(session=session, category_id=category_id)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category_endpoint(
    category_id: int,
    category_in: CategoryUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Updates a category.

    Only admins can update categories.

    Args:
        category_id: The ID of the category to update.
        category_in: The category data to update.
        session: The database session dependency.
        current_user: The authenticated user dependency.

    Returns:
        The updated category.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return update_category(
        session=session, category_id=category_id, category_update=category_in
    )


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category_endpoint(
    category_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    """Deletes a category.

    Only admins can delete categories.

    Args:
        category_id: The ID of the category to delete.
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

    delete_category(session=session, category_id=category_id)
