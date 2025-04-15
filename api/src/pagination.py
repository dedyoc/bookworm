from typing import Generic, List, TypeVar

from fastapi import Query
from pydantic import BaseModel

T = TypeVar("T")


class PaginationParams:
    """Pagination parameters dependency.

    Injects pagination parameters (page, page_size) from query parameters.

    Attributes:
        page: The current page number.
        page_size: The number of items per page.
        offset: The calculated offset for database queries.
    """

    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    ):
        """Initializes PaginationParams.

        Args:
            page: The page number requested.
            page_size: The number of items per page requested.
        """
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size


class PageResponse(BaseModel, Generic[T]):
    """Generic response model for paginated data.

    Attributes:
        items: The list of items for the current page.
        total: The total number of items across all pages.
        page: The current page number.
        page_size: The number of items per page.
        pages: The total number of pages.
    """

    items: List[T]
    total: int
    page: int
    page_size: int
    pages: int

    @classmethod
    def create(
        cls, items: List[T], total: int, params: PaginationParams
    ) -> "PageResponse[T]":
        """Creates a PageResponse instance.

        Args:
            items: The list of items for the current page.
            total: The total number of items.
            params: The pagination parameters used for the request.

        Returns:
            A PageResponse instance populated with pagination details.
        """
        pages = (total + params.page_size - 1) // params.page_size if total > 0 else 0
        return cls(
            items=items,
            total=total,
            page=params.page,
            page_size=params.page_size,
            pages=pages,
        )
