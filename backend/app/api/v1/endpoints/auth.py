from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app import models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

router = APIRouter()


class JsonLoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", response_model=schemas.user.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.user.UserCreate,
) -> Any:
    """
    Register a new user in the AI Hospital system.
    """
    # Check if the user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists.",
        )

    # Validate role input to prevent injection of random strings
    valid_roles = ["admin", "doctor", "patient", "staff"]
    if user_in.role not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role selected. Allowed roles are: {', '.join(valid_roles)}",
        )

    hashed_password = security.get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.user.Token)
def login_access_token_form(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, for Swagger UI / external tools.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "role": user.role,
        "name": user.full_name
    }


@router.post("/login/json", response_model=schemas.user.Token)
def login_access_token_json(
    *,
    db: Session = Depends(get_db),
    login_data: JsonLoginRequest,
) -> Any:
    """
    Standard JSON login payload for React SPA integrations.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "role": user.role,
        "name": user.full_name
    }


@router.get("/me", response_model=schemas.user.UserResponse)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current logged in user details.
    """
    return current_user
