import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import (
    User, Project, Task, Milestone, SafetyInspection, CrackInspection,
    DailyReport, PropertyValuation
)
from app.core.security import hash_password
from app.services.ai_service import SAFETY_DISCLAIMER, CRACK_DISCLAIMER
from app.services.valuation_service import VALUATION_DISCLAIMER

def seed_initial_data(db: Session):
    # Check if already seeded
    if db.query(User).first():
        return

    # 1. Create Demo Users
    users = [
        User(
            email="admin@buildsense.ai",
            hashed_password=hash_password("BuildSense2026!"),
            full_name="Marcus Vance (VP of Construction)",
            role="Administrator",
            is_active=True
        ),
        User(
            email="pm@buildsense.ai",
            hashed_password=hash_password("BuildSense2026!"),
            full_name="Sarah Jenkins, PMP",
            role="Project Manager",
            is_active=True
        ),
        User(
            email="engineer@buildsense.ai",
            hashed_password=hash_password("BuildSense2026!"),
            full_name="David Chen, PE",
            role="Site Engineer",
            is_active=True
        ),
        User(
            email="safety@buildsense.ai",
            hashed_password=hash_password("BuildSense2026!"),
            full_name="Elena Rodriguez, CSP",
            role="Safety Officer",
            is_active=True
        )
    ]
    db.add_all(users)
    db.commit()

    admin_user = users[0]

    # 2. Create Realistic Projects
    projects = [
        Project(
            name="Hudson Commercial Tower",
            project_type="Commercial",
            location="Hudson Yards, New York, NY",
            budget=48500000.0,
            spent_budget=31200000.0,
            start_date="2025-03-15",
            end_date="2027-02-28",
            status="In Progress",
            completion_percentage=68,
            client_name="Hudson Capital Real Estate Group",
            project_manager="Sarah Jenkins, PMP",
            team_members=json.dumps(["Sarah Jenkins", "David Chen", "Elena Rodriguez", "Tom Bradley"]),
            notes="42-story LEED Platinum office tower with slipform concrete core and curtainwall enclosure.",
            created_by_id=admin_user.id
        ),
        Project(
            name="Bayside Logistics & Distribution Hub",
            project_type="Industrial",
            location="Elizabeth Port, Newark, NJ",
            budget=22000000.0,
            spent_budget=17800000.0,
            start_date="2025-06-01",
            end_date="2026-12-15",
            status="In Progress",
            completion_percentage=82,
            client_name="Apex Global Logistics REIT",
            project_manager="David Chen, PE",
            team_members=json.dumps(["David Chen", "Marcus Vance", "Elena Rodriguez"]),
            notes="350,000 sq.ft cold-storage warehouse with high-tolerance superflat concrete slab floors.",
            created_by_id=admin_user.id
        ),
        Project(
            name="Greenwood Residential Eco-Park",
            project_type="Residential",
            location="Austin Hills, Austin, TX",
            budget=16800000.0,
            spent_budget=6200000.0,
            start_date="2026-01-10",
            end_date="2027-08-30",
            status="In Progress",
            completion_percentage=38,
            client_name="Greenwood Sustainable Living LLC",
            project_manager="Sarah Jenkins, PMP",
            team_members=json.dumps(["Sarah Jenkins", "Michael Ross"]),
            notes="120-unit mass timber residential enclave with rooftop solar arrays and rain retention gardens.",
            created_by_id=admin_user.id
        ),
        Project(
            name="Metro Rail Rapid Transit Station 4",
            project_type="Infrastructure",
            location="Downtown Civic Center, Chicago, IL",
            budget=74000000.0,
            spent_budget=14500000.0,
            start_date="2026-04-01",
            end_date="2028-11-20",
            status="Planning",
            completion_percentage=18,
            client_name="Regional Transit Authority",
            project_manager="Marcus Vance",
            team_members=json.dumps(["Marcus Vance", "David Chen", "Elena Rodriguez"]),
            notes="Cut-and-cover underground terminal with seismic-rated diaphragm slurry walls.",
            created_by_id=admin_user.id
        )
    ]
    db.add_all(projects)
    db.commit()

    p1, p2, p3 = projects[0], projects[1], projects[2]

    # 3. Tasks
    tasks = [
        Task(
            project_id=p1.id,
            title="Pour Floor Slab Level 24 & Shoring Inspection",
            description="Inspect post-tension rebar layout and coordinate pump truck batch placement.",
            due_date="2026-11-06",
            status="In Progress",
            priority="Critical",
            assigned_to="David Chen, PE",
            progress=65
        ),
        Task(
            project_id=p1.id,
            title="Curtainwall Glazing Quality Hold-Point (Levels 14-18)",
            description="Water pressure infiltration field testing on double-glazed facade panels.",
            due_date="2026-11-14",
            status="To Do",
            priority="High",
            assigned_to="Sarah Jenkins, PMP",
            progress=10
        ),
        Task(
            project_id=p2.id,
            title="Superflat Slab Laser Screed QA Measurement",
            description="Verify Floor Flatness (FF 50) and Floor Levelness (FL 40) optical surveys.",
            due_date="2026-11-04",
            status="Completed",
            priority="High",
            assigned_to="David Chen, PE",
            progress=100
        ),
        Task(
            project_id=p2.id,
            title="Roof Membrane Torch-Down & Skylight Flashings",
            description="Verify 60-mil TPO membrane heat welding along parapets and scuppers.",
            due_date="2026-11-10",
            status="In Progress",
            priority="Medium",
            assigned_to="Tom Bradley",
            progress=40
        ),
        Task(
            project_id=p3.id,
            title="Mass Timber Beam Rigging & Fastener Proofing",
            description="Torque-check structural glulam connections and fire retardant treatment seals.",
            due_date="2026-11-18",
            status="To Do",
            priority="Medium",
            assigned_to="Sarah Jenkins, PMP",
            progress=0
        )
    ]
    db.add_all(tasks)

    # 4. Milestones
    milestones = [
        Milestone(project_id=p1.id, title="Substructure & Slurry Wall Complete", target_date="2025-09-30", status="Reached"),
        Milestone(project_id=p1.id, title="Structural Frame Level 30 Pour", target_date="2026-12-15", status="Pending"),
        Milestone(project_id=p1.id, title="Façade Envelope Dry-In", target_date="2027-01-30", status="Pending"),
        Milestone(project_id=p2.id, title="Foundations & Steel Erection", target_date="2025-11-15", status="Reached"),
        Milestone(project_id=p2.id, title="Interior MEP & Fire System Online", target_date="2026-11-30", status="Pending")
    ]
    db.add_all(milestones)

    # 5. Safety Inspections
    safety_demo = [
        SafetyInspection(
            project_id=p1.id,
            image_name="hudson_scaffold_lvl21.jpg",
            image_path=None,
            analysis_type="safety",
            summary="Identified perimeter guardrail missing intermediate mid-rail on eastern scaffolding bay.",
            findings=json.dumps([
                {
                    "category": "Fall Hazard / Guardrails",
                    "description": "Scaffolding work platform at Level 21 lacks required 21-inch intermediate mid-rail along a 3.2m opening.",
                    "severity": "high",
                    "recommended_action": "Halt work on bay until certified scaffolder installs compliant mid-rail and toeboards.",
                    "suggested_priority": "Immediate",
                    "confidence": 0.93
                },
                {
                    "category": "Housekeeping & Access",
                    "description": "Loose electrical extension leads draped across steel stairwell tread #4 to #6.",
                    "severity": "medium",
                    "recommended_action": "Elevate cables using non-conductive 'S' hooks above 7-foot head clearance.",
                    "suggested_priority": "Immediate",
                    "confidence": 0.88
                }
            ]),
            limitations=json.dumps([
                "Preliminary visual assessment only based on camera perspective.",
                "Subsurface integrity and harness anchor point ratings require physical proof-load certification."
            ]),
            overall_severity="high",
            is_demo=True
        )
    ]
    db.add_all(safety_demo)

    # 6. Crack Inspections
    crack_demo = [
        CrackInspection(
            project_id=p1.id,
            image_name="shear_wall_lvl4_inspection.jpg",
            image_path=None,
            structure_type="Shear Wall",
            location_notes="Basement Sub-grade Level 4, Gridline C-4",
            summary="Forensic evaluation indicates stepped diagonal hairline fracture radiating from door lintel.",
            findings=json.dumps([
                {
                    "crack_type": "Diagonal Shear Trace",
                    "location_in_image": "Upper lintel re-entrant corner extending at 45 degrees",
                    "appearance": "Continuous clean fracture with average width ~0.25mm without active water seepage",
                    "severity": "medium",
                    "recommended_action": "Affix graduated acrylic tell-tale monitor; take baseline optical reading for structural engineer review.",
                    "confidence": 0.87
                }
            ]),
            limitations=json.dumps([
                "Uncalibrated visual image without millimeter scale marker.",
                "Internal steel rebar position and corrosion potential cannot be evaluated photographically."
            ]),
            severity="medium",
            recommended_actions="Install tell-tale crack monitor gauge. Structural engineer site sign-off required.",
            is_demo=True
        )
    ]
    db.add_all(crack_demo)

    # 7. Daily Reports
    daily_demo = [
        DailyReport(
            project_id=p1.id,
            report_date="2026-11-01",
            work_completed="Completed rebar layout on Deck 23 North. Installed electrical conduits for slab lighting boxes. Tower crane hoisted 14 tons of #8 rebar.",
            workers_count=138,
            equipment_used="Potain Tower Crane (1), Putzmeister Concrete Pump (1), Bobcat Skidsteers (2)",
            materials_consumed="14 tons steel rebar, 850 linear ft PVC conduit, 6 bundles tying wire",
            deliveries="3 flatbed trucks of structural reinforcing steel; 1 dry-mix mortar pallet",
            weather_notes="Fair, 21°C, Wind 16 km/h. Ideal operating window.",
            safety_incidents="None reported. Morning toolbox talk focused on lanyard double-tie off.",
            delays="30-minute delay due to morning traffic congestion at loading gate 2.",
            photos=json.dumps(["deck23_rebar_inspect.jpg", "tower_crane_pick.jpg"]),
            next_day_plan="Commence concrete placement on Deck 23 starting at 06:00 AM. 420 cubic yards scheduled.",
            supervisor_notes="Concrete batch plant confirmed transit mix dispatch timing. Slump tests required on every third truck.",
            supervisor_name="Sarah Jenkins, PMP"
        )
    ]
    db.add_all(daily_demo)

    # 8. Property Valuation Sample
    valuation_demo = [
        PropertyValuation(
            project_id=p1.id,
            property_type="Commercial Complex",
            location="Hudson Yards, New York, NY",
            land_area=15000.0,
            builtup_area=185000.0,
            floors=42,
            rooms=85,
            age=1,
            quality="Luxury",
            condition="Excellent",
            amenities=json.dumps(["LEED Platinum", "High-speed Destination Dispatch Elevators", "Subterranean Automated Parking", "Emergency Power Generation"]),
            estimated_min=84500000.0,
            estimated_max=102000000.0,
            estimated_avg=93250000.0,
            price_per_sq_unit=504.05,
            factors=json.dumps([
                {"name": "Prime Metro Core Multiplier", "impact_percentage": 35.0, "description": "High barrier to entry urban core real estate valuation."},
                {"name": "Luxury LEED Grade Materials", "impact_percentage": 25.0, "description": "High performance low-E curtainwall, premium acoustic isolation, and smart BMS."}
            ]),
            assumptions=json.dumps([
                "Assumes full commercial occupancy cap rate of 5.8%.",
                "Parametric replacement-cost algorithm based on regional architectural indexes."
            ]),
            confidence="High",
            is_demo=True
        )
    ]
    db.add_all(valuation_demo)

    db.commit()
