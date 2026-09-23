import math
from typing import List, Dict, Any, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees)
    """
    R = 6371.0  # Earth radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return round(distance, 2)

def find_nearest_center(lat: float, lng: float, centers: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not centers:
        return None
    
    nearest = None
    min_dist = float('inf')

    for center in centers:
        geo = center.get("geo_location") or {}
        c_lat = geo.get("lat")
        c_lng = geo.get("lng")
        if c_lat is not None and c_lng is not None:
            dist = haversine_distance(lat, lng, float(c_lat), float(c_lng))
            if dist < min_dist:
                min_dist = dist
                nearest = {**center, "distance_km": dist}

    return nearest
