import copy

class ChassisSpecs:
    def __init__(self, wheelbase, overall_length, articulated_axles, turning_circle_radius):
        """
        Initializes the vehicle's chassis and steering specifications.
        
        :param wheelbase: Distance between front and rear axles (meters).
        :param overall_length: Total length of the vehicle (meters).
        :param articulated_axles: Number of articulated trailer axles.
        :param turning_circle_radius: Minimum physical radius required to execute a turn (meters).
        """
        self.wheelbase = wheelbase
        self.overall_length = overall_length
        self.articulated_axles = articulated_axles
        self.turning_circle_radius = turning_circle_radius

def validate_swept_path(chassis_specs, road_graph):
    """
    Validates turn-geometry for multi-axle freight vehicles.
    Prunes median cuts or intersection radii tighter than the vehicle's turning circle.
    
    :param chassis_specs: ChassisSpecs instance.
    :param road_graph: dict representing adjacency list of the graph.
           Example: { 'A': {'B': {'cost': 10, 'turn_radius': 15.0}} }
           Note: Edges representing straight roads should have turn_radius=None or float('inf').
    :return: turn-validated subgraph
    """
    validated_subgraph = copy.deepcopy(road_graph)
    required_radius = chassis_specs.turning_circle_radius
    
    for origin, destinations in validated_subgraph.items():
        for destination, attributes in destinations.items():
            turn_radius = attributes.get('turn_radius')
            
            # If the edge represents a tight junction/median cut that is physically too tight
            if turn_radius is not None and turn_radius < required_radius:
                # Apply infinite traversal penalty to prune the maneuver (prevents jackknifing)
                attributes['cost'] = float('inf')
                
    return validated_subgraph
