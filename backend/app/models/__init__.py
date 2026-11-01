import json
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="Site Engineer")  # Administrator, Project Manager, Site Engineer, Safety Officer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    projects = relationship("Project", back_populates="creator")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    project_type = Column(String(100), default="Commercial")
    location = Column(String(255), nullable=False)
    budget = Column(Float, default=0.0)
    spent_budget = Column(Float, default=0.0)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    status = Column(String(50), default="In Progress")  # Planning, In Progress, On Hold, Completed
    completion_percentage = Column(Integer, default=0)
    client_name = Column(String(255), nullable=True)
    project_manager = Column(String(255), nullable=True)
    team_members = Column(Text, default="[]")  # JSON list
    notes = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    creator = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    safety_inspections = relationship("SafetyInspection", back_populates="project")
    crack_inspections = relationship("CrackInspection", back_populates="project")
    daily_reports = relationship("DailyReport", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(String(50), nullable=True)
    status = Column(String(50), default="To Do")  # To Do, In Progress, In Review, Completed
    priority = Column(String(50), default="Medium")  # Low, Medium, High, Critical
    assigned_to = Column(String(255), nullable=True)
    progress = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="tasks")

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_date = Column(String(50), nullable=False)
    status = Column(String(50), default="Pending")  # Pending, Reached, Delayed
    created_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="milestones")

class SafetyInspection(Base):
    __tablename__ = "safety_inspections"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    image_name = Column(String(255), nullable=True)
    image_path = Column(String(500), nullable=True)
    analysis_type = Column(String(100), default="safety")
    summary = Column(Text, nullable=False)
    findings = Column(Text, default="[]")  # JSON string of findings
    limitations = Column(Text, default="[]")  # JSON string
    overall_severity = Column(String(50), default="low")  # low, medium, high, critical
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="safety_inspections")

class CrackInspection(Base):
    __tablename__ = "crack_inspections"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    image_name = Column(String(255), nullable=True)
    image_path = Column(String(500), nullable=True)
    structure_type = Column(String(100), default="Concrete Wall")  # Wall, Beam, Slab, Column, Foundation
    location_notes = Column(String(255), nullable=True)
    summary = Column(Text, nullable=False)
    findings = Column(Text, default="[]")  # JSON string of crack observations
    limitations = Column(Text, default="[]")
    severity = Column(String(50), default="low")
    recommended_actions = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="crack_inspections")

class PropertyValuation(Base):
    __tablename__ = "property_valuations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    property_type = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    land_area = Column(Float, default=0.0)
    builtup_area = Column(Float, default=0.0)
    floors = Column(Integer, default=1)
    rooms = Column(Integer, default=3)
    age = Column(Integer, default=0)
    quality = Column(String(50), default="Standard")  # Economy, Standard, Premium, Luxury
    condition = Column(String(50), default="Good")  # Poor, Fair, Good, Excellent
    amenities = Column(Text, default="[]")
    
    estimated_min = Column(Float, nullable=False)
    estimated_max = Column(Float, nullable=False)
    estimated_avg = Column(Float, nullable=False)
    price_per_sq_unit = Column(Float, nullable=False)
    factors = Column(Text, default="[]")  # JSON string
    assumptions = Column(Text, default="[]")  # JSON string
    confidence = Column(String(50), default="Medium")
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

class ProjectPlan(Base):
    __tablename__ = "project_plans"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    project_name = Column(String(255), nullable=False)
    scope = Column(Text, nullable=False)
    site_area = Column(Float, default=0.0)
    estimated_budget = Column(Float, default=0.0)
    estimated_duration_months = Column(Float, default=0.0)
    wbs = Column(Text, default="[]")  # JSON list of tasks/phases
    milestones = Column(Text, default="[]")  # JSON list
    risks = Column(Text, default="[]")  # JSON list
    budget_allocation = Column(Text, default="[]")  # JSON list
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

class DailyReport(Base):
    __tablename__ = "daily_reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    report_date = Column(String(50), nullable=False)
    work_completed = Column(Text, nullable=False)
    workers_count = Column(Integer, default=0)
    equipment_used = Column(Text, default="")
    materials_consumed = Column(Text, default="")
    deliveries = Column(Text, default="")
    weather_notes = Column(String(255), default="Clear, 24°C")
    safety_incidents = Column(Text, default="None reported")
    delays = Column(Text, default="None")
    photos = Column(Text, default="[]")  # JSON list of photo paths/names
    next_day_plan = Column(Text, nullable=True)
    supervisor_notes = Column(Text, nullable=True)
    supervisor_name = Column(String(255), default="Site Supervisor")
    created_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="daily_reports")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    mode = Column(String(20), default="ai")  # ai, demo
    created_at = Column(DateTime, default=utcnow)
