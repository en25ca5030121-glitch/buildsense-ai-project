import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.session import Base, engine, SessionLocal
from app.database.seed import seed_initial_data

from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.tasks import router as tasks_router
from app.api.analysis import router as analysis_router
from app.api.valuation import router as valuation_router
from app.api.planning import router as planning_router
from app.api.weather import router as weather_router
from app.api.assistant import router as assistant_router
from app.api.reports import router as reports_router
from app.api.analytics import router as analytics_router
from app.api.health import router as health_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB Schema
    Base.metadata.create_all(bind=engine)
    # Seed Demo Data
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multimodal AI Construction Intelligence Platform API backend with safety audits, crack analysis, CPM planning, and site telemetry.",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files safely
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Centralized Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "mode": "error",
            "data": None,
            "error": f"Internal system error: {str(exc)}"
        }
    )

# Include Routers with standard /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(valuation_router, prefix="/api")
app.include_router(planning_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "status": "operational"
    }
