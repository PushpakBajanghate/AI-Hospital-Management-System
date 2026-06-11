import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Vercel filesystem is read-only. Use /tmp for SQLite.
if os.environ.get("VERCEL") == "1" and database_url.startswith("sqlite"):
    database_url = "sqlite:////tmp/hospital.db"
    db_source = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "hospital.db")
    db_target = "/tmp/hospital.db"
    if os.path.exists(db_source) and not os.path.exists(db_target):
        try:
            shutil.copy2(db_source, db_target)
        except Exception as e:
            print(f"Error copying DB: {e}")

# Detect if we are using SQLite for local development
if database_url.startswith("sqlite"):
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        database_url,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
