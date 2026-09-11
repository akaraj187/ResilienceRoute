import uuid
import datetime
from typing import Dict

from .route_monitor_service import route_monitor_service
from .routing_service import routing_service
from .weather_adapter import weather_adapter
import networkx as nx

class RouteReplacementService:
    def __init__(self):
        self._recommendations: Dict[str, dict] = {}
        self._audit_log: list = []

    def recommend_replacement(self, route_id: str) -> dict:
        route_record = route_monitor_service._monitored_routes.get(route_id)
        if not route_record:
            return {"status": "error", "message": "Route not found"}

        if route_record["monitor_status"] != "INVALIDATED":
            return {
                "status": "success",
                "route_id": route_id,
                "replacement_status": "NOT_REQUIRED",
                "message": "Replacement not required."
            }

        origin = route_record["origin"]
        destination = route_record["destination"]
        
        try:
            candidate = routing_service.calculate_route(
                origin["lat"], origin["lon"],
                destination["lat"], destination["lon"],
                hazard_aware=True
            )
        except nx.NetworkXNoPath:
            return {
                "status": "success",
                "route_id": route_id,
                "replacement_status": "NO_ROUTE",
                "message": "No alternative path exists."
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
            
        if not candidate.get("route_nodes"):
            return {
                "status": "success",
                "route_id": route_id,
                "replacement_status": "NO_ROUTE",
                "message": "No alternative path exists."
            }

        old_summary = route_record["current_hazard_summary"]
        new_summary = candidate["hazard_summary"]
        
        old_score = old_summary.get("overall_score", 0.0)
        new_score = new_summary.get("overall_score", 0.0)
        new_critical = new_summary.get("critical_segments", 0)

        is_identical = (candidate["route_nodes"] == route_record["route_nodes"])

        if is_identical:
            replacement_status = "NO_BETTER_ROUTE"
            reason = "Current hazard-aware routing did not identify a lower-risk alternative."
        elif new_critical > 0:
            replacement_status = "NO_SAFE_AVAILABLE_ROUTE"
            reason = "Candidate route has CRITICAL segments."
        elif new_score >= old_score:
            replacement_status = "NO_BETTER_ROUTE"
            reason = "Candidate route is not lower risk than the current route."
        else:
            replacement_status = "RECOMMENDATION_READY"
            reason = "Candidate route has lower hazard exposure and no CRITICAL segments."

        rec_id = str(uuid.uuid4())
        now = datetime.datetime.now().isoformat()
        
        weather_ev = weather_adapter.get_weather_evidence()
        mode_label = weather_ev.get("source", "Unknown")

        if replacement_status == "RECOMMENDATION_READY":
            self._recommendations[rec_id] = {
                "recommendation_id": rec_id,
                "route_id": route_id,
                "status": "PENDING",
                "candidate_route": candidate,
                "reason": reason,
                "created_at": now
            }

        audit_event = {
            "recommendation_id": rec_id if replacement_status == "RECOMMENDATION_READY" else None,
            "route_id": route_id,
            "timestamp": now,
            "old_hazard_score": old_score,
            "candidate_hazard_score": new_score,
            "old_critical_segments": old_summary.get("critical_segments", 0),
            "candidate_critical_segments": new_critical,
            "environmental_mode": mode_label,
            "reason": reason,
            "replacement_status": replacement_status
        }
        self._audit_log.append(audit_event)

        res = {
            "status": "success",
            "route_id": route_id,
            "replacement_status": replacement_status,
            "current_route": {
                "distance_m": route_record.get("distance_m", 0),
                "travel_time_s": route_record.get("estimated_time_s", 0),
                "hazard_score": old_score,
                "hazard_level": old_summary.get("overall_level", "SAFE"),
                "critical_segments": old_summary.get("critical_segments", 0),
                "high_risk_segments": old_summary.get("high_risk_segments", 0)
            },
            "candidate_route": {
                "distance_m": candidate.get("distance_m", 0),
                "travel_time_s": candidate.get("estimated_time_s", 0),
                "hazard_score": new_score,
                "hazard_level": new_summary.get("overall_level", "SAFE"),
                "critical_segments": new_critical,
                "high_risk_segments": new_summary.get("high_risk_segments", 0),
                "route_nodes": candidate.get("route_nodes")
            },
            "decision": {
                "recommended": replacement_status == "RECOMMENDATION_READY",
                "reason": reason
            },
            "environmental_mode": mode_label,
            "provenance": {
                "weather": mode_label,
                "terrain": "ISRO/NRSC CartoDEM V3 R1 \u2014 D43D (LOCAL/CACHED DATA)",
                "road": "OpenStreetMap (LOCAL/CACHED GRAPH)"
            }
        }
        
        if replacement_status == "RECOMMENDATION_READY":
            res["recommendation_id"] = rec_id
            
        return res

    def approve_replacement(self, route_id: str, recommendation_id: str) -> dict:
        rec = self._recommendations.get(recommendation_id)
        if not rec or rec["route_id"] != route_id:
            return {"status": "error", "message": "Recommendation not found or mismatch"}
            
        if rec["status"] != "PENDING":
            return {"status": "error", "message": f"Recommendation is already {rec['status']}"}
            
        rec["status"] = "APPROVED"
        now = datetime.datetime.now().isoformat()
        
        actor = "EOC operator"
        
        # Apply the replacement
        route_monitor_service.apply_replacement(route_id, rec["candidate_route"], recommendation_id, actor=actor)
        
        audit_event = {
            "recommendation_id": recommendation_id,
            "route_id": route_id,
            "timestamp": now,
            "action": "APPROVED",
            "actor": actor
        }
        self._audit_log.append(audit_event)
        
        return {
            "status": "success",
            "approval_status": "APPROVED",
            "route_id": route_id,
            "replacement_status": "APPROVED",
            "audit_event": audit_event
        }

    def reject_replacement(self, route_id: str, recommendation_id: str, reason: str) -> dict:
        rec = self._recommendations.get(recommendation_id)
        if not rec or rec["route_id"] != route_id:
            return {"status": "error", "message": "Recommendation not found or mismatch"}
            
        if rec["status"] != "PENDING":
            return {"status": "error", "message": f"Recommendation is already {rec['status']}"}
            
        rec["status"] = "REJECTED"
        now = datetime.datetime.now().isoformat()
        actor = "EOC operator"
        
        audit_event = {
            "recommendation_id": recommendation_id,
            "route_id": route_id,
            "timestamp": now,
            "action": "REJECTED",
            "actor": actor,
            "reason": reason
        }
        self._audit_log.append(audit_event)
        
        return {
            "status": "success",
            "approval_status": "REJECTED",
            "route_id": route_id,
            "replacement_status": "REJECTED",
            "audit_event": audit_event
        }

route_replacement_service = RouteReplacementService()
