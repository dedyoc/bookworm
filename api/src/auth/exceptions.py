from fastapi import HTTPException, status


class InvalidCredentialsError(HTTPException):
    """Custom exception for 401 Unauthorized errors due to invalid credentials."""

    def __init__(self, detail: str = "Invalid credentials"):
        """Initializes InvalidCredentialsError."""
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class UserAlreadyExistsError(HTTPException):
    """Custom exception for 409 Conflict errors when a user already exists."""

    def __init__(self, detail: str = "User with this email already exists"):
        """Initializes UserAlreadyExistsError."""
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)
