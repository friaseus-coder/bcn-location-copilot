# Especificación de Arquitectura Técnica y Flujo de Datos
## BCN Location Intelligence & Underwriting Copilot (v3.0)

Este documento contiene la arquitectura técnica del sistema, la descripción de APIs públicas abiertas consumidas a coste 0,00 €, el diseño del backend en FastAPI, la integración con Leaflet GIS y el protocolo de despliegue y ejecución en **Antigravity IDE**.

---

## 1. Topología del Sistema: Arquitectura Monolítica Ligera (Camino A)

El sistema se implementa bajo un esquema **Todo-en-Uno (Camino A)** donde un único proceso en Python con **FastAPI** sirve la interfaz visual generada por Google Stitch y expone los endpoints REST del motor analítico.

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      NAVEGADOR DEL USUARIO                             │
 │  • Dashboard HTML5 + Tailwind CSS + Vanilla JS + Leaflet.js            │
 │  • Sin autenticación • Sin cookies de bloqueo • Acceso inmediato       │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼────────────────────────────┐
         │ HTTP GET /api/analizar    │ HTTP GET /api/descargar-pdf│ HTTP GET /api/excel
         ▼                           ▼                            ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                     BACKEND FASTAPI (server.py)                        │
 │                                                                        │
 │  ┌──────────────── MOTOR DE INGESTA ABIERTO (0,00 €) ───────────────┐  │
 │  │ • ICGC Pelias REST API      ──> Geocodificación y callejero      │  │
 │  │ • Sede Catastro OVC (SOAP)  ──> Ref. Catastral, año y superficie │  │
 │  │ • Registradores WFS local   ──> Cruce espacial de Registros 1-33 │  │
 │  │ • Open-Meteo Archive API    ──> 365 días reales (Lluvia, HDD/CDD)│  │
 │  │ • TMB / ATM Open Data       ──> Red de metro, líneas y minutos   │  │
 │  │ • Open Data BCN (CKAN)      ──> Censo actividades PB y acústica  │  │
 │  │ • INE ADRH Microdatos       ──> Renta neta hogar y persona       │  │
 │  │ • INCASÒL Series de Fianzas ──> Precios contractuales de mercado │  │
 │  └──────────────────────────────────────────────────────────────────┘  │
 │                                                                        │
 │  ┌──────────────── GESTOR DE REPORTES Y ENTREGABLES ────────────────┐  │
 │  │ • OpenPyXL Engine           ──> Modelo financiero .xlsx (5 tabs) │  │
 │  │ • CSS @page Engine          ──> Paginación limpia One-Pager / 2p │  │
 │  └──────────────────────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────┘
```

### Ventajas de la Arquitectura Seleccionada:
1. **Zero-Database Overhead:** No requiere instalar ni administrar instancias de PostgreSQL, MySQL o Redis. Los microdatos censales, la matriz registral de Barcelona y la red de metro residen estructurados en memoria RAM, resolviendo las consultas en $<5\text{ ms}$.
2. **Cero Conflictos CORS:** Al servirse la interfaz estática y las rutas de API desde el mismo origen HTTP (`localhost:8000`), desaparecen los bloqueos de origen cruzado de los navegadores.
3. **Resiliencia de Red (*Fallback Pattern*):** Si la Sede Electrónica del Catastro o Open-Meteo experimentan caídas de servicio o superan un *timeout* de 3,5 segundos, el servidor conmuta de manera transparente a los estimadores territoriales del distrito para no interrumpir la experiencia de usuario.

---

## 2. Catálogo de APIs e Infraestructuras de Datos Abiertos (Coste 0,00 €)

| # | Capa Analítica | Proveedor Oficial | Formato / Protocolo | Parámetros Obtenidos |
|---|---|---|---|---|
| **1** | **Geocodificación** | Institut Cartogràfic i Geològic de Catalunya (ICGC) | REST JSON (`https://geocoder.icc.cat/pelias/v1/autocomplete`) | Coordenadas ETRS89/WGS84, calle y número de portal normalizado. |
| **2** | **Validación Catastral** | Sede Electrónica del Catastro (DGC) | Web Service SOAP/XML (`http://ovc.catastro.meh.es/ovcservweb/ovcswlocalizacionrc/ovccoordenadas.asmx`) | Referencia catastral (14 y 20 dígitos), año de edificación y superficie construida. |
| **3** | **Seguridad Registral** | Colegio de Registradores de España | Cruce espacial de distritos hipotecarios | Registro de la Propiedad competente (1 al 33), titular, dirección física y teléfono oficial. |
| **4** | **Rentas de Contrato** | Institut Català del Sòl (INCASÒL) | Series trimestrales abiertas | Renta contractual real escriturada (€/mes y €/m²) por barrio para retail, oficinas y vivienda. |
| **5** | **Socioeconomía Micro** | Instituto Nacional de Estadística (INE) | Atlas de Distribución de Renta de los Hogares (ADRH) | Renta neta media por hogar y persona a escala de sección censal. |
| **6** | **Dinámica Planta Baja** | Ajuntament de Barcelona | Cens d'Activitats Comercials en Planta Baixa (CKAN) | Densidad de locales comerciales abiertos en 150 m y porcentaje de locales desocupados. |
| **7** | **Movilidad y Metro** | Transports Metropolitans de Barcelona (TMB) | Matriz GTFS de accesos y andenes georreferenciados | Estación de metro más cercana, líneas de paso, distancia euclidiana y tiempo a pie (80 m/min). |
| **8** | **Clima y Sostenibilidad** | Open-Meteo Historical Weather | REST JSON (`https://archive-api.open-meteo.com/v1/archive`) | Serie de 365 días: días con lluvia $>1\text{ mm}$, precipitación acumulada, olas de calor y grados día HDD/CDD. |

---

## 3. Especificación del Backend FastAPI (`server.py`)

### 3.1. Estructura de Endpoints de la Aplicación

#### `GET /`
* **Descripción:** Renderiza la plantilla principal `templates/index.html` generada a partir del diseño de Google Stitch.
* **Respuesta:** `HTMLResponse`.

#### `GET /api/analizar`
* **Descripción:** Orquesta la llamada concurrente a las fuentes públicas y ejecuta los motores de underwriting, OCR y movilidad.
* **Parámetros de Entrada (Query String):**
  * `direccion` (*string*, default: `"Carrer de Balmes, 12"`).
  * `tipologia` (*string*, default: `"Local Comercial (Retail)"`).
  * `superficie` (*float*, default: `110.0`).
  * `precio` (*float*, default: `320000.0`).
  * `fachada` (*string*, default: `"Chaflán Eixample (>10m)"`).
  * `humos` (*bool*, default: `False`).
  * `conservacion` (*string*, default: `"Listo para entrar / Buen estado"`).
* **Estructura del Payload de Salida (JSON):**
```json
{
  "status": "success",
  "activo": {
    "direccion": "Carrer de Balmes, 12, 08007 Barcelona",
    "lat": 41.38745,
    "lon": 2.16482,
    "distrito": "Eixample",
    "ref_catastral": "08019A014000320001KL",
    "ano_construccion": 1928,
    "score": 86,
    "registro": {
      "num": 14,
      "sede": "Passeig de Gràcia, 101, 1º",
      "tel": "932 15 89 21"
    }
  },
  "finanzas": {
    "renta_m2": 35.0,
    "renta_mensual": 3850.0,
    "renta_anual_bruta": 46200.0,
    "inversion_total": 356800.0,
    "gastos_compra": 36800.0,
    "capex": 0.0,
    "opex_anual": 4906.0,
    "noi": 41294.0,
    "gross_yield": 7.22,
    "niy": 5.68,
    "sinergia_parking": {
      "deficit_aparcamiento_score": "90 / 100",
      "presion_calzada": "Muy Alta (Rotación crítica en chaflanes)",
      "oportunidad_parking_vinculado": "🟢 Alta Oportunidad"
    }
  },
  "acustica": {
    "viandantes_hora": 420,
    "ancho_acera": 5.2,
    "apto_terraza": true
  },
  "clima": {
    "dias_lluvia": 46,
    "precipitacion_mm": 540.0,
    "olas_calor": 15,
    "hdd": 740,
    "cdd": 430
  },
  "metro": {
    "estacion": "Universitat",
    "lineas": "L1, L2",
    "distancia_m": 280,
    "minutos_a_pie": 3
  }
}
```

#### `GET /api/descargar-excel`
* **Descripción:** Genera un libro binario de Microsoft Excel (.xlsx) estructurado en 5 pestañas formuladas mediante `openpyxl`.
* **Respuesta:** `StreamingResponse` con tipo MIME `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

#### `GET /api/generar-informe-html`
* **Descripción:** Renderiza una vista web optimizada para impresión con hojas de estilo `@media print` que respetan los formatos A4 y saltos forzados de página (`page-break-before: always;`).
* **Respuesta:** `HTMLResponse`.

---

## 4. Integración Frontend: Plantilla de Google Stitch y Leaflet.js

### 4.1. Tokens Visuales y Estilos (`DESIGN.md`)
La interfaz respeta la dirección de arte **Architectural Editorial Modernism**:
* **Color Primario (`#02362f`):** Verde de competición institucional utilizado en títulos, botones principales, tarjetas de KPIs y bordes de acento.
* **Color Secundario (`#b45309`):** Terracota y ocre arquitectónico para advertencias normativas, insignias de estado y acentos secundarios.
* **Lienzo de Fondo (`#faf9f5`):** Piedra caliza cálida que sustituye a los grises digitales convencionales.
* **Bordes y Superficies:** Líneas sutiles de $1\text{px}$ en tono arenisca (`#dedad2`) y fondos de módulo en alabastro puro (`#ffffff`).
* **Tipografía Dual:** *Outfit* para encabezados numéricos y de sección, y *Plus Jakarta Sans* para lectura editorial continua.

### 4.2. Visor Cartográfico Dinámico con Leaflet.js
Se elimina cualquier mapa estático o imagen incrustada de la maqueta de Stitch, incorporando el visor interactivo de código abierto:

```html
<!-- Cabecera de templates/index.html -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Contenedor del mapa interactivo -->
<div class="relative w-full h-[380px] rounded-lg overflow-hidden border border-sandstone-border" id="map-container">
  <div id="leaflet-map" class="w-full h-full z-10"></div>
</div>
```

```javascript
// Motor de renderizado dinámico en templates/index.html
let leafletMap = null;
let currentMarker = null;
let currentCircle = null;

function inicializarMapa(lat = 41.38745, lon = 2.16482) {
  if (!document.getElementById('leaflet-map')) return;
  if (leafletMap) leafletMap.remove();

  leafletMap = L.map('leaflet-map', { zoomControl: false }).setView([lat, lon], 16);

  // Teselas de Carto Positron (coherencia cromática con la paleta de piedra caliza)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19
  }).addTo(leafletMap);

  L.control.zoom({ position: 'topright' }).addTo(leafletMap);
  actualizarMarcadorMapa(lat, lon, "Carrer de Balmes, 12");
}

function actualizarMarcadorMapa(lat, lon, direccion) {
  if (!leafletMap) return;
  if (currentMarker) leafletMap.removeLayer(currentMarker);
  if (currentCircle) leafletMap.removeLayer(currentCircle);

  leafletMap.setView([lat, lon], 16);

  // Marcador institucional verde (#02362f)
  currentMarker = L.circleMarker([lat, lon], {
    radius: 7,
    fillColor: "#02362f",
    color: "#ffffff",
    weight: 2,
    fillOpacity: 0.95
  }).addTo(leafletMap).bindPopup(`<b>${direccion}</b><br>Parcela Catastral Validada`).openPopup();

  // Isócrona peatonal circular de referencia (300 m ~ 5 min a pie)
  currentCircle = L.circle([lat, lon], {
    radius: 300,
    color: '#02362f',
    dashArray: '4, 6',
    fillColor: '#02362f',
    fillOpacity: 0.05,
    weight: 1.5
  }).addTo(leafletMap);
}
```

---

## 5. Arquitectura del Libro Financiero en Excel (`openpyxl`)

La descarga a hoja de cálculo genera un libro estructurado en **5 pestañas independientes** con estilos corporativos (cabeceras en azul institucional `#1E3A8A`, fuentes Calibri y autoajuste de anchura de columnas):

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      LIBRO EXCEL (.XLSX) - 5 PESTAÑAS                  │
 ├──────────────────────┬─────────────────────────────────────────────────┤
 │ 1. Resumen_Ejecutivo │ Identidad del activo, registro y KPIs clave     │
 │ 2. Entorno_Urbano    │ Indicadores micro de cuenca según tipología     │
 │ 3. Cuenta_Explotacion│ P&L formulado: Renta, OpEx, NOI, Gross y NIY    │
 │ 4. Movilidad_Parking │ Déficit de plazas en cuenca, presión de calzada │
 │ 5. Clima_Historico   │ Serie temporal de 365 días reales (Open-Meteo)  │
 └──────────────────────┴─────────────────────────────────────────────────┘
```

* **Fórmulas dinámicas:** Las celdas de ingresos, costes operativos, subtotales, $NOI$ y yields no se guardan como texto estático, sino como fórmulas nativas de Excel (`=SUM(...)`, `=(C10-C11)`, `=(C12/C8)*100`), permitiendo al analista modificar precios o rentas y recalcular el modelo automáticamente.

---

## 6. Procedimiento de Arranque y Despliegue en Antigravity IDE

### 6.1. Requisitos de Dependencias (`requirements.txt`)
```text
fastapi>=0.111.0
uvicorn>=0.30.0
jinja2>=3.1.4
requests>=2.31.0
pandas>=2.2.0
numpy>=1.26.0
openpyxl>=3.1.2
```

### 6.2. Comandos de Ejecución Local
Abre la terminal integrada de Antigravity IDE (`Ctrl + ~`) y ejecuta:

```bash
# 1. Instalar librerías en el entorno virtual
pip install -r requirements.txt

# 2. Iniciar el servidor con recarga en caliente
uvicorn server:app --reload --port 8000
```

Accede desde tu navegador a:
👉 **`http://localhost:8000`**

### 6.3. Despliegue Público Gratuito (Hugging Face Spaces con Docker)
Para publicar la plataforma en la nube sin costes ni límites de uso:
1. Crea un repositorio en [Hugging Face Spaces](https://huggingface.co/spaces) seleccionando el SDK **Docker**.
2. Añade este `Dockerfile` en la raíz del proyecto:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 7860
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "7860"]
```
3. Ejecuta `git push origin main`. La plataforma se compilará automáticamente entregando una URL pública segura con HTTPS.