from .weather_service import weather_service
from .scenario_service import scenario_service

class WeatherAdapter:
    def get_weather_evidence(self, lat: float = None, lon: float = None):
        """
        Abstraction to fetch either LIVE WEATHER from the production service
        or CONTROLLED SCENARIO weather if a scenario is active.
        """
        scenario_weather = scenario_service.get_scenario_weather(lat=lat, lon=lon)
        if scenario_weather:
            return scenario_weather
            
        return weather_service.get_current_weather()

    def get_weather_forecast(self, lat: float = None, lon: float = None):
        if scenario_service.is_active():
            import datetime
            base_precip = float(scenario_service.get_config().get("precipitation_mm", 50.0))
            return {
                "status": "success",
                "source": "CONTROLLED SCENARIO",
                "is_controlled_scenario": True,
                "warning": "CONTROLLED DEMONSTRATION SCENARIO — NOT LIVE FORECAST DATA",
                "location": {
                    "lat": 15.3647,
                    "lon": 75.1240,
                    "name": "Hubballi-Dharwad Region (Scenario Mode)"
                },
                "timestamp": datetime.datetime.now().isoformat(),
                "current": {
                    "temperature_c": 25.0,
                    "precipitation_mm": base_precip,
                    "humidity_pct": 95,
                    "wind_speed_kmh": 15.0,
                    "weather_code": 65
                },
                "summary": {
                    "max_prob_6h": 95,
                    "expected_rain_6h_mm": base_precip,
                    "max_prob_24h": 98,
                    "expected_rain_24h_mm": base_precip * 1.5,
                    "preparedness_level": "CRITICAL PREPAREDNESS",
                    "preparedness_badge": "CRITICAL",
                    "preparedness_reason": f"Controlled demonstration rainfall scenario active ({base_precip}mm rainfall). High operational preparedness required.",
                    "active_drainage_issues": 4,
                    "recommendations": [
                        "CONTROLLED DEMO: Inspect Gokul Road & Keshwapur drainage corridors.",
                        "CONTROLLED DEMO: Clear open drainage blockages.",
                        "CONTROLLED DEMO: Pre-position NDRF & municipal flood response teams.",
                        "CONTROLLED DEMO: Monitor low-lying road access points."
                    ]
                },
                "hourly": [
                    {
                        "time": (datetime.datetime.now() + datetime.timedelta(hours=i)).strftime("%Y-%m-%dT%H:00"),
                        "rain_probability_pct": 95 if i < 12 else (80 if i < 24 else 45),
                        "expected_rain_mm": round(base_precip / 3, 1) if i < 12 else (round(base_precip / 6, 1) if i < 24 else 2.0),
                        "precipitation_mm": round(base_precip / 3, 1) if i < 12 else (round(base_precip / 6, 1) if i < 24 else 2.0),
                        "temperature_c": 24.5 + (i % 5) * 0.5,
                        "weather_code": 65
                    } for i in range(48)
                ],
                "daily": {}
            }
        return weather_service.get_weather_forecast()

weather_adapter = WeatherAdapter()
