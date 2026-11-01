from fastapi import APIRouter, Query, HTTPException, status
from app.schemas import WeatherData, APIEnvelope
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["Weather Advisory"])

@router.get("", response_model=APIEnvelope[WeatherData])
async def get_weather(location: str = Query("New York, NY", description="City, State or coordinates")):
    try:
        data, mode = await WeatherService.get_site_weather(location)
        return APIEnvelope(success=True, mode=mode, data=data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Weather telemetry retrieval failed: {str(e)}"
        )
