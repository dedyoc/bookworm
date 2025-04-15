from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    """Custom exception for 404 Not Found errors."""

    def __init__(self, detail: str = "Resource not found"):
        """Initializes NotFoundError."""
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class BadRequestError(HTTPException):
    """Custom exception for 400 Bad Request errors."""

    def __init__(self, detail: str = "Bad request"):
        """Initializes BadRequestError."""
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class UnauthorizedError(HTTPException):
    """Custom exception for 401 Unauthorized errors."""

    def __init__(self, detail: str = "Not authenticated"):
        """Initializes UnauthorizedError."""
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class ForbiddenError(HTTPException):
    """Custom exception for 403 Forbidden errors."""

    def __init__(self, detail: str = "Not enough permissions"):
        """Initializes ForbiddenError."""
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
