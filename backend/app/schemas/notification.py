from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.patient import PatientResponse


class NotificationBase(BaseModel):
    patient_id: int = Field(..., description="Target patient ID")
    type: str = Field(..., description="Type of notification: appointment, discharge, follow_up, custom")
    message: str = Field(..., description="SMS message text")
    phone_number: str = Field(..., description="Target phone number for SMS")
    scheduled_time: datetime = Field(..., description="Scheduled delivery timestamp")


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(NotificationBase):
    id: int
    status: str
    sent_time: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    patient: Optional[PatientResponse] = None

    class Config:
        from_attributes = True


class InstantSMSRequest(BaseModel):
    patient_id: int = Field(..., description="Target patient ID")
    message: str = Field(..., description="SMS message text")


class NotificationStats(BaseModel):
    total_sent: int
    total_pending: int
    total_failed: int
    success_rate: float
