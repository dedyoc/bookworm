from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select

from src.auth.exceptions import InvalidCredentialsError
from src.auth.models import TokenPayload, User
from src.auth.service import is_token_blacklisted, purge_expired_blacklisted_tokens
from src.config import settings
from src.database import get_session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)
) -> User:
    """Decodes the JWT token and retrieves the current user.

    Args:
        token: The OAuth2 bearer token extracted from the request header.
        session: The database session dependency.

    Returns:
        The authenticated User object.

    Raises:
        InvalidCredentialsError: If the token is invalid, expired, blacklisted or the user
                                 associated with the token does not exist.
    """
    credentials_exception = InvalidCredentialsError("Could not validate credentials")

    # Check if the token is blacklisted
    if is_token_blacklisted(session, token):
        raise InvalidCredentialsError("Token has been revoked")

    # Occasionally clean up expired tokens from blacklist
    # Placeholder as prototype for actual implementation
    import random

    if random.random() < 0.01:  # 1% chance
        purge_expired_blacklisted_tokens(session)

    try:
        payload_data = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        payload = TokenPayload.model_validate(payload_data)
        email: str | None = payload.sub
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()

    if user is None:
        raise credentials_exception

    return user
