from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, index=True, nullable=False)  # appointment, discharge, follow_up, custom
    status = Column(String, index=True, default="pending", nullable=False)  # pending, sent, failed
    message = Column(Text, nullable=False)
    phone_number = Column(String, nullable=False)
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    sent_time = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Establish relationship to patient
    patient = relationship("Patient", backref="notifications")
