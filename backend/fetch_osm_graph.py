import urllib.request
import urllib.parse
import json
import csv
import math
import os

# Haversine formula to calculate distance between two lat/lon points
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)
    
    a = math.sin(dLat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dLon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def fetch_and_build_graph():
    print("Querying Overpass API for real Bangalore road network...")
    # Bounding box around central Bangalore
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = """
    [out:json][timeout:60];
    (
      way["highway"~"primary|secondary|tertiary|trunk"](12.94,77.56,12.99,77.63);
    );
    (._;>;);
    out body;
    """
    
    req = urllib.request.Request(overpass_url, data=overpass_query.encode('utf-8'))
    req.add_header('User-Agent', 'SABRE-Engine-Fetcher/1.0')
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching OSM data: {e}")
        return

    nodes = {}
    ways = []
    
    for element in data['elements']:
        if element['type'] == 'node':
            nodes[element['id']] = {
                'lat': element['lat'],
                'lon': element['lon']
            }
        elif element['type'] == 'way':
            ways.append(element)
            
    print(f"Downloaded {len(nodes)} nodes and {len(ways)} ways.")
    
    # Export Nodes to CSV
    nodes_path = os.path.join(os.path.dirname(__file__), 'routing_engine', 'graph_nodes.csv')
    edges_path = os.path.join(os.path.dirname(__file__), 'routing_engine', 'graph_edges.csv')
    
    with open(nodes_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['node_id', 'lat', 'lon', 'name'])
        for node_id, node_data in nodes.items():
            writer.writerow([node_id, node_data['lat'], node_data['lon'], f"Node_{node_id}"])
            
    # Process ways to create edges
    edges = []
    import random
    
    for way in ways:
        way_nodes = way.get('nodes', [])
        tags = way.get('tags', {})
        oneway = tags.get('oneway', 'no') == 'yes'
        maxheight = tags.get('maxheight', 'none')
        
        # Parse maxheight or randomly simulate some constraints for realism
        height_clearance = 5.5 # Default NHAI standard
        if maxheight != 'none' and maxheight.replace('.', '', 1).isdigit():
            height_clearance = float(maxheight)
        else:
            # Inject simulated real-world risks (5% chance of low bridge, 5% chance of HAZMAT ban)
            if random.random() < 0.05:
                height_clearance = random.choice([3.2, 3.5, 3.8, 4.0])
                
        allows_hazmat = 1
        if tags.get('highway') == 'residential' or random.random() < 0.05:
            allows_hazmat = 0
            
        for i in range(len(way_nodes) - 1):
            n1 = way_nodes[i]
            n2 = way_nodes[i+1]
            if n1 in nodes and n2 in nodes:
                dist = haversine(nodes[n1]['lat'], nodes[n1]['lon'], nodes[n2]['lat'], nodes[n2]['lon'])
                edges.append([n1, n2, dist, height_clearance, allows_hazmat])
                if not oneway:
                    edges.append([n2, n1, dist, height_clearance, allows_hazmat])
                    
    with open(edges_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['from_node', 'to_node', 'cost_km', 'height_clearance', 'allows_hazmat'])
        for edge in edges:
            writer.writerow(edge)
            
    print(f"Successfully built graph! Exported {len(nodes)} nodes and {len(edges)} edges to routing_engine directory.")

if __name__ == "__main__":
    fetch_and_build_graph()
