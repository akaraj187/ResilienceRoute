import datetime
from .weather_adapter import weather_adapter
from .terrain_service import terrain_service

class HazardService:
    def __init__(self):
        self.flood_zone_available = False

    def assess_flood_hazard(self, lat: float, lon: float):
        # 1. Collect inputs
        weather = weather_adapter.get_weather_evidence()
        terrain = terrain_service.get_terrain_susceptibility(lat, lon)
        
        indicators = {
            "precipitation_mm": None,
            "elevation_m": None,
            "local_relative_elevation_m": None,
            "terrain_susceptibility_score": None,
            "water_proximity": None,
            "flood_zone": None
        }
        
        sources = {
            "weather": "UNAVAILABLE",
            "terrain": "UNAVAILABLE",
            "flood_zone": "UNAVAILABLE"
        }
        
        reasons = []
        total_score = 0
        total_weight = 0
        
        # Weights
        WEATHER_WEIGHT = 0.60
        TERRAIN_WEIGHT = 0.40
        
        # 2. Weather Contribution
        if weather["status"] == "success":
            sources["weather"] = weather["source"]
            precip = weather["data"].get("precipitation_mm", 0.0)
            indicators["precipitation_mm"] = precip
            
            # Simple deterministic rule for precipitation (0 to 100 scale internally before weighting)
            precip_risk = min((precip / 20.0) * 100, 100)
            
            total_score += precip_risk * WEATHER_WEIGHT
            total_weight += WEATHER_WEIGHT
            
            if precip > 15:
                reasons.append("Heavy precipitation actively occurring")
            elif precip > 5:
                reasons.append("Moderate precipitation detected")
            elif precip > 0:
                reasons.append("Light precipitation detected")
            else:
                reasons.append("No active precipitation")
        else:
            reasons.append("Weather data unavailable, cannot assess meteorological risk")
            
        # 3. Terrain Contribution
        if terrain["status"] == "success":
            sources["terrain"] = terrain["source"]
            indicators["elevation_m"] = terrain["elevation_m"]
            indicators["local_relative_elevation_m"] = terrain["local_relative_elevation_m"]
            indicators["terrain_susceptibility_score"] = terrain["susceptibility_score"]
            
            terrain_risk = terrain["susceptibility_score"]
            
            total_score += terrain_risk * TERRAIN_WEIGHT
            total_weight += TERRAIN_WEIGHT
            
            # Reasons based on local relative elevation
            rel_el = terrain["local_relative_elevation_m"]
            if rel_el <= -1.0:
                reasons.append("Location is relatively lower than the sampled local terrain.")
            elif rel_el < 1.0:
                reasons.append("Location is near the local neighborhood elevation.")
            else:
                reasons.append("Location is relatively higher than the sampled local terrain.")
        else:
            reasons.append(f"Terrain contribution unavailable: {terrain.get('error', 'unknown error')}")
            
        # 4. Flood Zone Contributions
        reasons.append("Flood zone data unavailable")
        
        # 5. Calculate deterministic normalized risk score (0-100)
        if total_weight > 0:
            final_score = int(total_score / total_weight)
            
            # Determine confidence based on available indicators
            if sources["weather"] != "UNAVAILABLE" and sources["terrain"] != "UNAVAILABLE":
                confidence = "MEDIUM" # We have two data sources now!
            else:
                confidence = "LIMITED"
        else:
            final_score = 0
            confidence = "UNAVAILABLE"
            
        # 6. Classify Risk
        if final_score < 25:
            level = "SAFE"
        elif final_score < 50:
            level = "LOW"
        elif final_score < 75:
            level = "HIGH"
        else:
            level = "CRITICAL"
            
        return {
            "status": "success",
            "hazard_type": "flood",
            "location": {
                "lat": lat,
                "lon": lon
            },
            "risk": {
                "score": final_score,
                "level": level
            },
            "indicators": indicators,
            "reasons": reasons,
            "confidence": confidence,
            "source": sources,
            "timestamp": datetime.datetime.now().isoformat()
        }

hazard_service = HazardService()
