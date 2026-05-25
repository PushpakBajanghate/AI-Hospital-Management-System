from fastapi import APIRouter
from app.api.v1.endpoints import auth, patients, appointments, doctor, beds, admissions

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(doctor.router, prefix="/doctor", tags=["doctor"])
api_router.include_router(beds.router, prefix="/beds", tags=["beds"])
api_router.include_router(admissions.router, prefix="/admissions", tags=["admissions"])
