import unittest
from left_lane_transformer import ExpresswayGeometry, GpsTelemetry, process_lane_guidance

class TestLeftLaneTransformer(unittest.TestCase):
    def setUp(self):
        # Standard 3-lane expressway, 3.5m width per lane
        self.expressway = ExpresswayGeometry(is_expressway=True, num_lanes=3, lane_width_meters=3.5)
        
        # Standard 2-lane local road (not classified as a strict expressway)
        self.local_road = ExpresswayGeometry(is_expressway=False, num_lanes=2, lane_width_meters=3.5)

    def test_expressway_compliant_driving(self):
        # Truck is driving perfectly in the center of the left lane (1.75 meters from left edge)
        telemetry = GpsTelemetry(lateral_offset_from_left_edge_meters=1.75)
        guidance = process_lane_guidance(telemetry, self.expressway)
        
        # Navigation stays locked to Lane 1 and no alerts are triggered
        self.assertEqual(guidance['target_guidance_lane'], 1)
        self.assertFalse(guidance['drift_alert_triggered'])
        
    def test_expressway_lane_drifting(self):
        # Truck has drifted completely into Lane 2 (e.g., 5.0 meters from left edge)
        telemetry = GpsTelemetry(lateral_offset_from_left_edge_meters=5.0)
        guidance = process_lane_guidance(telemetry, self.expressway)
        
        # Engine detects the drift and triggers the severe warning
        self.assertTrue(guidance['drift_alert_triggered'])
        self.assertIsNotNone(guidance['alert_message'])
        self.assertIn("WARNING", guidance['alert_message'])
        
    def test_local_road_ignore(self):
        # Driving on a local road where expressway rules do not apply
        # Even if they are in the middle (5.0m), it shouldn't trigger the expressway challan alert
        telemetry = GpsTelemetry(lateral_offset_from_left_edge_meters=5.0)
        guidance = process_lane_guidance(telemetry, self.local_road)
        
        # No alert triggered on local non-expressways
        self.assertFalse(guidance['drift_alert_triggered'])

if __name__ == '__main__':
    unittest.main()
