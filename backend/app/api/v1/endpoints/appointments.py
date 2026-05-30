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

def schedule_appointment_reminder_sms(db: Session, appointment_id: int):
    try:
        from datetime import datetime, timedelta, timezone
        from app.models.appointment import Appointment
        from app.models.notification import Notification
        
        # Refresh appointment with relations loaded
        appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appt or not appt.patient:
            return
            
        # 1. Parse date and time slot
        try:
            time_parts = appt.time_slot.split(" ")
            hh_mm = time_parts[0].split(":")
            hour = int(hh_mm[0])
            minute = int(hh_mm[1])
            if len(time_parts) > 1 and time_parts[1].upper() == "PM" and hour < 12:
                hour += 12
            elif len(time_parts) > 1 and time_parts[1].upper() == "AM" and hour == 12:
                hour = 0
                
            date_parts = appt.appointment_date.split("-")
            year = int(date_parts[0])
            month = int(date_parts[1])
            day = int(date_parts[2])
            
            appt_dt = datetime(year, month, day, hour, minute, tzinfo=timezone.utc)
            scheduled_time = appt_dt - timedelta(days=1)
            
            if scheduled_time <= datetime.now(timezone.utc):
                # If within 24h, schedule for 5 seconds in the future so poller triggers it immediately
                scheduled_time = datetime.now(timezone.utc) + timedelta(seconds=5)
        except Exception:
            scheduled_time = datetime.now(timezone.utc) + timedelta(seconds=5)
            
        # 2. Build message body
        msg = (
            f"Dear {appt.patient.name}, this is a reminder for your appointment with "
            f"Dr. {appt.doctor.full_name} on {appt.appointment_date} at {appt.time_slot}. "
            f"Your queue token is #{appt.token_number}. Please arrive 15 minutes before your slot. "
            f"Reply HELP for info."
        )
        
        # 3. Create Notification record
        # Check if there's already an active scheduled reminder for this appointment, cancel it
        existing = db.query(Notification).filter(
            Notification.patient_id == appt.patient_id,
            Notification.type == "appointment",
            Notification.message.like(f"%token is #{appt.token_number}%"),
            Notification.status == "pending"
        ).first()
        
        if existing:
            db.delete(existing)
            
        notification = Notification(
            patient_id=appt.patient_id,
            type="appointment",
            status="pending",
            message=msg,
            phone_number=appt.patient.phone_number,
            scheduled_time=scheduled_time
        )
        db.add(notification)
        db.commit()
        print(f"⏰ [Notification Hub] Scheduled appointment reminder SMS for Patient {appt.patient.name} at {scheduled_time}")
    except Exception as e:
        print(f"⚠️ [Notification Hub] Error scheduling appointment reminder: {str(e)}")


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
    
    # Schedule SMS reminder
    schedule_appointment_reminder_sms(db, db_appointment.id)
    
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
    
    # Reschedule SMS reminder if date/time slot updated
    if rescheduling:
        schedule_appointment_reminder_sms(db, appointment.id)
        
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
