from fastapi import HTTPException, status


class ReviewNotFoundError(HTTPException):
    """Custom exception for when a review is not found."""

    def __init__(self, detail: str = "Review not found"):
        """Initializes ReviewNotFoundError."""
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class InvalidReviewDataError(HTTPException):
    """Custom exception for invalid review data."""

    def __init__(self, detail: str = "Invalid review data"):
        """Initializes InvalidReviewDataError."""
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class DuplicateReviewError(HTTPException):
    """Custom exception when user tries to review the same book twice."""

    def __init__(self, detail: str = "You have already reviewed this book"):
        """Initializes DuplicateReviewError."""
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)
