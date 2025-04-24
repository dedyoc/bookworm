from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from sqlmodel import Session

from src.auth.exceptions import InvalidCredentialsError
from src.auth.dependencies import get_current_user
from src.auth.models import (
    RefreshTokenRequest,
    Token,
    TokenPayload,
    User,
    UserCreate,
    UserRegister,
    UserResponse,
)
from src.auth.service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    create_user,
    get_user_by_email,
)
from src.config import settings
from src.database import get_session

router = APIRouter(prefix="/auth", tags=["auth"])
"""Authentication related routes."""


@router.post("/signup", response_model=UserResponse)
def register_user(
    user_in: UserRegister, session: Session = Depends(get_session)
) -> Any:
    """Registers a new user.

    Args:
        user_in: The user registration data.
        session: The database session dependency.

    Returns:
        The created user's information.

    Raises:
        HTTPException: If a user with the same email already exists.
    """
    user = get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_create = UserCreate.model_validate(user_in)
    user = create_user(session=session, user_create=user_create)
    return user


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """Logs in a user and returns an access token.

    Uses OAuth2PasswordRequestForm for standard username/password form data.

    Args:
        form_data: The OAuth2 form data containing username (email) and password.
        session: The database session dependency.

    Returns:
        A dictionary containing the access token and token type.
    """
    user = authenticate_user(session, form_data.username, form_data.password)

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=Token)
def refresh_token(
    request: RefreshTokenRequest,
    session: Session = Depends(get_session),
):
    """Refreshes the access token using a refresh token.

    Args:
        token: The refresh token.
        session: The database session dependency.

    Returns:
        A dictionary containing the new access token and token type.
    """
    refresh_token = request.refresh_token
    try:
        payload_data = jwt.decode(
            refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        payload = TokenPayload.model_validate(payload_data)
        email: str | None = payload.sub
        if email is None:
            raise InvalidCredentialsError("Invalid refresh token")
    except JWTError:
        raise InvalidCredentialsError("Invalid refresh token")
    user = get_user_by_email(session=session, email=email)
    if user is None:
        raise InvalidCredentialsError("Invalid refresh token")
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    # New refresh token can be created here if needed

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Gets the information of the currently authenticated user.

    Args:
        current_user: The authenticated user dependency.

    Returns:
        The current user's information.
    """
    return current_user
