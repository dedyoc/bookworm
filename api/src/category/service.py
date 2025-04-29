from typing import List, Optional

import sqlmodel
from sqlmodel import Session, select

from src.category.models import Category, CategoryCreate, CategoryUpdate
from src.exceptions import NotFoundError
from src.pagination import PageResponse, PaginationParams


def create_category(session: Session, category_create: CategoryCreate) -> Category:
    """Creates a new category.

    Args:
        session: The database session.
        category_create: The category data for creation.

    Returns:
        The newly created category.
    """
    category = Category.model_validate(category_create)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def get_category(session: Session, category_id: int) -> Category:
    """Gets a category by ID.

    Args:
        session: The database session.
        category_id: The ID of the category to retrieve.

    Returns:
        The requested category.

    Raises:
        NotFoundError: If the category doesn't exist.
    """
    category = session.get(Category, category_id)
    if not category:
        raise NotFoundError(f"Category with ID {category_id} not found")
    return category


def get_all_categories(session: Session) -> List[Category]:
    """Gets all categories.

    Args:
        session: The database session.

    Returns:
        A list of all categories.
    """
    statement = select(Category).order_by(Category.category_name)
    results = session.exec(statement)
    return results.all()


def get_categories(
    session: Session, pagination: PaginationParams
) -> PageResponse[Category]:
    """Gets a paginated list of categories.

    Args:
        session: The database session.
        pagination: Pagination parameters.

    Returns:
        A paginated response containing categories.
    """
    statement = select(Category).order_by(Category.category_name)
    results = session.exec(
        statement.offset(pagination.offset).limit(pagination.page_size)
    )
    categories = results.all()
    count_statement = select(sqlmodel.func.count()).select_from(Category)
    total = session.exec(count_statement).one()

    return PageResponse.create(items=categories, total=total, params=pagination)


def update_category(
    session: Session, category_id: int, category_update: CategoryUpdate
) -> Category:
    """Updates a category.

    Args:
        session: The database session.
        category_id: The ID of the category to update.
        category_update: The category data to update.

    Returns:
        The updated category.

    Raises:
        NotFoundError: If the category doesn't exist.
    """
    category = get_category(session, category_id)

    update_data = category_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)

    session.add(category)
    session.commit()
    session.refresh(category)  # Refresh to get updated data with id
    return category


def delete_category(session: Session, category_id: int) -> None:
    """Deletes a category.

    Args:
        session: The database session.
        category_id: The ID of the category to delete.

    Raises:
        NotFoundError: If the category doesn't exist.
    """
    category = get_category(session, category_id)
    session.delete(category)
    session.commit()
