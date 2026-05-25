from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    appointment_date = Column(String, index=True, nullable=False)  # ISO Date String: YYYY-MM-DD
    time_slot = Column(String, nullable=False)  # E.g., "09:30 AM"
    token_number = Column(Integer, nullable=False)  # Sequential clinic queue token
    status = Column(String, default="scheduled", nullable=False)  # scheduled, checked_in, completed, cancelled
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Establish relationships
    patient = relationship("Patient", backref="appointments")
    doctor = relationship("User", backref="appointments")
