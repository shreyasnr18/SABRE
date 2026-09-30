import copy

def filter_carriageway_surface(gvw_tonnes, road_graph):
    """
    Prunes narrow or unpaved road segments for heavy vehicles (>= 16 tonnes).
    
    :param gvw_tonnes: Gross Vehicle Weight in tonnes.
    :param road_graph: dict representing adjacency list of the graph.
           Example: { 'A': {'B': {'cost': 10, 'width': 7.5, 'is_paved': True}} }
    :return: width-validated subgraph
    """
    validated_subgraph = copy.deepcopy(road_graph)
    
    # Only enforce if GVW is 16 tonnes or greater
    if gvw_tonnes < 16.0:
        return validated_subgraph
        
    for origin, destinations in validated_subgraph.items():
        for destination, attributes in destinations.items():
            width = attributes.get('width', 0.0)
            is_paved = attributes.get('is_paved', False)
            
            # If the road is narrower than 7.0 meters or is not paved, 
            # it is unsafe for >= 16T vehicles. Assign infinite cost.
            if width < 7.0 or not is_paved:
                attributes['cost'] = float('inf')
                
    return validated_subgraph
