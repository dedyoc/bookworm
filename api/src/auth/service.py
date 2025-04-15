from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from src.auth.exceptions import InvalidCredentialsError, UserAlreadyExistsError
from src.auth.models import User, UserCreate
from src.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def create_access_token(data: dict, expires_delta: timedelta) -> str:
    """Creates a JWT access token.

    Args:
        data: The data to encode in the token (payload).
        expires_delta: The duration for which the token is valid.

    Returns:
        The encoded JWT access token string.
    """
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, **data}
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed password.

    Args:
        plain_password: The plain text password.
        hashed_password: The hashed password stored in the database.

    Returns:
        True if the passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hashes a plain text password.

    Args:
        password: The plain text password to hash.

    Returns:
        The hashed password string.
    """
    return pwd_context.hash(password)


def create_user(user_create: UserCreate, session: Session) -> User:
    """Creates a new user in the database.

    Checks if a user with the given email already exists.

    Args:
        user_create: The user data for creation.
        session: The database session.

    Returns:
        The newly created user object.

    Raises:
        UserAlreadyExistsError: If a user with the same email already exists.
    """
    existing_user = get_user_by_email(session, user_create.email)
    if existing_user:
        raise UserAlreadyExistsError()

    user = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate_user(session: Session, email: str, password: str) -> User:
    """Authenticates a user by email and password.

    Args:
        session: The database session.
        email: The user's email.
        password: The user's plain text password.

    Returns:
        The authenticated user object.

    Raises:
        InvalidCredentialsError: If authentication fails (user not found or password mismatch).
    """
    user = get_user_by_email(session, email)

    if not user:
        raise InvalidCredentialsError()

    if not verify_password(password, user.hashed_password):
        raise InvalidCredentialsError()

    return user


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """Retrieves a user from the database by email.

    Args:
        session: The database session.
        email: The email of the user to retrieve.

    Returns:
        The User object if found, otherwise None.
    """
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()
