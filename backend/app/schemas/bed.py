from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.patient import PatientResponse
from app.schemas.user import UserResponse

class BedBase(BaseModel):
    bed_number: str = Field(..., description="E.g., ICU-101, GEN-204")
    room_type: str = Field(..., description="ICU, General, Private, Semi-Private")
    status: str = Field(default="vacant", description="vacant, occupied, maintenance")

class BedCreate(BedBase):
    pass

class BedResponse(BedBase):
    id: int
    current_patient_id: Optional[int] = None
    patient: Optional[PatientResponse] = None

    class Config:
        from_attributes = True

class AdmissionBase(BaseModel):
    patient_id: int = Field(..., description="ID of patient being admitted")
    severity: str = Field(default="normal", description="normal, urgent, critical")
    reason: str = Field(..., description="Reason for patient admission")

class AdmissionCreate(AdmissionBase):
    bed_id: Optional[int] = Field(None, description="Assigned Bed ID (if not emergency/auto-allotted)")
    emergency_allotment: Optional[bool] = Field(False, description="Auto-allocate a bed based on severity")

class AdmissionResponse(AdmissionBase):
    id: int
    bed_id: int
    admitting_doctor_id: int
    admission_date: datetime
    status: str
    discharge_date: Optional[datetime] = None
    discharge_notes: Optional[str] = None
    
    # Nested info for frontend convenience
    patient: Optional[PatientResponse] = None
    bed: Optional[BedResponse] = None
    doctor: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class DischargeRequest(BaseModel):
    discharge_notes: str = Field(..., description="Notes regarding treatment outcome and discharge instructions")

class TransferRequest(BaseModel):
    target_bed_id: int = Field(..., description="Target bed ID to move the patient to")
