from typing import Dict, List, Any, Optional
from datetime import datetime
from .models import FieldUnit, LocationUpdate, StatusUpdate
from ..incidents.incident_service import incident_service

DEMO_UNITS = [
    FieldUnit(name="Rescue Team Alpha", unit_type="RESCUE_TEAM", status="ASSIGNED", state="Karnataka", district="Dharwad", city="Hubballi", demo=True),
    FieldUnit(name="Rescue Team Beta", unit_type="RESCUE_TEAM", status="ASSIGNED", state="Karnataka", district="Dharwad", city="Dharwad", demo=True),
    FieldUnit(name="Ambulance Unit A", unit_type="AMBULANCE", status="ASSIGNED", state="Karnataka", district="Dharwad", city="Hubballi", demo=True),
    FieldUnit(name="Boat Unit A", unit_type="BOAT_TEAM", status="ASSIGNED", state="Karnataka", district="Dharwad", city="Hubballi", demo=True)
]

VALID_TRANSITIONS = {
    "ASSIGNED": ["EN_ROUTE", "UNAVAILABLE"],
    "EN_ROUTE": ["AT_SCENE", "UNAVAILABLE", "ASSIGNED"],
    "AT_SCENE": ["OPERATING", "UNAVAILABLE", "RETURNING", "ASSIGNED"],
    "OPERATING": ["COMPLETED", "UNAVAILABLE", "RETURNING", "ASSIGNED"],
    "RETURNING": ["COMPLETED", "UNAVAILABLE", "ASSIGNED"],
    "COMPLETED": ["UNAVAILABLE", "ASSIGNED"],
    "UNAVAILABLE": ["ASSIGNED"]
}

class FieldService:
    def __init__(self):
        self.units: Dict[str, FieldUnit] = {u.field_unit_id: u for u in DEMO_UNITS}

    def get_all(self, incident_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if incident_id:
            return [u.dict() for u in self.units.values() if u.incident_id == incident_id]
        return [u.dict() for u in self.units.values()]

    def get_unit(self, field_unit_id: str) -> Optional[FieldUnit]:
        return self.units.get(field_unit_id)

    def create_unit(self, unit: FieldUnit) -> FieldUnit:
        self.units[unit.field_unit_id] = unit
        incident_service._log_audit("SYSTEM", "SYSTEM", "FIELD_UNIT_CREATED", "", "SUCCESS")
        return unit

    def update_location(self, field_unit_id: str, loc: LocationUpdate) -> Dict[str, Any]:
        unit = self.units.get(field_unit_id)
        if not unit:
            return {"error": "Unit not found"}

        unit.latitude = loc.latitude
        unit.longitude = loc.longitude
        unit.location_accuracy_m = loc.accuracy_m
        unit.last_seen = loc.timestamp or (datetime.utcnow().isoformat() + "Z")
        
        incident_service._log_audit("SYSTEM", "SYSTEM", "FIELD_LOCATION_UPDATED", field_unit_id, "SUCCESS")
        return {"status": "success", "unit": unit.dict()}

    def update_status(self, field_unit_id: str, update: StatusUpdate) -> Dict[str, Any]:
        unit = self.units.get(field_unit_id)
        if not unit:
            return {"error": "Unit not found"}

        current_status = unit.status
        new_status = update.new_status

        # Validate transition
        allowed = VALID_TRANSITIONS.get(current_status, [])
        if new_status not in allowed and new_status != current_status:
            return {"error": f"Invalid transition from {current_status} to {new_status}"}

        if new_status != current_status:
            unit.status = new_status
            incident_service._log_audit(update.actor, update.role, "FIELD_STATUS_CHANGED", field_unit_id, f"{current_status}->{new_status}")
            
            # Update timeline if tied to an incident
            if unit.incident_id:
                inc = incident_service.incidents.get(unit.incident_id)
                if inc:
                    incident_service._add_timeline(
                        inc, 
                        "FIELD_STATUS_CHANGED", 
                        f"{unit.name} status changed to {new_status}", 
                        update.actor, 
                        update.role
                    )

        return {"status": "success", "unit": unit.dict()}

field_service = FieldService()
