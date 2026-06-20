from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app import models, schemas
from app.api import deps
from app.core.database import get_db
from app.models.admission import Admission
from app.models.bed import Bed
from app.models.patient import Patient
from app.models.user import User

def trigger_discharge_notifications(db: Session, admission_id: int):
    try:
        from datetime import datetime, timedelta, timezone
        from app.models.admission import Admission
        from app.models.notification import Notification
        
        # Load admission with patient & doctor loaded
        adm = db.query(Admission).filter(Admission.id == admission_id).first()
        if not adm or not adm.patient:
            return
            
        # 1. Trigger Instant Discharge Summary SMS
        disc_notes = adm.discharge_notes or "Discharged in stable condition. Take rest."
        discharge_msg = (
            f"MedOS Alert: Dear {adm.patient.name}, you have been discharged from MedOS Hospital. "
            f"Care Guidelines: {disc_notes}. "
            f"If you experience any chest pain, high fever, or breathing difficulty, call 911 immediately."
        )
        
        discharge_notification = Notification(
            patient_id=adm.patient_id,
            type="discharge",
            status="pending", # Start as pending so scheduler picks it up immediately (e.g. within 5-15 seconds)
            message=discharge_msg,
            phone_number=adm.patient.phone_number,
            scheduled_time=datetime.now(timezone.utc) + timedelta(seconds=2)
        )
        db.add(discharge_notification)
        
        # 2. Trigger Scheduled Follow-up SMS (7 days from now)
        followup_time = datetime.now(timezone.utc) + timedelta(days=7)
        followup_msg = (
            f"Dear {adm.patient.name}, it has been a week since your discharge from MedOS Hospital. "
            f"We hope you are recovering well! Please remember to schedule a follow-up consultation "
            f"if you have not done so. Stay healthy!"
        )
        
        followup_notification = Notification(
            patient_id=adm.patient_id,
            type="follow_up",
            status="pending",
            message=followup_msg,
            phone_number=adm.patient.phone_number,
            scheduled_time=followup_time
        )
        db.add(followup_notification)
        db.commit()
        
        print(f"⏰ [Notification Hub] Created instant Discharge SMS and scheduled 7-Day Follow-up SMS for Patient {adm.patient.name}")
    except Exception as e:
        print(f"⚠️ [Notification Hub] Error scheduling discharge/followup reminders: {str(e)}")


router = APIRouter()
CLINICAL_ROLES = ["doctor", "nurse", "admin", "staff"]


@router.get("/", response_model=List[schemas.bed.AdmissionResponse])
def read_admissions(
    db: Session = Depends(get_db),
    status: Optional[str] = None,  # admitted, discharged
    patient_id: Optional[int] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve clinical admissions, optionally filtered by status and patient.
    """
    query = db.query(Admission)
    if status:
        query = query.filter(Admission.status == status)
    if patient_id:
        query = query.filter(Admission.patient_id == patient_id)
    return query.order_by(Admission.admission_date.desc()).all()


@router.post("/admit", response_model=schemas.bed.AdmissionResponse, status_code=status.HTTP_201_CREATED)
def admit_patient(
    *,
    db: Session = Depends(get_db),
    admission_in: schemas.bed.AdmissionCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Admit a patient, occupying a bed. Supports emergency priority-based auto-allocation.
    """
    # Enforce role safety
    if current_user.role not in CLINICAL_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Admitting patients is restricted to medical practitioners and staff."
        )

    # 1. Verify Patient exists
    patient = db.query(Patient).filter(Patient.id == admission_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found."
        )

    # 2. Check if patient is already admitted
    active_admission = db.query(Admission).filter(
        Admission.patient_id == admission_in.patient_id,
        Admission.status == "admitted"
    ).first()
    if active_admission:
        raise HTTPException(
            status_code=400,
            detail="Patient is already admitted to an active bed."
        )

    assigned_bed = None

    # 3. Emergency / Priority bed allocation logic
    if admission_in.emergency_allotment:
        # Check severity-based queues
        if admission_in.severity == "critical":
            # Priority 1: Search for first vacant ICU bed
            assigned_bed = db.query(Bed).filter(
                Bed.room_type == "ICU",
                Bed.status == "vacant"
            ).first()

        # Priority 2: If critical but ICU full, or if not critical, search other vacant beds
        if not assigned_bed:
            # Check room types sequentially: General -> Semi-Private -> Private -> ICU
            for room in ["General", "Semi-Private", "Private", "ICU"]:
                assigned_bed = db.query(Bed).filter(
                    Bed.room_type == room,
                    Bed.status == "vacant"
                ).first()
                if assigned_bed:
                    break

        if not assigned_bed:
            raise HTTPException(
                status_code=400,
                detail="Emergency Allotment Failed: No vacant clinical beds available in the hospital."
            )
    else:
        # Manual allocation
        if not admission_in.bed_id:
            raise HTTPException(
                status_code=400,
                detail="Bed ID is required when emergency allotment is disabled."
            )
        
        assigned_bed = db.query(Bed).filter(Bed.id == admission_in.bed_id).first()
        if not assigned_bed:
            raise HTTPException(
                status_code=404,
                detail="Selected bed not found."
            )
        
        if assigned_bed.status != "vacant":
            raise HTTPException(
                status_code=400,
                detail=f"Selected bed {assigned_bed.bed_number} is currently {assigned_bed.status}."
            )

    # 4. Occupy bed
    assigned_bed.status = "occupied"
    assigned_bed.current_patient_id = patient.id
    db.add(assigned_bed)

    # 5. Create admission record
    admitting_doctor_id = current_user.id
    if current_user.role != "doctor":
        # Find a doctor in the system, or fall back to current_user
        first_doc = db.query(User).filter(User.role == "doctor", User.is_active == True).first()
        if first_doc:
            admitting_doctor_id = first_doc.id

    db_admission = Admission(
        patient_id=patient.id,
        bed_id=assigned_bed.id,
        admitting_doctor_id=admitting_doctor_id,
        severity=admission_in.severity,
        reason=admission_in.reason,
        status="admitted"
    )
    db.add(db_admission)
    db.commit()
    db.refresh(db_admission)
    return db_admission


@router.post("/discharge/{id}", response_model=schemas.bed.AdmissionResponse)
def discharge_patient(
    *,
    id: int,
    discharge_in: schemas.bed.DischargeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Discharge a patient, vacating their physical bed and logging summary notes.
    """
    # Enforce role safety
    if current_user.role not in CLINICAL_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Discharging patients is restricted to medical practitioners and staff."
        )

    # 1. Fetch active admission
    admission = db.query(Admission).filter(
        Admission.id == id,
        Admission.status == "admitted"
    ).first()
    if not admission:
        raise HTTPException(
            status_code=404,
            detail="Active admission record not found."
        )

    # 2. Fetch associated bed
    bed = db.query(Bed).filter(Bed.id == admission.bed_id).first()
    if bed:
        bed.status = "vacant"
        bed.current_patient_id = None
        db.add(bed)

    # 3. Complete admission record
    admission.status = "discharged"
    admission.discharge_date = datetime.utcnow()
    admission.discharge_notes = discharge_in.discharge_notes
    db.add(admission)
    
    db.commit()
    db.refresh(admission)
    
    # Trigger Discharge and Follow-up SMS reminders
    trigger_discharge_notifications(db, admission.id)
    
    return admission
