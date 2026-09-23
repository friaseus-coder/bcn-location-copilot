import httpx
import time

lat, lon = 41.3888, 2.1590
radio_m = 400
overpass_query = f"""[out:json][timeout:10];
(
  node["amenity"~"restaurant|cafe|bar|pub|fast_food|ice_cream|food_court|pharmacy|dentist|clinic|doctors|hospital|bank|post_office"](around:{radio_m},{lat},{lon});
  node["shop"](around:{radio_m},{lat},{lon});
  node["office"~"lawyer|notary|accountant|insurance|real_estate|financial|consulting|telecommunication|architect|company|coworking"](around:{radio_m},{lat},{lon});
  node["leisure"~"fitness_centre|sports_centre"](around:{radio_m},{lat},{lon});
);
out center 120;
"""

headers = {
    "User-Agent": "BCNLocationCopilot/3.0 (underwriting@bcncopilot.local)",
    "Accept": "application/json"
}

mirrors = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
]

for m in mirrors:
    t0 = time.time()
    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.post(m, data={"data": overpass_query}, headers=headers)
            print(f"Mirror: {m} -> Status: {resp.status_code}, Length: {len(resp.text)}, Time: {time.time()-t0:.2f}s")
            if resp.status_code == 200:
                elements = resp.json().get("elements", [])
                print(f"   -> Elements: {len(elements)}")
    except Exception as e:
        print(f"Mirror: {m} -> Error: {e} ({time.time()-t0:.2f}s)")
