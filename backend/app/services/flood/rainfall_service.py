from app.services.weather_adapter import weather_adapter

class RainfallService:
    def generate_forecast(self, intensity_mm_hr, duration_minutes=180):
        # Validate intensity: 20-100 mm/hr
        intensity_mm_hr = max(20, min(100, intensity_mm_hr))
        
        forecast = []
        for minute in range(0, duration_minutes + 1, 30):
            forecast.append({
                "minute": minute,
                "rainfall_mm_hr": float(intensity_mm_hr)
            })
            
        return {
            "mode": "SIMULATION",
            "base_intensity_mm_hr": intensity_mm_hr,
            "forecast": forecast,
            "source": "User-defined simulation scenario (NOT an official weather forecast)"
        }
        
    def get_live_rainfall(self):
        weather = weather_adapter.get_weather_evidence()
        precip = 0.0
        if weather and "data" in weather and weather["data"]:
            precip = weather["data"].get("precipitation_mm", 0.0) or 0.0
        
        return {
            "mode": "LIVE",
            "base_intensity_mm_hr": precip,
            "forecast": [
                {"minute": 0, "rainfall_mm_hr": precip}
            ],
            "source": "Live weather data"
        }

rainfall_service = RainfallService()
