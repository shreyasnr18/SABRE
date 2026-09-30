import urllib.request
import json
import time

class EnvironmentConnector:
    _cache = {}
    _CACHE_TTL = 300 # 5 minutes

    @classmethod
    def get_live_weather(cls, lat=12.97, lon=77.59):
        cache_key = f"{round(lat, 2)}_{round(lon, 2)}"
        now = time.time()
        
        if cache_key in cls._cache:
            entry = cls._cache[cache_key]
            if now - entry['timestamp'] < cls._CACHE_TTL:
                return entry['data']
                
        # Fetch from open-meteo
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,precipitation&timezone=auto"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'SABRE-Engine/1.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                
            current = data.get("current", {})
            temp = current.get("temperature_2m", 25.0)
            precip = current.get("precipitation", 0.0)
            
            result = {
                "temperature_c": temp,
                "precipitation_mmh": precip,
                "flood_risk": "HIGH" if precip > 25.0 else "LOW",
                "cold_chain_heat_load": "SEVERE" if temp > 35.0 else ("MODERATE" if temp > 25.0 else "LOW")
            }
            
            cls._cache[cache_key] = {
                "timestamp": now,
                "data": result
            }
            return result
        except Exception as e:
            print(f"Error fetching live weather: {e}")
            # Fallback mock data
            return {
                "temperature_c": 28.5,
                "precipitation_mmh": 0.0,
                "flood_risk": "LOW",
                "cold_chain_heat_load": "MODERATE"
            }
