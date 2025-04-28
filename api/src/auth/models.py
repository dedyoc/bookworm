from datetime import datetime
from typing import Optional
from pydantic import EmailStr
from sqlalchemy import BigInteger
from sqlmodel import Field, SQLModel

from src.models import TimestampModel


# TODO: Move to DTO folder
class UserBase(SQLModel):
    """Base user model with common fields."""

    first_name: str | None = Field(default=None, max_length=50)
    last_name: str | None = Field(default=None, max_length=50)
    email: EmailStr = Field(unique=True, index=True, max_length=70)
    admin: bool = False


class UserCreate(UserBase):
    """User creation model including password."""

    password: str = Field(min_length=8, max_length=255)


class UserRegister(SQLModel):
    """User registration model for the signup endpoint."""

    first_name: str | None = Field(default=None, max_length=50)
    last_name: str | None = Field(default=None, max_length=50)
    email: EmailStr = Field(max_length=50)
    password: str = Field(max_length=50)


class User(UserBase, TimestampModel, table=True):
    """Database model for a user."""

    id: int | None = Field(sa_type=BigInteger, default=None, primary_key=True)
    hashed_password: str


class UserResponse(UserBase):
    """Response model for user information (excluding password)."""

    id: int


class Token(SQLModel):
    """Response model for JWT access token."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    """Schema for the data stored within the JWT token."""

    sub: str | None = None


class RefreshTokenRequest(SQLModel):
    refresh_token: str


class BlacklistedToken(TimestampModel, table=True):
    """Model for blacklisted tokens.

    When a user logs out, their token is added to this blacklist and
    will be rejected even if it's not expired yet.

    Attributes:
        id: The primary key.
        token_jti: The JWT token ID (jti claim).
        expiry: The time when the token expires.
        blacklisted_on: The time when the token was blacklisted.
    """

    id: Optional[int] = Field(sa_type=BigInteger, default=None, primary_key=True)
    token: str = Field(index=True)
    expiry: datetime
    blacklisted_on: datetime = Field(default_factory=datetime.now)
