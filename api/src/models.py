from datetime import datetime

from sqlmodel import Field, SQLModel


class TimestampModel(SQLModel):
    """Base model with created_at and updated_at fields.

    Attributes:
        created_at: The timestamp when the record was created.
        updated_at: The timestamp when the record was last updated.
    """

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
