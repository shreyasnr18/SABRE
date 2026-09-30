import copy

class VehicleProfile:
    def __init__(self, base_height, payload_overhang=0.0, roof_unit_height=0.0):
        """
        Initializes the vehicle's vertical profile.
        """
        self.base_height = base_height
        self.payload_overhang = payload_overhang
        self.roof_unit_height = roof_unit_height
        
    @property
    def total_height(self):
        return self.base_height + self.payload_overhang + self.roof_unit_height
        
    @property
    def safe_envelope(self):
        return self.total_height + 0.2

def prune_volumetric_graph(vehicle_profile, road_graph):
    """
    Prunes the graph by assigning an infinite Big-M penalty cost to edges with
    vertical clearance lower than the vehicle's safe height envelope.
    
    :param vehicle_profile: VehicleProfile instance.
    :param road_graph: dict representing adjacency list of the graph.
           Example: { 'A': {'B': {'cost': 10, 'vertical_clearance': 4.5, 'hazard_coordinates': (lat, lon)}} }
    :return: tuple (cleared_subgraph, pruned_hazards_log)
    """
    safe_height = vehicle_profile.safe_envelope
    cleared_subgraph = copy.deepcopy(road_graph)
    pruned_hazards_log = []
    
    for origin, destinations in cleared_subgraph.items():
        for destination, attributes in destinations.items():
            clearance = attributes.get('vertical_clearance')
            
            if clearance is not None and clearance < safe_height:
                # Apply infinite Big-M traversal penalty
                attributes['cost'] = float('inf')
                
                # Log hazard coordinates
                coords = attributes.get('hazard_coordinates')
                if coords:
                    pruned_hazards_log.append({
                        'edge': f"{origin}->{destination}",
                        'coordinates': coords,
                        'clearance': clearance,
                        'required_safe_height': safe_height
                    })
                    
    return cleared_subgraph, pruned_hazards_log
