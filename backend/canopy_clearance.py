import copy

class VehicleExterior:
    def __init__(self, has_tarpaulin=False, has_reefer=False, has_solar=False):
        """
        Initializes the vehicle's exterior equipment profile.
        """
        self.has_tarpaulin = has_tarpaulin
        self.has_reefer = has_reefer
        self.has_solar = has_solar
        
    @property
    def is_vulnerable_to_canopy(self):
        """
        Returns True if the vehicle has fragile top-mounted equipment or soft covers
        that can be damaged by low-hanging tree branches.
        """
        return self.has_tarpaulin or self.has_reefer or self.has_solar

def filter_canopy_clearance(vehicle_exterior, road_graph):
    """
    Evaluates secondary/tertiary road tree-canopy clearance.
    Assigns high traversal penalty weights to low-canopy secondary corridors
    for vulnerable vehicles (high-cube, refrigerated, tarpaulin).
    
    :param vehicle_exterior: VehicleExterior instance.
    :param road_graph: dict representing adjacency list of the graph.
           Example: { 'A': {'B': {'cost': 10, 'has_low_canopy': True}} }
    :return: damage-proof road network subgraph
    """
    cleared_subgraph = copy.deepcopy(road_graph)
    
    # If the vehicle has a standard hard-top and no roof extensions, it can proceed
    if not vehicle_exterior.is_vulnerable_to_canopy:
        return cleared_subgraph
        
    for origin, destinations in cleared_subgraph.items():
        for destination, attributes in destinations.items():
            has_low_canopy = attributes.get('has_low_canopy', False)
            
            if has_low_canopy:
                # Assign an infinite traversal penalty weight to force arterial routing
                attributes['cost'] = float('inf')
                
    return cleared_subgraph
