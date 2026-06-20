from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Bed(Base):
    __tablename__ = "beds"

    id = Column(Integer, primary_key=True, index=True)
    bed_number = Column(String, unique=True, index=True, nullable=False)
    room_type = Column(
        String, nullable=False
    )  # "ICU", "General", "Private", "Semi-Private"
    status = Column(
        String, nullable=False, default="vacant"
    )  # "vacant", "occupied", "maintenance"
    current_patient_id = Column(
        Integer, ForeignKey("patients.id", ondelete="SET NULL"), nullable=True
    )

    # Establish relationship to Patient
    patient = relationship("Patient", backref="bed")
