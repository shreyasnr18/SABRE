import copy

class CargoFragility:
    def __init__(self, is_shock_sensitive=False):
        """
        Initializes the cargo classification profile.
        
        :param is_shock_sensitive: True for fragile electronics, pharmaceuticals, breakables, eggs, etc.
        """
        self.is_shock_sensitive = is_shock_sensitive

def penalize_roughness(cargo, road_graph):
    """
    Evaluates road roughness based on IRI scores and speed humps.
    Dynamically increases traversal costs for fragile cargo on bumpy roads
    to prevent leaf-spring fractures and cargo breakage.
    
    :param cargo: CargoFragility instance.
    :param road_graph: dict representing adjacency list of the graph.
           Example: { 'A': {'B': {'cost': 10, 'iri_score': 3.5, 'has_speed_humps': True}} }
    :return: vibration-optimized subgraph
    """
    optimized_subgraph = copy.deepcopy(road_graph)
    
    for origin, destinations in optimized_subgraph.items():
        for destination, attributes in destinations.items():
            base_cost = attributes.get('cost', 1.0)
            iri_score = attributes.get('iri_score', 1.0) # Baseline smooth highway IRI is ~1.0
            has_speed_humps = attributes.get('has_speed_humps', False)
            
            # Base penalty for durable goods based purely on roughness (represents minor mechanical wear/tear)
            roughness_multiplier = 1.0 + (max(0.0, iri_score - 1.0)) * 0.1
            
            if cargo.is_shock_sensitive:
                # Heavy penalty for fragile cargo attempting to navigate rough roads
                roughness_multiplier = 1.0 + (max(0.0, iri_score - 1.0)) * 2.0
                
                # Extreme penalty for non-standard tabletop speed humps (e.g. 20cm breakers)
                if has_speed_humps:
                    roughness_multiplier += 10.0
                    
            # Apply dynamic cost weighting
            attributes['cost'] = base_cost * roughness_multiplier
            
    return optimized_subgraph
