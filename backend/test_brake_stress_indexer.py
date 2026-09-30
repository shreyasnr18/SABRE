import unittest
from brake_stress_indexer import BrakingHardware, assess_thermal_stress

class TestBrakeStressIndexer(unittest.TestCase):
    def setUp(self):
        self.road_graph = {
            'A': {
                # Massive continuous drop over short distance (very steep, low cooling)
                'B': {'cost': 10, 'elevation_drop_m': 1000, 'slope_distance_m': 5000},
                # Moderate drop over long distance (high cooling)
                'C': {'cost': 15, 'elevation_drop_m': 300, 'slope_distance_m': 8000}
            }
        }
        
    def test_heavy_truck_with_drum_brakes(self):
        # 30-tonne truck relying purely on friction brakes
        hardware = BrakingHardware(loaded_tonnage=30.0, hardware_type='drum')
        tagged_graph = assess_thermal_stress(hardware, self.road_graph)
        
        # The steep descent should overheat the drums (Temp > 400)
        steep_route = tagged_graph['A']['B']
        self.assertTrue(steep_route['mandatory_stepped_descent'])
        self.assertTrue(steep_route['retarder_zone'])
        self.assertGreater(steep_route['estimated_drum_temp'], 400.0)
        self.assertEqual(steep_route['cost'], 10 + 50) # Penalized
        
        # Moderate descent should be perfectly safe
        mod_route = tagged_graph['A']['C']
        self.assertFalse(mod_route['mandatory_stepped_descent'])
        
    def test_heavy_truck_with_retarder(self):
        # Exact same 30-tonne truck, but equipped with an engine retarder
        hardware = BrakingHardware(loaded_tonnage=30.0, hardware_type='retarder')
        tagged_graph = assess_thermal_stress(hardware, self.road_graph)
        
        # Retarder absorbs the energy, keeping drums cool
        steep_route = tagged_graph['A']['B']
        self.assertFalse(steep_route['mandatory_stepped_descent'])
        self.assertLess(steep_route['estimated_drum_temp'], 400.0)
        self.assertEqual(steep_route['cost'], 10) # No penalty
        
    def test_light_truck_with_drum_brakes(self):
        # Light 10-tonne truck on friction brakes
        hardware = BrakingHardware(loaded_tonnage=10.0, hardware_type='drum')
        tagged_graph = assess_thermal_stress(hardware, self.road_graph)
        
        # Lower mass generates less potential energy; drums stay cool
        steep_route = tagged_graph['A']['B']
        self.assertFalse(steep_route['mandatory_stepped_descent'])
        self.assertLess(steep_route['estimated_drum_temp'], 400.0)

if __name__ == '__main__':
    unittest.main()
