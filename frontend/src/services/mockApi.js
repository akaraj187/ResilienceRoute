/**
 * ResilienceRoute Standalone Mock & Interceptor Engine
 * Enables live interactive exploration on GitHub Pages and static deployments,
 * with automatic fallback to live Open-Meteo meteorological data and simulated EOC incidents.
 */

// In-memory simulation state
let scenarioActive = false;

let mockIncidents = [
  {
    incident_id: "INC-001",
    title: "Gokul Road Waterlogging",
    description: "Heavy rainfall has caused water accumulation along Gokul Road corridor. Stormwater drainage is overflowing and vehicle access is restricted.",
    severity: "CRITICAL",
    status: "ACTIVE",
    hazard_type: "Road Waterlogging",
    latitude: 15.3647,
    longitude: 75.1240,
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubballi",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    response_plan_id: "PLAN-001",
    timeline: [
      {
        event_id: "TL-001",
        event_type: "DETECTED",
        description: "Automated runoff sensor detected 88/100 risk score on Gokul Road.",
        source: "Flood Sensor",
        actor: "Sensor Network",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        event_id: "TL-002",
        event_type: "ALERT_ISSUED",
        description: "Red early warning broadcasted to municipal emergency operations.",
        source: "EOC System",
        actor: "System Dispatcher",
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  },
  {
    incident_id: "INC-002",
    title: "Dharwad Central Drainage Overflow",
    description: "Stormwater drainage overflow is affecting road access near Dharwad Central following heavy rainfall.",
    severity: "HIGH",
    status: "ACTIVE",
    hazard_type: "Drainage Overflow",
    latitude: 15.4589,
    longitude: 75.0078,
    state: "Karnataka",
    district: "Dharwad",
    city: "Dharwad",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString(),
    response_plan_id: "PLAN-002",
    timeline: [
      {
        event_id: "TL-003",
        event_type: "REPORTED",
        description: "Municipal drainage obstruction reported near Jubilee Circle base.",
        source: "PWD Sensor",
        actor: "PWD Dispatch",
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ]
  },
  {
    incident_id: "INC-003",
    title: "Keshwapur Corridor Culvert Blockage",
    description: "Open drainage culvert blocked by silt and debris causing road inundation and reduced discharge.",
    severity: "HIGH",
    status: "ACTIVE",
    hazard_type: "Culvert Blockage",
    latitude: 15.3750,
    longitude: 75.1350,
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubballi",
    created_at: new Date(Date.now() - 5400000).toISOString(),
    updated_at: new Date().toISOString(),
    timeline: []
  },
  {
    incident_id: "INC-004",
    title: "Unkal Lake Peripheral Overflow",
    description: "Low-lying water accumulation threatening peripheral road corridor.",
    severity: "MODERATE",
    status: "ACTIVE",
    hazard_type: "Surface Runoff",
    latitude: 15.3750,
    longitude: 75.1300,
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubballi",
    created_at: new Date(Date.now() - 9000000).toISOString(),
    updated_at: new Date().toISOString(),
    timeline: []
  }
];

let mockResources = [
  {
    resource_id: "RES-001",
    name: "Rescue Team Alpha (NDRF)",
    resource_type: "RESCUE_TEAM",
    category: "PERSONNEL",
    quantity: 4,
    available_quantity: 3,
    status: "AVAILABLE",
    latitude: 15.3647,
    longitude: 75.1240,
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubballi",
    location_name: "Hubballi Fire Station",
    last_updated: new Date().toISOString()
  },
  {
    resource_id: "RES-002",
    name: "Rescue Team Beta (SDRF)",
    resource_type: "RESCUE_TEAM",
    category: "PERSONNEL",
    quantity: 2,
    available_quantity: 2,
    status: "AVAILABLE",
    latitude: 15.4589,
    longitude: 75.0078,
    state: "Karnataka",
    district: "Dharwad",
    city: "Dharwad",
    location_name: "Dharwad Central Base",
    last_updated: new Date().toISOString()
  },
  {
    resource_id: "RES-003",
    name: "Emergency Ambulance Unit A",
    resource_type: "AMBULANCE",
    category: "VEHICLE",
    quantity: 5,
    available_quantity: 4,
    status: "AVAILABLE",
    latitude: 15.3500,
    longitude: 75.1500,
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubballi",
    location_name: "KIMS Hospital Depot",
    last_updated: new Date().toISOString()
  },
  {
    resource_id: "RES-004",
    name: "Flood Evac Boat Unit 1",
    resource_type: "BOAT",
    category: "VEHICLE",
    quantity: 3,
    available_quantity: 2,
    status: "AVAILABLE",
    latitude: 15.3700,
    longitude: 75.1300,
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubballi",
    location_name: "Unkal Lake Watercraft Depot",
    last_updated: new Date().toISOString()
  },
  {
    resource_id: "RES-005",
    name: "High-Capacity Dewatering Pump Unit",
    resource_type: "PUMP",
    category: "EQUIPMENT",
    quantity: 6,
    available_quantity: 5,
    status: "AVAILABLE",
    latitude: 15.3680,
    longitude: 75.1210,
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubballi",
    location_name: "Municipal PWD Yard",
    last_updated: new Date().toISOString()
  },
  {
    resource_id: "RES-006",
    name: "Medical Aid & Emergency Supplies Depot",
    resource_type: "MEDICAL_KIT",
    category: "SUPPLY",
    quantity: 100,
    available_quantity: 92,
    status: "AVAILABLE",
    latitude: 15.3600,
    longitude: 75.1400,
    state: "Karnataka",
    district: "Dharwad",
    city: "Hubballi",
    location_name: "District Health Logistics Hub",
    last_updated: new Date().toISOString()
  }
];

let mockFieldUnits = [
  {
    unit_id: "UNIT-001",
    name: "Unit Alpha 1",
    unit_type: "RESCUE_TEAM",
    status: "EN_ROUTE",
    target_incident_id: "INC-001",
    latitude: 15.3620,
    longitude: 75.1210,
    heading: 45,
    speed_kmh: 35,
    updated_at: new Date().toISOString()
  },
  {
    unit_id: "UNIT-002",
    name: "Ambulance 3",
    unit_type: "AMBULANCE",
    status: "OPERATING",
    target_incident_id: "INC-002",
    latitude: 15.4560,
    longitude: 75.0100,
    heading: 90,
    speed_kmh: 0,
    updated_at: new Date().toISOString()
  },
  {
    unit_id: "UNIT-003",
    name: "Flood Evac Boat 2",
    unit_type: "BOAT",
    status: "AVAILABLE",
    target_incident_id: null,
    latitude: 15.3720,
    longitude: 75.1280,
    heading: 0,
    speed_kmh: 0,
    updated_at: new Date().toISOString()
  }
];

let mockAlerts = [
  {
    alert_id: "ALT-001",
    incident_id: "INC-001",
    title: "Flash Flood Warning — Gokul Road Corridor",
    severity: "CRITICAL",
    status: "SENT",
    message: "Urgent: Gokul Road underpass and low-lying sectors experiencing severe inundation. Divert through Keshwapur or PB Road.",
    hazard_type: "Road Waterlogging",
    channels: ["SMS", "CAP_BROADCAST", "PUBLIC_RADIO"],
    recipients_count: 2480,
    acknowledged_count: 1845,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    alert_id: "ALT-002",
    incident_id: "INC-002",
    title: "Urban Drainage Advisory — Dharwad Central",
    severity: "HIGH",
    status: "SENT",
    message: "Culvert capacity exceeded near Jubilee Circle. Exercise caution and avoid waterlogged road intersections.",
    hazard_type: "Drainage Overflow",
    channels: ["SMS", "APP_ALERT"],
    recipients_count: 1720,
    acknowledged_count: 1102,
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

let mockPlans = {
  "INC-001": {
    plan_id: "PLAN-001",
    incident_id: "INC-001",
    status: "APPROVED",
    title: "Rapid Deployment Plan for Gokul Road",
    actions: [
      {
        action_id: "ACT-001",
        plan_id: "PLAN-001",
        resource_id: "RES-001",
        resource_name: "Rescue Team Alpha",
        action_type: "DISPATCH",
        quantity: 1,
        status: "DISPATCHED",
        assigned_to: "Unit Alpha 1",
        notes: "Clear road sector and assist stranded motorists."
      },
      {
        action_id: "ACT-002",
        plan_id: "PLAN-001",
        resource_id: "RES-005",
        resource_name: "High-Capacity Dewatering Pump Unit",
        action_type: "DEPLOY",
        quantity: 2,
        status: "DISPATCHED",
        assigned_to: "PWD Dewatering Squad",
        notes: "Dewater low-lying underpass stormwater drain."
      }
    ]
  },
  "INC-002": {
    plan_id: "PLAN-002",
    incident_id: "INC-002",
    status: "RECOMMENDED",
    title: "Culvert Drainage Response Plan",
    actions: [
      {
        action_id: "ACT-003",
        plan_id: "PLAN-002",
        resource_id: "RES-002",
        resource_name: "Rescue Team Beta",
        action_type: "DISPATCH",
        quantity: 1,
        status: "PENDING",
        assigned_to: "Dharwad Base",
        notes: "Assist municipal clearance crews."
      }
    ]
  }
};

let activeMonitoredRoute = null;

// Generate realistic route waypoints between two coordinates
function generateRouteLine(origin, destination) {
  const steps = 12;
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add slight natural curve
    const offsetLat = Math.sin(t * Math.PI) * 0.003;
    const offsetLng = Math.sin(t * Math.PI) * -0.003;
    const lat = origin.lat + (destination.lat - origin.lat) * t + offsetLat;
    const lng = origin.lng + (destination.lng - origin.lng) * t + offsetLng;
    coords.push([lng, lat]); // GeoJSON order [lon, lat]
  }
  return coords;
}

// Fetch live weather from Open-Meteo client-side
async function fetchLiveOpenMeteo() {
  try {
    const lat = 15.3647;
    const lon = 75.1240;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;
    const res = await window.__originalFetch(url);
    if (!res.ok) throw new Error("Open-Meteo returned status " + res.status);
    const data = await res.json();
    
    const hourly = [];
    if (data.hourly?.time) {
      for (let i = 0; i < Math.min(48, data.hourly.time.length); i++) {
        hourly.push({
          time: data.hourly.time[i],
          temperature_c: data.hourly.temperature_2m?.[i] ?? 24,
          rain_probability_pct: data.hourly.precipitation_probability?.[i] ?? 10,
          expected_rain_mm: data.hourly.precipitation?.[i] ?? 0,
          precipitation_mm: data.hourly.precipitation?.[i] ?? 0,
          wind_speed_kmh: data.hourly.wind_speed_10m?.[i] ?? 10,
          weather_code: data.hourly.weather_code?.[i] ?? 0
        });
      }
    }

    const currentPrecip = data.current?.precipitation ?? 0;
    const maxProb6h = Math.max(...hourly.slice(0, 6).map(h => h.rain_probability_pct), 0);
    const expectedRain6h = hourly.slice(0, 6).reduce((acc, h) => acc + (h.expected_rain_mm || 0), 0);
    const maxProb24h = Math.max(...hourly.slice(0, 24).map(h => h.rain_probability_pct), 0);
    const expectedRain24h = hourly.slice(0, 24).reduce((acc, h) => acc + (h.expected_rain_mm || 0), 0);

    let prepLevel = "NORMAL";
    let prepBadge = "NORMAL";
    if (scenarioActive || maxProb6h > 80 || expectedRain6h > 40) {
      prepLevel = "CRITICAL PREPAREDNESS";
      prepBadge = "CRITICAL";
    } else if (maxProb6h > 60 || expectedRain6h > 20) {
      prepLevel = "HIGH PREPAREDNESS";
      prepBadge = "HIGH";
    } else if (maxProb6h > 40 || expectedRain6h > 10) {
      prepLevel = "PREPARE";
      prepBadge = "PREPARE";
    } else if (maxProb6h > 20) {
      prepLevel = "WATCH";
      prepBadge = "WATCH";
    }

    return {
      status: "success",
      source: "Open-Meteo Live Integration",
      is_controlled_scenario: scenarioActive,
      location: {
        lat: 15.3647,
        lon: 75.1240,
        name: "Hubballi-Dharwad Region"
      },
      timestamp: new Date().toISOString(),
      current: {
        temperature_c: data.current?.temperature_2m ?? 26.5,
        precipitation_mm: scenarioActive ? 55.0 : currentPrecip,
        humidity_pct: data.current?.relative_humidity_2m ?? 78,
        wind_speed_kmh: data.current?.wind_speed_10m ?? 12,
        weather_code: scenarioActive ? 65 : (data.current?.weather_code ?? 1)
      },
      summary: {
        max_prob_6h: scenarioActive ? 95 : maxProb6h,
        expected_rain_6h_mm: scenarioActive ? 65.0 : Math.round(expectedRain6h * 10) / 10,
        max_prob_24h: scenarioActive ? 98 : maxProb24h,
        expected_rain_24h_mm: scenarioActive ? 120.0 : Math.round(expectedRain24h * 10) / 10,
        preparedness_level: scenarioActive ? "CRITICAL PREPAREDNESS" : prepLevel,
        preparedness_badge: scenarioActive ? "CRITICAL" : prepBadge,
        preparedness_reason: scenarioActive
          ? "Controlled demonstration rainfall scenario active (65mm rainfall). Severe inundation risk along arterial corridors."
          : `Live regional meteorological forecast indicates ${prepLevel} alert for urban Hubballi-Dharwad stormwater drainage.`,
        active_drainage_issues: mockIncidents.length,
        recommendations: [
          "Inspect Gokul Road & Keshwapur drainage corridors for debris blockage.",
          "Pre-position municipal high-capacity dewatering pumps at low-lying underpasses.",
          "Coordinate with Traffic Police for automated route diversions around waterlogged segments.",
          "Keep NDRF and SDRF rescue personnel on standby for rapid urban flood response."
        ]
      },
      hourly
    };
  } catch (e) {
    console.warn("Failed to fetch live Open-Meteo weather, using realistic synthetic fallback:", e);
    return getSyntheticForecast();
  }
}

function getSyntheticForecast() {
  const hourly = [];
  const now = new Date();
  for (let i = 0; i < 48; i++) {
    const hTime = new Date(now.getTime() + i * 3600000);
    hourly.push({
      time: hTime.toISOString().substring(0, 16),
      temperature_c: 24.5 + Math.sin(i / 4) * 3,
      rain_probability_pct: scenarioActive ? (i < 12 ? 95 : 70) : Math.max(15, Math.round(55 + Math.sin(i / 3) * 30)),
      expected_rain_mm: scenarioActive ? (i < 6 ? 12.5 : 4.0) : Math.max(0, Math.round((5 + Math.sin(i / 2) * 5) * 10) / 10),
      precipitation_mm: scenarioActive ? 10.0 : 2.5,
      wind_speed_kmh: 14.0,
      weather_code: scenarioActive ? 65 : 61
    });
  }

  return {
    status: "success",
    source: scenarioActive ? "CONTROLLED SCENARIO" : "Standalone Operational Simulation",
    is_controlled_scenario: scenarioActive,
    location: {
      lat: 15.3647,
      lon: 75.1240,
      name: "Hubballi-Dharwad Municipal Region"
    },
    timestamp: new Date().toISOString(),
    current: {
      temperature_c: 25.2,
      precipitation_mm: scenarioActive ? 52.0 : 14.5,
      humidity_pct: 88,
      wind_speed_kmh: 15.5,
      weather_code: 61
    },
    summary: {
      max_prob_6h: scenarioActive ? 95 : 82,
      expected_rain_6h_mm: scenarioActive ? 52.0 : 24.0,
      max_prob_24h: scenarioActive ? 98 : 88,
      expected_rain_24h_mm: scenarioActive ? 98.0 : 45.0,
      preparedness_level: scenarioActive ? "CRITICAL PREPAREDNESS" : "HIGH PREPAREDNESS",
      preparedness_badge: scenarioActive ? "CRITICAL" : "HIGH",
      preparedness_reason: "Monsoon trough convergence causing high-intensity precipitation over Hubballi-Dharwad twin cities.",
      active_drainage_issues: 4,
      recommendations: [
        "Pre-position municipal pumping stations in Gokul Road and Old Hubballi sectors.",
        "Inspect culvert intakes along Dharwad Central & Keshwapur.",
        "Alert municipal flood dispatch teams (NDRF Alpha & SDRF Beta)."
      ]
    },
    hourly
  };
}

function handleMockRequest(url, init = {}) {
  const method = (init.method || "GET").toUpperCase();
  const parsed = new URL(url, window.location.origin);
  const path = parsed.pathname;
  const params = parsed.searchParams;

  console.info(`[ResilienceRoute Mock Engine] ${method} ${path}`);

  // Helpers
  const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  };

  // 1. Health & System
  if (path === "/api/health") {
    return jsonResponse({ status: "ok", mode: "live_demo" });
  }

  if (path === "/api/system/status") {
    return jsonResponse({
      backend: "ONLINE (Cloud Standalone)",
      osm: "LOADED (Hubballi-Dharwad)",
      terrain: "AVAILABLE (ISRO CartoDEM V3)",
      weather: "LIVE (Open-Meteo)",
      flood_model: "READY",
      drainage: "PROTOTYPE"
    });
  }

  if (path === "/api/gis/status") {
    return jsonResponse({
      status: "ready",
      graph_available: true,
      nodes: 4520,
      edges: 11840,
      bounds: [15.32, 75.05, 15.48, 75.18]
    });
  }

  // 2. Weather
  if (path === "/api/weather") {
    return (async () => {
      const forecast = await fetchLiveOpenMeteo();
      return jsonResponse({
        temperature_c: forecast.current.temperature_c,
        precipitation_mm: forecast.current.precipitation_mm,
        humidity_pct: forecast.current.humidity_pct,
        wind_speed_kmh: forecast.current.wind_speed_kmh,
        weather_code: forecast.current.weather_code,
        source: forecast.source,
        timestamp: forecast.timestamp
      });
    })();
  }

  if (path === "/api/weather/forecast") {
    return (async () => {
      const forecast = await fetchLiveOpenMeteo();
      return jsonResponse(forecast);
    })();
  }

  // 3. Scenario Controller
  if (path === "/api/scenario/status") {
    return jsonResponse({
      active: scenarioActive,
      name: "Controlled Hubballi Flood Scenario",
      precipitation_mm: scenarioActive ? 65.0 : 0
    });
  }

  if (path === "/api/scenario/activate" && method === "POST") {
    scenarioActive = true;
    return jsonResponse({
      status: "success",
      active: true,
      message: "Controlled flood scenario activated."
    });
  }

  if (path === "/api/scenario/deactivate" && method === "POST") {
    scenarioActive = false;
    return jsonResponse({
      status: "success",
      active: false,
      message: "Scenario deactivated. Live weather restored."
    });
  }

  if (path === "/api/flood/simulate" && method === "POST") {
    return jsonResponse({
      status: "success",
      message: "Flood simulation completed successfully.",
      inundation_hotspots: 4,
      critical_roads_severed: 2
    });
  }

  // 4. National EOC Status
  if (path === "/api/national/eoc/status") {
    return jsonResponse({
      status: "success",
      imd: "ONLINE",
      satellite: "ONLINE",
      risk_engine: "ONLINE",
      alert_engine: "SIMULATED",
      incident_engine: "ONLINE"
    });
  }

  // 5. Incidents
  if (path === "/api/national/incidents") {
    if (method === "GET") {
      return jsonResponse({ status: "success", records: mockIncidents });
    }
  }

  if (path === "/api/national/incidents/recommend" && method === "POST") {
    return jsonResponse({
      status: "success",
      message: "Scanned risk engine. Identified 4 active flood hotspots.",
      incidents: mockIncidents
    });
  }

  // /api/national/incidents/:id/...
  const incDetailMatch = path.match(/^\/api\/national\/incidents\/([^/]+)$/);
  if (incDetailMatch && method === "GET") {
    const id = incDetailMatch[1];
    const found = mockIncidents.find(i => i.incident_id === id);
    if (!found) return jsonResponse({ detail: "Incident not found" }, 404);
    return jsonResponse({ status: "success", record: found });
  }

  const incPlanMatch = path.match(/^\/api\/national\/incidents\/([^/]+)\/response-plan$/);
  if (incPlanMatch) {
    const id = incPlanMatch[1];
    if (method === "GET" || method === "POST") {
      let plan = mockPlans[id];
      if (!plan) {
        plan = {
          plan_id: `PLAN-${id}`,
          incident_id: id,
          status: "RECOMMENDED",
          title: `Emergency Response Action Plan for ${id}`,
          actions: [
            {
              action_id: `ACT-${Date.now()}-1`,
              plan_id: `PLAN-${id}`,
              resource_id: "RES-001",
              resource_name: "Rescue Team Alpha (NDRF)",
              action_type: "DISPATCH",
              quantity: 1,
              status: "PENDING",
              assigned_to: "NDRF Unit",
              notes: "Deploy to affected corridor."
            }
          ]
        };
        mockPlans[id] = plan;
      }
      return jsonResponse({ status: "success", plan });
    }
  }

  // /api/national/response-plans/:id/approve
  const planApproveMatch = path.match(/^\/api\/national\/response-plans\/([^/]+)\/approve$/);
  if (planApproveMatch && method === "POST") {
    const pId = planApproveMatch[1];
    for (const k in mockPlans) {
      if (mockPlans[k].plan_id === pId) {
        mockPlans[k].status = "APPROVED";
      }
    }
    return jsonResponse({ status: "success", message: "Response plan approved successfully." });
  }

  // /api/national/response-actions/:id/dispatch
  const actionDispatchMatch = path.match(/^\/api\/national\/response-actions\/([^/]+)\/dispatch$/);
  if (actionDispatchMatch && method === "POST") {
    const aId = actionDispatchMatch[1];
    for (const k in mockPlans) {
      const act = mockPlans[k].actions?.find(a => a.action_id === aId);
      if (act) act.status = "DISPATCHED";
    }
    return jsonResponse({ status: "success", message: "Resource dispatched to scene." });
  }

  // /api/national/field-units/:id/status
  const fuStatusMatch = path.match(/^\/api\/national\/field-units\/([^/]+)\/status$/);
  if (fuStatusMatch && method === "POST") {
    const uId = fuStatusMatch[1];
    const unit = mockFieldUnits.find(u => u.unit_id === uId);
    if (unit) {
      try {
        const body = typeof init.body === 'string' ? JSON.parse(init.body) : {};
        if (body.status) unit.status = body.status;
      } catch {}
    }
    return jsonResponse({ status: "success", unit });
  }

  // 6. Resources & Field Units
  if (path === "/api/national/resources") {
    return jsonResponse({ status: "success", records: mockResources });
  }

  if (path === "/api/national/field-units") {
    return jsonResponse({ status: "success", records: mockFieldUnits });
  }

  // 7. Alerts
  if (path === "/api/national/alerts") {
    return jsonResponse({ status: "success", records: mockAlerts });
  }

  if (path === "/api/national/alerts/preview") {
    return jsonResponse({
      status: "success",
      preview_text: "URGENT FLASH FLOOD ADVISORY: Hubballi-Dharwad Municipal Corporation warns of heavy inundation. Please follow recommended safe routes.",
      estimated_recipients: 3500
    });
  }

  if (path === "/api/national/alerts/send" && method === "POST") {
    return jsonResponse({
      status: "success",
      alert_id: `ALT-${Date.now().toString().slice(-4)}`,
      recipients: 3500,
      delivery_status: "BROADCAST_QUEUED"
    });
  }

  // 8. Satellite Layers
  if (path === "/api/national/satellite/layers") {
    return jsonResponse({
      status: "success",
      records: [
        {
          id: "viirs-reflectance",
          name: "NASA VIIRS Corrected Reflectance True Color",
          layer: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
          type: "WMS",
          format: "image/jpeg",
          attribution: "NASA GIBS / EOSDIS",
          active: true
        },
        {
          id: "modis-flood",
          name: "MODIS NRT Global Flood Product",
          layer: "MODIS_Terra_SurfaceReflectance_Bands721",
          type: "WMS",
          format: "image/jpeg",
          attribution: "NASA GIBS",
          active: false
        }
      ]
    });
  }

  // 9. Risk & National
  if (path === "/api/national/risk" || path === "/api/national/risk/forecast") {
    return jsonResponse({
      status: "success",
      regions: [
        {
          state: "Karnataka",
          district: "Dharwad",
          city: "Hubballi",
          latitude: 15.3647,
          longitude: 75.1240,
          risk: { level: "CRITICAL", score: 88 },
          hazard_type: "Road Waterlogging",
          title: "Gokul Road Corridor Risk"
        },
        {
          state: "Karnataka",
          district: "Dharwad",
          city: "Dharwad",
          latitude: 15.4589,
          longitude: 75.0078,
          risk: { level: "HIGH", score: 78 },
          hazard_type: "Drainage Overflow",
          title: "Dharwad Central Risk"
        },
        {
          state: "Maharashtra",
          district: "Kolhapur",
          city: "Kolhapur",
          latitude: 16.7050,
          longitude: 74.2433,
          risk: { level: "MODERATE", score: 55 },
          hazard_type: "River Discharge",
          title: "Panchganga Basin Risk"
        },
        {
          state: "Kerala",
          district: "Wayanad",
          city: "Kalpetta",
          latitude: 11.6050,
          longitude: 76.0828,
          risk: { level: "HIGH", score: 72 },
          hazard_type: "Slope Runoff",
          title: "Western Ghats Flash Runoff"
        }
      ]
    });
  }

  // 10. Citizen Safety
  if (path === "/api/national/citizen-alerts") {
    return jsonResponse({ status: "success", records: mockAlerts });
  }

  if (path === "/api/national/preparedness") {
    return jsonResponse({
      guidelines: [
        "Avoid wading or driving through moving water; 15cm of water can stall vehicles.",
        "Store clean drinking water and non-perishable food supplies for 48 hours.",
        "Keep mobile phones and emergency power banks fully charged.",
        "Move valuable household electronics and documents to higher levels.",
        "Call municipal EOC Helpline: 1077 / Hubballi EOC: 0836-2213888."
      ]
    });
  }

  if (path === "/api/national/citizens") {
    return jsonResponse({
      records: [
        { citizen_id: "CIT-001", name: "Citizen User", phone: "+91 98765 43210", location: "Gokul Road" }
      ]
    });
  }

  if (path === "/api/national/citizen-observations" && method === "POST") {
    return jsonResponse({ status: "success", observation_id: `OBS-${Date.now()}` });
  }

  // 11. Route Monitoring Engine
  if (path === "/api/route-monitor/register" && method === "POST") {
    activeMonitoredRoute = {
      route_id: `RMON-${Date.now().toString().slice(-4)}`,
      origin: { lat: 15.4589, lng: 75.0078 },
      destination: { lat: 15.3647, lng: 75.1240 },
      hazard_score: 32,
      status: "MONITORING"
    };
    return jsonResponse(activeMonitoredRoute);
  }

  const rmonCheckMatch = path.match(/^\/api\/route-monitor\/([^/]+)\/check$/);
  if (rmonCheckMatch && method === "POST") {
    return jsonResponse({
      status: "SAFE",
      hazard_score: 28,
      message: "Continuous sensor monitoring: Route corridor remains navigable."
    });
  }

  const rmonInvalMatch = path.match(/^\/api\/route-monitor\/([^/]+)\/invalidate$/);
  if (rmonInvalMatch && method === "POST") {
    return jsonResponse({
      status: "OBSTRUCTED",
      hazard_score: 94,
      message: "Severe flood obstruction detected on Gokul Road corridor. Route invalidated."
    });
  }

  const rmonRecMatch = path.match(/^\/api\/route-monitor\/([^/]+)\/replacement\/recommend$/);
  if (rmonRecMatch && method === "POST") {
    return jsonResponse({
      status: "success",
      replacement_available: true,
      replacement_route: {
        route_id: `REPL-${Date.now().toString().slice(-4)}`,
        distance_m: 4350,
        estimated_time_s: 490,
        hazard_score: 16,
        source: "Safe Detour Engine (Via PB Bypass)",
        route: {
          type: "LineString",
          coordinates: [
            [75.1240, 15.3647],
            [75.1215, 15.3680],
            [75.1180, 15.3720],
            [75.1200, 15.3750]
          ]
        }
      }
    });
  }

  const rmonApproveMatch = path.match(/^\/api\/route-monitor\/([^/]+)\/replacement\/approve$/);
  if (rmonApproveMatch && method === "POST") {
    return jsonResponse({
      status: "success",
      message: "Safe replacement detour approved and dispatched to field units."
    });
  }

  // 12. Routing Engine
  if (path === "/api/route" || path === "/api/route/flood-safe") {
    const originLat = parseFloat(params.get("origin_lat") || "15.3647");
    const originLon = parseFloat(params.get("origin_lon") || "75.1240");
    const destLat = parseFloat(params.get("destination_lat") || "15.3700");
    const destLon = parseFloat(params.get("destination_lon") || "75.1200");

    const coordinates = generateRouteLine(
      { lat: originLat, lng: originLon },
      { lat: destLat, lng: destLon }
    );

    const distanceMeters = Math.round(
      Math.hypot(destLat - originLat, destLon - originLon) * 111000
    );
    const timeSeconds = Math.round((distanceMeters / 1000 / 35) * 3600); // 35 km/h avg

    return jsonResponse({
      status: "success",
      source: path.includes("flood-safe") ? "Terrain & Drainage Flood-Safe Router" : "Fastest Road Router",
      distance_m: distanceMeters || 3200,
      estimated_time_s: timeSeconds || 360,
      hazard_score: path.includes("flood-safe") ? 18 : 64,
      route: {
        type: "LineString",
        coordinates
      },
      recommended_route: {
        distance_m: distanceMeters || 3200,
        estimated_time_s: timeSeconds || 360,
        hazard_score: path.includes("flood-safe") ? 18 : 64
      }
    });
  }

  // Default fallback for any unhandled /api call
  return jsonResponse({ status: "success", message: "Endpoint handled by ResilienceRoute Mock Engine" });
}

export function setupApiInterceptor() {
  if (typeof window === "undefined" || window.__rr_interceptor_installed) return;
  window.__rr_interceptor_installed = true;

  const originalFetch = window.fetch.bind(window);
  window.__originalFetch = originalFetch;

  window.fetch = async function (resource, init = {}) {
    const url = typeof resource === "string" ? resource : resource?.url || "";

    // Determine if this is an API call intended for the backend
    const isApiCall =
      url.startsWith("http://127.0.0.1:8000/api") ||
      url.startsWith("http://localhost:8000/api") ||
      url.startsWith("/api/");

    if (!isApiCall) {
      return originalFetch(resource, init);
    }

    // If on HTTPS (e.g. GitHub Pages https://akaraj187.github.io/...),
    // browser will block http://127.0.0.1 with mixed content error.
    // In that case, directly route to the standalone mock engine unless a custom HTTPS API URL is provided.
    const isHttps = window.location.protocol === "https:";
    const hasCustomBackend = Boolean(window.__RR_CUSTOM_API_URL__ || import.meta.env.VITE_API_URL);

    if (isHttps && !hasCustomBackend) {
      const responsePromise = handleMockRequest(url, init);
      return responsePromise instanceof Promise ? await responsePromise : responsePromise;
    }

    // In dev / localhost or with custom backend, try real backend first
    try {
      let targetUrl = url;
      if (hasCustomBackend) {
        const customBase = (window.__RR_CUSTOM_API_URL__ || import.meta.env.VITE_API_URL).replace(/\/$/, "");
        targetUrl = url.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, customBase);
      }

      const res = await originalFetch(targetUrl, init);
      if (res.ok) {
        return res;
      }
      // If server returned 404/500, fallback to mock if appropriate
      if (res.status >= 500 || res.status === 404) {
        console.warn(`[ResilienceRoute] Remote API returned status ${res.status}. Falling back to client mock engine.`);
        const responsePromise = handleMockRequest(url, init);
        return responsePromise instanceof Promise ? await responsePromise : responsePromise;
      }
      return res;
    } catch (err) {
      console.warn("[ResilienceRoute] Network request failed or blocked, serving from Standalone Engine:", err.message);
      const responsePromise = handleMockRequest(url, init);
      return responsePromise instanceof Promise ? await responsePromise : responsePromise;
    }
  };

  console.log("🌊 ResilienceRoute Standalone Engine & Mock Interceptor active");
}
