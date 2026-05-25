from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class PrescriptionBase(BaseModel):
    patient_id: int = Field(..., description="Target patient ID")
    appointment_id: Optional[int] = Field(None, description="Optional associated appointment ID")
    symptoms: str = Field(..., description="Symptoms presenting, e.g. cough, fever")
    diagnosis: str = Field(..., description="Doctor's final diagnosis")
    medicines: str = Field(..., description="Medicines list, e.g. Paracetamol 500mg, Amoxicillin")
    instructions: str = Field(..., description="Take twice daily after meals")


class PrescriptionCreate(PrescriptionBase):
    pass


class PrescriptionResponse(PrescriptionBase):
    id: int
    doctor_id: int
    created_at: datetime

    class Config:
        from_attributes = True
