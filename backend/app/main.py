from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.core.database import get_db, engine
from app.models.base import Base
from app.api.v1.api import api_router

# Auto-generate DB tables
Base.metadata.create_all(bind=engine)

def seed_beds(db: Session):
    from app.models.bed import Bed
    # Check if we have any beds
    if db.query(Bed).count() == 0:
        beds_to_seed = [
            # ICU Beds
            Bed(bed_number="ICU-101", room_type="ICU", status="vacant"),
            Bed(bed_number="ICU-102", room_type="ICU", status="vacant"),
            Bed(bed_number="ICU-103", room_type="ICU", status="vacant"),
            Bed(bed_number="ICU-104", room_type="ICU", status="vacant"),
            # General Ward Beds
            Bed(bed_number="GEN-201", room_type="General", status="vacant"),
            Bed(bed_number="GEN-202", room_type="General", status="vacant"),
            Bed(bed_number="GEN-203", room_type="General", status="vacant"),
            Bed(bed_number="GEN-204", room_type="General", status="vacant"),
            Bed(bed_number="GEN-205", room_type="General", status="vacant"),
            Bed(bed_number="GEN-206", room_type="General", status="vacant"),
            # Private Room Beds
            Bed(bed_number="PRI-301", room_type="Private", status="vacant"),
            Bed(bed_number="PRI-302", room_type="Private", status="vacant"),
            Bed(bed_number="PRI-303", room_type="Private", status="vacant"),
            # Semi-Private Room Beds
            Bed(bed_number="SEM-401", room_type="Semi-Private", status="vacant"),
            Bed(bed_number="SEM-402", room_type="Semi-Private", status="vacant"),
        ]
        db.add_all(beds_to_seed)
        db.commit()
        print("Successfully seeded 15 hospital beds!")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.on_event("startup")
def startup_event():
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        seed_beds(db)
    finally:
        db.close()

# Register routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/")
def root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "status": "online"
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Try to execute a simple query to verify DB connection
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "environment": settings.ENV
    }
