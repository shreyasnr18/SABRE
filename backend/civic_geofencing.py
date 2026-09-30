import copy
from datetime import datetime, time

class CivicRegulations:
    def __init__(self, curfew_windows):
        """
        Initializes municipal traffic gazette regulations.
        
        :param curfew_windows: List of tuples representing active curfew hours (start_time, end_time)
               e.g., [(time(7, 0), time(11, 0)), (time(16, 0), time(22, 0))]
        """
        self.curfew_windows = curfew_windows
        
    def is_in_curfew(self, arrival_dt):
        """
        Checks if a given arrival datetime falls within any active curfew window.
        """
        arrival_time = arrival_dt.time()
        for start_t, end_t in self.curfew_windows:
            if start_t <= arrival_time <= end_t:
                return True
        return False

def enforce_civic_geofence(civic_regs, road_graph, edge_arrival_times):
    """
    Evaluates candidate routes against municipal traffic curfews.
    Prunes restricted urban corridors during active curfew hours to prevent automated ANPR fines.
    Automatically diverts trucks to outer ring bypasses or scheduled hold-points.
    
    :param civic_regs: CivicRegulations instance.
    :param road_graph: dict representing adjacency list of the graph.
           Example: { 'A': {'B': {'cost': 10, 'in_city_limits': True, 'is_hold_point': False}} }
    :param edge_arrival_times: dict mapping edge identifier "Origin->Destination" to datetime objects representing predicted arrival time.
    :return: curfew-compliant subgraph
    """
    compliant_subgraph = copy.deepcopy(road_graph)
    
    for origin, destinations in compliant_subgraph.items():
        for destination, attributes in destinations.items():
            in_city_limits = attributes.get('in_city_limits', False)
            is_hold_point = attributes.get('is_hold_point', False)
            
            edge_key = f"{origin}->{destination}"
            arrival_dt = edge_arrival_times.get(edge_key)
            
            if in_city_limits and arrival_dt and civic_regs.is_in_curfew(arrival_dt):
                if not is_hold_point:
                    # Vehicle arrives in city limits during peak curfew -> Prune route (infinite cost)
                    attributes['cost'] = float('inf')
                else:
                    # Vehicle arrives at an industrial perimeter rest stop -> Flag for hold
                    attributes['hold_required'] = True
                    attributes['penalty_fines'] = 0
            else:
                attributes['hold_required'] = False
                
    return compliant_subgraph
