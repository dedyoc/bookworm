from fastapi import HTTPException, status


class OrderNotFoundError(HTTPException):
    """Custom exception for when an order is not found."""

    def __init__(self, detail: str = "Order not found"):
        """Initializes OrderNotFoundError."""
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class InvalidOrderDataError(HTTPException):
    """Custom exception for invalid order data."""

    def __init__(self, detail: str = "Invalid order data"):
        """Initializes InvalidOrderDataError."""
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class OrderAccessDeniedError(HTTPException):
    """Custom exception when a user tries to access an order they don't own."""

    def __init__(self, detail: str = "You don't have permission to access this order"):
        """Initializes OrderAccessDeniedError."""
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class EmptyOrderError(HTTPException):
    """Custom exception when trying to create an empty order."""

    def __init__(self, detail: str = "Cannot create an empty order"):
        """Initializes EmptyOrderError."""
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class OutOfStockError(HTTPException):
    """Custom exception when a book is out of stock."""

    def __init__(self, detail: str = "One or more items are out of stock"):
        """Initializes OutOfStockError."""
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
