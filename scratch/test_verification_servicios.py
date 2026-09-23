import sys
import os
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_servicios_barcelona():
    print("\n--- Test 1: /api/servicios-cercanos en Barcelona (Balmes/Catalunya) ---")
    resp = client.get("/api/servicios-cercanos", params={"lat": 41.387, "lon": 2.169, "minutos": 5})
    assert resp.status_code == 200, f"Error {resp.status_code}: {resp.text}"
    data = resp.json()
    total = data.get("total", 0)
    servicios = data.get("servicios", [])
    conteo = data.get("conteo", {})
    print(f"Total servicios devueltos: {total}")
    print(f"Conteo por categoria: {json.dumps(conteo, indent=2, ensure_ascii=False)}")
    assert total > 10, f"Se esperaban más de 10 servicios en centro de Barcelona, se obtuvieron {total}"
    assert len(servicios) == total
    # Check sample service structure
    s0 = servicios[0]
    for key in ["id", "nombre", "direccion", "categoria", "categoriaNombre", "subtipo", "distancia_m", "minutos", "lat", "lon", "titularidad"]:
        assert key in s0, f"Falta clave {key} en servicio: {s0}"
    print(f"Muestra de servicio 1: {s0['nombre']} [{s0['categoriaNombre']}] ({s0['minutos']}, {s0['titularidad']})")

def test_servicios_fuera_barcelona():
    print("\n--- Test 2: /api/servicios-cercanos fuera de Barcelona (Sant Cugat del Vallès) ---")
    resp = client.get("/api/servicios-cercanos", params={"lat": 41.472, "lon": 2.086, "minutos": 7})
    assert resp.status_code == 200, f"Error {resp.status_code}: {resp.text}"
    data = resp.json()
    total = data.get("total", 0)
    servicios = data.get("servicios", [])
    conteo = data.get("conteo", {})
    print(f"Total servicios devueltos en Sant Cugat: {total}")
    print(f"Conteo por categoria: {json.dumps(conteo, indent=2, ensure_ascii=False)}")
    assert total > 5, f"Se esperaban servicios en Sant Cugat, se obtuvieron {total}"
    assert len(servicios) == total
    print(f"Muestra de servicio Sant Cugat: {servicios[0]['nombre']} [{servicios[0]['categoriaNombre']}] ({servicios[0]['minutos']})")

def test_analizar_payload_includes_servicios():
    print("\n--- Test 3: /api/analizar incluye servicios_cercanos y conteo_servicios ---")
    resp = client.get("/api/analizar", params={"direccion": "Carrer de Balmes 12, Barcelona", "tipo_activo": "Residencial"})
    assert resp.status_code == 200, f"Error {resp.status_code}: {resp.text}"
    data = resp.json()
    assert "servicios_cercanos" in data, "No se encontró 'servicios_cercanos' en la respuesta de /api/analizar"
    assert "conteo_servicios" in data, "No se encontró 'conteo_servicios' en la respuesta de /api/analizar"
    servicios = data["servicios_cercanos"]
    conteo = data["conteo_servicios"]
    print(f"Total servicios_cercanos en /api/analizar: {len(servicios)}")
    print(f"Conteo servicios en /api/analizar: {json.dumps(conteo, indent=2, ensure_ascii=False)}")
    assert len(servicios) > 0, "servicios_cercanos no debería estar vacío"

if __name__ == "__main__":
    test_servicios_barcelona()
    test_servicios_fuera_barcelona()
    test_analizar_payload_includes_servicios()
    print("\n>>> ¡TODOS LOS TESTS DE SERVICIOS PASARON EXITOSAMENTE! <<<")
