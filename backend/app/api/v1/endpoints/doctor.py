from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app import models, schemas
from app.api import deps
from app.core.database import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.user import User

router = APIRouter()
CLINICAL_ROLES = ["doctor", "nurse", "admin", "staff"]


@router.get("/dashboard-stats")
def get_doctor_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve clinical analytics for the active Doctor's dashboard.
    """
    # Enforce role safety
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Dashboard restricted to Practitioner logins only."
        )

    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    # Fetch doctor's appointments for today
    today_appointments = db.query(Appointment).filter(
        Appointment.doctor_id == current_user.id,
        Appointment.appointment_date == today_str
    ).order_by(Appointment.token_number.asc()).all()

    # Metrics
    total_today = len(today_appointments)
    completed_today = len([app for app in today_appointments if app.status == "completed"])
    pending_today = len([app for app in today_appointments if app.status in ["scheduled", "checked_in"]])

    # Serialize today's appointments manually or via schemas
    serialized_apps = []
    for app in today_appointments:
        serialized_apps.append({
            "id": app.id,
            "patient_id": app.patient_id,
            "patient_name": app.patient.name if app.patient else "Unknown Patient",
            "patient_age": app.patient.age if app.patient else None,
            "patient_gender": app.patient.gender if app.patient else None,
            "patient_blood_group": app.patient.blood_group if app.patient else None,
            "time_slot": app.time_slot,
            "token_number": app.token_number,
            "status": app.status,
            "notes": app.notes
        })

    return {
        "metrics": {
            "total_today": total_today,
            "completed_today": completed_today,
            "pending_today": pending_today
        },
        "today_appointments": serialized_apps
    }


@router.post("/prescriptions", response_model=schemas.prescription.PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_prescription(
    *,
    db: Session = Depends(get_db),
    prescription_in: schemas.prescription.PrescriptionCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a patient prescription. Triggers automatic completion of the corresponding active appointment.
    """
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Uploading prescriptions is restricted to Doctors."
        )

    # 1. Verify Patient exists
    patient = db.query(Patient).filter(Patient.id == prescription_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Specified Patient record not found.",
        )

    # 2. Record Prescription
    db_prescription = Prescription(
        patient_id=prescription_in.patient_id,
        doctor_id=current_user.id,
        appointment_id=prescription_in.appointment_id,
        symptoms=prescription_in.symptoms,
        diagnosis=prescription_in.diagnosis,
        medicines=prescription_in.medicines,
        instructions=prescription_in.instructions
    )
    db.add(db_prescription)

    # 3. Automation: If linked appointment is supplied, transition its status to 'completed'
    if prescription_in.appointment_id:
        appointment = db.query(Appointment).filter(Appointment.id == prescription_in.appointment_id).first()
        if appointment:
            appointment.status = "completed"
            db.add(appointment)

    db.commit()
    db.refresh(db_prescription)
    return db_prescription


@router.get("/patients/{patient_id}/history")
def get_patient_clinical_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve clinical timeline dossier of all past visits and prescriptions for a specific patient.
    """
    if current_user.role not in CLINICAL_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Clinical history is restricted to medical practitioners and admins."
        )

    # 1. Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found."
        )

    # 2. Fetch past prescriptions
    prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id
    ).order_by(Prescription.created_at.desc()).all()

    # 3. Fetch past appointments
    appointments = db.query(Appointment).filter(
        Appointment.patient_id == patient_id
    ).order_by(Appointment.appointment_date.desc()).all()

    # Serialize
    serialized_prescriptions = []
    for pr in prescriptions:
        serialized_prescriptions.append({
            "id": pr.id,
            "doctor_name": pr.doctor.full_name if pr.doctor else "Practitioner",
            "symptoms": pr.symptoms,
            "diagnosis": pr.diagnosis,
            "medicines": pr.medicines,
            "instructions": pr.instructions,
            "created_at": pr.created_at
        })

    serialized_appointments = []
    for app in appointments:
        serialized_appointments.append({
            "id": app.id,
            "doctor_name": app.doctor.full_name if app.doctor else "Practitioner",
            "appointment_date": app.appointment_date,
            "time_slot": app.time_slot,
            "token_number": app.token_number,
            "status": app.status,
            "notes": app.notes
        })

    return {
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "blood_group": patient.blood_group
        },
        "prescriptions": serialized_prescriptions,
        "appointments": serialized_appointments
    }


@router.post("/ai-recommendations", response_model=schemas.prescription.AIRecommendationResponse)
def get_ai_clinical_recommendations(
    *,
    db: Session = Depends(get_db),
    ai_in: schemas.prescription.AIRecommendationRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Generate real-time custom health recommendations assisting the clinician.
    Analyzes patient EMR demographics, chronic history, allergies, symptoms, and proposed medicines.
    """
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="AI recommendations restricted to registered medical practitioners only."
        )

    # 1. Fetch Patient profile
    patient = db.query(Patient).filter(Patient.id == ai_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Target patient clinical record not found."
        )

    # 2. Build patient profile details
    patient_profile = {
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "allergies": patient.allergies,
        "disease_history": patient.disease_history
    }

    # 3. Build clinical context from input request
    clinical_context = {
        "symptoms": ai_in.symptoms,
        "diagnosis": ai_in.diagnosis,
        "medicines": ai_in.medicines,
        "instructions": ai_in.instructions
    }

    # 4. Trigger AI Service
    from app.services.ai_service import ai_service
    suggestions, summary = ai_service.generate_recommendations(patient_profile, clinical_context)

    return {
        "suggestions": suggestions,
        "summary": summary
    }
