import requests
import networkx as nx
import math
import re

OVERPASS_URL = "http://overpass-api.de/api/interpreter"

def fetch_real_world_corridor(bbox: tuple):
    """
    Queries all drivable ways within a bounding box from the Overpass API.
    Transforms raw OSM ways and nodes into a structured, SABRE-compatible NetworkX graph.
    
    :param bbox: tuple of (south, west, north, east)
    """
    south, west, north, east = bbox
    
    # Query builder for drivable highways
    query = f"""
    [out:json][timeout:25];
    (
      way["highway"~"motorway|trunk|primary|secondary|tertiary"]({south},{west},{north},{east});
    );
    out body;
    >;
    out skel qt;
    """
    
    print(f"Fetching Overpass data for bounding box: {bbox}...")
    response = requests.post(OVERPASS_URL, data={'data': query})
    
    if response.status_code != 200:
        raise Exception(f"Overpass API error: HTTP {response.status_code}")
        
    data = response.json()
    print(f"Data retrieved! Parsing {len(data.get('elements', []))} elements...")
    
    return parse_osm_to_sabre_graph(data)

def parse_osm_to_sabre_graph(osm_data: dict) -> nx.DiGraph:
    """
    SABRE Feature Normalizer
    Parses OpenStreetMap tags and normalizes them into kinematic physics inputs.
    """
    G = nx.DiGraph()
    
    # Extract nodes for coordinate referencing
    nodes = {}
    for element in osm_data.get('elements', []):
        if element['type'] == 'node':
            nodes[element['id']] = (element['lat'], element['lon'])
            
    # Extract ways and build edges
    for element in osm_data.get('elements', []):
        if element['type'] == 'way':
            tags = element.get('tags', {})
            way_nodes = element.get('nodes', [])
            
            # --- Feature Normalizer: Maxheight (Big-M Clearance) ---
            maxheight_str = tags.get('maxheight', '')
            maxheight = 5.0 # Default clear height
            if maxheight_str:
                match = re.search(r"([\d\.]+)", maxheight_str)
                if match:
                    maxheight = float(match.group(1))
                    
            # --- Feature Normalizer: Width & Lanes ---
            width_str = tags.get('width', '')
            lanes_str = tags.get('lanes', '')
            width = 4.0 # Default for single-lane unclassified
            if width_str:
                match = re.search(r"([\d\.]+)", width_str)
                if match:
                    width = float(match.group(1))
            else:
                if lanes_str and lanes_str.isdigit():
                    width = float(lanes_str) * 3.5 # Standard 3.5m lane multiplier
            
            # --- Feature Normalizer: Incline (Gradient Feasibility) ---
            incline_str = tags.get('incline', '')
            incline_deg = 0.0
            if incline_str:
                match = re.search(r"(-?[\d\.]+)", incline_str)
                if match:
                    inc_val = float(match.group(1))
                    if "%" in incline_str or abs(inc_val) > 25:
                        # Convert percentage to degrees (θ=arctan(incline/100))
                        incline_deg = math.degrees(math.atan(inc_val / 100.0))
                    else:
                        incline_deg = inc_val # Assume it's already in degrees
                        
            # --- Feature Normalizer: Surface to IRI (Roughness) ---
            surface = tags.get('surface', '').lower()
            smoothness = tags.get('smoothness', '').lower()
            iri = 3.0 # Default baseline
            
            if 'asphalt' in surface or 'paved' in surface:
                iri = 2.0
            if 'unpaved' in surface or 'gravel' in surface or 'dirt' in surface:
                iri = 8.0
                
            if smoothness == 'excellent':
                iri -= 1.0
            elif smoothness in ['bad', 'very_bad', 'horrible']:
                iri += 4.0
                
            # Traffic calming & HGV parameters
            traffic_calming = tags.get('traffic_calming', 'no')
            hgv = tags.get('hgv', 'yes')
            
            # Build Graph Edges
            for i in range(len(way_nodes) - 1):
                u = way_nodes[i]
                v = way_nodes[i+1]
                
                if u not in nodes or v not in nodes:
                    continue
                    
                edge_attrs = {
                    "maxheight": maxheight,
                    "width": width,
                    "incline_deg": incline_deg,
                    "iri": max(0.5, iri),
                    "traffic_calming": traffic_calming,
                    "hgv_allowed": hgv,
                    "osmid": element['id']
                }
                
                # Add forward edge
                G.add_edge(u, v, **edge_attrs)
                
                # Assume two-way unless oneway=yes
                oneway = tags.get('oneway', 'no')
                if oneway != 'yes':
                    G.add_edge(v, u, **edge_attrs)
                    
    # Attach coordinates to nodes for geospatial processing
    nx.set_node_attributes(G, nodes, 'coords')
    
    print(f"NetworkX Graph successfully generated: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges.")
    return G

if __name__ == "__main__":
    # Test execution for Bengaluru Industrial Corridor (Peenya to Whitefield approx BBox)
    # BBox format: (south, west, north, east)
    test_bbox = (12.95, 77.50, 13.05, 77.75)
    G = fetch_real_world_corridor(test_bbox)
    print("Sample Edge Data:", list(G.edges(data=True))[:1])
