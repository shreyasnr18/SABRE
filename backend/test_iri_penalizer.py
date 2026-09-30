import unittest
from iri_penalizer import CargoFragility, penalize_roughness

class TestIRIPenalizer(unittest.TestCase):
    def setUp(self):
        self.road_graph = {
            'A': {
                # Smooth highway (IRI=1.0, no humps)
                'B': {'cost': 10, 'iri_score': 1.0, 'has_speed_humps': False},
                # Moderately rough road (IRI=3.5, no humps)
                'C': {'cost': 10, 'iri_score': 3.5, 'has_speed_humps': False},
                # Very rough local road with tabletop speed humps (IRI=5.0)
                'D': {'cost': 10, 'iri_score': 5.0, 'has_speed_humps': True}
            }
        }
        
    def test_shock_sensitive_cargo(self):
        # Fragile electronics
        cargo = CargoFragility(is_shock_sensitive=True)
        optimized_graph = penalize_roughness(cargo, self.road_graph)
        
        # Smooth highway is untouched
        self.assertEqual(optimized_graph['A']['B']['cost'], 10.0)
        
        # Moderate road has heavy multiplier: 1.0 + (2.5 * 2.0) = 6.0 multiplier -> cost = 60
        self.assertEqual(optimized_graph['A']['C']['cost'], 60.0)
        
        # Hump road has extreme multiplier: 1.0 + (4.0 * 2.0) + 10.0 = 19.0 multiplier -> cost = 190
        self.assertEqual(optimized_graph['A']['D']['cost'], 190.0)

    def test_durable_cargo(self):
        # Sand or durable goods
        cargo = CargoFragility(is_shock_sensitive=False)
        optimized_graph = penalize_roughness(cargo, self.road_graph)
        
        # Smooth highway is untouched
        self.assertEqual(optimized_graph['A']['B']['cost'], 10.0)
        
        # Moderate road has minor penalty: 1.0 + (2.5 * 0.1) = 1.25 multiplier -> cost = 12.5
        self.assertEqual(optimized_graph['A']['C']['cost'], 12.5)
        
        # Hump road has minor penalty (ignores hump multiplier for durable goods): 1.0 + (4.0 * 0.1) = 1.4 multiplier -> cost = 14.0
        self.assertEqual(optimized_graph['A']['D']['cost'], 14.0)

if __name__ == '__main__':
    unittest.main()
