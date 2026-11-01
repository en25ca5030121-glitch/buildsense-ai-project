import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import ProjectPlan
from app.schemas import (
    PlanGenerateRequest, PlanData, PlanRecord, APIEnvelope
)
from app.services.planning_service import PlanningService

router = APIRouter(prefix="/planning", tags=["Project Planning"])

@router.post("/generate", response_model=APIEnvelope[PlanData])
def generate_project_plan(
    req: PlanGenerateRequest
):
    plan_data, mode = PlanningService.generate_plan(req)
    return APIEnvelope(success=True, mode=mode, data=plan_data)

@router.post("/save", response_model=APIEnvelope[PlanRecord])
def save_project_plan(
    plan: PlanData,
    project_id: int = None,
    db: Session = Depends(get_db)
):
    record = ProjectPlan(
        project_id=project_id,
        project_name=plan.project_name,
        scope=plan.scope,
        estimated_budget=plan.total_estimated_budget,
        estimated_duration_months=plan.estimated_duration_months,
        wbs=json.dumps([t.model_dump() for t in plan.wbs]),
        milestones=json.dumps([m.model_dump() for m in plan.milestones]),
        risks=json.dumps([r.model_dump() for r in plan.risks]),
        budget_allocation=json.dumps([b.model_dump() for b in plan.budget_allocation]),
        is_demo=True
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return APIEnvelope(
        success=True,
        mode="db",
        data=PlanRecord(
            id=record.id,
            project_name=record.project_name,
            scope=record.scope,
            estimated_duration_months=record.estimated_duration_months,
            estimated_budget=record.estimated_budget,
            wbs=plan.wbs,
            milestones=plan.milestones,
            risks=plan.risks,
            budget_allocation=plan.budget_allocation,
            is_demo=record.is_demo,
            created_at=record.created_at
        )
    )

@router.get("", response_model=APIEnvelope[List[PlanRecord]])
def list_plans(db: Session = Depends(get_db)):
    records = db.query(ProjectPlan).order_by(ProjectPlan.created_at.desc()).limit(30).all()
    results = []
    for r in records:
        try:
            wbs = json.loads(r.wbs)
        except Exception:
            wbs = []
        try:
            milestones = json.loads(r.milestones)
        except Exception:
            milestones = []
        try:
            risks = json.loads(r.risks)
        except Exception:
            risks = []
        try:
            budget_alloc = json.loads(r.budget_allocation)
        except Exception:
            budget_alloc = []
        
        results.append(PlanRecord(
            id=r.id,
            project_name=r.project_name,
            scope=r.scope,
            estimated_duration_months=r.estimated_duration_months,
            estimated_budget=r.estimated_budget,
            wbs=wbs,
            milestones=milestones,
            risks=risks,
            budget_allocation=budget_alloc,
            is_demo=r.is_demo,
            created_at=r.created_at
        ))
    return APIEnvelope(success=True, mode="db", data=results)
