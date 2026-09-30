import unittest
from dock_bay_snapper import EnterpriseLogisticsDatabase, snap_to_dock_bay

class TestDockBaySnapper(unittest.TestCase):
    def setUp(self):
        self.enterprise_db = EnterpriseLogisticsDatabase()
        # Register a massive distribution center's dedicated rear loading dock
        self.enterprise_db.add_dock("MEGA_MALL_01", (12.9810, 77.6025))
        
    def test_verified_commercial_poi(self):
        # Navigation requests the consumer front gate / pedestrian security entrance
        consumer_front_gate = (12.9800, 77.6015)
        
        # Engine intercepts and snaps to the heavy-vehicle rear loading bay
        corrected_coords = snap_to_dock_bay("MEGA_MALL_01", consumer_front_gate, self.enterprise_db)
        
        # Verify the snap eliminates the turnaround delay
        self.assertEqual(corrected_coords, (12.9810, 77.6025))
        
    def test_unregistered_location(self):
        # A standard residential delivery not present in the enterprise database
        residential_address = (13.0011, 77.5555)
        
        # Engine allows the coordinates through without snapping
        corrected_coords = snap_to_dock_bay("RESIDENCE_45", residential_address, self.enterprise_db)
        
        # Verify coordinates remain untouched
        self.assertEqual(corrected_coords, residential_address)

if __name__ == '__main__':
    unittest.main()
