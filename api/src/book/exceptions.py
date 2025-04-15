from fastapi import HTTPException, status


class BookNotFoundError(HTTPException):
    """Custom exception for when a book is not found."""

    def __init__(self, detail: str = "Book not found"):
        """Initializes BookNotFoundError."""
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class InvalidBookDataError(HTTPException):
    """Custom exception for invalid book data."""

    def __init__(self, detail: str = "Invalid book data"):
        """Initializes InvalidBookDataError."""
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
