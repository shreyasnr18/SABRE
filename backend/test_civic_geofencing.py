import unittest
from datetime import datetime, time
from civic_geofencing import CivicRegulations, enforce_civic_geofence

class TestCivicGeofencing(unittest.TestCase):
    def setUp(self):
        # 07:00-11:00 AM and 16:00-22:00 PM curfews
        curfew = [(time(7, 0), time(11, 0)), (time(16, 0), time(22, 0))]
        self.regs = CivicRegulations(curfew)
        
        self.road_graph = {
            'A': {
                # Outer ring bypass (always open)
                'B': {'cost': 10, 'in_city_limits': False, 'is_hold_point': False},
                # City center corridor (ANPR enforced)
                'C': {'cost': 5, 'in_city_limits': True, 'is_hold_point': False},
                # Industrial perimeter rest stop / hold point
                'D': {'cost': 2, 'in_city_limits': True, 'is_hold_point': True}
            }
        }
        
    def test_curfew_arrival(self):
        # Arriving at 9:00 AM (peak morning curfew)
        arrival_times = {
            "A->B": datetime(2026, 8, 30, 9, 0),
            "A->C": datetime(2026, 8, 30, 9, 0),
            "A->D": datetime(2026, 8, 30, 9, 0)
        }
        
        compliant_graph = enforce_civic_geofence(self.regs, self.road_graph, arrival_times)
        
        # Bypass remains unaffected (outside city limits)
        self.assertEqual(compliant_graph['A']['B']['cost'], 10)
        
        # City center is dynamically pruned (cost = inf to avoid ₹2,000 fine)
        self.assertEqual(compliant_graph['A']['C']['cost'], float('inf'))
        
        # Hold point is safe and flagged for waiting
        self.assertEqual(compliant_graph['A']['D']['cost'], 2)
        self.assertTrue(compliant_graph['A']['D'].get('hold_required'))

    def test_safe_arrival(self):
        # Arriving at 14:00 PM (safe window between morning and evening curfews)
        arrival_times = {
            "A->B": datetime(2026, 8, 30, 14, 0),
            "A->C": datetime(2026, 8, 30, 14, 0),
            "A->D": datetime(2026, 8, 30, 14, 0)
        }
        
        compliant_graph = enforce_civic_geofence(self.regs, self.road_graph, arrival_times)
        
        # Everything remains open and un-penalized
        self.assertEqual(compliant_graph['A']['B']['cost'], 10)
        self.assertEqual(compliant_graph['A']['C']['cost'], 5)
        self.assertEqual(compliant_graph['A']['D']['cost'], 2)
        
        # Hold flag is False during safe hours
        self.assertFalse(compliant_graph['A']['D'].get('hold_required'))

if __name__ == '__main__':
    unittest.main()
