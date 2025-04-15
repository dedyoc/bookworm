from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import BigInteger
from sqlmodel import Field, SQLModel

from src.models import TimestampModel


class AuthorBase(SQLModel):
    """Base model for author with common attributes."""

    author_name: str = Field(index=True)
    author_bio: Optional[str] = Field(default=None)


class Author(AuthorBase, TimestampModel, table=True):
    """Author database model."""

    id: int | None = Field(sa_type=BigInteger, default=None, primary_key=True)


class AuthorCreate(AuthorBase):
    """Model for creating an author."""

    pass


class AuthorUpdate(BaseModel):
    """Model for updating an author."""

    author_name: Optional[str] = None
    author_bio: Optional[str] = None


class AuthorResponse(AuthorBase):
    """Model for author response."""

    id: int
