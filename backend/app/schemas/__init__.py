from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any, Generic, TypeVar
from datetime import datetime

T = TypeVar("T")

# Standard API Envelope
class APIEnvelope(BaseModel, Generic[T]):
    success: bool = True
    mode: str = "ai"  # "ai" or "demo"
    data: Optional[T] = None
    error: Optional[str] = None

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "Site Engineer"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DemoLoginRequest(BaseModel):
    role: str = "Administrator"  # Administrator, Project Manager, Site Engineer, Safety Officer

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Task & Milestone Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    status: str = "To Do"
    priority: str = "Medium"
    assigned_to: Optional[str] = None
    progress: int = 0

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    progress: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    project_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: str
    status: str = "Pending"

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneResponse(MilestoneBase):
    id: int
    project_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Project Schemas
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2)
    project_type: str = "Commercial"
    location: str
    budget: float = 0.0
    spent_budget: float = 0.0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: str = "In Progress"
    completion_percentage: int = 0
    client_name: Optional[str] = None
    project_manager: Optional[str] = None
    team_members: Optional[List[str]] = []
    notes: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    project_type: Optional[str] = None
    location: Optional[str] = None
    budget: Optional[float] = None
    spent_budget: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None
    completion_percentage: Optional[int] = None
    client_name: Optional[str] = None
    project_manager: Optional[str] = None
    team_members: Optional[List[str]] = None
    notes: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    project_type: str
    location: str
    budget: float
    spent_budget: float
    start_date: Optional[str]
    end_date: Optional[str]
    status: str
    completion_percentage: int
    client_name: Optional[str]
    project_manager: Optional[str]
    team_members: List[str] = []
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    tasks_count: Optional[int] = 0
    pending_tasks: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

# Safety Analysis Schemas
class SafetyFinding(BaseModel):
    category: str  # PPE, Fall Hazard, Guardrails, Material Storage, Housekeeping, Equipment
    description: str
    severity: str  # low, medium, high, critical
    recommended_action: str
    suggested_priority: str = "Immediate"
    confidence: float = 0.85

class SafetyAnalysisData(BaseModel):
    analysis_type: str = "safety"
    summary: str
    overall_severity: str = "medium"
    findings: List[SafetyFinding]
    limitations: List[str]
    disclaimer: str

class SafetyInspectionRecord(BaseModel):
    id: int
    project_id: Optional[int]
    image_name: Optional[str]
    image_path: Optional[str]
    summary: str
    findings: List[SafetyFinding]
    limitations: List[str]
    overall_severity: str
    is_demo: bool
    created_at: datetime

# Crack Detection Schemas
class CrackObservation(BaseModel):
    crack_type: str  # Hairline, Diagonal Shear, Vertical Settlement, Surface Crazing
    location_in_image: str  # e.g., Upper-left quadrant near beam junction
    appearance: str
    severity: str  # low, medium, high, critical
    recommended_action: str
    confidence: float = 0.88

class CrackAnalysisData(BaseModel):
    analysis_type: str = "crack_detection"
    structure_type: str
    summary: str
    observations: List[CrackObservation]
    limitations: List[str]
    overall_severity: str
    calibrated_measurement_available: bool = False
    disclaimer: str

class CrackInspectionRecord(BaseModel):
    id: int
    project_id: Optional[int]
    image_name: Optional[str]
    structure_type: str
    location_notes: Optional[str]
    summary: str
    findings: List[CrackObservation]
    limitations: List[str]
    severity: str
    is_demo: bool
    created_at: datetime

# Property Valuation Schemas
class ValuationRequest(BaseModel):
    project_id: Optional[int] = None
    property_type: str = "Commercial Complex"
    location: str = "Metro District"
    land_area: float = 5000.0
    builtup_area: float = 12000.0
    floors: int = 4
    rooms: int = 16
    age: int = 3
    quality: str = "Standard"  # Economy, Standard, Premium, Luxury
    condition: str = "Good"  # Poor, Fair, Good, Excellent
    amenities: List[str] = ["HVAC", "Basement Parking", "Fire Suppression", "Elevator"]
    local_market_rate: Optional[float] = None

class ValuationFactor(BaseModel):
    name: str
    impact_percentage: float
    description: str

class ValuationData(BaseModel):
    property_type: str
    location: str
    estimated_min: float
    estimated_max: float
    estimated_avg: float
    price_per_sq_unit: float
    unit: str = "sq.ft"
    factors: List[ValuationFactor]
    assumptions: List[str]
    confidence: str = "Medium"
    data_availability: str = "Estimated cost approach & regional baseline"
    suggested_additional_information: List[str]
    disclaimer: str

class ValuationRecord(BaseModel):
    id: int
    property_type: str
    location: str
    land_area: float
    builtup_area: float
    floors: int
    estimated_min: float
    estimated_max: float
    estimated_avg: float
    price_per_sq_unit: float
    confidence: str
    is_demo: bool
    created_at: datetime

# Project Planning Schemas
class PlanGenerateRequest(BaseModel):
    project_id: Optional[int] = None
    project_name: str
    scope: str
    project_type: str = "Commercial"
    site_area: float = 10000.0
    start_date: str
    target_completion_date: str
    budget: float
    team_size: int = 25
    complexity: str = "Medium"

class PlanTaskItem(BaseModel):
    id: str
    phase: str
    task_name: str
    duration_days: int
    dependencies: List[str] = []
    suggested_resources: str
    risk_level: str = "Medium"

class PlanMilestoneItem(BaseModel):
    title: str
    target_month: int
    deliverables: str

class PlanRiskItem(BaseModel):
    risk: str
    probability: str  # Low, Medium, High
    impact: str
    mitigation: str

class BudgetAllocationItem(BaseModel):
    category: str
    percentage: float
    amount: float

class PlanData(BaseModel):
    project_name: str
    scope: str
    estimated_duration_months: float
    total_estimated_budget: float
    wbs: List[PlanTaskItem]
    milestones: List[PlanMilestoneItem]
    risks: List[PlanRiskItem]
    budget_allocation: List[BudgetAllocationItem]
    limitations: List[str]
    disclaimer: str

class PlanRecord(BaseModel):
    id: int
    project_name: str
    scope: str
    estimated_duration_months: float
    estimated_budget: float
    wbs: List[PlanTaskItem]
    milestones: List[PlanMilestoneItem]
    risks: List[PlanRiskItem]
    budget_allocation: List[BudgetAllocationItem]
    is_demo: bool
    created_at: datetime

# Weather Advisory Schemas
class WeatherAdvisoryItem(BaseModel):
    category: str  # Concrete, Crane/Lifting, Work at Height, Heat, Rain
    severity: str  # info, warning, danger
    title: str
    message: str
    recommendation: str

class WeatherForecastDay(BaseModel):
    date: str
    day_name: str
    temp_high: int
    temp_low: int
    condition: str
    icon: str
    wind_speed_kmh: int
    rain_probability: int

class WeatherData(BaseModel):
    location: str
    current_temp: int
    feels_like: int
    condition: str
    humidity: int
    wind_speed_kmh: int
    wind_direction: str
    precipitation_probability: int
    uv_index: int
    air_quality_index: str
    advisories: List[WeatherAdvisoryItem]
    forecast: List[WeatherForecastDay]
    disclaimer: str

# Assistant Schemas
class AssistantChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    project_id: Optional[int] = None

class AssistantChatResponse(BaseModel):
    role: str = "assistant"
    content: str
    suggestions: List[str] = []
    disclaimer: str

# Daily Report Schemas
class DailyReportCreate(BaseModel):
    project_id: int
    report_date: str
    work_completed: str
    workers_count: int = 0
    equipment_used: Optional[str] = ""
    materials_consumed: Optional[str] = ""
    deliveries: Optional[str] = ""
    weather_notes: Optional[str] = "Clear, 24°C"
    safety_incidents: Optional[str] = "None reported"
    delays: Optional[str] = "None"
    photos: Optional[List[str]] = []
    next_day_plan: Optional[str] = None
    supervisor_notes: Optional[str] = None
    supervisor_name: Optional[str] = "Site Supervisor"

class DailyReportResponse(DailyReportCreate):
    id: int
    project_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Dashboard Analytics
class MetricCard(BaseModel):
    title: str
    value: Any
    subtext: str
    trend: Optional[str] = None
    status: Optional[str] = None

class ProgressChartItem(BaseModel):
    name: str
    planned: int
    actual: int

class ActivityChartItem(BaseModel):
    day: str
    workers: int
    hours: int
    inspections: int

class SafetyIncidentChartItem(BaseModel):
    month: str
    minor: int
    near_miss: int
    resolved: int

class RecentActivityItem(BaseModel):
    id: str
    type: str
    title: str
    timestamp: str
    status: str

class UpcomingDeadlineItem(BaseModel):
    id: str
    project_name: str
    milestone: str
    due_date: str
    priority: str

class DashboardSummaryData(BaseModel):
    metrics: Dict[str, MetricCard]
    project_progress: List[ProgressChartItem]
    weekly_activity: List[ActivityChartItem]
    safety_trend: List[SafetyIncidentChartItem]
    recent_activity: List[RecentActivityItem]
    upcoming_deadlines: List[UpcomingDeadlineItem]
    ai_insights: List[str]
    weather_summary: Dict[str, Any]
    recent_inspections: List[Dict[str, Any]]
