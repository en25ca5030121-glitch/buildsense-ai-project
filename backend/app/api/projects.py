import json
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models import Project, Task, Milestone, User
from app.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse, APIEnvelope
)
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/projects", tags=["Project Management"])

def serialize_project(p: Project, db: Session) -> ProjectResponse:
    team = []
    if p.team_members:
        try:
            team = json.loads(p.team_members)
        except Exception:
            team = [p.team_members]

    tasks_count = db.query(Task).filter(Task.project_id == p.id).count()
    pending_tasks = db.query(Task).filter(Task.project_id == p.id, Task.status != "Completed").count()

    return ProjectResponse(
        id=p.id,
        name=p.name,
        project_type=p.project_type,
        location=p.location,
        budget=p.budget,
        spent_budget=p.spent_budget,
        start_date=p.start_date,
        end_date=p.end_date,
        status=p.status,
        completion_percentage=p.completion_percentage,
        client_name=p.client_name,
        project_manager=p.project_manager,
        team_members=team,
        notes=p.notes,
        created_at=p.created_at,
        updated_at=p.updated_at,
        tasks_count=tasks_count,
        pending_tasks=pending_tasks
    )

@router.get("", response_model=APIEnvelope[List[ProjectResponse]])
def list_projects(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Project.status.ilike(f"%{status_filter}%"))
    if search:
        query = query.filter(
            (Project.name.ilike(f"%{search}%")) |
            (Project.location.ilike(f"%{search}%")) |
            (Project.project_type.ilike(f"%{search}%"))
        )
    projects = query.order_by(Project.created_at.desc()).all()
    data = [serialize_project(p, db) for p in projects]
    return APIEnvelope(success=True, mode="db", data=data)

@router.post("", response_model=APIEnvelope[ProjectResponse])
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    team_json = json.dumps(project_in.team_members or [current_user.full_name])
    project = Project(
        name=project_in.name,
        project_type=project_in.project_type,
        location=project_in.location,
        budget=project_in.budget,
        spent_budget=project_in.spent_budget,
        start_date=project_in.start_date,
        end_date=project_in.end_date,
        status=project_in.status,
        completion_percentage=project_in.completion_percentage,
        client_name=project_in.client_name,
        project_manager=project_in.project_manager or current_user.full_name,
        team_members=team_json,
        notes=project_in.notes,
        created_by_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Add default foundation milestone & task
    default_task = Task(
        project_id=project.id,
        title="Initial Site Mobilization & Safety Briefing",
        description="Verify perimeter security, site utility hookups, and issue emergency response plans.",
        due_date=project.start_date,
        status="To Do",
        priority="High",
        assigned_to=project.project_manager,
        progress=0
    )
    db.add(default_task)
    db.commit()

    return APIEnvelope(success=True, mode="db", data=serialize_project(project, db))

@router.get("/{project_id}", response_model=APIEnvelope[ProjectResponse])
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project record not found")
    return APIEnvelope(success=True, mode="db", data=serialize_project(project, db))

@router.put("/{project_id}", response_model=APIEnvelope[ProjectResponse])
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project record not found")
    
    update_data = project_in.model_dump(exclude_unset=True)
    if "team_members" in update_data and update_data["team_members"] is not None:
        project.team_members = json.dumps(update_data.pop("team_members"))
    
    for field, val in update_data.items():
        setattr(project, field, val)
    
    db.commit()
    db.refresh(project)
    return APIEnvelope(success=True, mode="db", data=serialize_project(project, db))

@router.delete("/{project_id}", response_model=APIEnvelope[dict])
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project record not found")
    
    db.delete(project)
    db.commit()
    return APIEnvelope(success=True, mode="db", data={"message": f"Project '{project.name}' successfully deleted."})
