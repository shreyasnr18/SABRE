import unittest
from flood_wading_threshold import VehicleWadingProfile, threshold_flood_depths

class TestFloodWadingThreshold(unittest.TestCase):
    def setUp(self):
        self.road_graph = {
            'A': {
                # Elevated dry flyover
                'B': {'cost': 15, 'water_accumulation_cm': 0.0},
                # Slight puddle on arterial road
                'C': {'cost': 5, 'water_accumulation_cm': 12.0},
                # Deeply flooded underpass
                'D': {'cost': 2, 'water_accumulation_cm': 45.0}
            }
        }
        
    def test_low_clearance_ev_freight(self):
        # EV freight with sealed battery enclosure only safe up to 10 cm
        ev_truck = VehicleWadingProfile(safe_wading_depth_cm=10.0)
        cleared_graph = threshold_flood_depths(ev_truck, self.road_graph)
        
        # Dry flyover remains open
        self.assertEqual(cleared_graph['A']['B']['cost'], 15)
        
        # 12 cm puddle is blocked for EV (exceeds its 10 cm safe depth threshold)
        self.assertEqual(cleared_graph['A']['C']['cost'], float('inf'))
        self.assertTrue(cleared_graph['A']['C']['hydrostatic_hazard_flagged'])
        
        # 45 cm flooded underpass is definitively blocked
        self.assertEqual(cleared_graph['A']['D']['cost'], float('inf'))
        self.assertTrue(cleared_graph['A']['D']['hydrostatic_hazard_flagged'])

    def test_high_clearance_combustion_truck(self):
        # High-clearance diesel with elevated air intake safe up to 40 cm
        diesel_truck = VehicleWadingProfile(safe_wading_depth_cm=40.0)
        cleared_graph = threshold_flood_depths(diesel_truck, self.road_graph)
        
        # Dry flyover remains open
        self.assertEqual(cleared_graph['A']['B']['cost'], 15)
        
        # 12 cm puddle is perfectly safe for this truck
        self.assertEqual(cleared_graph['A']['C']['cost'], 5)
        self.assertFalse(cleared_graph['A']['C']['hydrostatic_hazard_flagged'])
        
        # 45 cm flooded underpass is blocked (violates absolute 30 cm limit AND 40 cm vehicle limit)
        self.assertEqual(cleared_graph['A']['D']['cost'], float('inf'))
        self.assertTrue(cleared_graph['A']['D']['hydrostatic_hazard_flagged'])

if __name__ == '__main__':
    unittest.main()
