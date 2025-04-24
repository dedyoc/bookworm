import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file.

    Attributes:
        DATABASE_URL: The connection string for the database.
        JWT_SECRET_KEY: The secret key for encoding/decoding JWT tokens.
        JWT_ACCESS_TOKEN_EXPIRE_MINUTES: The expiry time for access tokens in minutes.
        JWT_ALGORITHM: The algorithm used for JWT signing.
    """

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES: int
    JWT_ALGORITHM: str


settings = Settings()
