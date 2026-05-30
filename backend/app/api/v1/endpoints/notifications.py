from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app import models, schemas
from app.api import deps
from app.core.database import get_db
from app.models.notification import Notification
from app.models.patient import Patient
from app.models.user import User
from app.services.twilio_service import twilio_service

router = APIRouter()


@router.get("/", response_model=List[schemas.notification.NotificationResponse])
def read_notifications(
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    type: Optional[str] = None,
    patient_id: Optional[int] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve clinical notifications log. Supports optional filters.
    """
    query = db.query(Notification)
    if status:
        query = query.filter(Notification.status == status)
    if type:
        query = query.filter(Notification.type == type)
    if patient_id:
        query = query.filter(Notification.patient_id == patient_id)
        
    return query.order_by(Notification.scheduled_time.desc()).all()


@router.get("/stats", response_model=schemas.notification.NotificationStats)
def get_notification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get system-wide SMS delivery analytics and performance metrics.
    """
    total_sent = db.query(Notification).filter(Notification.status == "sent").count()
    total_pending = db.query(Notification).filter(Notification.status == "pending").count()
    total_failed = db.query(Notification).filter(Notification.status == "failed").count()
    
    total = total_sent + total_failed
    success_rate = round((total_sent / total) * 100, 1) if total > 0 else 100.0
    
    return {
        "total_sent": total_sent,
        "total_pending": total_pending,
        "total_failed": total_failed,
        "success_rate": success_rate
    }


@router.post("/send-instant", response_model=schemas.notification.NotificationResponse)
def send_instant_sms(
    *,
    db: Session = Depends(get_db),
    sms_in: schemas.notification.InstantSMSRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Send an instant SMS to a patient.
    """
    # 1. Fetch patient
    patient = db.query(Patient).filter(Patient.id == sms_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )
        
    # 2. Trigger Twilio
    success, error_msg = twilio_service.send_sms(
        to_number=patient.phone_number,
        message_body=sms_in.message
    )
    
    # 3. Save notification
    db_notification = Notification(
        patient_id=patient.id,
        type="custom",
        status="sent" if success else "failed",
        message=sms_in.message,
        phone_number=patient.phone_number,
        scheduled_time=datetime.now(timezone.utc),
        sent_time=datetime.now(timezone.utc) if success else None,
        error_message=error_msg
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


@router.post("/schedule", response_model=schemas.notification.NotificationResponse)
def schedule_reminder(
    *,
    db: Session = Depends(get_db),
    reminder_in: schemas.notification.NotificationCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Schedule an SMS reminder for a patient in the future.
    """
    patient = db.query(Patient).filter(Patient.id == reminder_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )
        
    db_notification = Notification(
        patient_id=reminder_in.patient_id,
        type=reminder_in.type,
        status="pending",
        message=reminder_in.message,
        phone_number=reminder_in.phone_number,
        scheduled_time=reminder_in.scheduled_time
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


@router.post("/trigger-pending", response_model=List[schemas.notification.NotificationResponse])
def trigger_pending_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Manually force-trigger and process ALL pending reminders immediately.
    """
    pending_reminders = db.query(Notification).filter(Notification.status == "pending").all()
    
    print(f"⏰ [Manual Trigger] Triggering delivery for {len(pending_reminders)} pending notifications...")
    for reminder in pending_reminders:
        try:
            success, error_msg = twilio_service.send_sms(
                to_number=reminder.phone_number,
                message_body=reminder.message
            )
            
            if success:
                reminder.status = "sent"
                reminder.sent_time = datetime.now(timezone.utc)
            else:
                reminder.status = "failed"
                reminder.error_message = error_msg
                
            db.add(reminder)
        except Exception as e:
            reminder.status = "failed"
            reminder.error_message = str(e)
            db.add(reminder)
            
    db.commit()
    
    # Return all processed items
    return pending_reminders


@router.delete("/{id}", response_model=schemas.notification.NotificationResponse)
def cancel_notification(
    *,
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Cancel and delete a scheduled notification.
    """
    notification = db.query(Notification).filter(Notification.id == id).first()
    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification record not found.",
        )
    db.delete(notification)
    db.commit()
    return notification
