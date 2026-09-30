import uuid

class VehicleTelemetry:
    def __init__(self, truck_id, eta_minutes, cargo_type, length_meters):
        """
        Initializes live vehicle route progression telemetry.
        
        :param truck_id: Unique identifier for the vehicle.
        :param eta_minutes: Predicted Arrival Time (minutes from now).
        :param cargo_type: Type of cargo being hauled (e.g., 'pallet', 'refrigerated', 'machinery').
        :param length_meters: Total length of the vehicle.
        """
        self.truck_id = truck_id
        self.eta_minutes = eta_minutes
        self.cargo_type = cargo_type
        self.length_meters = length_meters

class LoadingBay:
    def __init__(self, bay_id, supported_cargo_types, max_length_meters, available_from_minute):
        """
        Initializes real-time warehouse bay status.
        
        :param bay_id: Unique identifier for the loading dock.
        :param supported_cargo_types: List of cargo categories this bay can unload.
        :param max_length_meters: Maximum physical vehicle length supported by this dock.
        :param available_from_minute: Minute marker when this bay becomes empty and available.
        """
        self.bay_id = bay_id
        self.supported_cargo_types = supported_cargo_types
        self.max_length_meters = max_length_meters
        self.available_from_minute = available_from_minute

class YardManagementSystem:
    def __init__(self):
        self.bays = []
        self.active_appointments = {} 

    def register_bay(self, bay):
        self.bays.append(bay)
        
    def synchronize_eta(self, telemetry):
        """
        Calculates dynamic arrival windows and automatically matches arriving trucks to bays.
        Pre-allocates tokens and dynamically swaps queues if en-route traffic delays occur.
        
        :param telemetry: VehicleTelemetry instance representing live HUD updates.
        :return: dict containing the scheduled bay number and gate pass token.
        """
        # If the truck was previously delayed and is sending a new ETA update,
        # rollback its previous appointment to free up that specific bay slot for others.
        if telemetry.truck_id in self.active_appointments:
            old_appt = self.active_appointments[telemetry.truck_id]
            for b in self.bays:
                if b.bay_id == old_appt['bay_id']:
                    b.available_from_minute = old_appt['previous_bay_state']
                    
        best_bay = None
        min_wait_time = float('inf')
        
        # Scan all available bays to find the optimal zero-wait match
        for bay in self.bays:
            if telemetry.cargo_type in bay.supported_cargo_types and telemetry.length_meters <= bay.max_length_meters:
                # Calculate required gate waiting time based on ETA vs Bay Availability
                wait_time = max(0, bay.available_from_minute - telemetry.eta_minutes)
                
                # We actively prioritize the bay that forces the absolute minimum wait time
                if wait_time < min_wait_time:
                    min_wait_time = wait_time
                    best_bay = bay
                    
        if not best_bay:
            return {"status": "ERROR", "message": "No compatible bays available for this truck configuration."}
            
        # Pre-allocate cryptographic gate pass token
        token = f"GATE-PASS-{uuid.uuid4().hex[:6].upper()}"
        scheduled_minute = max(best_bay.available_from_minute, telemetry.eta_minutes)
        
        # Record the dynamic appointment
        self.active_appointments[telemetry.truck_id] = {
            'bay_id': best_bay.bay_id,
            'token': token,
            'scheduled_minute': scheduled_minute,
            'previous_bay_state': best_bay.available_from_minute
        }
        
        # Lock the bay out for a standard 60-minute unloading window
        best_bay.available_from_minute = scheduled_minute + 60
        
        return {
            "status": "SUCCESS",
            "bay_id": best_bay.bay_id,
            "gate_pass_token": token,
            "scheduled_unloading_time": scheduled_minute,
            "estimated_wait_time_minutes": min_wait_time
        }
