from typing import Optional
from sqlalchemy import BigInteger
from sqlmodel import Field, SQLModel

from src.models import TimestampModel


class CategoryBase(SQLModel):
    """Base category model with common fields.

    Attributes:
        category_name: The name of the category.
        category_desc: An optional description of the category.
    """

    category_name: str = Field(unique=True, max_length=120)
    category_desc: Optional[str] = Field(default=None, max_length=255)


class Category(CategoryBase, TimestampModel, table=True):
    """Database model for a category.

    Attributes:
        id: The primary key of the category.
    """

    id: int | None = Field(sa_type=BigInteger, default=None, primary_key=True)


class CategoryCreate(CategoryBase):
    """Model for creating a new category."""

    pass


class CategoryUpdate(SQLModel):
    """Model for updating an existing category.

    All fields are optional to allow partial updates.
    """

    category_name: Optional[str] = Field(default=None, max_length=120)
    category_desc: Optional[str] = Field(default=None, max_length=255)


class CategoryResponse(CategoryBase):
    """Response model for category information.

    Attributes:
        id: The ID of the category.
    """

    id: int
