import copy

class BrakingHardware:
    def __init__(self, loaded_tonnage, hardware_type='drum'):
        """
        Initializes the vehicle's braking hardware profile.
        
        :param loaded_tonnage: Vehicle's gross weight in tonnes.
        :param hardware_type: Type of secondary braking system ('drum', 'retarder', 'exhaust').
        """
        self.loaded_tonnage = loaded_tonnage
        self.hardware_type = hardware_type

def assess_thermal_stress(braking_hardware, road_graph):
    """
    Evaluates topographic brake stress on steep descents.
    Tags routes exceeding 400°C with mandatory stepped-descent checkpoints.
    
    :param braking_hardware: BrakingHardware instance.
    :param road_graph: dict representing adjacency list of the graph.
           Example: { 'A': {'B': {'cost': 10, 'elevation_drop_m': 500, 'slope_distance_m': 5000}} }
    :return: thermal-safe tagged subgraph
    """
    tagged_subgraph = copy.deepcopy(road_graph)
    
    # Constants for simplified thermal physics model
    GRAVITY = 9.81
    BASE_AMBIENT_TEMP = 30.0 # Starting temp of brakes in Celsius
    THERMAL_MASS_CONSTANT = 3.0 # Modeled coefficient mapping Megajoules to Temp Rise
    COOLING_FACTOR_PER_METER = 0.1 # Cooling effect over distance
    
    for origin, destinations in tagged_subgraph.items():
        for destination, attributes in destinations.items():
            elevation_drop = attributes.get('elevation_drop_m')
            slope_dist = attributes.get('slope_distance_m')
            
            if elevation_drop and elevation_drop > 0 and slope_dist:
                # Potential Energy converted to braking heat (E = mgh)
                energy_joules = (braking_hardware.loaded_tonnage * 1000) * GRAVITY * elevation_drop
                
                # Apply hardware multipliers
                # Engine Retarders absorb ~80% of braking energy dynamically
                if braking_hardware.hardware_type == 'retarder':
                    energy_to_drums = energy_joules * 0.20
                elif braking_hardware.hardware_type == 'exhaust':
                    energy_to_drums = energy_joules * 0.60
                else: # Default 'drum' (friction brakes absorb 100% of the load)
                    energy_to_drums = energy_joules
                    
                # Calculate raw heat buildup in Megajoules
                temp_rise = (energy_to_drums / 1_000_000) * THERMAL_MASS_CONSTANT
                
                # Subtract convective cooling over the descent distance
                cooling = slope_dist * COOLING_FACTOR_PER_METER
                
                final_temp = BASE_AMBIENT_TEMP + max(0, temp_rise - cooling)
                
                if final_temp > 400.0:
                    # Tag the hazardous route
                    attributes['mandatory_stepped_descent'] = True
                    attributes['retarder_zone'] = True
                    attributes['estimated_drum_temp'] = round(final_temp, 1)
                    
                    # Lightly penalize the route cost to discourage usage if safer routes exist
                    attributes['cost'] += 50
                else:
                    attributes['mandatory_stepped_descent'] = False
                    attributes['retarder_zone'] = False
                    attributes['estimated_drum_temp'] = round(final_temp, 1)
                    
    return tagged_subgraph
