import unittest
from dock_eta_synchronizer import VehicleTelemetry, LoadingBay, YardManagementSystem

class TestDockEtaSynchronizer(unittest.TestCase):
    def setUp(self):
        self.yms = YardManagementSystem()
        
        # Standard Pallet Bay: Currently occupied, frees up at t=10
        self.yms.register_bay(LoadingBay(bay_id="BAY_1_STANDARD", supported_cargo_types=["pallet", "boxes"], max_length_meters=15.0, available_from_minute=10))
        
        # Heavy Machinery Bay: Entirely empty and available immediately at t=0
        self.yms.register_bay(LoadingBay(bay_id="BAY_2_HEAVY", supported_cargo_types=["machinery", "pallet"], max_length_meters=30.0, available_from_minute=0))
        
        # Cold Storage Bay: Heavily congested, frees up at t=45
        self.yms.register_bay(LoadingBay(bay_id="BAY_3_COLD", supported_cargo_types=["refrigerated"], max_length_meters=20.0, available_from_minute=45))

    def test_optimal_bay_selection(self):
        # Truck arrives quickly at t=5 needing to drop off standard pallets
        telemetry = VehicleTelemetry(truck_id="TRK_001", eta_minutes=5, cargo_type="pallet", length_meters=12.0)
        
        result = self.yms.synchronize_eta(telemetry)
        
        # The engine should instantly map it to BAY_2_HEAVY since it's available at t=0,
        # resulting in a 0-minute wait time. (BAY_1 would have forced a 5-minute wait).
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["bay_id"], "BAY_2_HEAVY")
        self.assertEqual(result["estimated_wait_time_minutes"], 0)
        self.assertIn("GATE-PASS-", result["gate_pass_token"])

    def test_dynamic_swap_on_traffic_delay(self):
        # Truck arrives at t=25 hauling a refrigerated load
        telemetry = VehicleTelemetry(truck_id="TRK_002", eta_minutes=25, cargo_type="refrigerated", length_meters=18.0)
        result1 = self.yms.synchronize_eta(telemetry)
        
        # Expected: BAY_3_COLD. Wait time: 45 - 25 = 20 minutes demurrage penalty
        self.assertEqual(result1["bay_id"], "BAY_3_COLD")
        self.assertEqual(result1["estimated_wait_time_minutes"], 20)
        
        # Suddenly, severe traffic delays the truck by 30 minutes! Live ETA dynamically shifts to t=55.
        telemetry.eta_minutes = 55
        result2 = self.yms.synchronize_eta(telemetry)
        
        # The engine completely recalculates. It maintains BAY_3_COLD but because the truck is arriving late,
        # the bay is now completely empty by the time it gets there! Wait time drops to 0.
        self.assertEqual(result2["bay_id"], "BAY_3_COLD")
        self.assertEqual(result2["estimated_wait_time_minutes"], 0)

if __name__ == '__main__':
    unittest.main()
