from typing import Tuple, List
from app.schemas import ValuationRequest, ValuationData, ValuationFactor

VALUATION_DISCLAIMER = (
    "ILLUSTRATIVE ESTIMATION ONLY: This property valuation model uses an algorithmic replacement-cost "
    "and architectural quality index methodology. It does NOT constitute a certified appraisal or RICS/MAI "
    "valuation. Actual transaction value depends on localized deed transfers, title encumbrances, soil bearing capacity, "
    "and prevailing commercial cap rates. A licensed real estate appraiser must perform an on-site inspection for financing."
)

class ValuationService:
    @classmethod
    def calculate_valuation(cls, req: ValuationRequest) -> Tuple[ValuationData, str]:
        # Baseline unit rate per sq.ft based on property type
        base_rates = {
            "Commercial Complex": 320.0,
            "Residential Multi-Family": 220.0,
            "Single-Family Home": 240.0,
            "Industrial Warehouse": 140.0,
            "Infrastructure / Institutional": 280.0
        }
        base_rate = req.local_market_rate or base_rates.get(req.property_type, 230.0)

        # Quality multipliers
        quality_factors = {
            "Economy": 0.85,
            "Standard": 1.0,
            "Premium": 1.25,
            "Luxury": 1.55
        }
        q_mult = quality_factors.get(req.quality, 1.0)

        # Condition multipliers
        condition_factors = {
            "Poor": 0.70,
            "Fair": 0.85,
            "Good": 1.0,
            "Excellent": 1.15
        }
        c_mult = condition_factors.get(req.condition, 1.0)

        # Depreciation based on age (1.2% per year up to max 40%)
        age_depreciation = min(req.age * 0.012, 0.40)
        depreciation_mult = 1.0 - age_depreciation

        # Amenities bonus
        amenity_bonus = min(len(req.amenities) * 0.03, 0.20)

        # Combined multiplier
        adjusted_rate_per_sqft = base_rate * q_mult * c_mult * depreciation_mult * (1.0 + amenity_bonus)

        # Built-up area contribution + Land value component
        # Land estimated at ~35% of baseline replacement rate
        land_component = req.land_area * (base_rate * 0.35)
        structure_component = req.builtup_area * adjusted_rate_per_sqft
        estimated_avg = round(land_component + structure_component, 2)

        # Range +/- 12% to reflect uncertainty
        variance = 0.12
        estimated_min = round(estimated_avg * (1 - variance), 2)
        estimated_max = round(estimated_avg * (1 + variance), 2)
        price_per_sq_unit = round(estimated_avg / max(req.builtup_area, 1.0), 2)

        factors = [
            ValuationFactor(
                name="Base Rate Benchmark",
                impact_percentage=0.0,
                description=f"${base_rate:.2f}/sq.ft baseline for {req.property_type} in {req.location} regional category."
            ),
            ValuationFactor(
                name=f"Construction Quality ({req.quality})",
                impact_percentage=round((q_mult - 1.0) * 100, 1),
                description=f"Specification grade adjustment for materials, MEP standards, and finishes."
            ),
            ValuationFactor(
                name=f"Current Physical Condition ({req.condition})",
                impact_percentage=round((c_mult - 1.0) * 100, 1),
                description=f"Maintenance state and wear-and-tear assessment on envelope and building systems."
            ),
            ValuationFactor(
                name=f"Age Depreciation ({req.age} years)",
                impact_percentage=round(-age_depreciation * 100, 1),
                description=f"Standard economic life depreciation curve at 1.2% per annum."
            ),
            ValuationFactor(
                name=f"Amenities Specification ({len(req.amenities)} items)",
                impact_percentage=round(amenity_bonus * 100, 1),
                description=f"Features included: {', '.join(req.amenities) if req.amenities else 'Standard utilities'}."
            )
        ]

        assumptions = [
            "Assumes clean legal title with no restrictive covenants or zoning impediments.",
            "Assumes soil bearing capacity and foundation conditions conform to standard civil codes.",
            "Normal arm's-length market transaction without distressed liquidation pressure.",
            "Land area valued using a regional land-to-building replacement coefficient."
        ]

        additional_info = [
            "Recent comparable MLS transaction records within 1.0 mile radius.",
            "Detailed Phase I Environmental Site Assessment (ESA).",
            "Certified Mechanical, Electrical & Plumbing (MEP) remaining useful life audit.",
            "Local municipal property tax assessment and zoning variance filings."
        ]

        mode = "ai" if req.local_market_rate else "demo"
        confidence = "High" if (req.local_market_rate and req.age < 5) else "Medium"

        return ValuationData(
            property_type=req.property_type,
            location=req.location,
            estimated_min=estimated_min,
            estimated_max=estimated_max,
            estimated_avg=estimated_avg,
            price_per_sq_unit=price_per_sq_unit,
            unit="sq.ft",
            factors=factors,
            assumptions=assumptions,
            confidence=confidence,
            data_availability="Parametric replacement-cost algorithm; no direct live MLS connection claimed.",
            suggested_additional_information=additional_info,
            disclaimer=VALUATION_DISCLAIMER
        ), mode
