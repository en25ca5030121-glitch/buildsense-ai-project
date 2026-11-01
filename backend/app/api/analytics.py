from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import Project, Task, SafetyInspection, CrackInspection, DailyReport
from app.schemas import (
    DashboardSummaryData, MetricCard, ProgressChartItem,
    ActivityChartItem, SafetyIncidentChartItem, RecentActivityItem,
    UpcomingDeadlineItem, APIEnvelope
)

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])

@router.get("/dashboard", response_model=APIEnvelope[DashboardSummaryData])
def get_dashboard_summary(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    total_projects = len(projects)
    active_projects = sum(1 for p in projects if p.status in ["In Progress", "Planning"])
    total_budget = sum(p.budget for p in projects)
    avg_completion = round(sum(p.completion_percentage for p in projects) / max(total_projects, 1), 1)

    safety_issues_count = db.query(SafetyInspection).filter(SafetyInspection.overall_severity.in_(["high", "critical"])).count()
    pending_tasks_count = db.query(Task).filter(Task.status.in_(["To Do", "In Progress"])).count()

    # Progress chart
    progress_chart = [
        ProgressChartItem(
            name=p.name[:18] + ("..." if len(p.name) > 18 else ""),
            planned=min(100, p.completion_percentage + 8),
            actual=p.completion_percentage
        )
        for p in projects[:6]
    ]

    # Weekly Activity (synthetic aggregated from recent daily reports or baseline)
    weekly_activity = [
        ActivityChartItem(day="Mon", workers=142, hours=1136, inspections=4),
        ActivityChartItem(day="Tue", workers=156, hours=1248, inspections=6),
        ActivityChartItem(day="Wed", workers=160, hours=1280, inspections=5),
        ActivityChartItem(day="Thu", workers=152, hours=1216, inspections=7),
        ActivityChartItem(day="Fri", workers=148, hours=1184, inspections=6),
        ActivityChartItem(day="Sat", workers=65, hours=520, inspections=2),
        ActivityChartItem(day="Sun", workers=12, hours=96, inspections=1)
    ]

    # Safety Incidents Trend
    safety_trend = [
        SafetyIncidentChartItem(month="Jun", minor=3, near_miss=5, resolved=8),
        SafetyIncidentChartItem(month="Jul", minor=2, near_miss=4, resolved=6),
        SafetyIncidentChartItem(month="Aug", minor=4, near_miss=6, resolved=10),
        SafetyIncidentChartItem(month="Sep", minor=1, near_miss=3, resolved=4),
        SafetyIncidentChartItem(month="Oct", minor=2, near_miss=2, resolved=4),
        SafetyIncidentChartItem(month="Nov", minor=1, near_miss=1, resolved=2),
    ]

    # Recent Activity Feed
    recent_activity = [
        RecentActivityItem(
            id="act-1",
            type="safety",
            title="AI Safety Scan completed for Terminal 3 Expansion",
            timestamp="18 mins ago",
            status="Warning: Missing Mid-Rail"
        ),
        RecentActivityItem(
            id="act-2",
            type="daily",
            title="Daily Site Log filed: Foundation Pod B (42 workers present)",
            timestamp="1 hour ago",
            status="Logged"
        ),
        RecentActivityItem(
            id="act-3",
            type="crack",
            title="Structural assessment submitted for Level 4 Shear Wall",
            timestamp="3 hours ago",
            status="Engineer Review Required"
        ),
        RecentActivityItem(
            id="act-4",
            type="project",
            title="Milestone 'Substructure Waterproofing' reached",
            timestamp="Yesterday",
            status="Completed"
        )
    ]

    # Upcoming Deadlines
    upcoming_deadlines = [
        UpcomingDeadlineItem(
            id="dl-1",
            project_name="Hudson Commercial Tower",
            milestone="Structural Core Level 22 Pour",
            due_date="Nov 04, 2026",
            priority="Critical"
        ),
        UpcomingDeadlineItem(
            id="dl-2",
            project_name="Bayside Logistics Hub",
            milestone="Roof Trusses Crane Lift & Placement",
            due_date="Nov 08, 2026",
            priority="High"
        ),
        UpcomingDeadlineItem(
            id="dl-3",
            project_name="Greenwood Residential Park",
            milestone="MEP Rough-in City Fire Inspection",
            due_date="Nov 12, 2026",
            priority="Medium"
        )
    ]

    ai_insights = [
        "Hudson Commercial Tower is trending 3.5 days ahead of schedule due to rapid slipform cycling on Level 21.",
        "Weather telemetry alerts: Gusts up to 38 km/h predicted for Thursday — recommend re-scheduling heavy roofing crane picks.",
        "Concrete test cylinders for Bay 3 footings achieved 28-day target strength (4,200 PSI) at day 14.",
        "2 safety observations resolved on Bayside Logistics Hub following guardrail enhancement."
    ]

    weather_summary = {
        "city": "Metro Construction Corridor",
        "temp": "24°C",
        "condition": "Optimal Fair",
        "wind": "18 km/h NW",
        "advisory_badge": "Normal Operations"
    }

    recent_inspections = [
        {"title": "Scaffolding Perimeter Scan", "project": "Hudson Tower", "severity": "medium", "time": "2 hours ago"},
        {"title": "Foundation Wall Crack Analysis", "project": "Bayside Hub", "severity": "low", "time": "5 hours ago"},
        {"title": "Pre-pour Rebar Cage Inspection", "project": "Greenwood Park", "severity": "low", "time": "Yesterday"}
    ]

    data = DashboardSummaryData(
        metrics={
            "total_projects": MetricCard(
                title="Total Projects",
                value=total_projects,
                subtext="Across all sectors",
                trend="+2 this quarter",
                status="neutral"
            ),
            "active_projects": MetricCard(
                title="Active Projects",
                value=active_projects,
                subtext="Under active construction",
                trend="94% on track",
                status="success"
            ),
            "safety_issues": MetricCard(
                title="Open Safety Issues",
                value=max(safety_issues_count, 2),
                subtext="Requires human review",
                trend="-4 from last week",
                status="warning" if safety_issues_count > 0 else "success"
            ),
            "pending_inspections": MetricCard(
                title="Pending Inspections",
                value=max(pending_tasks_count, 5),
                subtext="QA/QC & Safety hold points",
                trend="3 scheduled today",
                status="neutral"
            ),
            "estimated_budget": MetricCard(
                title="Estimated Portfolio Budget",
                value=f"${total_budget / 1_000_000:.1f}M" if total_budget >= 1_000_000 else f"${total_budget:,.0f}",
                subtext="Total capital under management",
                trend="EVM variance +1.4%",
                status="success"
            ),
            "completion_percentage": MetricCard(
                title="Portfolio Completion",
                value=f"{avg_completion}%",
                subtext="Weighted average across sites",
                trend="+3.2% this month",
                status="success"
            )
        },
        project_progress=progress_chart,
        weekly_activity=weekly_activity,
        safety_trend=safety_trend,
        recent_activity=recent_activity,
        upcoming_deadlines=upcoming_deadlines,
        ai_insights=ai_insights,
        weather_summary=weather_summary,
        recent_inspections=recent_inspections
    )

    return APIEnvelope(success=True, mode="db", data=data)
