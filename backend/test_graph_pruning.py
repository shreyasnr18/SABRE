import unittest
from graph_pruning import VehicleProfile, prune_volumetric_graph

class TestVolumetricGraphPruning(unittest.TestCase):
    def setUp(self):
        # Total vehicle height = 3.5 (base) + 0.5 (payload) + 0.3 (roof) = 4.3m
        # Safe envelope = 4.3 + 0.2 = 4.5m
        self.vehicle = VehicleProfile(base_height=3.5, payload_overhang=0.5, roof_unit_height=0.3)
        
        self.road_graph = {
            'A': {
                'B': {'cost': 10, 'vertical_clearance': 5.0, 'hazard_coordinates': (12.9716, 77.5946)}, # Safe (5.0 > 4.5)
                'C': {'cost': 15, 'vertical_clearance': 4.6, 'hazard_coordinates': (12.9717, 77.5947)}  # Safe (4.6 > 4.5)
            },
            'B': {
                'D': {'cost': 20, 'vertical_clearance': 4.49, 'hazard_coordinates': (12.9718, 77.5948)}, # Unsafe (4.49 < 4.5)
                'E': {'cost': 5, 'vertical_clearance': 4.4, 'hazard_coordinates': (12.9719, 77.5949)}   # Unsafe (4.4 < 4.5)
            },
            'C': {
                'F': {'cost': 12, 'vertical_clearance': 10.0, 'hazard_coordinates': None} # Safe (no hazard coords)
            }
        }
        
    def test_safe_envelope_calculation(self):
        self.assertAlmostEqual(self.vehicle.total_height, 4.3)
        self.assertAlmostEqual(self.vehicle.safe_envelope, 4.5)

    def test_graph_pruning(self):
        cleared_graph, hazard_log = prune_volumetric_graph(self.vehicle, self.road_graph)
        
        # Check safe edges
        self.assertEqual(cleared_graph['A']['B']['cost'], 10)
        self.assertEqual(cleared_graph['A']['C']['cost'], 15)
        self.assertEqual(cleared_graph['C']['F']['cost'], 12)
        
        # Check unsafe edges (pruned with Big-M)
        self.assertEqual(cleared_graph['B']['D']['cost'], float('inf'))
        self.assertEqual(cleared_graph['B']['E']['cost'], float('inf'))
        
        # Check hazard log
        self.assertEqual(len(hazard_log), 2)
        
        edges_pruned = [log['edge'] for log in hazard_log]
        self.assertIn("B->D", edges_pruned)
        self.assertIn("B->E", edges_pruned)
        
        # Original graph should remain unmodified
        self.assertEqual(self.road_graph['B']['D']['cost'], 20)

if __name__ == '__main__':
    unittest.main()
