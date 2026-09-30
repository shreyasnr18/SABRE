import unittest
from gradient_feasibility import PowertrainSpecs, evaluate_gradient_feasibility

class TestGradientFeasibility(unittest.TestCase):
    def setUp(self):
        self.road_graph = {
            'A': {
                'B': {'cost': 10, 'incline_degrees': 2.0},  # Gradual approach (safe)
                'C': {'cost': 5, 'incline_degrees': 7.5}    # Steep flyover (>6 deg)
            },
            'B': {
                'D': {'cost': 15, 'incline_degrees': 0.0}   # Flat surface level
            }
        }
        
    def test_heavy_loaded_truck(self):
        # 28-tonne fully loaded truck
        truck = PowertrainSpecs(gvw_tonnes=28.0, horsepower=450)
        validated_graph = evaluate_gradient_feasibility(truck, self.road_graph)
        
        # Gradual approach and flat surface should remain safe
        self.assertEqual(validated_graph['A']['B']['cost'], 10)
        self.assertEqual(validated_graph['B']['D']['cost'], 15)
        
        # Steep flyover should be pruned for heavy load
        self.assertEqual(validated_graph['A']['C']['cost'], float('inf'))
        
    def test_lightly_loaded_truck(self):
        # 14-tonne lightly loaded truck
        truck = PowertrainSpecs(gvw_tonnes=14.0, horsepower=450)
        validated_graph = evaluate_gradient_feasibility(truck, self.road_graph)
        
        # All paths should remain safe since it is not fully loaded
        self.assertEqual(validated_graph['A']['B']['cost'], 10)
        self.assertEqual(validated_graph['B']['D']['cost'], 15)
        self.assertEqual(validated_graph['A']['C']['cost'], 5)

if __name__ == '__main__':
    unittest.main()
