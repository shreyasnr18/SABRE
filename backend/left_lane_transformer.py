class ExpresswayGeometry:
    def __init__(self, is_expressway, num_lanes, lane_width_meters=3.5):
        """
        Initializes the road geometry profile.
        
        :param is_expressway: True if the corridor is a designated multi-lane expressway.
        :param num_lanes: Total number of lanes available.
        :param lane_width_meters: Standard width of a single lane in meters (default 3.5m).
        """
        self.is_expressway = is_expressway
        self.num_lanes = num_lanes
        self.lane_width_meters = lane_width_meters

class GpsTelemetry:
    def __init__(self, lateral_offset_from_left_edge_meters):
        """
        Initializes live high-frequency vehicle GPS telemetry.
        
        :param lateral_offset_from_left_edge_meters: Float indicating where the truck is currently driving, 
                                                     measured from the extreme left edge of the carriageway.
        """
        self.lateral_offset_from_left_edge_meters = lateral_offset_from_left_edge_meters

def process_lane_guidance(telemetry, geometry):
    """
    Evaluates in-cabin expressway lane guidance.
    Locks navigation to the extreme left freight corridor (Lane 1) and triggers alerts if the vehicle drifts
    into middle or fast lanes to eliminate mandatory lane discipline challans.
    
    :param telemetry: GpsTelemetry instance.
    :param geometry: ExpresswayGeometry instance.
    :return: dict containing active guidance vector and alert status.
    """
    response = {
        'target_guidance_lane': 1,
        'drift_alert_triggered': False,
        'alert_message': None
    }
    
    # Only enforce the strict multi-lane expressway lane-discipline rules
    if geometry.is_expressway and geometry.num_lanes > 1:
        # Lane 1 (extreme left) boundary is between 0 and lane_width_meters
        lane_1_max_boundary = geometry.lane_width_meters
        
        # Buffer tolerance (in meters) to allow slight edge maneuvering without screaming at the driver
        tolerance_buffer = 0.5 
        
        # If the truck's lateral offset pushes past Lane 1 into Lane 2 or 3 (middle/fast lanes)
        if telemetry.lateral_offset_from_left_edge_meters > (lane_1_max_boundary + tolerance_buffer):
            response['drift_alert_triggered'] = True
            response['alert_message'] = "WARNING: Vehicle drifting into fast lane! Return to left freight corridor immediately."
            
    return response
