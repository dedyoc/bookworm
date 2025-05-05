from datetime import datetime, date
from enum import Enum
from typing import List, Optional

import sqlmodel
from sqlmodel import Session, select, func, or_
from sqlalchemy import Float
from sqlalchemy.sql.functions import coalesce
from sqlalchemy.orm import aliased

from src.author.models import Author
from src.book.models import Book, BookCreate, BookResponse, BookUpdate
from src.discount.models import Discount
from src.exceptions import NotFoundError
from src.pagination import PageResponse, PaginationParams
from src.review.models import Review


class SortMode(Enum):
    ON_SALE = "on_sale"
    POPULARITY = "popularity"
    PRICE_LOW_TO_HIGH = "price_low_to_high"
    PRICE_HIGH_TO_LOW = "price_high_to_low"


class FeaturedBook(Enum):
    RECOMMENDED = "recommended"
    POPULAR = "popular"


def create_book(session: Session, book_create: BookCreate) -> BookResponse:
    """Creates a new book.

    Args:
        session: The database session.
        book_create: The book data for creation.

    Returns:
        The newly created book.
    """
    book = Book.model_validate(book_create)
    session.add(book)
    session.commit()
    session.refresh(book)
    return book


def get_book(session: Session, book_id: int) -> BookResponse:
    """Gets a book by ID.

    Args:
        session: The database session.
        book_id: The ID of the book to retrieve.

    Returns:
        The requested book.

    Raises:
        NotFoundError: If the book doesn't exist.
    """
    statement = (
        select(Book, Discount.discount_price, Author.author_name)
        .join(Discount, isouter=True)
        .join(Author, isouter=True)
        .where(Book.id == book_id)
    )
    book = session.exec(statement).first()
    if not book:
        raise NotFoundError("Book not found")
    book, discount_price, author_name = book
    book_response = BookResponse.model_validate(book)
    book_response.discount_price = discount_price
    book_response.author_name = author_name

    return book_response


def get_books(
    session: Session,
    pagination: PaginationParams,
    category_id: Optional[int] = None,
    author_id: Optional[int] = None,
    rating: Optional[int] = None,
    sort_mode: Optional[SortMode] = None,
) -> PageResponse[BookResponse]:
    """Gets a paginated list of books with optional filtering and sorting.

    Args:
        session: The database session.
        pagination: Pagination parameters.
        category_id: Optional filter by category ID.
        author_id: Optional filter by author ID.
        rating: Optional filter by minimum average rating.
        sort_mode: Optional sorting mode.

    Returns:
        A paginated response containing books.
    """
    today = date.today()

    active_discount_subquery = (
        select(
            Discount.book_id,
            func.min(Discount.discount_price).label("best_discount_price"),
        )
        .where(
            or_(
                Discount.discount_start_date.is_(None),
                Discount.discount_start_date <= today,
            ),
            or_(
                Discount.discount_end_date.is_(None),
                Discount.discount_end_date >= today,
            ),
        )
        .group_by(Discount.book_id)
        .subquery()
    )

    final_price = (
        coalesce(active_discount_subquery.c.best_discount_price, Book.book_price)
        # .cast(Float)
        .label("final_price")
    )

    avg_rating = coalesce(func.avg(Review.rating), 0.0).cast(Float).label("avg_rating")
    review_count = func.count(Review.id).label("review_count")

    statement = (
        select(Book, Author.author_name, final_price, avg_rating, review_count)
        .outerjoin(Author, Book.author_id == Author.id)
        .outerjoin(
            active_discount_subquery, Book.id == active_discount_subquery.c.book_id
        )
        .outerjoin(Review, Book.id == Review.book_id)
        .group_by(
            Book.id, Author.author_name, active_discount_subquery.c.best_discount_price
        )  # Group by book and related fields
    )

    # Apply filters
    if category_id is not None:
        statement = statement.where(Book.category_id == category_id)
    if author_id is not None:
        statement = statement.where(Book.author_id == author_id)
    if rating is not None:
        statement = statement.having(avg_rating >= rating)

    # Apply sorting
    if sort_mode == SortMode.ON_SALE:
        discount_amount = (Book.book_price - final_price).label("discount_amount")
        statement = statement.order_by(
            discount_amount.desc(), final_price.asc(), Book.id.asc()
        )
    elif sort_mode == SortMode.POPULARITY:
        # Sort by review count (desc), then lowest final price (asc)
        statement = statement.order_by(
            review_count.desc(), final_price.asc(), Book.id.asc()
        )
    elif sort_mode == SortMode.PRICE_LOW_TO_HIGH:
        statement = statement.order_by(final_price.asc(), Book.id.asc())
    elif sort_mode == SortMode.PRICE_HIGH_TO_LOW:
        statement = statement.order_by(final_price.desc(), Book.id.asc())
    else:  # Default sort by title
        statement = statement.order_by(Book.book_title.asc(), Book.id.asc())
    count_subquery = statement.with_only_columns(Book.id).alias("count_sq")
    count_statement = select(func.count(count_subquery.c.id))
    total = session.exec(count_statement).first() or 0

    paginated_statement = statement.offset(pagination.offset).limit(
        pagination.page_size
    )
    results = session.exec(paginated_statement).all()

    books_response = []
    for book, author_name, calculated_final_price, _, _ in results:
        book_resp = BookResponse.model_validate(book)
        book_resp.author_name = author_name
        if (
            calculated_final_price is not None
            and calculated_final_price < book.book_price
        ):
            book_resp.discount_price = calculated_final_price
        else:
            book_resp.discount_price = None
        books_response.append(book_resp)

    return PageResponse.create(items=books_response, total=total, params=pagination)


def update_book(session: Session, book_id: int, book_update: BookUpdate) -> Book:
    """Updates a book.

    Args:
        session: The database session.
        book_id: The ID of the book to update.
        book_update: The book data to update.

    Returns:
        The updated book.

    Raises:
        NotFoundError: If the book doesn't exist.
    """
    book = get_book(session, book_id)

    update_data = book_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(book, key, value)
    book.updated_at = datetime.now()
    session.add(book)
    session.commit()
    session.refresh(book)
    return book


def delete_book(session: Session, book_id: int) -> None:
    """Deletes a book.

    Args:
        session: The database session.
        book_id: The ID of the book to delete.

    Raises:
        NotFoundError: If the book doesn't exist.
    """
    book = get_book(session, book_id)
    session.delete(book)
    session.commit()


def get_top_discounted_books(session: Session, limit: int = 10) -> List[BookResponse]:
    """Gets the top discounted books currently active.

    Args:
        session: The database session.
        limit: The maximum number of books to retrieve.

    Returns:
        A list of the top discounted books as BookResponse objects.
    """
    today = date.today()

    # Base subquery to find active discounts per book and calculate amounts
    base_subquery_stmt = (
        select(
            Discount.book_id,
            sqlmodel.func.max(Book.book_price - Discount.discount_price).label(
                "discount_amount"
            ),
            sqlmodel.func.min(Discount.discount_price).label("best_discount_price"),
        )
        .join(Book, Discount.book_id == Book.id)
        .where(
            or_(
                Discount.discount_start_date.is_(None),
                Discount.discount_start_date <= today,
            ),
            or_(
                Discount.discount_end_date.is_(None),
                Discount.discount_end_date >= today,
            ),
        )
        .group_by(Discount.book_id)
        .order_by(sqlmodel.text("discount_amount DESC"))
    )

    # Apply limit to the subquery
    subquery = base_subquery_stmt.limit(limit).subquery()

    # Main query using the limited subquery
    statement = (
        select(Book, Author.author_name, subquery.c.best_discount_price)
        .join(subquery, Book.id == subquery.c.book_id)
        .join(Author, Book.author_id == Author.id)
        .order_by(subquery.c.discount_amount.desc())
    )

    results = session.exec(statement).all()

    books_response = []
    for book, author_name, discount_price in results:
        book_resp = BookResponse.model_validate(book)
        book_resp.author_name = author_name
        book_resp.discount_price = discount_price
        books_response.append(book_resp)

    return books_response


def get_featured_book(
    session: Session, feature: FeaturedBook, limit: int = 8
) -> List[BookResponse]:
    """Gets the featured books based on the specified feature.
    Args:
        session: The database session.
        feature: The feature type (recommended or popular).
    """
    statement = select(Book).join(Review).join(Discount)
    if feature == FeaturedBook.RECOMMENDED:
        statement = (
            statement.group_by(Book.id)
            .order_by(sqlmodel.func.avg(Review.rating).desc())
            .limit(limit)
        )
    elif feature == FeaturedBook.POPULAR:
        statement = (
            statement.group_by(Book.id)
            .order_by(sqlmodel.func.count(Review.id).desc())
            .limit(limit)
        )
    else:
        raise ValueError("Invalid feature type")

    results = session.exec(statement)

    books = results.all()
    return books


def get_recommended_book(session: Session, limit: int = 8) -> List[BookResponse]:
    """Gets recommended books based on highest average rating, including discount info.

    Args:
        session: The database session.
        limit: The maximum number of recommended books to retrieve.

    Returns:
        A list of recommended books as BookResponse objects.
    """
    # Step 1: Subquery to find top N book IDs based on average rating
    top_rated_books_subquery_stmt = (
        select(Book.id, func.avg(Review.rating).label("avg_rating"))
        .join(
            Review, Book.id == Review.book_id
        )  # Inner join ensures books have reviews
        .group_by(Book.id)
        .order_by(func.avg(Review.rating).desc(), Book.id.asc())
    )

    # Apply limit for the actual subquery used later
    top_rated_books_subquery = top_rated_books_subquery_stmt.limit(limit).subquery()

    # Step 2: Active discount subquery (reuse logic)
    today = date.today()
    active_discount_subquery = (
        select(
            Discount.book_id,
            func.min(Discount.discount_price).label("best_discount_price"),
        )
        .where(
            or_(
                Discount.discount_start_date.is_(None),
                Discount.discount_start_date <= today,
            ),
            or_(
                Discount.discount_end_date.is_(None),
                Discount.discount_end_date >= today,
            ),
        )
        .group_by(Discount.book_id)
        .subquery()
    )

    # Step 3: Final price calculation (reuse logic)
    final_price = coalesce(
        active_discount_subquery.c.best_discount_price, Book.book_price
    ).label("final_price")

    # Step 4: Main query to fetch details for the recommended books
    statement = (
        select(
            Book,
            Author.author_name,
            final_price,
            top_rated_books_subquery.c.avg_rating,  # Keep avg_rating for ordering
        )
        # Join Book with the subquery containing only the top rated book IDs
        .join(top_rated_books_subquery, Book.id == top_rated_books_subquery.c.id)
        .outerjoin(Author, Book.author_id == Author.id)
        # Outer join to get the best active discount price if available
        .outerjoin(
            active_discount_subquery, Book.id == active_discount_subquery.c.book_id
        )
        # Order the final result by average rating, then lowest price, then ID
        .order_by(
            top_rated_books_subquery.c.avg_rating.desc(),
            final_price.asc(),
            Book.id.asc(),
        )
    )

    # Step 5: Execute and process results
    raw_results = session.exec(statement).all()

    books_response = []
    # Unpack results (book object, author name, calculated final price, avg rating)
    # avg_rating is selected but not directly used in the response model here, only for ordering
    for book, author_name, calculated_final_price, _ in raw_results:
        book_resp = BookResponse.model_validate(book)
        book_resp.author_name = author_name
        # Set discount_price only if there's an active discount lower than original price
        if (
            calculated_final_price is not None
            and calculated_final_price < book.book_price
        ):
            book_resp.discount_price = calculated_final_price
        else:
            book_resp.discount_price = None
        books_response.append(book_resp)

    return books_response


def get_popular_book(session: Session, limit: int = 8) -> List[BookResponse]:
    """Gets popular books ordered by review count.

    Args:
        session: The database session.
        limit: The maximum number of popular books to retrieve.

    Returns:
        A list of popular books as BookResponse objects.
    """
    # Step 1: Subquery to find top N popular book IDs and their review counts
    # Define the base statement without the limit first for counting
    popular_book_ids_subquery_stmt = (
        select(Book.id, func.count(Review.id).label("review_count"))
        .outerjoin(
            Review, Book.id == Review.book_id
        )  # Use outerjoin to include books without reviews (count will be 0)
        .group_by(Book.id)
        .order_by(
            func.count(Review.id).desc(), Book.id.asc()
        )  # Order by review count desc
    )

    # Apply limit for the actual subquery used later
    popular_book_ids_subquery = popular_book_ids_subquery_stmt.limit(limit).subquery()

    # Step 2: Active discount subquery (reuse logic from get_books/get_top_discounted)
    today = date.today()
    active_discount_subquery = (
        select(
            Discount.book_id,
            func.min(Discount.discount_price).label("best_discount_price"),
        )
        .where(
            or_(
                Discount.discount_start_date.is_(None),
                Discount.discount_start_date <= today,
            ),
            or_(
                Discount.discount_end_date.is_(None),
                Discount.discount_end_date >= today,
            ),
        )
        .group_by(Discount.book_id)
        .subquery()
    )

    # Step 3: Final price calculation (reuse logic)
    final_price = coalesce(
        active_discount_subquery.c.best_discount_price, Book.book_price
    ).label("final_price")

    # Step 4: Main query to fetch details for the popular books
    statement = (
        select(
            Book,
            Author.author_name,
            final_price,
            popular_book_ids_subquery.c.review_count,  # Keep review_count for ordering
        )
        # Join Book with the subquery containing only the top popular book IDs
        .join(popular_book_ids_subquery, Book.id == popular_book_ids_subquery.c.id)
        .outerjoin(Author, Book.author_id == Author.id)
        # Outer join to get the best active discount price if available
        .outerjoin(
            active_discount_subquery, Book.id == active_discount_subquery.c.book_id
        )
        # Order the final result based on the review count from the subquery
        .order_by(popular_book_ids_subquery.c.review_count.desc(), Book.id.asc())
    )

    # Step 5: Execute and process results
    raw_results = session.exec(statement).all()

    books_response = []
    # Unpack results (book object, author name, calculated final price, review count)
    # review_count is selected but not directly used in the response model here, only for ordering
    for book, author_name, calculated_final_price, _ in raw_results:
        book_resp = BookResponse.model_validate(book)
        book_resp.author_name = author_name
        # Set discount_price only if there's an active discount lower than original price
        if (
            calculated_final_price is not None
            and calculated_final_price
            < book.book_price  # This comparison should be fine with Decimals
        ):
            book_resp.discount_price = calculated_final_price
        else:
            book_resp.discount_price = (
                None  # Explicitly set to None if no active discount or not lower
            )
        books_response.append(book_resp)

    return books_response
