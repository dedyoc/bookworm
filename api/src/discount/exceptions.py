from fastapi import HTTPException, status


class DiscountNotFoundError(HTTPException):
    """Custom exception for when a discount is not found."""

    def __init__(self, detail: str = "Discount not found"):
        """Initializes DiscountNotFoundError."""
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class InvalidDiscountDataError(HTTPException):
    """Custom exception for invalid discount data."""

    def __init__(self, detail: str = "Invalid discount data"):
        """Initializes InvalidDiscountDataError."""
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class OverlappingDiscountError(HTTPException):
    """Custom exception when trying to create overlapping discount periods."""

    def __init__(self, detail: str = "Overlapping discount period for this book"):
        """Initializes OverlappingDiscountError."""
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)
