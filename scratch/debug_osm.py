import httpx
import time

lat, lon = 41.386465, 2.166792
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
    "https://z.overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass-api.de/api/interpreter"
]
for m in mirrors:
    t0 = time.time()
    try:
        r = httpx.post(m, data={"data": overpass_query}, headers=headers, timeout=6.0)
        print(m, "Status:", r.status_code, "Len:", len(r.text), f"({time.time()-t0:.2f}s)")
        if r.status_code == 200:
            print("Elements:", len(r.json().get("elements", [])))
    except Exception as e:
        print(m, "Err:", e)
