import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import PropertyValuation
from app.schemas import (
    ValuationRequest, ValuationData, ValuationRecord, APIEnvelope
)
from app.services.valuation_service import ValuationService

router = APIRouter(prefix="/valuation", tags=["Real Estate Valuation"])

@router.post("", response_model=APIEnvelope[ValuationData])
def calculate_and_save_valuation(
    req: ValuationRequest,
    db: Session = Depends(get_db)
):
    val_data, mode = ValuationService.calculate_valuation(req)

    # Persist in DB
    record = PropertyValuation(
        project_id=req.project_id,
        property_type=req.property_type,
        location=req.location,
        land_area=req.land_area,
        builtup_area=req.builtup_area,
        floors=req.floors,
        rooms=req.rooms,
        age=req.age,
        quality=req.quality,
        condition=req.condition,
        amenities=json.dumps(req.amenities),
        estimated_min=val_data.estimated_min,
        estimated_max=val_data.estimated_max,
        estimated_avg=val_data.estimated_avg,
        price_per_sq_unit=val_data.price_per_sq_unit,
        factors=json.dumps([f.model_dump() for f in val_data.factors]),
        assumptions=json.dumps(val_data.assumptions),
        confidence=val_data.confidence,
        is_demo=(mode == "demo")
    )
    db.add(record)
    db.commit()

    return APIEnvelope(success=True, mode=mode, data=val_data)

@router.get("", response_model=APIEnvelope[List[ValuationRecord]])
def get_valuation_history(db: Session = Depends(get_db)):
    records = db.query(PropertyValuation).order_by(PropertyValuation.created_at.desc()).limit(50).all()
    results = [
        ValuationRecord(
            id=r.id,
            property_type=r.property_type,
            location=r.location,
            land_area=r.land_area,
            builtup_area=r.builtup_area,
            floors=r.floors,
            estimated_min=r.estimated_min,
            estimated_max=r.estimated_max,
            estimated_avg=r.estimated_avg,
            price_per_sq_unit=r.price_per_sq_unit,
            confidence=r.confidence,
            is_demo=r.is_demo,
            created_at=r.created_at
        )
        for r in records
    ]
    return APIEnvelope(success=True, mode="db", data=results)
