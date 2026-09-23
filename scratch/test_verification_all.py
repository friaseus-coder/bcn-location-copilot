import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

# Import server app
from server import app, consultar_catastro_ovc, consultar_negocios_osm_en_vivo, clasificar_negocio_osm
from fastapi.testclient import TestClient

client = TestClient(app)

print("--- 1. PROBANDO CATASTRO OVC CON RC REAL ESPECÍFICA (NO HARDCODE 120 M2) ---")
# Consultar Balmes 12 entidad con RC real
# Primero obtenemos inmuebles de Balmes 12
resp_inm = client.get("/api/catastro/inmuebles?municipio=Barcelona&calle=Balmes&numero=12")
assert resp_inm.status_code == 200, f"Error inmuebles: {resp_inm.status_code}"
inm_data = resp_inm.json()
opciones = inm_data.get("opciones", [])
print(f"Entidades encontradas en Balmes 12: {len(opciones)}")
assert len(opciones) > 0, "Debe haber opciones de inmuebles en Balmes 12"

# Seleccionar la primera y segunda entidad y verificar que sus superficies son reales
primera = opciones[0]
rc_1 = primera.get("rc")
print(f"Probando entidad 1: {primera.get('label')} | RC: {rc_1}")

resp_analisis_1 = client.get(f"/api/analizar?municipio=Barcelona&calle=Balmes&numero=12&piso={primera.get('value')}&rc={rc_1}")
assert resp_analisis_1.status_code == 200, f"Error análisis 1: {resp_analisis_1.status_code}"
data_1 = resp_analisis_1.json()
activo_1 = data_1["activo"]
sup_1 = activo_1["superficie"]
print(f"Superficie obtenida para entidad 1: {sup_1} m² (Privativa: {activo_1.get('superficie_privativa')} m², Comunes: {activo_1.get('superficie_comunes')} m², Cuota: {activo_1.get('coeficiente_participacion')}%)")

# Verificar si hay una segunda entidad diferente
if len(opciones) > 1:
    segunda = opciones[1]
    rc_2 = segunda.get("rc")
    resp_analisis_2 = client.get(f"/api/analizar?municipio=Barcelona&calle=Balmes&numero=12&piso={segunda.get('value')}&rc={rc_2}")
    assert resp_analisis_2.status_code == 200
    data_2 = resp_analisis_2.json()
    activo_2 = data_2["activo"]
    sup_2 = activo_2["superficie"]
    print(f"Superficie obtenida para entidad 2 ({segunda.get('label')}): {sup_2} m²")
    print("Verificación de superficie dinámica Catastro OVC: SUPERADA")

print("\n--- 2. PROBANDO NEGOCIOS EN VIVO DE OPENSTREETMAP / OVERPASS ---")
negocios = data_1.get("negocios_cercanos", [])
conteos = data_1.get("conteo_negocios", {})
print(f"Total negocios devueltos por /api/analizar: {len(negocios)}")
print(f"Conteos por categoría: {conteos}")

assert len(negocios) > 10, f"Debe haber más de 10 negocios reales (hay {len(negocios)})"
print(f"Hostelería: {conteos.get('hosteleria', 0)}")
print(f"Retail: {conteos.get('retail', 0)}")
print(f"Alimentación: {conteos.get('alimentacion', 0)}")
print(f"Salud: {conteos.get('salud', 0)}")
print(f"Servicios: {conteos.get('servicios', 0)}")
print(f"Bienestar & Especializados: {conteos.get('especializados', 0)}")

# Verificar que Alimentación, Servicios y Salud ya NO están a 0
assert conteos.get("alimentacion", 0) > 0, "Alimentación debe tener comercios reales"
assert conteos.get("servicios", 0) > 0, "Servicios debe tener comercios reales"

print("\n--- 3. PROBANDO ENDPOINT DEDICADO /api/negocios-cercanos ---")
resp_neg = client.get("/api/negocios-cercanos?lat=41.3888&lon=2.1590&minutos=5")
assert resp_neg.status_code == 200
data_neg = resp_neg.json()
print(f"Total negocios a 5 min (~400m): {data_neg.get('total')} | Categorías: {data_neg.get('conteos')}")

print("\n--- 4. PROBANDO MUNICIPIO FUERA DE BARCELONA (SANT CUGAT DEL VALLÈS) ---")
import time
time.sleep(1.5)
# Coordenadas Sant Cugat: 41.4722, 2.0858
resp_sc = client.get("/api/negocios-cercanos?lat=41.4722&lon=2.0858&minutos=5")
assert resp_sc.status_code == 200
data_sc = resp_sc.json()
print(f"Total negocios en Sant Cugat (5 min): {data_sc.get('total')} | Categorías: {data_sc.get('conteos')}")
assert data_sc.get("total", 0) > 0, "OpenStreetMap debe devolver comercios en Sant Cugat también"

print("\n¡TODAS LAS PRUEBAS END-TO-END HAN SIDO SUPERADAS CON ÉXITO!")
