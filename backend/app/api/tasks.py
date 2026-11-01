from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import Task, Milestone, Project, User
from app.schemas import (
    TaskCreate, TaskUpdate, TaskResponse,
    MilestoneCreate, MilestoneResponse, APIEnvelope
)
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Tasks & Milestones"])

@router.get("/projects/{project_id}/tasks", response_model=APIEnvelope[List[TaskResponse]])
def get_project_tasks(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    tasks = db.query(Task).filter(Task.project_id == project_id).order_by(Task.id.desc()).all()
    return APIEnvelope(success=True, mode="db", data=[TaskResponse.model_validate(t) for t in tasks])

@router.post("/projects/{project_id}/tasks", response_model=APIEnvelope[TaskResponse])
def create_project_task(
    project_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    task = Task(
        project_id=project_id,
        title=task_in.title,
        description=task_in.description,
        due_date=task_in.due_date,
        status=task_in.status,
        priority=task_in.priority,
        assigned_to=task_in.assigned_to or current_user.full_name,
        progress=task_in.progress
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return APIEnvelope(success=True, mode="db", data=TaskResponse.model_validate(task))

@router.put("/tasks/{task_id}", response_model=APIEnvelope[TaskResponse])
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for field, val in task_in.model_dump(exclude_unset=True).items():
        setattr(task, field, val)
    
    db.commit()
    db.refresh(task)
    return APIEnvelope(success=True, mode="db", data=TaskResponse.model_validate(task))

@router.delete("/tasks/{task_id}", response_model=APIEnvelope[dict])
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return APIEnvelope(success=True, mode="db", data={"message": "Task deleted successfully"})

@router.get("/projects/{project_id}/milestones", response_model=APIEnvelope[List[MilestoneResponse]])
def get_project_milestones(project_id: int, db: Session = Depends(get_db)):
    milestones = db.query(Milestone).filter(Milestone.project_id == project_id).order_by(Milestone.id.asc()).all()
    return APIEnvelope(success=True, mode="db", data=[MilestoneResponse.model_validate(m) for m in milestones])

@router.post("/projects/{project_id}/milestones", response_model=APIEnvelope[MilestoneResponse])
def create_project_milestone(
    project_id: int,
    m_in: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    milestone = Milestone(
        project_id=project_id,
        title=m_in.title,
        description=m_in.description,
        target_date=m_in.target_date,
        status=m_in.status
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return APIEnvelope(success=True, mode="db", data=MilestoneResponse.model_validate(milestone))
