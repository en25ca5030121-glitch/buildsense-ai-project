import os
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models import SafetyInspection, CrackInspection
from app.schemas import (
    SafetyAnalysisData, SafetyInspectionRecord,
    CrackAnalysisData, CrackInspectionRecord, APIEnvelope
)
from app.services.ai_service import AIService
from app.core.config import settings

router = APIRouter(prefix="/analysis", tags=["AI Multimodal Site Analysis"])

@router.post("/safety", response_model=APIEnvelope[SafetyAnalysisData])
async def analyze_site_safety(
    file: Optional[UploadFile] = File(None),
    project_id: Optional[int] = Form(None),
    categories: Optional[str] = Form(None),  # Comma-separated categories
    db: Session = Depends(get_db)
):
    saved_path = None
    original_filename = "demo_photo.jpg"

    if file:
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{file.content_type}'. Supported image formats: JPEG, PNG, WEBP."
            )
        
        # Read content to check file size
        contents = await file.read()
        if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum size limit of {settings.MAX_FILE_SIZE_MB}MB."
            )
        
        ext = os.path.splitext(file.filename)[1] or ".jpg"
        unique_name = f"safety_{uuid.uuid4().hex[:10]}{ext}"
        saved_path = os.path.join(settings.UPLOAD_DIR, unique_name)
        with open(saved_path, "wb") as f:
            f.write(contents)
        original_filename = file.filename

    cat_list = [c.strip() for c in categories.split(",")] if categories else []

    try:
        analysis_data, mode = await AIService.analyze_site_safety(saved_path, cat_list)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Safety analysis failed: {str(e)}"
        )

    # Persist in DB
    record = SafetyInspection(
        project_id=project_id,
        image_name=original_filename,
        image_path=saved_path,
        analysis_type="safety",
        summary=analysis_data.summary,
        findings=json.dumps([f.model_dump() for f in analysis_data.findings]),
        limitations=json.dumps(analysis_data.limitations),
        overall_severity=analysis_data.overall_severity,
        is_demo=(mode == "demo")
    )
    db.add(record)
    db.commit()

    return APIEnvelope(success=True, mode=mode, data=analysis_data)

@router.get("/safety", response_model=APIEnvelope[List[SafetyInspectionRecord]])
def get_safety_history(db: Session = Depends(get_db)):
    records = db.query(SafetyInspection).order_by(SafetyInspection.created_at.desc()).limit(50).all()
    results = []
    for r in records:
        try:
            findings_list = json.loads(r.findings)
        except Exception:
            findings_list = []
        try:
            limitations_list = json.loads(r.limitations)
        except Exception:
            limitations_list = []
        
        results.append(SafetyInspectionRecord(
            id=r.id,
            project_id=r.project_id,
            image_name=r.image_name,
            image_path=r.image_path,
            summary=r.summary,
            findings=findings_list,
            limitations=limitations_list,
            overall_severity=r.overall_severity or "medium",
            is_demo=r.is_demo,
            created_at=r.created_at
        ))
    return APIEnvelope(success=True, mode="db", data=results)

@router.post("/cracks", response_model=APIEnvelope[CrackAnalysisData])
async def analyze_cracks(
    file: Optional[UploadFile] = File(None),
    structure_type: str = Form("Concrete Wall"),
    location_notes: Optional[str] = Form(""),
    project_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    saved_path = None
    original_filename = "demo_crack_surface.jpg"

    if file:
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{file.content_type}'. Supported image formats: JPEG, PNG, WEBP."
            )
        
        contents = await file.read()
        if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum size limit of {settings.MAX_FILE_SIZE_MB}MB."
            )
        
        ext = os.path.splitext(file.filename)[1] or ".jpg"
        unique_name = f"crack_{uuid.uuid4().hex[:10]}{ext}"
        saved_path = os.path.join(settings.UPLOAD_DIR, unique_name)
        with open(saved_path, "wb") as f:
            f.write(contents)
        original_filename = file.filename

    try:
        analysis_data, mode = await AIService.analyze_cracks(saved_path, structure_type, location_notes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Crack analysis failed: {str(e)}"
        )

    # Persist in DB
    record = CrackInspection(
        project_id=project_id,
        image_name=original_filename,
        image_path=saved_path,
        structure_type=structure_type,
        location_notes=location_notes,
        summary=analysis_data.summary,
        findings=json.dumps([obs.model_dump() for obs in analysis_data.observations]),
        limitations=json.dumps(analysis_data.limitations),
        severity=analysis_data.overall_severity,
        is_demo=(mode == "demo")
    )
    db.add(record)
    db.commit()

    return APIEnvelope(success=True, mode=mode, data=analysis_data)

@router.get("/cracks", response_model=APIEnvelope[List[CrackInspectionRecord]])
def get_crack_history(db: Session = Depends(get_db)):
    records = db.query(CrackInspection).order_by(CrackInspection.created_at.desc()).limit(50).all()
    results = []
    for r in records:
        try:
            findings_list = json.loads(r.findings)
        except Exception:
            findings_list = []
        try:
            limitations_list = json.loads(r.limitations)
        except Exception:
            limitations_list = []
        
        results.append(CrackInspectionRecord(
            id=r.id,
            project_id=r.project_id,
            image_name=r.image_name,
            structure_type=r.structure_type,
            location_notes=r.location_notes,
            summary=r.summary,
            findings=findings_list,
            limitations=limitations_list,
            severity=r.severity or "low",
            is_demo=r.is_demo,
            created_at=r.created_at
        ))
    return APIEnvelope(success=True, mode="db", data=results)
