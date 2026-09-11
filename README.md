# ResilienceRoute

## AI-Powered Urban Flood Nowcasting & Emergency Route Intelligence Platform

**SIH Problem Statement**: SIH26085 — Urban Flood Nowcasting System (Drainage and Rainfall Coupling)

ResilienceRoute couples short-term rainfall information with terrain and drainage intelligence to estimate evolving urban flood risk over a 0–3 hour horizon and convert those predictions into safer emergency routing decisions.

### 1. System Status
* **Backend APIs**: ONLINE (FastAPI)
* **OSM Network**: LOADED (NetworkX / OSMnx)
* **Terrain Engine**: AVAILABLE (ISRO CartoDEM V3)
* **Weather**: LIVE (Open-Meteo)
* **Flood & Routing Engine**: READY
* **Drainage Model**: SYNTHETIC PROTOTYPE

### 2. Architecture
The complete end-to-end data flow operates as follows:
`Rainfall → Runoff → Terrain Susceptibility → Drainage Capacity/Blockage → Overflow → Inundation Estimate → Road Flood Risk Penalty → Dynamic Road Weighting → Flood-Safe Route Calculation.`

### 3. APIs
* `GET /api/health` - Basic health check
* `GET /api/system/status` - Service availability diagnostics
* `GET /api/gis/status` - Road graph metrics
* `GET /api/weather` - Live meteorological data
* `GET /api/hazard` - Point-based local hazard queries
* `GET /api/road-hazard` - Specific OSM edge hazard
* `GET /api/flood/status` - 30-minute current flood lookahead
* `POST /api/flood/simulate` - Full 180-minute scenario timeline
* `GET /api/route` - Baseline travel-time routing
* `GET /api/route/flood-safe` - Dynamic resilience routing

### 4. Flood Model
Uses an urban runoff coefficient (0.85) to convert rainfall into surface runoff. Combines live weather parameters with `rasterio` sampling of local geographic depressions (CartoDEM) to estimate susceptibility to ponding. 

### 5. Drainage Model
Due to the unavailability of precise municipal pipe data, the system utilizes a **synthetic/prototype drainage graph**. Nodes simulate catch-basins and topological edges simulate downhill flow. Overflow is calculated when `total_inflow > effective_capacity` (where capacity is dynamically reduced by the user's Blockage parameter). 

### 6. Routing Model
The standard OpenStreetMap routing utilizes `travel_time` Dijkstra. The flood-aware engine overlays an algorithmic penalty `SAFE (1.0x) → HIGH (2.5x)`. Roads flagged as `CRITICAL` (>80 risk score) are mathematically severed from the graph to prevent unsafe passage. If no safe route exists, the API gracefully declines routing rather than falsifying an unsafe detour.

### 7. Frontend
A React/Leaflet dashboard acting as an Emergency Operations Center (EOC). Features a dynamic "Command Center" sidebar with predefined demo scenarios (NORMAL, HEAVY RAIN, EXTREME), timeline forecast sliders, and interactive routing comparisons detailing exact risk-reduction and detour distance.

### 8. End-to-End Demo
**Tested Scenario:** Origin 15.36, 75.12 to Dest 15.42, 75.10.
At 100mm/hr rainfall + 75% blockage (+3h horizon), the fastest baseline route directly crossed a CRITICAL flood corridor (Score 80). The ResilienceRoute engine dynamically detected the overflow and mathematically diverted the path. The resulting recommended route safely skirted the inundation, reducing the flood risk score down to 0, at the minimal cost of 19 meters of extra driving.

### 9. Tests
Comprehensive test suite `test_phase5c.py` executes 8/8 tests perfectly, verifying regression endpoints, parameter validation, and algorithmic detours.

### 10. Build
Frontend React/Vite builds flawlessly (`npm run build`) with zero structural errors.

### 11. Performance
Vectorized sampling of the DEM data via `rasterio` and batched OSM geometry queries (`osmnx.distance.nearest_edges`) ensure that evaluating the 70,000+ edge Hubballi-Dharwad road network completes in `<500ms`, enabling rapid +3h timeline switching without server lag.

### 12. Limitations
* **Hydrological Fidelity**: The drainage network is purely synthetic and topology-driven; it is NOT real municipal infrastructure data.
* **Depth Estimates**: Estimated water depth is a localized prototype extrapolation intended for scoring, not a physically validated hydrodynamic model (e.g., SWMM).

### 13. SIH Alignment
Explicitly maps to **SIH26085** requirements by dynamically coupling rainfall with drainage constraints to estimate inundation on road segments, ultimately delivering actionable geospatial intelligence to the end-user.

### 14. Remaining Risks
Judges may point out the use of a synthetic drainage proxy. Teams must be highly transparent during demonstrations that the architecture is designed to eagerly accept real SWMM shapefiles once provided by a municipality.

### 15. Recommended Post-SIH Enhancements
* Sub-divide runoff coefficients natively using proper Land Use Land Cover (LULC) satellite multi-spectral classifications.
* Continuously poll weather daemons to generate proactive alert notifications for connected vehicles if a route they are currently navigating becomes flooded mid-journey.

***

_Prototype model intended for demonstration and decision support. Flood estimates are not a validated hydrodynamic forecast._
