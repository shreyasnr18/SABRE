import math

class FreightStabilityProfile:
    def __init__(self, track_width_meters, cog_height_meters):
        """
        Initializes the dynamic payload stability profile.
        
        :param track_width_meters: Distance between the left and right wheels (e.g., 2.5m).
        :param cog_height_meters: Height of the center of gravity (CoG). 
                                  Top-heavy containers have exceptionally high CoGs.
        """
        self.track_width_meters = track_width_meters
        self.cog_height_meters = cog_height_meters

def generate_curve_advisories(stability_profile, route_geometry):
    """
    Calculates dynamic roll-stability thresholds for approaching highway interchange loops and curves.
    Generates HUD speed advisories (km/h) specifically calibrated for top-heavy container freight
    to prompt deceleration and prevent lateral centrifugal rollovers.
    
    :param stability_profile: FreightStabilityProfile instance.
    :param route_geometry: dict representing sequential curves or road segments.
           Example: { 'Curve_1': {'radius_meters': 50, 'current_speed_limit': 60} }
    :return: dict mapping segments to maximum safe advisory speeds (km/h)
    """
    GRAVITY = 9.81
    
    # Max lateral acceleration before tipping (Static Rollover Threshold)
    # SRT = (t / 2h) * g
    t = stability_profile.track_width_meters
    h = stability_profile.cog_height_meters
    
    # Safe lateral acceleration incorporates a conservative 0.6x safety margin 
    # to account for dynamic load shifting, sloshing (for tankers), or suspension sway
    safe_lateral_accel = (t / (2.0 * h)) * GRAVITY * 0.6
    
    advisories = {}
    
    for segment, attributes in route_geometry.items():
        radius = attributes.get('radius_meters')
        posted_limit = attributes.get('current_speed_limit', 100)
        
        if radius:
            # v^2 / r = a  =>  v = sqrt(a * r)
            # v is in meters/second. Convert to km/h by multiplying by 3.6
            max_safe_speed_ms = math.sqrt(safe_lateral_accel * radius)
            max_safe_speed_kmh = max_safe_speed_ms * 3.6
            
            # The HUD advisory should never exceed the legal posted limit
            advisories[segment] = {
                'advisory_speed_kmh': round(min(max_safe_speed_kmh, posted_limit), 1),
                'rollover_risk': max_safe_speed_kmh < posted_limit
            }
        else:
            # Straight segments just mirror the posted limit
            advisories[segment] = {
                'advisory_speed_kmh': posted_limit,
                'rollover_risk': False
            }
            
    return advisories
