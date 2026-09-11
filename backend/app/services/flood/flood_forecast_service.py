from .rainfall_service import rainfall_service
from .runoff_service import runoff_service
from .drainage_service import drainage_service
from .inundation_service import inundation_service
from app.services.weather_adapter import weather_adapter

class FloodForecastService:
    def simulate(self, rainfall_mm_hr, blockage_percent=0, forecast_minutes=180):
        if not (20 <= rainfall_mm_hr <= 100):
            raise ValueError("rainfall_mm_hr must be between 20 and 100")
        if not (0 <= blockage_percent <= 75):
            raise ValueError("blockage_percent must be between 0 and 75")
        if not (30 <= forecast_minutes <= 180):
            raise ValueError("forecast_minutes must be between 30 and 180")
        
        scenario = {
            "rainfall_mm_hr": rainfall_mm_hr,
            "blockage_percent": blockage_percent,
            "forecast_minutes": forecast_minutes,
            "runoff_coefficient": runoff_service.DEFAULT_URBAN_COEFFICIENT
        }
        
        forecast = []
        road_geometries = {}
        
        for minute in range(0, forecast_minutes + 1, 30):
            cumulative_rainfall_mm = rainfall_mm_hr * (minute / 60.0)
            runoff_mm_hr = runoff_service.calculate_runoff(rainfall_mm_hr)
            
            drainage_state = drainage_service.simulate(runoff_mm_hr, blockage_percent)
            
            roads_assessed = inundation_service.assess_roads(rainfall_mm_hr, blockage_percent, minute)
            
            roads_dict = {}
            affected_count = 0
            max_score = 0
            max_depth = 0.0
            
            for r in roads_assessed:
                uvk = f"{r['u']}_{r['v']}_{r['key']}"
                
                if minute == 0:
                    road_geometries[uvk] = r["coordinates"]
                    
                roads_dict[uvk] = {
                    "flood_score": r["flood_score"],
                    "flood_level": r["flood_level"],
                    "estimated_depth_cm": r["estimated_depth_cm"],
                    "name": r["name"],
                    "drainage_status": r["drainage_status"]
                }
                
                if r["flood_score"] >= 40:
                    affected_count += 1
                    
                max_score = max(max_score, r["flood_score"])
                max_depth = max(max_depth, r["estimated_depth_cm"])
                
            forecast.append({
                "minute": minute,
                "rainfall_mm_hr": rainfall_mm_hr,
                "cumulative_rainfall_mm": cumulative_rainfall_mm,
                "runoff_mm_hr": runoff_mm_hr,
                "roads": roads_dict,
                "summary": {
                    "total_roads_assessed": len(roads_assessed),
                    "affected_roads": affected_count,
                    "max_flood_score": max_score,
                    "max_depth_cm": max_depth,
                    "flood_level": inundation_service.classify(max_score),
                    "overloaded_drains": drainage_state["summary"]["overloaded_nodes"]
                }
            })
            
        return {
            "status": "success",
            "scenario": scenario,
            "road_geometries": road_geometries,
            "forecast": forecast,
            "drainage": drainage_service.get_network_info(),
            "provenance": {
                "rainfall": "User-defined simulation (WHAT-IF)",
                "terrain": "ISRO/NRSC CartoDEM V3 R1 — D43D (LOCAL/CACHED)",
                "road": "OpenStreetMap (LOCAL/CACHED)",
                "drainage": "SYNTHETIC/PROTOTYPE — Not real municipal data"
            },
            "disclaimer": "Prototype estimate based on rainfall, terrain and drainage assumptions; not a validated hydrodynamic water-depth prediction."
        }

    def get_status(self):
        weather = weather_adapter.get_weather_evidence()
        precip = 0.0
        if weather and "data" in weather and weather["data"]:
            precip = weather["data"].get("precipitation_mm", 0.0) or 0.0
        
        return self.simulate(max(20.0, precip), 0, 30)

flood_forecast_service = FloodForecastService()
