from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app import models, schemas
from app.api import deps
from app.core.database import get_db
from app.models.patient import Patient
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=schemas.patient.PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    *,
    db: Session = Depends(get_db),
    patient_in: schemas.patient.PatientCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new patient record. Captures registration clinician credentials.
    """
    # Create patient row
    db_patient = Patient(
        name=patient_in.name,
        age=patient_in.age,
        gender=patient_in.gender,
        blood_group=patient_in.blood_group,
        allergies=patient_in.allergies,
        disease_history=patient_in.disease_history,
        phone_number=patient_in.phone_number,
        address=patient_in.address,
        created_by_id=current_user.id,
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("/", response_model=List[schemas.patient.PatientResponse])
def read_patients(
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    gender: Optional[str] = None,
    blood_group: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve patients with support for dynamic search by name and filtering by blood group/gender.
    """
    query = db.query(Patient)

    if search:
        query = query.filter(Patient.name.ilike(f"%{search}%"))
    
    if gender:
        query = query.filter(Patient.gender == gender)
        
    if blood_group:
        query = query.filter(Patient.blood_group == blood_group)

    return query.order_by(Patient.name.asc()).all()


@router.get("/{id}", response_model=schemas.patient.PatientResponse)
def read_patient_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve an individual patient's dossier record.
    """
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )
    return patient


@router.put("/{id}", response_model=schemas.patient.PatientResponse)
def update_patient(
    *,
    id: int,
    db: Session = Depends(get_db),
    patient_in: schemas.patient.PatientUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update patient details.
    """
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )
        
    # Update only provided attributes
    update_data = patient_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{id}", response_model=schemas.patient.PatientResponse)
def delete_patient(
    *,
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a patient record from the database.
    """
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )
    db.delete(patient)
    db.commit()
    return patient
