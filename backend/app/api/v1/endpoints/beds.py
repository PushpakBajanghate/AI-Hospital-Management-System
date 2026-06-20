from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.core.database import get_db
from app.models.bed import Bed
from app.models.admission import Admission
from app.models.user import User

router = APIRouter()
OPERATIONS_ROLES = ["admin", "nurse", "receptionist", "staff"]
CLINICAL_ROLES = ["doctor", "nurse", "admin", "staff"]


@router.get("/", response_model=List[schemas.bed.BedResponse])
def read_beds(
    db: Session = Depends(get_db),
    room_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve clinical beds with optional filter by room type and occupancy status.
    """
    query = db.query(Bed)
    if room_type:
        query = query.filter(Bed.room_type == room_type)
    if status:
        query = query.filter(Bed.status == status)
    return query.order_by(Bed.bed_number.asc()).all()


@router.post("/", response_model=schemas.bed.BedResponse, status_code=status.HTTP_201_CREATED)
def create_bed(
    *,
    db: Session = Depends(get_db),
    bed_in: schemas.bed.BedCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new clinical bed record. Restrict to Admin/Staff.
    """
    if current_user.role not in OPERATIONS_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Creating beds is restricted to administrative and clinical staff."
        )

    # Check for existing bed number
    existing_bed = db.query(Bed).filter(Bed.bed_number == bed_in.bed_number).first()
    if existing_bed:
        raise HTTPException(
            status_code=400,
            detail=f"Bed number {bed_in.bed_number} already exists."
        )

    db_bed = Bed(
        bed_number=bed_in.bed_number,
        room_type=bed_in.room_type,
        status=bed_in.status
    )
    db.add(db_bed)
    db.commit()
    db.refresh(db_bed)
    return db_bed


@router.delete("/{id}", response_model=schemas.bed.BedResponse)
def delete_bed(
    *,
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a bed. Restrict to Admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Deleting beds is restricted to administrators."
        )

    bed = db.query(Bed).filter(Bed.id == id).first()
    if not bed:
        raise HTTPException(
            status_code=404,
            detail="Bed not found."
        )

    if bed.status == "occupied":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete an occupied bed. Discharge or transfer the patient first."
        )

    db.delete(bed)
    db.commit()
    return bed


@router.put("/transfer/{admission_id}", response_model=schemas.bed.AdmissionResponse)
def transfer_patient_bed(
    *,
    admission_id: int,
    transfer_in: schemas.bed.TransferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Room transfer system. Moves an active admitted patient to a new target bed.
    """
    # Enforce role safety
    if current_user.role not in CLINICAL_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Transferring patients is restricted to medical practitioners and staff."
        )

    # 1. Fetch the active admission
    admission = db.query(Admission).filter(
        Admission.id == admission_id,
        Admission.status == "admitted"
    ).first()
    if not admission:
        raise HTTPException(
            status_code=404,
            detail="Active admission record not found."
        )

    # 2. Fetch the target bed
    target_bed = db.query(Bed).filter(Bed.id == transfer_in.target_bed_id).first()
    if not target_bed:
        raise HTTPException(
            status_code=404,
            detail="Target bed not found."
        )

    if target_bed.status != "vacant":
        raise HTTPException(
            status_code=400,
            detail=f"Target bed {target_bed.bed_number} is currently {target_bed.status}."
        )

    # 3. Fetch the old bed and free it
    old_bed = db.query(Bed).filter(Bed.id == admission.bed_id).first()
    if old_bed:
        old_bed.status = "vacant"
        old_bed.current_patient_id = None
        db.add(old_bed)

    # 4. Occupy the new bed
    target_bed.status = "occupied"
    target_bed.current_patient_id = admission.patient_id
    db.add(target_bed)

    # 5. Update admission record
    admission.bed_id = target_bed.id
    db.add(admission)
    
    db.commit()
    db.refresh(admission)
    return admission
