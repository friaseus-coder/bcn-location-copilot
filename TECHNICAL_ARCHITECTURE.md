# TECHNICAL ARCHITECTURE SPECIFICATION
## Barcelona Province Location Intelligence & Underwriting Copilot (v3.0)

Este documento define la arquitectura técnica de software, la integración de infraestructuras de datos abiertos oficiales, el catálogo de rutas de API REST, la estructura de los payloads JSON, el diccionario exhaustivo de identificadores del DOM y las políticas de tolerancia a fallos y resiliencia del sistema.

---

## 1. Topología de la Arquitectura de Software

El sistema está diseñado bajo una **arquitectura monolítica ligera y desacoplada** de alto rendimiento en Python y JavaScript:

```
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                                NAVEGADOR DEL CLIENTE                                   │
 │  • Dashboard HTML5 + Tailwind CSS + Vanilla JS (static/js/copilot.js)                  │
 │  • Visor Cartográfico Interactivo Leaflet.js v1.9.4 con CartoDB Positron               │
 │  • Interfaz libre de cookies invasivas y de autenticación obligatoria                  │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │ HTTP Fetch JSON / Streaming XLSX / HTML   │
                       ▼                                           ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                             BACKEND FASTAPI (server.py)                                │
 │                                                                                        │
 │  ┌────────────────────── MOTOR DE INGESTA ABIERTA (COSTE 0 €) ──────────────────────┐  │
 │  │ • ICGC Pelias API       ──> Geocodificación y callejero provincial (311 mun.)    │  │
 │  │ • Sede Catastro OVC     ──> SOAP/XML Ref. Catastral 14/20 dígitos, año y m²      │  │
 │  │ • Registradores WFS/RAM ──> Asignación automática Registros de la Propiedad 1-33  │  │
 │  │ • Open-Meteo Archive    ──> Serie temporal 365 días reales (Lluvia, HDD/CDD)     │  │
 │  │ • Matriz TMB / ATM / R  ──> Accesibilidad Metro, Rodalies Renfe y FGC            │  │
 │  │ • INCASÒL Series        ──> Renta contractual escriturada por municipio y uso    │  │
 │  │ • INE ADRH Microdatos   ──> Renta neta media hogar por sección censal            │  │
 │  └──────────────────────────────────────────────────────────────────────────────────┘  │
 │                                                                                        │
 │  ┌────────────────────── GESTOR DE ENTREGABLES Y EXPORTACIÓN ───────────────────────┐  │
 │  │ • OpenPyXL Engine       ──> Libro Excel (.xlsx) de 5 pestañas formuladas         │  │
 │  │ • CSS @page Engine      ──> Vista web para impresión ejecutiva PDF A4            │  │
 │  └──────────────────────────────────────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

### Ventajas Operativas:
1. **Zero-Database Overhead:** No precisa instancias de bases de datos pesadas (PostgreSQL, MySQL o Redis). Los datos censales, de transporte y registros residen en estructuras de memoria RAM y diccionarios indexados, resolviendo consultas en $< 5\text{ ms}$.
2. **Cero Conflictos CORS:** Al servirse los archivos estáticos (`/static`) y los endpoints analíticos (`/api/...`) desde el mismo origen HTTP (`localhost:8000`), desaparecen los bloqueos de origen cruzado de los navegadores.
3. **Pila Tecnológica Mínima:** Python 3.11+, FastAPI, Uvicorn, HTTPX, OpenPyXL, Jinja2, Tailwind CSS y Leaflet.js.

---

## 2. Catálogo de Endpoints de la API REST

### 2.1. `GET /`
* **Descripción:** Renderiza el panel de control principal `templates/index.html`.
* **Respuesta:** `HTMLResponse`.

### 2.2. `GET /api/autocompletar`
* **Descripción:** Normaliza y autocompleta el nombre de la calle con la API de Pelias de ICGC.
* **Parámetros Query:**
  * `texto` (*string*, requerido, mín. 2 caracteres): Texto parcial introducido por el usuario.
  * `municipio` (*string*, opcional, default: `"Barcelona"`): Municipio de referencia para el filtro geoespacial.
* **Payload de Respuesta (JSON):**
```json
{
  "status": "success",
  "sugerencias": [
    {
      "nombre": "Carrer de Balmes",
      "etiqueta": "Carrer de Balmes, Barcelona",
      "municipio": "Barcelona",
      "codigo_postal": "08007",
      "tipo": "Vía Urbana"
    }
  ]
}
```

### 2.3. `GET /api/analizar`
* **Descripción:** Pipeline de underwriting inmobiliario en cascada: consulta Catastro OVC, resuelve la demarcación registral, estima la renta oficial INCASÒL, calcula el P&L, evalúa el modelo OCR y audita el clima a 365 días con Open-Meteo.
* **Parámetros Query:**
  * `municipio` (*string*, default: `"Barcelona"`).
  * `calle` (*string*, default: `"Carrer de Balmes"`).
  * `numero` (*string*, default: `"12"`).
  * `piso` (*string*, opcional): Planta y puerta (ej. `"Principal 1ª"`).
  * `tipologia` (*string*, enum: `retail`, `oficina`, `residencial`, default: `retail`).
  * `superficie` (*float*, opcional, default: `110.0`).
  * `precio` / `precio_compra` (*float*, opcional, default: `320000.0`).
  * `fachada` (*string*, default: `"chaflan"`).
  * `humos` (*bool*, default: `false`).
  * `conservacion` (*string*, enum: `listo`, `ligera`, `reforma`, default: `"ligera"`).
* **Payload de Respuesta (JSON):**
```json
{
  "status": "success",
  "activo": {
    "direccion": "Carrer de Balmes, 12, Principal 1ª, Barcelona",
    "municipio": "Barcelona",
    "distrito": "L'Eixample - Dreta de l'Eixample",
    "lat": 41.3888,
    "lon": 2.159,
    "ref_catastral": "08019A014000320001KL",
    "ano_construccion": 1928,
    "superficie": 110.0,
    "tipo_finca": "Finca Clásica",
    "score": 86,
    "registro": {
      "num": "Registro de la Propiedad Nº 14 de Barcelona",
      "sede": "Carrer de Bergara, 10, 4ª Planta, 08002 Barcelona",
      "tel": "+34 933 01 24 55",
      "titular": "D. Carlos Morales (Titular Mercantil)",
      "jurisdiccion": "Jurisdicción Registral Validada"
    }
  },
  "regulacion": {
    "titulo": "Regulación Especial Eixample (Susp. C3 / Hostelería)",
    "subtitulo": "Pla d'Usos & Marco Autonómico",
    "descripcion": "Sector afectado por el Pla Especial d'Usos...",
    "alerta": true,
    "zona_tensionada": true
  },
  "finanzas": {
    "precio": 320000.0,
    "renta_m2": 35.0,
    "renta_mensual": 3850.0,
    "renta_anual_bruta": 46200.0,
    "inversion_total": 376600.0,
    "itp": 32000.0,
    "ajd": 4800.0,
    "capex": 19800.0,
    "opex_anual": 4834.4,
    "ibi": 1248.0,
    "comunidad": 1320.0,
    "seguro": 450.0,
    "reserva": 1016.4,
    "noi": 41365.6,
    "gross_yield": 14.44,
    "niy": 10.98,
    "payback": 9.1,
    "cap_rate": 10.98,
    "tir": 13.63,
    "sinergia_parking": {
      "deficit_aparcamiento_score": "90 / 100",
      "presion_calzada": "Alta Rotación Comercial",
      "oportunidad_parking_vinculado": "🟢 Alta Oportunidad de Monetización"
    }
  },
  "entorno": {
    "renta_ine": 38450,
    "renta_ine_seccion": "Renta Bruta Media Hogar (Barcelona)",
    "poblacion_flotante": "2.8x Residente",
    "competencia": "3 Locales en 150m",
    "ocr": {
      "facturacion_mensual_req": 36667.0,
      "tickets_dia_req": 78.0,
      "tasa_captura_req": 1.69,
      "riesgo_impago": "Bajo (1.4/10)",
      "riesgo_num": 1.4,
      "ratio_saludable": "10.5%"
    }
  },
  "acustica": {
    "viandantes_hora": 420,
    "ancho_acera": 5.2,
    "apto_terraza": true,
    "terraza_detalle": "Acera > 4.5 m de anchura total. Ancho libre garantizado.",
    "ruido": {
      "vianants_ld": 62,
      "vianants_le": 59,
      "oci_ln": 48,
      "transit_ld": 66
    }
  },
  "clima": {
    "dias_lluvia": 52,
    "precipitacion_mm": 485.0,
    "olas_calor": 38,
    "noches_tropicales": 74,
    "hdd": 840,
    "cdd": 495
  },
  "metro": {
    "estacion": "Universitat",
    "lineas": "Metro L1, L2",
    "distancia_m": 280,
    "minutos_a_pie": 3,
    "texto": "Universitat (Metro L1, L2) a 280 m (3 min a pie)",
    "deficit_score": 90,
    "presion_calzada": "Muy Alta (Rotación crítica en chaflanes)"
  }
}
```

### 2.4. `GET /api/descargar-excel` y `POST /api/exportar-excel`
* **Descripción:** Genera el libro Excel (.xlsx) estructurado en 5 pestañas formuladas (`Resumen_Ejecutivo`, `Cuenta_Explotacion`, `Entorno_Urbano_OCR`, `Movilidad_Parking` y `Clima_Historico`) utilizando `openpyxl`.
* **Tipo MIME:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

### 2.5. `GET /api/exportar-pdf-html` y `GET /api/generar-informe-html`
* **Descripción:** Renderiza una vista web ejecutiva para impresión directa con `@page { size: A4 portrait; margin: 15mm; }` y `window.print()`.

---

## 3. Diccionario Completo de Identificadores del DOM

| Componente UI | Selector DOM | Tipo Elemento | Propósito / Dato Inyectado |
|---|---|---|---|
| **Buscador Provincial** | `#select-municipio` | `<select>` | Selector de los 311 municipios de la provincia |
| | `#input-calle` | `<input type="text">` | Nombre de la vía con autocompletado ICGC Pelias |
| | `#input-numero` | `<input type="number">` | Número de policía (ancho fijo ~80px) |
| | `#input-piso` | `<input type="text">` | Piso / Puerta (ej. "3º 2ª", "Bajos") |
| | `#sugerencias-vias` | `<div>` | Contenedor flotante para sugerencias de vías |
| | `#btn-analizar` | `<button>` | Disparo forzado de análisis |
| **Control Underwriting** | `#select-tipologia` | `<select>` | Retail, Oficina o Residencial |
| | `#input-superficie` | `<input type="number">` | Superficie útil en m² |
| | `#input-precio` | `<input type="number">` | Precio objetivo de adquisición (€) |
| | `#select-fachada` | `<select>` | Chaflán, Escaparate amplio, Estándar o Estrecho |
| | `#check-humos` | `<input type="checkbox">` | Salida de humos reglamentaria CTE DB-SI |
| | `#select-conservacion` | `<select>` | Listo (0 €), Ligera (180 €) o Reforma (650 €) |
| | `#btn-recalcular` | `<button>` | Recálculo de modelo financiero |
| **Banners Superiores** | `#badge-regulacion` | `<div>` | Semáforo Pla d'Usos y Ley de Vivienda |
| | `#badge-parking` | `<div>` | Déficit de parking y presión en calzada |
| | `#badge-transporte` | `<div>` | Hub intermodal TMB / Rodalies más cercano |
| **KPIs Clave** | `#kpi-score` | `<div>` | Location Score integral (0 a 100) |
| | `#kpi-score-bar` | `<div>` | Barra de progreso porcentual del score |
| | `#kpi-renta` | `<div>` | Renta contractual estimada INCASÒL (€/mes) |
| | `#kpi-gross-yield` | `<div>` | Rentabilidad bruta simple (%) |
| | `#kpi-niy` | `<div>` | Net Initial Yield institucional (%) |
| | `#kpi-noi-sub` | `<span>` | Subtítulo con importe NOI anual (€/año) |
| **Pestaña 1: Catastro** | `#val-ref-catastral` | `<span>` | Referencia Catastral (14 o 20 caracteres) |
| | `#val-ano` | `<span>` | Año de edificación de la finca |
| | `#val-municipio-distrito`| `<span>` | Municipio y distrito censal |
| | `#val-registro-num` | `<span>` | Registro de la Propiedad competente |
| | `#val-registro-sede` | `<span>` | Dirección de la oficina registral |
| | `#val-registro-tel` | `<span>` | Teléfono oficial de contacto |
| | `#leaflet-map` | `<div>` | Visor cartográfico interactivo Leaflet |
| **Pestaña 2: Finanzas** | `#row-precio` | `<td>` | Precio de compraventa pactado |
| | `#row-itp` | `<td>` | Impuesto Transmisiones Patrimoniales (10%) |
| | `#row-ajd` | `<td>` | Actos Jurídicos Documentados (1,5%) |
| | `#row-capex` | `<td>` | Presupuesto CapEx de adecuación inicial |
| | `#row-inversion-total` | `<td>` | Total inversión inicial desembolsada |
| | `#row-renta-anual` | `<td>` | Renta bruta anualizada |
| | `#row-ibi` | `<td>` | Gasto IBI municipal |
| | `#row-comunidad` | `<td>` | Gasto ordinario de comunidad de propietarios |
| | `#row-seguro` | `<td>` | Seguro multirriesgo continente |
| | `#row-reserva` | `<td>` | Reserva técnica de vacancia y reposición (2,2%)|
| | `#row-noi` | `<td>` | Net Operating Income anual neto |
| | `#box-payback` | `<span>` | Años de amortización desapalancada |
| | `#box-cap-rate` | `<span>` | Tasa de capitalización sobre inversión |
| | `#box-tir` | `<span>` | Tasa Interna de Retorno proyectada a 10 años |
| **Pestaña 4: Entorno** | `#val-renta-ine` | `<div>` | Renta media neta del hogar (INE ADRH) |
| | `#val-ocr-facturacion`| `<div>` | Facturación mensual requerida (OCR Inverso) |
| | `#val-ocr-tickets` | `<div>` | Tickets diarios mínimos requeridos |
| | `#val-ocr-captura` | `<div>` | Tasa de captura peatonal requerida (%) |
| | `#val-ocr-riesgo` | `<div>` | Nivel de riesgo de impago comercial |
| **Pestaña 5: Acústica**| `#val-viandantes` | `<div>` | Viandantes diurnos en hora punta |
| | `#val-terraza` | `<div>` | Viabilidad de terraza según ordenanza de acera|
| | `#val-ruido-vianants-ld`| `<span>` | Ruido diurno viandantes (dBA) |
| | `#bar-ruido-vianants-ld`| `<div>` | Barra gráfica decibelios diurnos |
| | `#val-ruido-oci-ln` | `<span>` | Ruido ocio nocturno 23h-07h (dBA) |
| **Pestaña 6: Clima** | `#clima-dias-lluvia` | `<span>` | Días anuales con precipitación > 1 mm |
| | `#clima-precipitacion` | `<span>` | Precipitación acumulada anual (mm) |
| | `#clima-ola-calor` | `<span>` | Días con temperatura máxima > 32 °C |
| | `#clima-noches-tropicales`| `<span>` | Noches con temperatura mínima > 20 °C |
| | `#clima-hdd` | `<span>` | Grados día de calefacción (HDD base 18°C) |
| | `#clima-cdd` | `<span>` | Grados día de refrigeración (CDD base 21°C) |
| **Exportación** | `#btn-descargar-excel`| `<button>` | Descarga del modelo financiero (.xlsx) |
| | `#btn-descargar-pdf` | `<button>` | Apertura de diálogo de impresión para PDF |

---

## 4. Política de Tolerancia a Fallos y Caché Resiliente

La arquitectura implementa el patrón **Graceful Degradation with Deterministic Fallbacks**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      LLAMADA A SERVICIO EXTERNO                        │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                     ¿Respuesta HTTP 200 en < 3,5s?
                     /                           \
                   SÍ                             NO
                   │                              │
        ┌──────────┴──────────┐       ┌───────────┴───────────┐
        │  PARSEO DE DATOS    │       │ CONMUTACIÓN INMEDIATA │
        │  OFICIALES EN VIVO  │       │ AL MODELO DETERMINISTA│
        │  (OVC / Open-Meteo) │       │ RESILIENTE (MEMORIA)  │
        └─────────────────────┘       └───────────────────────┘
```

1. **Protección contra caídas del Catastro OVC:**
   - Si la Sede Electrónica supera el timeout de 2,5 segundos o experimenta errores 500, el backend sintetiza la Referencia Catastral estructurada a partir del código provincial (`08`), código de municipio y orden viario, garantizando que el usuario jamás visualice una pantalla de error.
2. **Protección contra latencia en Geocodificación (ICGC Pelias):**
   - Si el endpoint del Institut Cartogràfic no responde en 3,0 segundos, el sistema despliega vías normalizadas canónicas generadas por el motor local.
3. **Resiliencia Climatológica (Open-Meteo Archive):**
   - En caso de indisponibilidad de la API meteorológica, el sistema aplica la matriz territorial consolidada de la comarca correspondiente (precipitación anual media, HDD 840 y CDD 495).
4. **Caché en Cliente (copilot.js):**
   - Si el navegador pierde conectividad con el backend, `copilot.js` conmuta de forma automática a `aplicarCalculoResilienteLocal()`, recalculando el P&L, las isócronas y el semáforo OCR íntegramente en el motor JavaScript del cliente sin interrumpir la operativa.
