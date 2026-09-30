import unittest
from canopy_clearance import VehicleExterior, filter_canopy_clearance

class TestCanopyClearance(unittest.TestCase):
    def setUp(self):
        self.road_graph = {
            'A': {
                'B': {'cost': 10, 'has_low_canopy': False},  # Clear arterial
                'C': {'cost': 5, 'has_low_canopy': True}     # Low canopy tertiary
            },
            'B': {
                'D': {'cost': 15, 'has_low_canopy': False}
            },
            'C': {
                'D': {'cost': 10, 'has_low_canopy': True}
            }
        }
        
    def test_vulnerable_vehicle(self):
        # Refrigerated truck
        vehicle = VehicleExterior(has_reefer=True)
        cleared_graph = filter_canopy_clearance(vehicle, self.road_graph)
        
        # Clear arterial should retain normal cost
        self.assertEqual(cleared_graph['A']['B']['cost'], 10)
        
        # Low canopy should have penalty
        self.assertEqual(cleared_graph['A']['C']['cost'], float('inf'))
        self.assertEqual(cleared_graph['C']['D']['cost'], float('inf'))
        
    def test_safe_vehicle(self):
        # Standard hard-top truck, no rooftop units
        vehicle = VehicleExterior()
        cleared_graph = filter_canopy_clearance(vehicle, self.road_graph)
        
        # No penalties applied
        self.assertEqual(cleared_graph['A']['B']['cost'], 10)
        self.assertEqual(cleared_graph['A']['C']['cost'], 5)

if __name__ == '__main__':
    unittest.main()
