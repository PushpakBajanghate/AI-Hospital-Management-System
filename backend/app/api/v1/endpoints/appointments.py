from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.api import deps
from app.core.database import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=schemas.appointment.AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    *,
    db: Session = Depends(get_db),
    appointment_in: schemas.appointment.AppointmentCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Book a new appointment. Prevents double-booking and assigns a sequential queue token.
    """
    # 1. Verify Patient exists
    patient = db.query(Patient).filter(Patient.id == appointment_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Specified Patient record not found.",
        )

    # 2. Verify Doctor exists and has correct role
    doctor = db.query(User).filter(User.id == appointment_in.doctor_id, User.role == "doctor").first()
    if not doctor:
        raise HTTPException(
            status_code=400,
            detail="Specified Practitioner user not found or does not hold the Doctor role.",
        )

    # 3. Check Slot availability (Double-booking check)
    existing_booking = db.query(Appointment).filter(
        Appointment.doctor_id == appointment_in.doctor_id,
        Appointment.appointment_date == appointment_in.appointment_date,
        Appointment.time_slot == appointment_in.time_slot,
        Appointment.status != "cancelled"
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=400,
            detail=f"This time slot ({appointment_in.time_slot}) is already booked for Dr. {doctor.full_name} on {appointment_in.appointment_date}.",
        )

    # 4. Generate Queue Token sequentially
    max_token = db.query(func.max(Appointment.token_number)).filter(
        Appointment.doctor_id == appointment_in.doctor_id,
        Appointment.appointment_date == appointment_in.appointment_date
    ).scalar()

    next_token = (max_token or 0) + 1

    # 5. Save appointment
    db_appointment = Appointment(
        patient_id=appointment_in.patient_id,
        doctor_id=appointment_in.doctor_id,
        appointment_date=appointment_in.appointment_date,
        time_slot=appointment_in.time_slot,
        token_number=next_token,
        status="scheduled",
        notes=appointment_in.notes,
    )
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


@router.get("/", response_model=List[schemas.appointment.AppointmentResponse])
def read_appointments(
    db: Session = Depends(get_db),
    doctor_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    appointment_date: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve appointments with flexible filters for doctors, patients, or specific days.
    """
    query = db.query(Appointment)

    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
        
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
        
    if appointment_date:
        query = query.filter(Appointment.appointment_date == appointment_date)

    # Order by Date and Time Slot
    return query.order_by(Appointment.appointment_date.asc(), Appointment.time_slot.asc()).all()


@router.get("/{id}", response_model=schemas.appointment.AppointmentResponse)
def read_appointment_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Fetch details of a single scheduled appointment slot.
    """
    appointment = db.query(Appointment).filter(Appointment.id == id).first()
    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment record not found.",
        )
    return appointment


@router.put("/{id}", response_model=schemas.appointment.AppointmentResponse)
def update_appointment(
    *,
    id: int,
    db: Session = Depends(get_db),
    appointment_in: schemas.appointment.AppointmentUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update appointment parameters (Status transition, or Rescheduling dates).
    """
    appointment = db.query(Appointment).filter(Appointment.id == id).first()
    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment record not found.",
        )

    # If rescheduling, check slot validation and generate a new token
    rescheduling = (
        (appointment_in.appointment_date and appointment_in.appointment_date != appointment.appointment_date) or
        (appointment_in.time_slot and appointment_in.time_slot != appointment.time_slot)
    )

    if rescheduling:
        target_date = appointment_in.appointment_date or appointment.appointment_date
        target_slot = appointment_in.time_slot or appointment.time_slot
        
        # Check slot
        existing_booking = db.query(Appointment).filter(
            Appointment.doctor_id == appointment.doctor_id,
            Appointment.appointment_date == target_date,
            Appointment.time_slot == target_slot,
            Appointment.status != "cancelled",
            Appointment.id != id
        ).first()

        if existing_booking:
            raise HTTPException(
                status_code=400,
                detail=f"Reschedule failed: Time slot {target_slot} is already booked for this doctor on {target_date}.",
            )

        # Allocate new token for that target day
        max_token = db.query(func.max(Appointment.token_number)).filter(
            Appointment.doctor_id == appointment.doctor_id,
            Appointment.appointment_date == target_date
        ).scalar()
        
        appointment.token_number = (max_token or 0) + 1
        appointment.appointment_date = target_date
        appointment.time_slot = target_slot

    # Update only provided attributes
    update_data = appointment_in.model_dump(exclude_unset=True, exclude={"appointment_date", "time_slot"})
    for field, value in update_data.items():
        setattr(appointment, field, value)

    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/{id}", response_model=schemas.appointment.AppointmentResponse)
def delete_appointment(
    *,
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an appointment record completely.
    """
    appointment = db.query(Appointment).filter(Appointment.id == id).first()
    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment record not found.",
        )
    db.delete(appointment)
    db.commit()
    return appointment
