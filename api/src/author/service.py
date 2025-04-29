from typing import List, Optional

import sqlmodel
from fastapi import HTTPException, status
from sqlmodel import Session, select

from src.author.models import Author, AuthorCreate, AuthorUpdate
from src.pagination import PageResponse, PaginationParams


def create_author(session: Session, author_create: AuthorCreate) -> Author:
    """Creates a new author.

    Args:
        session: The database session.
        author_create: The author data for creation.

    Returns:
        The created author.
    """
    author = Author.model_validate(author_create)
    session.add(author)
    session.commit()
    session.refresh(author)
    return author


def get_all_authors(session: Session) -> List[Author]:
    """Gets all authors.

    Args:
        session: The database session.

    Returns:
        A list of all authors.
    """
    statement = select(Author).order_by(Author.author_name)
    results = session.exec(statement)
    return results.all()


def get_authors(session: Session, pagination: PaginationParams) -> PageResponse[Author]:
    """Gets a paginated list of authors.

    Args:
        session: The database session.
        pagination: The pagination parameters.

    Returns:
        A paginated response containing authors.
    """
    statement = select(Author).order_by(Author.author_name)
    results = session.exec(
        statement.offset(pagination.offset).limit(pagination.page_size)
    )
    authors = results.all()
    count_statement = select(sqlmodel.func.count()).select_from(Author)
    total = session.exec(count_statement).one()
    return PageResponse.create(
        items=authors,
        total=total,
        params=pagination,
    )


def get_author(session: Session, author_id: int) -> Author:
    """Gets a specific author by ID.

    Args:
        session: The database session.
        author_id: The ID of the author to retrieve.

    Returns:
        The requested author.

    Raises:
        HTTPException: If the author is not found.
    """
    author = session.get(Author, author_id)
    if not author:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Author with ID {author_id} not found",
        )
    return author


def update_author(
    session: Session, author_id: int, author_update: AuthorUpdate
) -> Author:
    """Updates an author.

    Args:
        session: The database session.
        author_id: The ID of the author to update.
        author_update: The author data to update.

    Returns:
        The updated author.

    Raises:
        HTTPException: If the author is not found.
    """
    author = get_author(session=session, author_id=author_id)

    update_data = author_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(author, field, value)

    session.add(author)
    session.commit()
    session.refresh(author)
    return author


def delete_author(session: Session, author_id: int) -> None:
    """Deletes an author.

    Args:
        session: The database session.
        author_id: The ID of the author to delete.

    Raises:
        HTTPException: If the author is not found.
    """
    author = get_author(session=session, author_id=author_id)
    session.delete(author)
    session.commit()
