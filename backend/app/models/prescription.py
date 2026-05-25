from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    
    symptoms = Column(Text, nullable=False)
    diagnosis = Column(Text, nullable=False)
    medicines = Column(Text, nullable=False)  # Dosages / medicines list
    instructions = Column(Text, nullable=False)  # Intake instructions
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Establish relationships
    patient = relationship("Patient", backref="prescriptions")
    doctor = relationship("User", backref="prescriptions")
    appointment = relationship("Appointment", backref="prescription")
