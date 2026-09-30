import copy

class VehicleWadingProfile:
    def __init__(self, safe_wading_depth_cm):
        """
        Initializes the vehicle's maximum safe wading depth.
        
        :param safe_wading_depth_cm: Maximum safe depth in cm. (Based on air-intake height 
                                     for combustion engines or sealed battery depth for EVs).
        """
        self.safe_wading_depth_cm = safe_wading_depth_cm

def threshold_flood_depths(wading_profile, road_graph):
    """
    Evaluates real-time waterlogging telemetry against vehicle wading limits.
    Immediately blocks any low-lying road where flood depth exceeds 30 cm 
    or the vehicle's safety limits to prevent hydrostatic engine lock and EV battery shorts.
    
    :param wading_profile: VehicleWadingProfile instance.
    :param road_graph: dict representing adjacency list of the graph.
           Example: { 'A': {'B': {'cost': 10, 'water_accumulation_cm': 45.0}} }
    :return: flood-cleared optimized subgraph
    """
    cleared_subgraph = copy.deepcopy(road_graph)
    
    # Absolute critical safety threshold (30 cm) regardless of vehicle capabilities
    ABSOLUTE_FLOOD_LIMIT_CM = 30.0
    
    for origin, destinations in cleared_subgraph.items():
        for destination, attributes in destinations.items():
            water_depth = attributes.get('water_accumulation_cm', 0.0)
            
            # Prune if water exceeds absolute safety limit OR vehicle-specific capability
            if water_depth > ABSOLUTE_FLOOD_LIMIT_CM or water_depth > wading_profile.safe_wading_depth_cm:
                # Apply infinite traversal penalty to block the flooded corridor
                attributes['cost'] = float('inf')
                attributes['hydrostatic_hazard_flagged'] = True
            else:
                attributes['hydrostatic_hazard_flagged'] = False
                
    return cleared_subgraph
