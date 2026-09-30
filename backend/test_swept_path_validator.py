import unittest
from swept_path_validator import ChassisSpecs, validate_swept_path

class TestSweptPathValidator(unittest.TestCase):
    def setUp(self):
        self.road_graph = {
            'A': {
                'B': {'cost': 10, 'turn_radius': None},      # Straight arterial (no turn)
                'C': {'cost': 5, 'turn_radius': 25.0}        # Wide roundabout (safe)
            },
            'B': {
                'D': {'cost': 15, 'turn_radius': 8.5},       # Tight U-turn median cut
                'E': {'cost': 8, 'turn_radius': 12.0}        # Passenger car intersection
            }
        }
        
    def test_multi_axle_freight_vehicle(self):
        # Heavy multi-axle truck requiring 14.5m turning radius
        truck = ChassisSpecs(wheelbase=6.0, overall_length=18.0, articulated_axles=3, turning_circle_radius=14.5)
        validated_graph = validate_swept_path(truck, self.road_graph)
        
        # Straight roads and wide roundabouts should be untouched
        self.assertEqual(validated_graph['A']['B']['cost'], 10)
        self.assertEqual(validated_graph['A']['C']['cost'], 5)
        
        # Tight U-turn (8.5m) and intersection (12.0m) should be pruned
        self.assertEqual(validated_graph['B']['D']['cost'], float('inf'))
        self.assertEqual(validated_graph['B']['E']['cost'], float('inf'))
        
    def test_passenger_car_vehicle(self):
        # Small delivery van requiring 5.5m turning radius
        van = ChassisSpecs(wheelbase=3.0, overall_length=5.0, articulated_axles=0, turning_circle_radius=5.5)
        validated_graph = validate_swept_path(van, self.road_graph)
        
        # Straight roads and wide roundabouts should be untouched
        self.assertEqual(validated_graph['A']['B']['cost'], 10)
        self.assertEqual(validated_graph['A']['C']['cost'], 5)
        
        # Tight U-turn (8.5m) and intersection (12.0m) should BE SAFE for van
        self.assertEqual(validated_graph['B']['D']['cost'], 15)
        self.assertEqual(validated_graph['B']['E']['cost'], 8)

if __name__ == '__main__':
    unittest.main()
