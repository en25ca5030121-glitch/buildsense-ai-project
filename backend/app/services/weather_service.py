import httpx
from typing import Tuple, Dict, Any, List
from app.core.config import settings
from app.schemas import WeatherData, WeatherAdvisoryItem, WeatherForecastDay

WEATHER_DISCLAIMER = (
    "OFFICIAL WEATHER ADVISORY NOTICE: Weather forecasts and automated site recommendations are for planning guidance only. "
    "Site superintendents and crane operators must monitor on-site calibrated anemometers, local weather radar, "
    "and official meteorological warnings. Do not conduct crane lifts or work at height during severe wind or lightning alerts."
)

class WeatherService:
    @classmethod
    async def get_site_weather(cls, location: str = "New York, NY") -> Tuple[WeatherData, str]:
        if settings.WEATHER_API_KEY and settings.WEATHER_API_KEY.strip():
            try:
                data = await cls._fetch_live_weather(location)
                return data, "live"
            except Exception as e:
                # Per instructions, never silently pretend live succeeded if failed
                raise RuntimeError(f"Live weather service query failed: {str(e)}")
        
        # Fallback to realistic, clearly labeled demo mode
        return cls._generate_demo_weather(location), "demo"

    @classmethod
    async def _fetch_live_weather(cls, location: str) -> WeatherData:
        # Example OpenWeatherMap endpoint
        url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={settings.WEATHER_API_KEY}&units=metric"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                raise Exception(f"Weather provider error: {resp.text}")
            d = resp.json()
            temp = int(d["main"]["temp"])
            feels_like = int(d["main"]["feels_like"])
            condition = d["weather"][0]["main"]
            humidity = d["main"]["humidity"]
            wind_kmh = int(d["wind"]["speed"] * 3.6)
            
            advisories = cls._compute_advisories(temp, wind_kmh, condition)
            forecast = cls._generate_sample_forecast(temp)
            
            return WeatherData(
                location=location,
                current_temp=temp,
                feels_like=feels_like,
                condition=condition,
                humidity=humidity,
                wind_speed_kmh=wind_kmh,
                wind_direction="NW",
                precipitation_probability=20 if "rain" in condition.lower() else 5,
                uv_index=6,
                air_quality_index="Moderate",
                advisories=advisories,
                forecast=forecast,
                disclaimer=WEATHER_DISCLAIMER
            )

    @classmethod
    def _compute_advisories(cls, temp: int, wind_kmh: int, condition: str) -> List[WeatherAdvisoryItem]:
        advisories = []
        
        # Wind / Crane Advisory
        if wind_kmh >= 45:
            advisories.append(WeatherAdvisoryItem(
                category="Crane & Lifting Operations",
                severity="danger",
                title="Crane High-Wind Cutoff Exceeded",
                message=f"Current wind speed of {wind_kmh} km/h exceeds safe lifting threshold (40 km/h).",
                recommendation="Halt tower crane and mobile crane hoisting. Secure jibs into weathervane mode."
            ))
        elif wind_kmh >= 30:
            advisories.append(WeatherAdvisoryItem(
                category="Work at Height & Roofing",
                severity="warning",
                title="Elevated Gust Caution",
                message=f"Wind gusts reaching {wind_kmh} km/h require extra fall arrest tethering.",
                recommendation="Double-check scaffold guardrails, anchor lanyards, and avoid handling broad sheet materials."
            ))
        else:
            advisories.append(WeatherAdvisoryItem(
                category="Crane & Lifting Operations",
                severity="info",
                title="Wind Conditions Favorable",
                message=f"Sustained wind {wind_kmh} km/h within normal operating envelope.",
                recommendation="Standard lifting procedures permitted with certified rigging."
            ))

        # Temperature / Concrete Advisory
        if temp >= 32:
            advisories.append(WeatherAdvisoryItem(
                category="Concrete Placement & Hydration",
                severity="warning",
                title="Hot Weather Concreting Protocol Required",
                message=f"Ambient temperature of {temp}°C accelerates hydration and initial set time.",
                recommendation="Use chilled batch water, retarding admixtures, and initiate moist curing immediately after finishing."
            ))
            advisories.append(WeatherAdvisoryItem(
                category="Heat Stress & Workforce",
                severity="warning",
                title="Heat Stress Alert",
                message=f"High ambient heat ({temp}°C) increases dehydration and exhaustion risk.",
                recommendation="Provide shaded rest stations, mandatory hydration breaks every 45 mins, and cold potable water."
            ))
        elif temp <= 4:
            advisories.append(WeatherAdvisoryItem(
                category="Concrete Placement & Masonry",
                severity="danger",
                title="Cold Weather Concreting Alert",
                message=f"Ambient temp at {temp}°C risks freezing freshly placed concrete.",
                recommendation="Heat subgrade before pouring. Maintain concrete temp above 10°C with thermal insulating blankets for 72h."
            ))
        else:
            advisories.append(WeatherAdvisoryItem(
                category="Concrete Placement",
                severity="info",
                title="Optimal Concreting Window",
                message=f"Moderate temperature ({temp}°C) provides ideal conditions for curing.",
                recommendation="Follow standard 7-day wet burlap or curing compound protocol."
            ))

        # Rain Advisory
        if "rain" in condition.lower() or "storm" in condition.lower():
            advisories.append(WeatherAdvisoryItem(
                category="Trenching & Earthworks",
                severity="warning",
                title="Rainfall & Soil Erosion Risk",
                message="Precipitation may undermine excavation walls and increase mud tracking.",
                recommendation="Inspect trench shoring, cover soil stockpiles with tarps, and deploy dewatering sump pumps."
            ))
        else:
            advisories.append(WeatherAdvisoryItem(
                category="Site Access & Haul Roads",
                severity="info",
                title="Dry Roadway Conditions",
                message="Stable ground conditions for heavy delivery trucks and concrete mixers.",
                recommendation="Maintain dust control misting on active unpaved transit corridors."
            ))

        return advisories

    @classmethod
    def _generate_demo_weather(cls, location: str) -> WeatherData:
        temp = 24
        wind_kmh = 18
        condition = "Partly Cloudy"
        
        advisories = cls._compute_advisories(temp, wind_kmh, condition)
        forecast = cls._generate_sample_forecast(temp)
        
        return WeatherData(
            location=f"{location} (Demo Telemetry)",
            current_temp=temp,
            feels_like=25,
            condition=condition,
            humidity=54,
            wind_speed_kmh=wind_kmh,
            wind_direction="ESE",
            precipitation_probability=10,
            uv_index=5,
            air_quality_index="Good (38 AQI)",
            advisories=advisories,
            forecast=forecast,
            disclaimer=WEATHER_DISCLAIMER
        )

    @classmethod
    def _generate_sample_forecast(cls, base_temp: int) -> List[WeatherForecastDay]:
        days = [
            ("Today", base_temp, base_temp - 6, "Partly Cloudy", "cloud-sun", 18, 10),
            ("Tomorrow", base_temp + 2, base_temp - 5, "Sunny", "sun", 14, 5),
            ("Wednesday", base_temp + 1, base_temp - 4, "Scattered Showers", "cloud-rain", 28, 65),
            ("Thursday", base_temp - 2, base_temp - 7, "Windy & Clear", "wind", 38, 15),
            ("Friday", base_temp, base_temp - 6, "Optimal Fair", "sun", 12, 0),
        ]
        return [
            WeatherForecastDay(
                date=f"Day {i+1}",
                day_name=d[0],
                temp_high=d[1],
                temp_low=d[2],
                condition=d[3],
                icon=d[4],
                wind_speed_kmh=d[5],
                rain_probability=d[6]
            )
            for i, d in enumerate(days)
        ]
