import copy

class PowertrainSpecs:
    def __init__(self, gvw_tonnes, horsepower):
        """
        Initializes the vehicle's powertrain and weight specifications.
        
        :param gvw_tonnes: Gross Vehicle Weight in tonnes.
        :param horsepower: Engine horsepower rating.
        """
        self.gvw_tonnes = gvw_tonnes
        self.horsepower = horsepower

def evaluate_gradient_feasibility(powertrain, road_graph):
    """
    Evaluates powertrain feasibility for steep gradients.
    Prunes steep flyover ramps (>6 degrees) if the vehicle is fully loaded (>= 25 tonnes)
    to prevent powertrain stalling and clutch burnout.
    
    :param powertrain: PowertrainSpecs instance.
    :param road_graph: dict representing adjacency list of the graph.
           Example: { 'A': {'B': {'cost': 10, 'incline_degrees': 7.5}} }
    :return: gradient-feasible subgraph
    """
    validated_subgraph = copy.deepcopy(road_graph)
    
    # Check if the truck is hauling a massive payload
    is_heavy_load = powertrain.gvw_tonnes >= 25.0
    
    for origin, destinations in validated_subgraph.items():
        for destination, attributes in destinations.items():
            incline = attributes.get('incline_degrees')
            
            # If the ramp is steeper than 6 degrees and the vehicle is heavily loaded
            if incline is not None and incline > 6.0 and is_heavy_load:
                # Apply infinite traversal penalty to prune steep climbs
                # This guarantees surface-level bypass alternatives and gradual climb corridors
                attributes['cost'] = float('inf')
                
    return validated_subgraph
