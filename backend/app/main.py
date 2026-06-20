from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text

from app.core.config import parse_cors, settings
from app.core.database import get_db, engine
from app.models.base import Base
from app.api.v1.api import api_router


def ensure_schema_compatibility():
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        user_columns = {column["name"] for column in inspector.get_columns("users")}
        if "refresh_token_hash" not in user_columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE users ADD COLUMN refresh_token_hash VARCHAR"))


def seed_users(db: Session):
    from app.models.user import User
    from app.core import security
    admin = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
    if not admin:
        db.add(User(
            email=settings.DEFAULT_ADMIN_EMAIL,
            hashed_password=security.get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
            full_name=settings.DEFAULT_ADMIN_NAME,
            role="admin",
            is_active=True
        ))
        db.commit()
        print(f"Seeded default admin login: {settings.DEFAULT_ADMIN_EMAIL}")
        return

    changed = False
    if admin.role != "admin":
        admin.role = "admin"
        changed = True
    if not admin.is_active:
        admin.is_active = True
        changed = True
    if changed:
        db.commit()
        print(f"Verified default admin login: {settings.DEFAULT_ADMIN_EMAIL}")

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
    import os
    import shutil

    if os.environ.get("VERCEL") == "1":
        # Copy the pre-populated SQLite DB to /tmp/ if it doesn't exist
        db_source = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "hospital.db")
        db_target = "/tmp/hospital.db"
        if os.path.exists(db_source) and not os.path.exists(db_target):
            try:
                shutil.copy2(db_source, db_target)
            except Exception as e:
                print(f"Error copying DB: {e}")

    from app.core.database import engine
    from app.models.base import Base
    Base.metadata.create_all(bind=engine)
    ensure_schema_compatibility()

    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        seed_users(db)
        seed_beds(db)
    finally:
        db.close()
    
    # Start SMS scheduler
    from app.services.scheduler import start_scheduler
    start_scheduler()


@app.on_event("shutdown")
def shutdown_event():
    from app.services.scheduler import stop_scheduler
    stop_scheduler()


# Register routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            str(origin).strip("/") for origin in parse_cors(settings.BACKEND_CORS_ORIGINS)
        ],
        allow_origin_regex=settings.BACKEND_CORS_ORIGIN_REGEX,
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
