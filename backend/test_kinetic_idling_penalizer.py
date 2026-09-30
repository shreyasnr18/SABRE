import unittest
import math
from kinetic_idling_penalizer import PowertrainEmissions, penalize_kinetic_idling

class TestKineticIdlingPenalizer(unittest.TestCase):
    def setUp(self):
        self.road_graph = {
            'A': {
                # Free-flowing outer artery
                'B': {'cost': 15, 'live_speed_kmh': 65.0, 'delay_minutes': 0},
                # Severe inner-city crawl (below 5 km/h for 20 mins)
                'C': {'cost': 5, 'live_speed_kmh': 3.0, 'delay_minutes': 20}
            }
        }
        
    def test_bs6_diesel_truck(self):
        # BS-VI truck requiring DPF regeneration (highly sensitive to crawling)
        truck = PowertrainEmissions(engine_type='bs6_diesel')
        optimized_graph = penalize_kinetic_idling(truck, self.road_graph)
        
        # Free-flowing bypass is untouched
        self.assertEqual(optimized_graph['A']['B']['cost'], 15)
        
        # Severe crawl route incurs exponential penalty: cost 5 * exp(20/10) = 5 * e^2 = ~36.94
        crawling_cost = optimized_graph['A']['C']['cost']
        expected_cost = 5 * math.exp(2.0)
        
        self.assertAlmostEqual(crawling_cost, expected_cost, places=2)
        self.assertTrue(optimized_graph['A']['C']['dpf_hazard_flagged'])
        
        # The penalty guarantees the bypass (cost=15) is drastically preferred over the crawl (~36.9)
        self.assertLess(optimized_graph['A']['B']['cost'], crawling_cost)

    def test_ev_truck(self):
        # Electric Vehicle (no DPF to clog, no idling fuel burn)
        ev = PowertrainEmissions(engine_type='ev')
        optimized_graph = penalize_kinetic_idling(ev, self.road_graph)
        
        # Free-flowing bypass is untouched
        self.assertEqual(optimized_graph['A']['B']['cost'], 15)
        
        # Severe crawl route incurs standard linear time delay: cost 5 + 20 = 25
        self.assertEqual(optimized_graph['A']['C']['cost'], 25)
        self.assertFalse(optimized_graph['A']['C']['dpf_hazard_flagged'])
        
        # Bypass (15) is still preferred purely for time savings, but the cost scaling is linear, not exponential

if __name__ == '__main__':
    unittest.main()
