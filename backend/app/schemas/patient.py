from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class PatientBase(BaseModel):
    name: str = Field(..., min_length=2, description="Patient's full name")
    age: int = Field(..., ge=0, le=150, description="Patient's age")
    gender: str = Field(..., description="Gender: Male, Female, Other")
    blood_group: str = Field(..., description="Blood Group, e.g. A+, O-, etc.")
    allergies: Optional[str] = Field(None, description="Known allergies")
    disease_history: Optional[str] = Field(None, description="Previous/chronic diseases")
    phone_number: str = Field(..., description="Active phone number")
    address: str = Field(..., description="Residential address")


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    disease_history: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None


class PatientResponse(PatientBase):
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
