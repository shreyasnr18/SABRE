import copy
import math

class PowertrainEmissions:
    def __init__(self, engine_type='bs6_diesel'):
        """
        Initializes the vehicle's powertrain emissions profile.
        
        :param engine_type: Categorical engine type (e.g., 'bs6_diesel', 'bs4_diesel', 'ev', 'cng').
        """
        self.engine_type = engine_type

def penalize_kinetic_idling(emissions_profile, road_graph):
    """
    Evaluates stop-and-go congestion tailored for BS-VI diesel powertrains.
    Applies an exponential cost multiplier to corridors where traffic crawls below 5 km/h
    for extended intervals to prevent DPF (Diesel Particulate Filter) soot accumulation 
    and avoid engine limp mode.
    
    :param emissions_profile: PowertrainEmissions instance.
    :param road_graph: dict representing adjacency list of the graph.
           Example: { 'A': {'B': {'cost': 10, 'live_speed_kmh': 3.5, 'delay_minutes': 15}} }
    :return: soot-safe optimized subgraph
    """
    optimized_subgraph = copy.deepcopy(road_graph)
    
    # Modern DPF regeneration requires steady exhaust heat (free-flowing speeds)
    is_bs6_diesel = emissions_profile.engine_type == 'bs6_diesel'
    
    for origin, destinations in optimized_subgraph.items():
        for destination, attributes in destinations.items():
            base_cost = attributes.get('cost', 1.0)
            live_speed = attributes.get('live_speed_kmh', 60.0) # default free-flowing
            delay_minutes = attributes.get('delay_minutes', 0)
            
            # Detect corridors where traffic crawls at speeds below 5 km/h
            if live_speed < 5.0 and delay_minutes >= 10:
                if is_bs6_diesel:
                    # Exponential cost multiplier to actively force reroutes away from choke-points
                    # Example: 10 minutes crawling = e^(10 / 10) = ~2.7x multiplier
                    # Example: 30 minutes crawling = e^(30 / 10) = ~20.0x multiplier
                    dpf_clog_multiplier = math.exp(delay_minutes / 10.0)
                    attributes['cost'] = base_cost * dpf_clog_multiplier
                    attributes['dpf_hazard_flagged'] = True
                else:
                    # Standard vehicles (e.g., EV/CNG/older diesels) just suffer a linear time penalty
                    # Example: 10 minutes delay = base_cost + 10
                    attributes['cost'] = base_cost + delay_minutes
                    attributes['dpf_hazard_flagged'] = False
            else:
                attributes['dpf_hazard_flagged'] = False
                
    return optimized_subgraph
