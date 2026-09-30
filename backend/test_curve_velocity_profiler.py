import unittest
from curve_velocity_profiler import FreightStabilityProfile, generate_curve_advisories

class TestCurveVelocityProfiler(unittest.TestCase):
    def setUp(self):
        self.route_geometry = {
            'Straight_Highway': {'radius_meters': None, 'current_speed_limit': 80},
            'Tight_Interchange_Loop': {'radius_meters': 30, 'current_speed_limit': 45},
            'Gentle_Flyover_Curve': {'radius_meters': 150, 'current_speed_limit': 60}
        }
        
    def test_top_heavy_container(self):
        # Top-heavy freight (e.g. double-stacked containers or unbalanced machinery)
        # Standard track width 2.5m, dangerously high CoG at 2.2m
        top_heavy = FreightStabilityProfile(track_width_meters=2.5, cog_height_meters=2.2)
        advisories = generate_curve_advisories(top_heavy, self.route_geometry)
        
        # Straight highway should just return standard posted limit safely
        self.assertEqual(advisories['Straight_Highway']['advisory_speed_kmh'], 80)
        self.assertFalse(advisories['Straight_Highway']['rollover_risk'])
        
        # Tight interchange loop dynamically flags a major rollover hazard!
        # Posted limit is 45 km/h, but the physics engine caps it around ~36 km/h to prevent tipping
        tight_loop = advisories['Tight_Interchange_Loop']
        self.assertLess(tight_loop['advisory_speed_kmh'], 45.0)
        self.assertTrue(tight_loop['rollover_risk'])
        
    def test_low_profile_flatbed(self):
        # Heavy but low-slung flatbed (e.g. carrying steel plates bolted to the chassis floor)
        # Standard track width 2.5m, extremely safe low CoG at 0.8m
        low_profile = FreightStabilityProfile(track_width_meters=2.5, cog_height_meters=0.8)
        advisories = generate_curve_advisories(low_profile, self.route_geometry)
        
        # Tight interchange loop is no problem for a low-slung load
        # Engine clears it up to ~59.7 km/h, safely capping at the posted 45 km/h
        tight_loop = advisories['Tight_Interchange_Loop']
        self.assertEqual(tight_loop['advisory_speed_kmh'], 45.0)
        self.assertFalse(tight_loop['rollover_risk'])

if __name__ == '__main__':
    unittest.main()
