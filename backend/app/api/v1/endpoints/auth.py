from datetime import timedelta
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app import models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

router = APIRouter()
PUBLIC_REGISTRATION_ROLE = "patient"
ADMIN_CREATED_ROLES = {"admin", "doctor", "nurse", "receptionist"}


class JsonLoginRequest(BaseModel):
    email: EmailStr
    password: str


def _issue_tokens(db: Session, user: User) -> dict:
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    access_token = security.create_access_token(user.id, expires_delta=access_token_expires)
    refresh_token = security.create_refresh_token(user.id, expires_delta=refresh_token_expires)
    user.refresh_token_hash = security.get_token_hash(refresh_token)
    db.add(user)
    db.commit()
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.full_name,
    }


@router.post("/register", response_model=schemas.user.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.user.PatientRegister,
) -> Any:
    """
    Register a new patient account in the AI Hospital system.
    """
    # Check if the user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists.",
        )

    hashed_password = security.get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=PUBLIC_REGISTRATION_ROLE,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/users", response_model=schemas.user.UserResponse, status_code=status.HTTP_201_CREATED)
def create_staff_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.user.StaffCreate,
    current_user: User = Depends(deps.RoleChecker(["admin"])),
) -> Any:
    """
    Create hospital staff accounts. Restricted to Admin users.
    """
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists.",
        )

    if user_in.role not in ADMIN_CREATED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins may only create Doctor, Nurse, Receptionist, or Admin accounts.",
        )

    db_user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
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

    return _issue_tokens(db, user)


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

    return _issue_tokens(db, user)


@router.post("/refresh", response_model=schemas.user.Token)
def refresh_access_token(
    *,
    db: Session = Depends(get_db),
    refresh_in: schemas.user.RefreshTokenRequest,
) -> Any:
    try:
        payload = security.jwt.decode(
            refresh_in.refresh_token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = schemas.user.TokenPayload(**payload)
        if token_data.type != "refresh":
            raise JWTError("Invalid token type")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token",
        )

    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive or missing user")

    if user.refresh_token_hash != security.get_token_hash(refresh_in.refresh_token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has been revoked")

    return _issue_tokens(db, user)


@router.post("/logout")
def logout(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    current_user.refresh_token_hash = None
    db.add(current_user)
    db.commit()
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=schemas.user.UserResponse)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current logged in user details.
    """
    return current_user


@router.get("/doctors", response_model=List[schemas.appointment.DoctorSelector])
def get_all_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Fetch all active users registered as Doctors.
    """
    doctors = db.query(User).filter(User.role == "doctor", User.is_active == True).all()
    return doctors
