import httpx
import time

lat, lon = 41.386465, 2.166792
radio_m = 400
overpass_query = f"""[out:json][timeout:10];
(
  node["amenity"~"school|kindergarten|college|university|hospital|clinic|doctors|pharmacy|parking|parking_entrance|place_of_worship|library|community_centre|police|fire_station|townhall|post_office"](around:{radio_m},{lat},{lon});
  node["leisure"~"park|garden|playground|sports_centre|swimming_pool"](around:{radio_m},{lat},{lon});
  node["tourism"~"museum|gallery"](around:{radio_m},{lat},{lon});
);
out center 80;
"""

headers = {
    "User-Agent": "BCNLocationCopilot/3.0 (underwriting@bcncopilot.local)",
    "Accept": "application/json"
}

t0 = time.time()
r = httpx.post("https://z.overpass-api.de/api/interpreter", data={"data": overpass_query}, headers=headers, timeout=5.0)
print("Status:", r.status_code, "Time:", f"{time.time()-t0:.2f}s")
if r.status_code == 200:
    elements = r.json().get("elements", [])
    print("Servicios/Equipamientos encontrados:", len(elements))
    for el in elements[:10]:
        t = el.get("tags", {})
        print(f" - {t.get('name') or t.get('amenity') or t.get('leisure')} [{t.get('amenity') or t.get('leisure')}]")
