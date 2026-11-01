from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.core.config import settings
from app.services.ai_service import AIService

router = APIRouter(tags=["Health & Diagnostics"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    ai_provider = AIService.get_configured_provider()
    weather_provider = "live" if settings.WEATHER_API_KEY else "demo"

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected" if db_ok else "unreachable",
        "ai_provider": ai_provider,
        "weather_provider": weather_provider,
        "demo_mode": settings.ENABLE_DEMO_MODE
    }
