import unittest
from datetime import datetime, timedelta
from fastag_optimizer import optimize_fastag_tariffs

class TestFASTagOptimizer(unittest.TestCase):
    def setUp(self):
        self.toll_plazas = {
            "PlazaA": {"single_rate": 100, "return_rate": 150} # 50% discount on return
        }
        self.base_time = datetime(2026, 8, 30, 8, 0, 0) # 8:00 AM
        
    def test_naturally_within_window(self):
        # Outbound dep: 8:00 AM, Plaza out: 10:00 AM
        # Return dep: next day 6:00 AM, Plaza return: 9:00 AM (23 hrs later)
        dispatches = [{
            "trip_id": 1,
            "plaza_id": "PlazaA",
            "outbound_departure_time": self.base_time,
            "outbound_travel_hrs_to_plaza": 2.0,
            "return_departure_time": self.base_time + timedelta(hours=22),
            "return_travel_hrs_to_plaza": 3.0
        }]
        
        schedule, expense, savings = optimize_fastag_tariffs(dispatches, self.toll_plazas, margin_hrs=2.0)
        
        self.assertEqual(savings, 0)
        self.assertEqual(expense, 150)
        self.assertTrue(schedule[0]["discount_applied"])
        self.assertEqual(schedule[0]["shift_hrs"], 0)
        self.assertEqual(schedule[0]["return_departure_time"], dispatches[0]["return_departure_time"])

    def test_narrowly_misses_window(self):
        # Outbound dep: 8:00 AM, Plaza out: 10:00 AM
        # Return dep: next day 8:00 AM, Plaza return: 11:00 AM (25 hrs later)
        # Should shift return departure earlier by 1 hour
        dispatches = [{
            "trip_id": 2,
            "plaza_id": "PlazaA",
            "outbound_departure_time": self.base_time,
            "outbound_travel_hrs_to_plaza": 2.0,
            "return_departure_time": self.base_time + timedelta(hours=24),
            "return_travel_hrs_to_plaza": 3.0
        }]
        
        schedule, expense, savings = optimize_fastag_tariffs(dispatches, self.toll_plazas, margin_hrs=2.0)
        
        self.assertEqual(savings, 50) # (100*2) - 150 = 50 savings
        self.assertEqual(expense, 150)
        self.assertTrue(schedule[0]["discount_applied"])
        self.assertEqual(schedule[0]["shift_hrs"], 1.0)
        
        # Verify the time was shifted back by 1 hour
        expected_time = dispatches[0]["return_departure_time"] - timedelta(hours=1.0)
        self.assertEqual(schedule[0]["return_departure_time"], expected_time)

    def test_heavily_exceeds_window(self):
        # Outbound dep: 8:00 AM, Plaza out: 10:00 AM
        # Return dep: next day 12:00 PM, Plaza return: 15:00 PM (29 hrs later)
        # Margin is 2.0, so it shouldn't shift
        dispatches = [{
            "trip_id": 3,
            "plaza_id": "PlazaA",
            "outbound_departure_time": self.base_time,
            "outbound_travel_hrs_to_plaza": 2.0,
            "return_departure_time": self.base_time + timedelta(hours=28),
            "return_travel_hrs_to_plaza": 3.0
        }]
        
        schedule, expense, savings = optimize_fastag_tariffs(dispatches, self.toll_plazas, margin_hrs=2.0)
        
        self.assertEqual(savings, 0)
        self.assertEqual(expense, 200) # Two single passages
        self.assertFalse(schedule[0]["discount_applied"])
        self.assertEqual(schedule[0]["shift_hrs"], 0)

if __name__ == '__main__':
    unittest.main()
