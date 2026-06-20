from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = Field(default="patient", description="Role: admin, doctor, nurse, receptionist, patient")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")


class PatientRegister(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")


class StaffCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    role: str = Field(..., description="Role: admin, doctor, nurse, receptionist")


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    name: Optional[str] = None


class TokenPayload(BaseModel):
    sub: Optional[int] = None
    type: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str
