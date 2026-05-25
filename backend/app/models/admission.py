from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    bed_id = Column(Integer, ForeignKey("beds.id"), nullable=False)
    admitting_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    admission_date = Column(DateTime(timezone=True), server_default=func.now())
    severity = Column(String, nullable=False, default="normal")  # "normal", "urgent", "critical"
    reason = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="admitted")  # "admitted", "discharged"
    discharge_date = Column(DateTime(timezone=True), nullable=True)
    discharge_notes = Column(Text, nullable=True)

    # Relationships
    patient = relationship("Patient", backref="admissions")
    bed = relationship("Bed", backref="admissions")
    doctor = relationship("User", backref="admissions")
