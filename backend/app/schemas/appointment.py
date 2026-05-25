from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.user import UserResponse
from app.schemas.patient import PatientResponse


class AppointmentBase(BaseModel):
    patient_id: int = Field(..., description="Target patient ID")
    doctor_id: int = Field(..., description="Target practitioner user ID")
    appointment_date: str = Field(..., description="Scheduled date: YYYY-MM-DD")
    time_slot: str = Field(..., description="Scheduled time slot, e.g. '09:30 AM'")
    notes: Optional[str] = Field(None, description="Reason for consult or clinic notes")


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[str] = None
    time_slot: Optional[str] = None
    status: Optional[str] = Field(None, description="Status: scheduled, checked_in, completed, cancelled")
    notes: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: int
    token_number: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # We can include optional full models or simple attributes.
    # To keep it completely robust and avoid circular triggers:
    patient: Optional[PatientResponse] = None
    doctor: Optional[UserResponse] = None

    class Config:
        from_attributes = True
        
# For fast dropdown selectors
class DoctorSelector(BaseModel):
    id: int
    full_name: Optional[str]
    email: str
    role: str
    
    class Config:
        from_attributes = True
