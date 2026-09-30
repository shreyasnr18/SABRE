import asyncio
import math
import random
import database
from sabre_orchestrator import SabreOrchestrator

def interpolate(p1, p2, fraction):
    return [p1[0] + (p2[0] - p1[0]) * fraction, p1[1] + (p2[1] - p1[1]) * fraction]

def get_distance(p1, p2):
    return math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)

def get_segments(route):
    segments = []
    total_dist = 0
    if len(route) < 2: return segments, total_dist
    topo_profiles = ['FLAT_HIGHWAY', 'GHAT_INCLINE', 'DEEP_DECLINE', 'ROUGH_TERRAIN']
    for i in range(len(route)-1):
        d = get_distance(route[i], route[i+1])
        # Randomly assign a topographic profile to the segment to simulate edge physics
        topo = random.choice(topo_profiles) if d > 0.01 else 'FLAT_HIGHWAY'
        segments.append((route[i], route[i+1], d, topo))
        total_dist += d
    return segments, total_dist

class FleetManager:
    def __init__(self):
        self.orchestrator = SabreOrchestrator()
        self.is_playing = False
        self.speed_multiplier = 1.0
        self.recent_event = False
        self.swarm_active = False
        self.tick_counter = 0
        
        db_trucks = database.get_erp_fleet()
        self.trucks = []
        for t in db_trucks:
            self.trucks.append({
                "id": t["truck_id"],
                "label": t["classification"],
                "cargo": t["cargo_compatibility"],
                "length": 15.0,
                "progress": -1.0,
                "speed": 60,
                "eta": 20,
                "fuel": 100,
                "temp": 20.0,
                "reg": "MH-12-XX-0000",
                "type": t["classification"],
                "country": "IND",
                "age": "New",
                "serial": t["truck_id"],
                "state": "active",
                "route": [],
                "segments": [],
                "total_dist": 0,
                "start_time": None,
                "ai_logs": [],
                "ota_profile": "STANDARD"
            })

        self.active_sos = None

        self.truck_allocations = {}
        for t in self.trucks:
            order = {
                "scenario_preset": t["label"],
                "vehicle_id": t["id"],
                "height_meters": 3.0,
                "departure_hour": 12.0
            }
            res = self.orchestrator.run_pipeline(order)
            self.truck_allocations[t["id"]] = res

    def dispatch_custom_route(self, route_coords, truck_id=None):
        # find an idle truck
        for t in self.trucks:
            if truck_id and t["id"] != truck_id:
                continue
            if t["progress"] < 0 or t["progress"] >= 1.0:
                t["route"] = route_coords
                t["segments"], t["total_dist"] = get_segments(route_coords)
                t["progress"] = 0.0
                t["fuel"] = 100
                t["state"] = "active"
                import datetime
                t["start_time"] = datetime.datetime.now()
                self.is_playing = True
                return True
        return False

    def reset(self):
        self.is_playing = False
        for t in self.trucks:
            t["progress"] = -1.0
            t["route"] = []
            t["segments"] = []
            t["total_dist"] = 0
            t["start_time"] = None
            t["state"] = "active"
            t["platoon_id"] = None
            t["ai_logs"] = []
            t["ota_profile"] = "STANDARD"

    def engage_swarm(self):
        self.swarm_active = True
        active_trucks = [t for t in self.trucks if 0 <= t["progress"] < 1.0 and t.get("state") != "halted"]
        if len(active_trucks) >= 2:
            lead_truck = active_trucks[0]
            for i, t in enumerate(active_trucks):
                t["platoon_id"] = "SWARM-ALPHA"
                t["swarm_index"] = i
                if i > 0:
                    t["route"] = lead_truck["route"]
                    t["segments"] = lead_truck["segments"]
                    t["total_dist"] = lead_truck["total_dist"]
        return True

    def halt_truck(self, truck_id):
        for t in self.trucks:
            if t["id"] == truck_id:
                t["state"] = "halted"
                return True
        return False

    def resume_truck(self, truck_id):
        for t in self.trucks:
            if t["id"] == truck_id:
                t["state"] = "active"
                return True
        return False

    def apply_ota_flash(self, truck_id, profile):
        for t in self.trucks:
            if t["id"] == truck_id:
                t["ota_profile"] = profile
                t["ai_logs"].insert(0, f"[OTA] Flashed {profile} Engine Mapping.")
                return True
        return False

    def trigger_sos(self, truck_id, location):
        self.active_sos = {"truck_id": truck_id, "location": location, "timestamp": "NOW"}
        for t in self.trucks:
            if t["id"] == truck_id:
                t["state"] = "halted" # Auto halt on SOS
        return True

    def ingest_telemetry(self, truck_id, lat, lon, speed, heading):
        """Live override of truck's telemetry from mobile companion."""
        for t in self.trucks:
            if t["id"] == truck_id:
                t["live_lat"] = lat
                t["live_lon"] = lon
                t["live_speed"] = speed
                t["live_heading"] = heading
                t["is_live_tracking"] = True
                t["state"] = "active"
                self.is_playing = True
                return True
        return False

    def get_truck_diagnostics(self, truck_id):
        return {
            "engine_load": round(random.uniform(45, 85), 1),
            "tire_pressure_psi": [round(random.uniform(105, 115), 1) for _ in range(6)],
            "oil_life_percent": round(random.uniform(60, 95), 1),
            "cargo_humidity_percent": round(random.uniform(30, 50), 1),
            "battery_voltage": round(random.uniform(23.5, 24.5), 1)
        }
            
    def reroute_vehicle_in_transit(self, event_type, target_location):
        self.recent_event = True
        for t in self.trucks:
            if t["progress"] >= 1.0 or t["progress"] < 0:
                continue # Skip trucks that haven't started or already finished
                
            prog = t["progress"]
            current_dist = prog * t["total_dist"]
            accum = 0
            if len(t["route"]) == 0: continue
            current_pos = t["route"][0]
            
            for p1, p2, d, topo in t["segments"]:
                if accum + d >= current_dist:
                    fraction = (current_dist - accum) / d if d > 0 else 0
                    current_pos = interpolate(p1, p2, fraction)
                    break
                accum += d
                
            # Create a dynamic bypass coordinate
            if event_type == "MONSOON_FLOOD_SURGE":
                detour = [current_pos[0] + 0.015, current_pos[1] - 0.025]
            elif event_type == "EMERGENCY_CURFEW_CLOSURE":
                detour = [current_pos[0] - 0.02, current_pos[1] + 0.02]
            else:
                detour = [current_pos[0] + 0.02, current_pos[1] + 0.015]
                
            new_route = [current_pos, detour, t["route"][-1]]
            t["route"] = new_route
            t["segments"], t["total_dist"] = get_segments(new_route)
            t["progress"] = 0.0
            t["ai_logs"].insert(0, f"[RE-ROUTE] Physics recalculated for {event_type} bypass.")
            
    def tick(self):
        snapshots = []
        for t in self.trucks:
            # Idle truck check
            if t["progress"] < 0 or len(t["route"]) == 0:
                continue

            if self.swarm_active and t.get("platoon_id") == "SWARM-ALPHA":
                if t.get("swarm_index", 0) > 0:
                    lead_truck = next((trk for trk in self.trucks if trk.get("platoon_id") == "SWARM-ALPHA" and trk.get("swarm_index") == 0), None)
                    if lead_truck:
                        t["progress"] = max(0, lead_truck["progress"] - (0.015 * t["swarm_index"]))
                        if self.is_playing and t.get("state") != "halted":
                            t["fuel"] = max(0, t["fuel"] - (0.05 * self.speed_multiplier * 0.82)) # Drafting 18% fuel savings
                            if t["cargo"] == "pharma": t["temp"] += 0.02 * self.speed_multiplier
                else:
                    if self.is_playing and t["progress"] < 1.0 and t.get("state") != "halted":
                        t["progress"] += 0.005 * self.speed_multiplier
                        if t["progress"] > 1.0: t["progress"] = 1.0
                        t["fuel"] = max(0, t["fuel"] - (0.05 * self.speed_multiplier))
                        if t["cargo"] == "pharma": t["temp"] += 0.02 * self.speed_multiplier
            else:
                if self.is_playing and t["progress"] < 1.0 and t.get("state") != "halted":
                    t["progress"] += 0.005 * self.speed_multiplier
                    if t["progress"] > 1.0: t["progress"] = 1.0
                    t["fuel"] = max(0, t["fuel"] - (0.05 * self.speed_multiplier))
                    if t["cargo"] == "pharma": t["temp"] += 0.02 * self.speed_multiplier
                
            prog = max(0, t["progress"])
            current_dist = prog * t["total_dist"]
            accum = 0
            current_pos = t["route"][0]
            heading = 0
            current_topo = 'FLAT_HIGHWAY'
            
            for p1, p2, d, topo in t["segments"]:
                if accum + d >= current_dist:
                    fraction = (current_dist - accum) / d if d > 0 else 0
                    current_pos = interpolate(p1, p2, fraction)
                    heading = math.degrees(math.atan2(p2[1]-p1[1], p2[0]-p1[0]))
                    current_topo = topo
                    break
                accum += d
                
            if prog >= 1.0:
                current_pos = t["route"][-1]
                if t.get("db_dispatch_id"):
                    try:
                        database.update_dispatch_status(t["db_dispatch_id"], "COMPLETED")
                        t["db_dispatch_id"] = None
                    except Exception as e:
                        print("Failed to update status:", e)

            if t.get("is_live_tracking"):
                current_pos = [t.get("live_lat", current_pos[0]), t.get("live_lon", current_pos[1])]
                target_speed = t.get("live_speed", target_speed) * 3.6 # Convert m/s to km/h if it comes from Geolocation API
                heading = t.get("live_heading", heading)
                
            lane_drift_warning = False
            curve_advisory = False
            bay_snap = False
            
            # Reset event triggers if route was changed, or keep them relative
            if 0.25 < prog < 0.35: lane_drift_warning = True
            if 0.55 < prog < 0.65: curve_advisory = True
            if prog > 0.95: bay_snap = True
            
            target_speed = t["speed"]
            engine_state = "CRUISING"
            
            # Apply OTA Profile Modifiers
            if t.get("ota_profile") == "GHAT_POWER_CLIMB":
                target_speed *= 0.85
            elif t.get("ota_profile") == "ECO_CITY_GLIDE":
                target_speed *= 1.15
            
            # Topography Edge Physics
            if current_topo == 'GHAT_INCLINE':
                target_speed *= 0.6
                engine_state = "HIGH_TORQUE (14L/hr)"
                if self.is_playing: t["fuel"] -= 0.02
            elif current_topo == 'DEEP_DECLINE':
                target_speed *= 1.2
                engine_state = "COASTING (0L/hr)"
                if self.is_playing: t["fuel"] += 0.01 # Regen
            elif current_topo == 'ROUGH_TERRAIN':
                target_speed *= 0.7
                engine_state = "TRACTION_CTRL"

            if t["progress"] < 0: target_speed = 0
            if curve_advisory: 
                target_speed = 35
                engine_state = "CORNERING_STABILITY"
            if bay_snap: target_speed = 10
            if prog >= 1.0 or not self.is_playing or t.get("state") == "halted": 
                target_speed = 0
                engine_state = "IDLE"
            
            import datetime
            now = datetime.datetime.now()
            
            # Simulated AI Vision Logs
            if self.is_playing and random.random() < 0.02:
                ai_events = [
                    "LiDAR detected stray cattle 150m ahead - Soft braking applied.",
                    "Predicting erratic two-wheeler cut-in - Shifting lane offset.",
                    f"Topography shift ({current_topo}) - Optimizing fuel injection map.",
                    "Monsoon pothole cluster detected - Adjusting active suspension."
                ]
                t["ai_logs"].insert(0, f"[{now.strftime('%H:%M:%S')}] {random.choice(ai_events)}")
            t["ai_logs"] = t["ai_logs"][:10] # Keep last 10 logs
            
            # Digital Twin Wear Simulation
            wear_multiplier = 1.0
            if current_topo == 'GHAT_INCLINE': wear_multiplier = 2.5
            if current_topo == 'ROUGH_TERRAIN': wear_multiplier = 3.0
            
            dt_suspension = round(random.uniform(0.1, 0.2) * wear_multiplier, 3)
            dt_brake = round(random.uniform(0.01, 0.05) * wear_multiplier, 3)

            alloc = self.truck_allocations[t["id"]]
            
            import datetime
            now = datetime.datetime.now()
            start_time = t.get("start_time", now)
            elapsed = (now - start_time).total_seconds() if t["start_time"] else 0
            total_est_seconds = elapsed / max(prog, 0.01) if prog > 0 else 3600
            
            # Convert decimal degrees distance to roughly KM for UI display (very rough approx for visuals)
            dist_km = t["total_dist"] * 111
            covered_km = current_dist * 111
            
            snapshots.append({
                "id": t["id"],
                "label": t["label"],
                "state": t.get("state", "active"),
                "platoon_id": t.get("platoon_id"),
                "lat": current_pos[0],
                "lon": current_pos[1],
                "speed_kmh": round(target_speed + random.uniform(-1.5, 1.5) if target_speed > 0 else 0, 1),
                "heading": round(heading, 2),
                "fuel_level": round(t["fuel"], 1),
                "cargo_temp": round(t["temp"], 1),
                "events": {
                    "lane_drift": lane_drift_warning,
                    "curve_advisory": curve_advisory,
                    "bay_snap": bay_snap
                },
                "progress": round(t["progress"], 3),
                "route": t["route"],
                "hud_alerts": alloc.get("hud_alerts", {}),
                "bay_status": alloc.get("live_bay_status", {}),
                "metadata": {
                    "reg": t["reg"],
                    "type": t["type"],
                    "country": t["country"],
                    "age": t["age"],
                    "serial": t["serial"],
                    "altitude": round(random.uniform(150, 450), 1),
                    "wind_speed": round(random.uniform(5, 25), 1),
                    "ambient_temp": 32 + round(random.uniform(-3, 3), 1)
                },
                "routing": {
                    "total_dist_km": round(dist_km, 1),
                    "covered_km": round(covered_km, 1),
                    "remaining_km": round(dist_km - covered_km, 1),
                    "elapsed_sec": int(elapsed),
                    "total_est_sec": int(total_est_seconds),
                    "scheduled_dep": start_time.strftime("%I:%M %p") if t["start_time"] else "12:00 PM",
                    "actual_dep": (start_time + datetime.timedelta(minutes=15)).strftime("%I:%M %p") if t["start_time"] else "12:15 PM",
                    "eta": (start_time + datetime.timedelta(seconds=total_est_seconds)).strftime("%I:%M %p") if t["start_time"] else "05:00 PM"
                },
                "edge_computing": {
                    "engine_state": engine_state,
                    "topography": current_topo,
                    "ota_profile": t.get("ota_profile", "STANDARD")
                },
                "digital_twin": {
                    "brake_pad_wear_mm": dt_brake,
                    "suspension_stress_mpa": dt_suspension,
                    "battery_health": round(100 - (dt_brake*2), 1),
                    "pred_failure_days": int(120 / max(wear_multiplier, 1))
                },
                "ai_vision": t["ai_logs"]
            })
            
        self.tick_counter += 1
        if self.tick_counter % 4 == 0 and self.is_playing and len(snapshots) > 0:
            database.log_telemetry_batch(snapshots)
            
        return {"fleet": snapshots, "active_sos": self.active_sos}
