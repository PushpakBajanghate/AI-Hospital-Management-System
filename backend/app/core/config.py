from typing import List, Union, Optional
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors(v: Union[str, List[str]]) -> List[str]:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, (list, str)):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )

    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Smart Hospital Management System"
    ENV: str = "development"

    # CORS origins must be provided by environment for each deployment.
    BACKEND_CORS_ORIGINS: str = ""
    BACKEND_CORS_ORIGIN_REGEX: Optional[str] = r"https://.*\.vercel\.app"

    # Database
    DATABASE_URL: str = "sqlite:///./hospital.db"

    # JWT Settings
    SECRET_KEY: str = "yoursecretkeyhereplaceholder"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    DEFAULT_ADMIN_EMAIL: str = "admin@medos.com"
    DEFAULT_ADMIN_PASSWORD: str = "Admin@12345"
    DEFAULT_ADMIN_NAME: str = "MedOS Administrator"

    # Twilio API Configuration
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_FROM_NUMBER: Optional[str] = None

    # OpenAI API Configuration
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-3.5-turbo"



settings = Settings()
