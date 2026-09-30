import uuid

class ReeferTelemetry:
    def __init__(self, fuel_level_liters, internal_temp_c, target_temp_c):
        """
        Initializes live IoT cold-chain telemetry readings.
        
        :param fuel_level_liters: Amount of diesel remaining in the secondary auxiliary chiller tank.
        :param internal_temp_c: Live temperature inside the refrigerated container.
        :param target_temp_c: Required temperature for the cargo (e.g., -18C for frozen goods).
        """
        self.fuel_level_liters = fuel_level_liters
        self.internal_temp_c = internal_temp_c
        self.target_temp_c = target_temp_c

class LogisticsContext:
    def __init__(self, ambient_weather_c, transit_time_minutes, gate_wait_minutes, safety_buffer_minutes=30):
        """
        Initializes the dynamic logistics routing and weather context.
        
        :param ambient_weather_c: Real-time outside weather temperature.
        :param transit_time_minutes: Remaining driving time to the destination.
        :param gate_wait_minutes: Real-time dock gate waiting queues pulled from the yard engine.
        :param safety_buffer_minutes: Mandatory safety cushion required for unloading operations.
        """
        self.ambient_weather_c = ambient_weather_c
        self.transit_time_minutes = transit_time_minutes
        self.gate_wait_minutes = gate_wait_minutes
        self.safety_buffer_minutes = safety_buffer_minutes

def evaluate_cold_chain_health(telemetry, context):
    """
    Evaluates IoT cold-chain fuel and temperature telemetry to prevent catastrophic cargo spoilage.
    Calculates the dynamic diesel burn rate based on external heat loads, projecting remaining 
    run-time against total transit and yard delay time.
    If auxiliary fuel falls below the safety buffer, triggers control tower alerts and 
    issues priority dock gate bypass tokens.
    
    :param telemetry: ReeferTelemetry instance.
    :param context: LogisticsContext instance.
    :return: dict containing fuel health status, thermal risk logs, and bypass tokens.
    """
    # Base diesel burn rate for the secondary chiller compressor (e.g., 0.05 liters/minute -> ~3 liters/hr)
    base_burn_rate_lpm = 0.05
    
    # Calculate thermal load modifier
    # If it is scorching hot outside (e.g., 45C) and the target is frozen (-20C), the delta is massive.
    # The compressor must run constantly at a 100% duty cycle, drastically inflating fuel consumption.
    temp_delta = max(0, context.ambient_weather_c - telemetry.target_temp_c)
    
    # Scale the burn rate multiplier based on the extreme temperature differential
    thermal_load_modifier = 1.0 + (temp_delta * 0.02)
    dynamic_burn_rate_lpm = base_burn_rate_lpm * thermal_load_modifier
    
    # Calculate projected remaining runtime based on dynamic burn rate
    projected_runtime_minutes = telemetry.fuel_level_liters / dynamic_burn_rate_lpm
    
    # Calculate the total absolute required time (driving + waiting + mandatory safety unloading buffer)
    required_time_minutes = context.transit_time_minutes + context.gate_wait_minutes + context.safety_buffer_minutes
    
    # Check for live temperature compliance
    temp_deviation = telemetry.internal_temp_c - telemetry.target_temp_c
    is_temp_critical = temp_deviation > 2.0
    
    # Determine the absolute spoilage risk
    is_fuel_critical = projected_runtime_minutes < required_time_minutes
    spoilage_risk = is_fuel_critical or is_temp_critical
    
    response = {
        'projected_runtime_minutes': round(projected_runtime_minutes, 1),
        'required_time_minutes': required_time_minutes,
        'dynamic_burn_rate_lpm': round(dynamic_burn_rate_lpm, 3),
        'critical_spoilage_risk': spoilage_risk,
        'priority_dock_bypass_token': None,
        'thermal_risk_log': []
    }
    
    if is_fuel_critical:
        response['thermal_risk_log'].append(f"CRITICAL: Insufficient chiller fuel! Projected runtime {round(projected_runtime_minutes)}m vs required {required_time_minutes}m.")
    
    if is_temp_critical:
        response['thermal_risk_log'].append(f"CRITICAL: Internal temperature breached target by {round(temp_deviation, 1)}C.")
        
    if spoilage_risk:
        # Issue a cryptographic emergency token to completely bypass standard yard management delays
        # This allows the truck to skip the line and dock immediately to prevent goods spoilage.
        response['priority_dock_bypass_token'] = f"EMERGENCY-BYPASS-{uuid.uuid4().hex[:6].upper()}"
        
    return response
