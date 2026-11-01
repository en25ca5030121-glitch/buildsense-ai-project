from typing import Tuple, List
from app.schemas import (
    PlanGenerateRequest, PlanData, PlanTaskItem, PlanMilestoneItem,
    PlanRiskItem, BudgetAllocationItem
)
from app.services.ai_service import PLANNING_DISCLAIMER

class PlanningService:
    @classmethod
    def generate_plan(cls, req: PlanGenerateRequest) -> Tuple[PlanData, str]:
        # Calculate timeline estimate based on site area, complexity, team size
        complexity_factors = {"Low": 0.8, "Medium": 1.0, "High": 1.3, "Critical": 1.6}
        factor = complexity_factors.get(req.complexity, 1.0)
        
        # Base duration in months
        base_months = max(4.0, (req.site_area / 2000.0) * factor * (30.0 / max(req.team_size, 5)))
        estimated_duration_months = round(min(max(base_months, 3.0), 36.0), 1)

        # Work Breakdown Structure (WBS)
        wbs = [
            PlanTaskItem(
                id="T-01",
                phase="Phase 1: Pre-Construction & Permitting",
                task_name="Topographical Survey & Geotechnical Soil Boring",
                duration_days=18,
                dependencies=[],
                suggested_resources="Geotechnical Engineer, Survey Crew, Core Drilling Rig",
                risk_level="Medium"
            ),
            PlanTaskItem(
                id="T-02",
                phase="Phase 1: Pre-Construction & Permitting",
                task_name="Architectural & Structural Engineering Plan Approval",
                duration_days=35,
                dependencies=["T-01"],
                suggested_resources="Structural Design Team, Municipal Expeditor",
                risk_level="High"
            ),
            PlanTaskItem(
                id="T-03",
                phase="Phase 2: Substructure & Foundation",
                task_name="Site Excavation, Grading & Dewatering System Setup",
                duration_days=24,
                dependencies=["T-02"],
                suggested_resources="Excavators (2), Bulldozers, Dump Trucks, Dewatering Pumps",
                risk_level="Medium"
            ),
            PlanTaskItem(
                id="T-04",
                phase="Phase 2: Substructure & Foundation",
                task_name="Reinforced Concrete Footings & Foundation Walls",
                duration_days=30,
                dependencies=["T-03"],
                suggested_resources="Rebar Tying Crew, Concrete Pump, Transit Mixers",
                risk_level="High"
            ),
            PlanTaskItem(
                id="T-05",
                phase="Phase 3: Superstructure & Core",
                task_name="Structural Framing / Cast-in-Place Columns & Slabs",
                duration_days=45,
                dependencies=["T-04"],
                suggested_resources="Tower Crane Operator, Shoring Carpenters, Ironworkers",
                risk_level="High"
            ),
            PlanTaskItem(
                id="T-06",
                phase="Phase 4: MEP Rough-in & Enclosure",
                task_name="Mechanical, Electrical, Plumbing & Fire Sprinkler Rough-In",
                duration_days=40,
                dependencies=["T-05"],
                suggested_resources="Licensed Electricians, HVAC Sheet Metal Techs, Master Plumbers",
                risk_level="Medium"
            ),
            PlanTaskItem(
                id="T-07",
                phase="Phase 4: MEP Rough-in & Enclosure",
                task_name="Building Envelope Weatherproofing & Glazing Installation",
                duration_days=28,
                dependencies=["T-05"],
                suggested_resources="Curtainwall Installers, Caulking Crew, Boom Lifts",
                risk_level="Medium"
            ),
            PlanTaskItem(
                id="T-08",
                phase="Phase 5: Interior Finishes & Handover",
                task_name="Drywall Partitioning, Flooring & Millwork Finishes",
                duration_days=35,
                dependencies=["T-06", "T-07"],
                suggested_resources="Drywall Crews, Flooring Specialists, Finish Carpenters",
                risk_level="Low"
            ),
            PlanTaskItem(
                id="T-09",
                phase="Phase 5: Interior Finishes & Handover",
                task_name="System Commissioning, Life Safety Testing & Final Punch List",
                duration_days=20,
                dependencies=["T-08"],
                suggested_resources="Commissioning Agent, Fire Marshal Inspector, Project Manager",
                risk_level="Medium"
            )
        ]

        # Milestones
        milestones = [
            PlanMilestoneItem(
                title="M1: Permitting & Site Mobilization",
                target_month=1,
                deliverables="Building permits issued, temporary site fencing and utility connections activated."
            ),
            PlanMilestoneItem(
                title="M2: Foundation Sign-off",
                target_month=max(2, int(estimated_duration_months * 0.25)),
                deliverables="Substructure poured, third-party cylinder break tests verified, backfill complete."
            ),
            PlanMilestoneItem(
                title="M3: Structural Top-Out",
                target_month=max(3, int(estimated_duration_months * 0.55)),
                deliverables="Highest structural member placed, core shear walls cured, framing inspected."
            ),
            PlanMilestoneItem(
                title="M4: Building Dry-In",
                target_month=max(4, int(estimated_duration_months * 0.75)),
                deliverables="Roofing membrane watertight, exterior glazing installed, conditioned interior air online."
            ),
            PlanMilestoneItem(
                title="M5: Substantial Completion & Occupancy",
                target_month=int(estimated_duration_months),
                deliverables="Certificate of Occupancy (CO) granted, punch list signed off, client handover."
            )
        ]

        # Risk Matrix
        risks = [
            PlanRiskItem(
                risk="Permit & Municipal Review Delays",
                probability="High",
                impact="Critical",
                mitigation="Submit early schematic packets; retain third-party plan review expeditors."
            ),
            PlanRiskItem(
                risk="Unforeseen Geotechnical / Groundwater Anomalies",
                probability="Medium",
                impact="High",
                mitigation="Conduct comprehensive pre-construction bore logs; allocate a 5% subgrade contingency."
            ),
            PlanRiskItem(
                risk="Supply Chain Lead-Time Bottlenecks (Switchgear, Elevators)",
                probability="High",
                impact="High",
                mitigation="Issue early buyout purchase orders for long-lead MEP items at 30% design completion."
            ),
            PlanRiskItem(
                risk="Weather-Induced Lost Working Days",
                probability="Medium",
                impact="Medium",
                mitigation="Build a 10-day climatic buffer into exterior framing and roofing schedules."
            ),
            PlanRiskItem(
                risk="Subcontractor Labor Trade Stacking",
                probability="Medium",
                impact="Medium",
                mitigation="Deploy digital 3D BIM coordination to eliminate ductwork/pipe physical clashes before field install."
            )
        ]

        # Budget Allocation (CSI MasterFormat divisions approximate)
        total_b = req.budget
        budget_allocation = [
            BudgetAllocationItem(category="Substructure & Earthwork", percentage=14.0, amount=round(total_b * 0.14, 2)),
            BudgetAllocationItem(category="Core & Structural Shell", percentage=26.0, amount=round(total_b * 0.26, 2)),
            BudgetAllocationItem(category="MEP & Fire Protection", percentage=28.0, amount=round(total_b * 0.28, 2)),
            BudgetAllocationItem(category="Exterior Envelope & Roofing", percentage=12.0, amount=round(total_b * 0.12, 2)),
            BudgetAllocationItem(category="Interior Finishes & Millwork", percentage=12.0, amount=round(total_b * 0.12, 2)),
            BudgetAllocationItem(category="General Conditions & Contingency", percentage=8.0, amount=round(total_b * 0.08, 2))
        ]

        limitations = [
            "Durations reflect standard uninterrupted sequencing without severe legal or environmental stoppages.",
            "Resource counts assume availability of certified union / merit-shop trades in the local labor market.",
            "Material price escalations over multi-year cycles require index hedging."
        ]

        return PlanData(
            project_name=req.project_name,
            scope=req.scope,
            estimated_duration_months=estimated_duration_months,
            total_estimated_budget=req.budget,
            wbs=wbs,
            milestones=milestones,
            risks=risks,
            budget_allocation=budget_allocation,
            limitations=limitations,
            disclaimer=PLANNING_DISCLAIMER
        ), "demo"
