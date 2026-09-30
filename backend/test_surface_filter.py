import unittest
from surface_filter import filter_carriageway_surface

class TestSurfaceFilter(unittest.TestCase):
    def setUp(self):
        self.road_graph = {
            'A': {
                'B': {'cost': 10, 'width': 7.5, 'is_paved': True},   # Safe
                'C': {'cost': 15, 'width': 8.0, 'is_paved': False}   # Unpaved
            },
            'B': {
                'D': {'cost': 20, 'width': 6.5, 'is_paved': True},   # Too narrow
                'E': {'cost': 5, 'width': 5.0, 'is_paved': False}    # Narrow & Unpaved
            },
            'C': {
                'F': {'cost': 12, 'width': 7.0, 'is_paved': True}    # Exactly 7.0m, Paved (Safe)
            }
        }
        
    def test_heavy_vehicle_pruning(self):
        # Heavy vehicle >= 16T
        gvw = 18.0
        validated_graph = filter_carriageway_surface(gvw, self.road_graph)
        
        # Valid routes should remain
        self.assertEqual(validated_graph['A']['B']['cost'], 10)
        self.assertEqual(validated_graph['C']['F']['cost'], 12)
        
        # Invalid routes should be pruned (cost = inf)
        self.assertEqual(validated_graph['A']['C']['cost'], float('inf'))
        self.assertEqual(validated_graph['B']['D']['cost'], float('inf'))
        self.assertEqual(validated_graph['B']['E']['cost'], float('inf'))
        
    def test_light_vehicle_no_pruning(self):
        # Light vehicle < 16T
        gvw = 12.0
        validated_graph = filter_carriageway_surface(gvw, self.road_graph)
        
        # No routes should be pruned for light vehicles
        self.assertEqual(validated_graph['A']['B']['cost'], 10)
        self.assertEqual(validated_graph['A']['C']['cost'], 15)
        self.assertEqual(validated_graph['B']['D']['cost'], 20)
        self.assertEqual(validated_graph['B']['E']['cost'], 5)
        self.assertEqual(validated_graph['C']['F']['cost'], 12)

if __name__ == '__main__':
    unittest.main()
