from fastapi import HTTPException, status


class CartItemNotFoundError(HTTPException):
    """Custom exception for when a cart item is not found."""

    def __init__(self, detail: str = "Cart item not found"):
        """Initializes CartItemNotFoundError."""
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class QuantityLimitExceededError(HTTPException):
    """Custom exception for when the cart item quantity exceeds the limit."""

    def __init__(self, detail: str = "Maximum quantity limit exceeded"):
        """Initializes QuantityLimitExceededError."""
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
