import math
import httpx
from typing import List, Optional, Tuple, Dict, Any

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth in kilometers.
    """
    R = 6371.0  # Earth radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return round(distance, 2)

def get_bounding_box(lat: float, lon: float, radius_km: float) -> Tuple[float, float, float, float]:
    """
    Calculate min_lat, max_lat, min_lon, max_lon for rough SQL indexing/bounding box.
    """
    R = 6371.0
    lat_delta = (radius_km / R) * (180 / math.pi)
    lon_delta = (radius_km / (R * math.cos(math.radians(lat)))) * (180 / math.pi)
    
    return (
        lat - lat_delta,
        lat + lat_delta,
        lon - lon_delta,
        lon + lon_delta
    )

async def geocode_query(query: str) -> List[Dict[str, Any]]:
    """
    Geocode a text query (address/area/city) using OpenStreetMap Nominatim.
    """
    url = "https://nominatim.openstreetmap.org/search"
    headers = {
        "User-Agent": "PerchRentApp/1.0 (contact@perch.local)"
    }
    params = {
        "q": query,
        "format": "json",
        "addressdetails": 1,
        "limit": 5
    }
    
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            response = await client.get(url, params=params, headers=headers)
            if response.status_code == 200:
                results = response.json()
                parsed = []
                for item in results:
                    addr = item.get("address", {})
                    city = addr.get("city") or addr.get("town") or addr.get("state_district") or addr.get("state") or ""
                    locality = addr.get("suburb") or addr.get("neighbourhood") or addr.get("road") or ""
                    parsed.append({
                        "display_name": item.get("display_name"),
                        "latitude": float(item.get("lat")),
                        "longitude": float(item.get("lon")),
                        "city": city,
                        "locality": locality
                    })
                return parsed
    except Exception as e:
        print(f"Geocoding error: {e}")
    return []

async def reverse_geocode(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """
    Reverse geocode coordinates to get address/locality name.
    """
    url = "https://nominatim.openstreetmap.org/reverse"
    headers = {
        "User-Agent": "PerchRentApp/1.0 (contact@perch.local)"
    }
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "addressdetails": 1
    }
    
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            response = await client.get(url, params=params, headers=headers)
            if response.status_code == 200:
                data = response.json()
                addr = data.get("address", {})
                city = addr.get("city") or addr.get("town") or addr.get("state_district") or addr.get("state") or ""
                locality = addr.get("suburb") or addr.get("neighbourhood") or addr.get("road") or ""
                return {
                    "display_name": data.get("display_name"),
                    "city": city,
                    "locality": locality
                }
    except Exception as e:
        print(f"Reverse geocode error: {e}")
    return None
