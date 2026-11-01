import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "BuildSense AI — Construction Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = "buildsense-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./buildsense.db"
    
    # External Providers
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    WEATHER_API_KEY: str = ""
    
    # Demo mode fallback
    ENABLE_DEMO_MODE: bool = True
    
    # Uploads
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    MAX_FILE_SIZE_MB: int = 15
    ALLOWED_IMAGE_TYPES: list[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
        "image/tiff"
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
