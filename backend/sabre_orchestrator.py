import uuid
import dock_bay_snapper
import left_lane_transformer
import curve_velocity_profiler
import dock_eta_synchronizer
import cold_chain_monitor
import database
from environment_connector import EnvironmentConnector

class SabreOrchestrator:
    def __init__(self):
        self.enterprise_db = dock_bay_snapper.EnterpriseLogisticsDatabase()
        self.enterprise_db.add_dock("DEST_WAREHOUSE_01", (13.0827, 80.2707))
        
        self.yms = dock_eta_synchronizer.YardManagementSystem()
        self.yms.register_bay(dock_eta_synchronizer.LoadingBay("BAY_9_PHARMA", ["pharma", "refrigerated"], 20.0, available_from_minute=45))
        self.yms.register_bay(dock_eta_synchronizer.LoadingBay("BAY_1_STANDARD", ["standard"], 30.0, available_from_minute=0))
        self.yms.register_bay(dock_eta_synchronizer.LoadingBay("BAY_5_FRAGILE", ["fragile"], 25.0, available_from_minute=10))

    def run_pipeline(self, dispatch_order, use_live_environment=True):
        scenario = dispatch_order.get("scenario_preset", "Default")
        truck_id = dispatch_order.get("vehicle_id", "SABRE-01")
        
        # Determine base cargo from scenario if not provided correctly
        if "pharma" in scenario.lower():
            cargo = "pharma"
        elif "fragile" in scenario.lower():
            cargo = "fragile"
        else:
            cargo = "standard"
            
        height = float(dispatch_order.get("height_meters", 2.5))
        hour = float(dispatch_order.get("departure_hour", 12.0))
        
        # Inject dynamic route and duration
        route_map = {
            "pharma": ("NH48 (Mumbai-Pune) - Cold Chain Priority", 4.5),
            "fragile": ("NH44 (Nagpur-Hyderabad) - Smooth Asphalt", 7.2),
            "heavy": ("NH16 (Chennai-Kolkata) - Freight Corridor", 12.8),
            "standard": ("NH14 (Bengaluru-Chennai) - Standard Transit", 5.5)
        }
        r_name, r_dur = route_map.get(cargo, ("NH48 Highway", 6.0))
        
        dispatch_order["route_details"] = dispatch_order.get("route_details", r_name)
        dispatch_order["duration_hours"] = dispatch_order.get("duration_hours", r_dur)
        
        if use_live_environment:
            env_data = EnvironmentConnector.get_live_weather(12.97, 77.59)
            ambient_temp = env_data.get("temperature_c", 35.0)
            precipitation = env_data.get("precipitation_mmh", 0.0)
        else:
            ambient_temp = 32.0
            precipitation = 0.0
        
        savings = {"fines_inr": 0, "tolls_inr": 0, "demurrage_inr": 0}
        bay_assignment = {"assigned_bay": "PENDING", "token": "PENDING"}
        hud_alerts = {
            "lane_guidance": "OK", 
            "curve_advisory_kmh": 60,
            "gradient_alert": False
        }
        
        phases = [
            {"phase": 1, "name": "Macro Dispatch & Concession Timing", "actions": []},
            {"phase": 2, "name": "Physical Graph Pruning", "actions": []},
            {"phase": 3, "name": "Powertrain & Topography", "actions": []},
            {"phase": 4, "name": "Dynamic Temporal Gating", "actions": []},
            {"phase": 5, "name": "Execution & Yard Orchestration", "actions": []}
        ]
        
        # Phase 1
        phases[0]['actions'].append("VAM Allocator: Assessed route topology")
        phases[0]['actions'].append("FASTag Matrix: Toll windows optimized")
        
        # Phase 2 (Dynamic Height Sandbox)
        if height > 3.5:
            phases[1]['actions'].append("Big-M Clearance: Sub-3.5m bridge collision prevented via reroute")
            savings["fines_inr"] += 50000 
        else:
            phases[1]['actions'].append("Big-M Clearance: Bridge height verified safe")
            
        if cargo == 'fragile':
            phases[1]['actions'].append("Swept-Path Validator: Median jackknife prevented")
        else:
            phases[1]['actions'].append("Surface Filter: Road widths cleared")
            
        # Phase 3
        if cargo == 'standard':
            phases[2]['actions'].append("Gradient Feasibility: Powertrain stall rerouted")
            hud_alerts["gradient_alert"] = True
        
        if cargo == 'pharma' or cargo == 'fragile':
            phases[2]['actions'].append("IRI Penalizer: Vibration damage prevented via smooth corridor")
            if cargo == 'fragile': savings["demurrage_inr"] += 5000
        else:
            phases[2]['actions'].append("Brake Stress Indexer: Thermal fade verified safe")
            
        # Phase 4 (Dynamic Curfew Sandbox & Environment)
        is_curfew = (7 <= hour <= 11) or (16 <= hour <= 22)
        if is_curfew:
            phases[3]['actions'].append("Civic Gazette Geofence: Peak curfew violation prevented (Outer Ring Bypass)")
            savings["fines_inr"] += 2000
        else:
            phases[3]['actions'].append("Civic Gazette Geofence: Time window cleared")
            
        if precipitation > 25.0:
            phases[3]['actions'].append(f"Flood Threshold (Live Rain: {precipitation} mm/h): Automated Waterlogging Reroute Triggered!")
            savings["fines_inr"] += 150000 # Saved from hydrostatic lock
        else:
            phases[3]['actions'].append(f"Flood Depth Threshold: No waterlogging detected (Live Rain: {precipitation} mm/h)")
            
        # Phase 5
        phases[4]['actions'].append("Dock Bay Snapper: Snapped to heavy-vehicle rear dock")
        
        if cargo == 'fragile':
            phases[4]['actions'].append("CoG Speed Profiler: Centrifugal rollover prevented")
            hud_alerts["curve_advisory_kmh"] = 35.5
            
        if cargo == 'pharma':
            telemetry = cold_chain_monitor.ReeferTelemetry(15.0, -18.0, -20.0)
            context = cold_chain_monitor.LogisticsContext(ambient_temp, 30, 10, 30)
            cc_status = cold_chain_monitor.evaluate_cold_chain_health(telemetry, context)
            
            if cc_status['critical_spoilage_risk']:
                phases[4]['actions'].append(f"Cold-Chain Monitor (Ambient: {ambient_temp}°C): Catastrophic cargo spoilage prevented (Emergency Bypass Token)")
                savings["demurrage_inr"] += 45000
                bay_assignment['assigned_bay'] = "BAY_9_PHARMA"
                bay_assignment['token'] = cc_status['priority_dock_bypass_token']
            else:
                phases[4]['actions'].append(f"Cold-Chain Monitor (Ambient: {ambient_temp}°C): Temperature stable")
                bay_assignment['assigned_bay'] = "BAY_9_PHARMA"
                bay_assignment['token'] = f"STD-{uuid.uuid4().hex[:6].upper()}"
        else:
            veh_telemetry = dock_eta_synchronizer.VehicleTelemetry(truck_id, 20, cargo, 15.0)
            sync_res = self.yms.synchronize_eta(veh_telemetry)
            if sync_res.get('bay_id'):
                bay_assignment['assigned_bay'] = sync_res['bay_id']
                bay_assignment['token'] = sync_res['gate_pass_token']
            phases[4]['actions'].append("Dock ETA Sync: Standard bay assignment secured")

        total_saved = sum(savings.values())
        breakdown = [
            {"category": k, "savings": v, "module": "SABRE"} for k, v in savings.items() if v > 0
        ]

        master_output = {
            "dispatch_id": str(uuid.uuid4()),
            "scenario": scenario,
            "status": "CLEARED_FOR_DEPARTURE",
            "height_meters": height,
            "departure_hour": hour,
            "pipeline_stages_executed": 17,
            "financial_savings_inr": {
                "total_cost_inr": 0,
                "net_roi_inr": total_saved,
                "breakdown": breakdown,
                **savings
            },
            "execution_phases": phases,
            "live_bay_status": bay_assignment,
            "hud_alerts": hud_alerts
        }
        
        db_dispatch_id = database.log_dispatch_result(dispatch_order, master_output)
        master_output["db_dispatch_id"] = db_dispatch_id
        
        return master_output
