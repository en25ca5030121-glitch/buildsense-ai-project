import json
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models import (
    DailyReport, Project, SafetyInspection, CrackInspection, PropertyValuation, ProjectPlan
)
from app.schemas import (
    DailyReportCreate, DailyReportResponse, APIEnvelope
)

router = APIRouter(prefix="/reports", tags=["Daily Reports & Central Reporting"])

@router.get("/daily", response_model=APIEnvelope[List[DailyReportResponse]])
def get_daily_reports(
    project_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(DailyReport)
    if project_id:
        query = query.filter(DailyReport.project_id == project_id)
    reports = query.order_by(DailyReport.created_at.desc()).limit(50).all()
    
    data = []
    for r in reports:
        proj_name = r.project.name if r.project else "General Site"
        photos_list = []
        try:
            photos_list = json.loads(r.photos) if r.photos else []
        except Exception:
            photos_list = []

        data.append(DailyReportResponse(
            id=r.id,
            project_id=r.project_id,
            project_name=proj_name,
            report_date=r.report_date,
            work_completed=r.work_completed,
            workers_count=r.workers_count,
            equipment_used=r.equipment_used or "",
            materials_consumed=r.materials_consumed or "",
            deliveries=r.deliveries or "",
            weather_notes=r.weather_notes or "",
            safety_incidents=r.safety_incidents or "None reported",
            delays=r.delays or "None",
            photos=photos_list,
            next_day_plan=r.next_day_plan,
            supervisor_notes=r.supervisor_notes,
            supervisor_name=r.supervisor_name,
            created_at=r.created_at
        ))
    return APIEnvelope(success=True, mode="db", data=data)

@router.post("/daily", response_model=APIEnvelope[DailyReportResponse])
def create_daily_report(
    rep_in: DailyReportCreate,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == rep_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Associated project not found")
    
    report = DailyReport(
        project_id=rep_in.project_id,
        report_date=rep_in.report_date,
        work_completed=rep_in.work_completed,
        workers_count=rep_in.workers_count,
        equipment_used=rep_in.equipment_used,
        materials_consumed=rep_in.materials_consumed,
        deliveries=rep_in.deliveries,
        weather_notes=rep_in.weather_notes,
        safety_incidents=rep_in.safety_incidents,
        delays=rep_in.delays,
        photos=json.dumps(rep_in.photos or []),
        next_day_plan=rep_in.next_day_plan,
        supervisor_notes=rep_in.supervisor_notes,
        supervisor_name=rep_in.supervisor_name
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return APIEnvelope(
        success=True,
        mode="db",
        data=DailyReportResponse(
            id=report.id,
            project_id=report.project_id,
            project_name=project.name,
            report_date=report.report_date,
            work_completed=report.work_completed,
            workers_count=report.workers_count,
            equipment_used=report.equipment_used,
            materials_consumed=report.materials_consumed,
            deliveries=report.deliveries,
            weather_notes=report.weather_notes,
            safety_incidents=report.safety_incidents,
            delays=report.delays,
            photos=rep_in.photos or [],
            next_day_plan=report.next_day_plan,
            supervisor_notes=report.supervisor_notes,
            supervisor_name=report.supervisor_name,
            created_at=report.created_at
        )
    )

@router.get("/daily/{report_id}", response_model=APIEnvelope[DailyReportResponse])
def get_daily_report_detail(report_id: int, db: Session = Depends(get_db)):
    r = db.query(DailyReport).filter(DailyReport.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Daily report not found")
    
    photos_list = []
    try:
        photos_list = json.loads(r.photos) if r.photos else []
    except Exception:
        photos_list = []

    return APIEnvelope(
        success=True,
        mode="db",
        data=DailyReportResponse(
            id=r.id,
            project_id=r.project_id,
            project_name=r.project.name if r.project else "Site",
            report_date=r.report_date,
            work_completed=r.work_completed,
            workers_count=r.workers_count,
            equipment_used=r.equipment_used or "",
            materials_consumed=r.materials_consumed or "",
            deliveries=r.deliveries or "",
            weather_notes=r.weather_notes or "",
            safety_incidents=r.safety_incidents or "None",
            delays=r.delays or "None",
            photos=photos_list,
            next_day_plan=r.next_day_plan,
            supervisor_notes=r.supervisor_notes,
            supervisor_name=r.supervisor_name,
            created_at=r.created_at
        )
    )

@router.get("/central-overview", response_model=APIEnvelope[dict])
def get_central_reporting_overview(db: Session = Depends(get_db)):
    """Aggregated record counts and recent entries across all intelligence modules."""
    projects_cnt = db.query(Project).count()
    safety_cnt = db.query(SafetyInspection).count()
    cracks_cnt = db.query(CrackInspection).count()
    valuations_cnt = db.query(PropertyValuation).count()
    daily_cnt = db.query(DailyReport).count()
    plans_cnt = db.query(ProjectPlan).count()

    recent_safety = db.query(SafetyInspection).order_by(SafetyInspection.created_at.desc()).limit(5).all()
    recent_cracks = db.query(CrackInspection).order_by(CrackInspection.created_at.desc()).limit(5).all()

    return APIEnvelope(
        success=True,
        mode="db",
        data={
            "counts": {
                "projects": projects_cnt,
                "safety_inspections": safety_cnt,
                "crack_inspections": cracks_cnt,
                "valuations": valuations_cnt,
                "daily_reports": daily_cnt,
                "project_plans": plans_cnt
            },
            "recent_safety": [
                {"id": s.id, "summary": s.summary[:60] + "...", "severity": s.overall_severity, "date": s.created_at.strftime("%Y-%m-%d")}
                for s in recent_safety
            ],
            "recent_cracks": [
                {"id": c.id, "structure": c.structure_type, "severity": c.severity, "date": c.created_at.strftime("%Y-%m-%d")}
                for c in recent_cracks
            ]
        }
    )

@router.get("/export/csv/{dataset}")
def export_csv_dataset(dataset: str, db: Session = Depends(get_db)):
    """Generate RFC 4180 CSV export for stored records."""
    if dataset == "projects":
        rows = ["ID,Name,Type,Location,Budget,Spent,Status,Completion%"]
        for p in db.query(Project).all():
            rows.append(f"{p.id},\"{p.name}\",\"{p.project_type}\",\"{p.location}\",{p.budget},{p.spent_budget},\"{p.status}\",{p.completion_percentage}")
        csv_content = "\n".join(rows)
        return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=projects.csv"})
    
    elif dataset == "safety":
        rows = ["ID,ProjectID,Image,Severity,Summary,Created"]
        for s in db.query(SafetyInspection).all():
            clean_sum = s.summary.replace('"', '""')
            rows.append(f"{s.id},{s.project_id or ''},\"{s.image_name or ''}\",\"{s.overall_severity}\",\"{clean_sum}\",\"{s.created_at}\"")
        csv_content = "\n".join(rows)
        return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=safety_inspections.csv"})
    
    elif dataset == "daily":
        rows = ["ID,ProjectID,Date,Workers,Weather,Delays,WorkCompleted"]
        for d in db.query(DailyReport).all():
            clean_work = d.work_completed.replace('"', '""')
            rows.append(f"{d.id},{d.project_id},\"{d.report_date}\",{d.workers_count},\"{d.weather_notes}\",\"{d.delays}\",\"{clean_work}\"")
        csv_content = "\n".join(rows)
        return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=daily_site_reports.csv"})

    raise HTTPException(status_code=400, detail="Invalid dataset type for export. Options: projects, safety, daily")
