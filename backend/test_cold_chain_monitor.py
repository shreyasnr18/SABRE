import unittest
from cold_chain_monitor import ReeferTelemetry, LogisticsContext, evaluate_cold_chain_health

class TestColdChainMonitor(unittest.TestCase):
    
    def test_safe_transit(self):
        # 50 liters of secondary fuel, perfect temperature holding, nominal wait times
        telemetry = ReeferTelemetry(fuel_level_liters=50.0, internal_temp_c=-18.0, target_temp_c=-18.0)
        context = LogisticsContext(ambient_weather_c=20.0, transit_time_minutes=120, gate_wait_minutes=30, safety_buffer_minutes=30)
        
        result = evaluate_cold_chain_health(telemetry, context)
        
        # Required time = 180 mins. Projected runtime is massive (~568 mins). Engine runs flawlessly.
        self.assertFalse(result['critical_spoilage_risk'])
        self.assertIsNone(result['priority_dock_bypass_token'])
        self.assertEqual(len(result['thermal_risk_log']), 0)
        
    def test_fuel_starvation_in_extreme_heat(self):
        # Low auxiliary fuel (10L), extreme heat outside (45C), hauling highly sensitive frozen goods (-20C)
        telemetry = ReeferTelemetry(fuel_level_liters=10.0, internal_temp_c=-20.0, target_temp_c=-20.0)
        
        # Heavy traffic + massive 60-minute gate wait creates a 180-minute total required window
        context = LogisticsContext(ambient_weather_c=45.0, transit_time_minutes=90, gate_wait_minutes=60, safety_buffer_minutes=30)
        
        result = evaluate_cold_chain_health(telemetry, context)
        
        # Delta = 65C! Dynamic burn rate inflates drastically due to 100% duty cycle.
        # Projected runtime plummets to ~87 mins, which is far below the required 180 mins. Starvation imminent!
        self.assertTrue(result['critical_spoilage_risk'])
        self.assertIsNotNone(result['priority_dock_bypass_token'])
        self.assertIn("EMERGENCY-BYPASS", result['priority_dock_bypass_token'])
        self.assertTrue(any("Insufficient chiller fuel" in log for log in result['thermal_risk_log']))

    def test_temperature_breach_mechanical_failure(self):
        # Massive fuel reserves, but the actual internal temperature has spiked (indicating mechanical compressor failure)
        telemetry = ReeferTelemetry(fuel_level_liters=100.0, internal_temp_c=-10.0, target_temp_c=-18.0)
        context = LogisticsContext(ambient_weather_c=25.0, transit_time_minutes=60, gate_wait_minutes=30)
        
        result = evaluate_cold_chain_health(telemetry, context)
        
        # Temp deviation is 8 degrees (breaching the strict 2.0C pharmaceutical/dairy limit)
        self.assertTrue(result['critical_spoilage_risk'])
        self.assertIsNotNone(result['priority_dock_bypass_token'])
        self.assertTrue(any("temperature breached" in log for log in result['thermal_risk_log']))

if __name__ == '__main__':
    unittest.main()
