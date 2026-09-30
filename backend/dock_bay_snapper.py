class EnterpriseLogisticsDatabase:
    def __init__(self):
        # Maps POI names/IDs to their designated heavy-vehicle rear loading docks
        self.verified_docks = {}
        
    def add_dock(self, poi_id, dock_coordinates):
        """
        Registers a verified commercial logistics gate or rear loading bay.
        
        :param poi_id: String identifier of the commercial Point of Interest.
        :param dock_coordinates: Tuple (lat, lon) of the heavy-vehicle check-in lane.
        """
        self.verified_docks[poi_id] = dock_coordinates

def snap_to_dock_bay(poi_id, requested_coordinates, enterprise_db):
    """
    Intercepts standard passenger-car POI coordinates (e.g., front consumer gates) 
    and snaps the final route destination strictly to designated heavy-vehicle rear loading docks
    to eliminate 45-minute turnaround delays.
    
    :param poi_id: Identifier of the requested POI.
    :param requested_coordinates: Original (lat, lon) from standard consumer mapping.
    :param enterprise_db: EnterpriseLogisticsDatabase instance.
    :return: Corrected (lat, lon) destination coordinates.
    """
    # If the commercial POI exists in our enterprise database, redirect the truck to the rear dock
    if poi_id in enterprise_db.verified_docks:
        return enterprise_db.verified_docks[poi_id]
    
    # Otherwise, fallback to the original requested coordinates
    return requested_coordinates
