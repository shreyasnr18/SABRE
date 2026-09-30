#define _USE_MATH_DEFINES
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <queue>
#include <cmath>
#include <limits>
#include <algorithm>
#include <fstream>
#include <sstream>

using namespace std;

// Representing a City Node
struct Node {
    string id;
    double lat;
    double lon;
    string name;
};

// Representing an Edge
struct Edge {
    string to;
    double cost;
    double height_clearance; // Max height allowed on this edge
    bool allows_hazmat;
};

// Graph Definition
unordered_map<string, Node> nodes;
unordered_map<string, vector<Edge>> adjList;

// Utility for Haversine Distance (used as heuristic in A*)
double haversine(double lat1, double lon1, double lat2, double lon2) {
    const double R = 6371.0; // Earth radius in km
    double dLat = (lat2 - lat1) * M_PI / 180.0;
    double dLon = (lon2 - lon1) * M_PI / 180.0;
    lat1 = lat1 * M_PI / 180.0;
    lat2 = lat2 * M_PI / 180.0;
    
    double a = sin(dLat/2) * sin(dLat/2) +
               sin(dLon/2) * sin(dLon/2) * cos(lat1) * cos(lat2);
    double c = 2 * atan2(sqrt(a), sqrt(1-a));
    return R * c;
}

void loadGraphFromCSV(const string& base_path) {
    string nodes_file = base_path + "graph_nodes.csv";
    string edges_file = base_path + "graph_edges.csv";
    
    ifstream nf(nodes_file);
    if (!nf.is_open()) {
        cerr << "{\"error\": \"Could not open nodes CSV: " << nodes_file << "\"}" << endl;
        exit(1);
    }
    string line;
    getline(nf, line); // header
    while (getline(nf, line)) {
        stringstream ss(line);
        string id, lat_str, lon_str, name;
        getline(ss, id, ',');
        getline(ss, lat_str, ',');
        getline(ss, lon_str, ',');
        getline(ss, name, ',');
        if(!id.empty()){
            nodes[id] = {id, stod(lat_str), stod(lon_str), name};
        }
    }
    nf.close();

    ifstream ef(edges_file);
    if (!ef.is_open()) {
        cerr << "{\"error\": \"Could not open edges CSV: " << edges_file << "\"}" << endl;
        exit(1);
    }
    getline(ef, line); // header
    while (getline(ef, line)) {
        stringstream ss(line);
        string from, to, cost_str, height_str, hazmat_str;
        getline(ss, from, ',');
        getline(ss, to, ',');
        getline(ss, cost_str, ',');
        getline(ss, height_str, ',');
        getline(ss, hazmat_str, ',');
        
        if(!from.empty() && !to.empty()) {
            adjList[from].push_back({
                to, 
                stod(cost_str), 
                stod(height_str), 
                hazmat_str == "1" || hazmat_str == "true"
            });
        }
    }
    ef.close();
}

struct State {
    string id;
    double g; // Cost from start
    double f; // g + heuristic
    
    bool operator>(const State& other) const {
        return f > other.f;
    }
};

string findShortestPath(string start, string end, string cargo_type, double truck_height, bool use_astar) {
    if (nodes.find(start) == nodes.end() || nodes.find(end) == nodes.end()) {
        return "{\"status\": \"ERROR\", \"error\": \"Invalid start or end node ID. Make sure it exists in the graph.\"}";
    }
    
    priority_queue<State, vector<State>, greater<State>> pq;
    unordered_map<string, double> min_cost;
    unordered_map<string, string> came_from;
    vector<string> bypassed_hazards;
    
    for (const auto& pair : nodes) {
        min_cost[pair.first] = numeric_limits<double>::infinity();
    }
    
    pq.push({start, 0.0, 0.0});
    min_cost[start] = 0.0;
    
    int nodes_expanded = 0;

    while (!pq.empty()) {
        State current = pq.top();
        pq.pop();
        nodes_expanded++;
        
        if (current.id == end) break;
        
        // Handle stale queue entries
        if (current.g > min_cost[current.id]) continue;
        
        for (const auto& edge : adjList[current.id]) {
            // Apply Constraints
            if (truck_height > edge.height_clearance) {
                bypassed_hazards.push_back("LOW_CLEARANCE_" + current.id + "_" + edge.to);
                continue; // Skip this edge
            }
            if (cargo_type == "HAZMAT" && !edge.allows_hazmat) {
                bypassed_hazards.push_back("RESTRICTED_HAZMAT_" + current.id + "_" + edge.to);
                continue; // Skip this edge
            }
            
            double new_g = current.g + edge.cost;
            if (new_g < min_cost[edge.to]) {
                min_cost[edge.to] = new_g;
                double h = 0.0;
                if (use_astar) {
                    h = haversine(nodes[edge.to].lat, nodes[edge.to].lon, nodes[end].lat, nodes[end].lon);
                }
                pq.push({edge.to, new_g, new_g + h});
                came_from[edge.to] = current.id;
            }
        }
    }
    
    if (min_cost[end] == numeric_limits<double>::infinity()) {
        return "{\"status\": \"ERROR\", \"error\": \"No path found satisfying physical and regulatory constraints.\"}";
    }
    
    // Reconstruct path
    vector<string> path;
    string curr = end;
    while (curr != start) {
        path.push_back(curr);
        curr = came_from[curr];
    }
    path.push_back(start);
    reverse(path.begin(), path.end());
    
    // Construct JSON Response
    string algo_name = use_astar ? "A*" : "Dijkstra";
    string json = "{\n  \"status\": \"SUCCESS\",\n  \"algorithm\": \"" + algo_name + "\",\n";
    json += "  \"nodes_expanded\": " + to_string(nodes_expanded) + ",\n";
    json += "  \"distance\": " + to_string(min_cost[end]) + ",\n  \"path\": [\n";
    for (size_t i = 0; i < path.size(); ++i) {
        Node n = nodes[path[i]];
        json += "    {\"id\": \"" + n.id + "\", \"name\": \"" + n.name + "\", \"lat\": " + to_string(n.lat) + ", \"lon\": " + to_string(n.lon) + "}";
        if (i < path.size() - 1) json += ",";
        json += "\n";
    }
    json += "  ],\n  \"bypassed_hazards\": [";
    for (size_t i = 0; i < bypassed_hazards.size(); ++i) {
        json += "\"" + bypassed_hazards[i] + "\"";
        if (i < bypassed_hazards.size() - 1) json += ", ";
    }
    json += "]\n}";
    
    return json;
}

int main(int argc, char* argv[]) {
    if (argc < 5) {
        cerr << "Usage: router.exe <START_NODE_ID> <END_NODE_ID> <CARGO_TYPE> <TRUCK_HEIGHT> [ALGO (ASTAR/DIJKSTRA)] [CSV_DIR]" << endl;
        return 1;
    }
    
    string start = argv[1];
    string end = argv[2];
    string cargo_type = argv[3];
    double truck_height = stod(argv[4]);
    
    bool use_astar = true;
    if (argc >= 6) {
        string algo = argv[5];
        if (algo == "DIJKSTRA" || algo == "Dijkstra" || algo == "dijkstra") {
            use_astar = false;
        }
    }
    
    string csv_dir = "";
    if (argc >= 7) {
        csv_dir = argv[6];
        if (csv_dir.back() != '/' && csv_dir.back() != '\\') {
            csv_dir += "/";
        }
    }
    
    loadGraphFromCSV(csv_dir);
    
    string result = findShortestPath(start, end, cargo_type, truck_height, use_astar);
    cout << result << endl;
    
    return 0;
}
