# Playbook de Ejecución en Antigravity IDE: De Stitch a Producción Real

## Secuencia Exacta de Prompts para el Agente de Antigravity (Paso a Paso)

Este documento contiene la secuencia estructurada de instrucciones para que el Agente de **Antigravity IDE** ensamble los archivos de Google Stitch (`code.html`, `DESIGN.md`), elimine los datos simulados (*mocks*), limpie el branding, integre la cartografía dinámica con **Leaflet.js** y conecte el cuadro de mandos con el backend analítico en **FastAPI** (`server.py`).

## 0. Preparación Previa del Espacio de Trabajo

Antes de abrir el chat con el agente, asegúrate de colocar los archivos en la raíz de tu proyecto en Antigravity con esta estructura:

```
mi-proyecto-bcn/
│
├── stitch_export/
│   ├── code.html              <-- El archivo HTML exportado de Google Stitch
│   ├── DESIGN.md              <-- Tokens visuales y paleta exportada
│   └── screen.jpg             <-- Imagen de referencia visual
│
├── templates/                 <-- (Se creará en el Paso 1)
│   └── index.html
├── server.py                  <-- (Se creará en el Paso 2)
├── requirements.txt           <-- (Se creará en el Paso 4)
└── report_config.json

```

## PASO 1: Copiar, Limpiar Branding y Sustituir Mapa en `templates/index.html`

Abre el panel de **Chat con el Agente** en Antigravity (`Ctrl + L` o icono de chat lateral) y pega el siguiente prompt:

### Prompt 1 para Antigravity:

> ```
> Actúa como un desarrollador frontend senior especializado en Tailwind CSS y arquitectura web.
> 
> Tarea:
> 1. Crea la carpeta `templates/` si no existe y copia el contenido de `stitch_export/code.html` en `templates/index.html`.
> 
> 2. Higienización de Branding (Marca Neutra e Institucional):
>    - Sustituye en todo el archivo cualquier mención a "NN", "NN BCN CORE", "NN Heritage Portfolio" o "Núñez i Navarro Intelligence" por "BCN LOCATION COPILOT v3.0" o "Institutional Real Estate & Mobility Intelligence".
>    - Sustituye los avatares circulares que tengan las letras "NN" por un contenedor estilizado con el icono de Material Symbols "domain" o "apartment".
>    - En la barra superior, el badge secundario debe indicar: "Public Open Data Core (Coste 0 €)".
> 
> 3. Sustitución del Visor Cartográfico Estático por Leaflet.js Real:
>    - Añade en el <head> de `templates/index.html` las librerías de Leaflet:
>      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
>      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
>    - Localiza el contenedor del mapa (#map-container) que actualmente tiene una imagen de fondo fija y elementos <svg> rígidos, y reemplázalo por:
>      <div class="relative w-full h-[380px] rounded-lg overflow-hidden border border-sandstone-border" id="map-container">
>        <div id="leaflet-map" class="w-full h-full z-10"></div>
>      </div>
> 
> Mantén intactos todos los selectores de Tailwind CSS, fuentes (Outfit y Plus Jakarta Sans) y las tarjetas del diseño.
> 
> ```

## PASO 2: Creación del Backend Analítico (`server.py`)

Una vez que el agente confirme los cambios en `templates/index.html`, pega el siguiente prompt para generar el motor en FastAPI con las 8 capas de datos oficiales:

### Prompt 2 para Antigravity:

> ```
> Actúa como un ingeniero de software backend senior especializado en FastAPI, Python y analítica geoespacial.
> 
> Tarea:
> Crea el archivo `server.py` en la raíz del proyecto. Debe implementar un servidor FastAPI completo y resiliente que sirva la interfaz y conecte con fuentes públicas oficiales a coste 0 €:
> 
> Requisitos del servidor:
> 1. Servir `templates/index.html` en la ruta raíz GET `/`.
> 2. Conectores de Datos Públicos Abiertos (con try/except y fallback):
>    - Geocodificación oficial: ICGC Pelias (`https://geocoder.icc.cat/pelias/v1/autocomplete`).
>    - Sede Electrónica del Catastro (OVC): Consulta de referencia catastral y año de edificación (`http://ovc.catastro.meh.es/ovcservweb/ovcswlocalizacionrc/ovccoordenadas.asmx/Consulta_RCCOOR`).
>    - Registro de la Propiedad: Matriz de demarcaciones de los Registros 1 al 33 de Barcelona con sede física y teléfono de contacto.
>    - Climatología histórica 365 días: API de Open-Meteo Archive (`https://archive-api.open-meteo.com/v1/archive`) calculando lluvia, olas de calor, HDD (base 18°C) y CDD (base 21°C).
>    - Conectividad Metro TMB: Resolución de la estación más cercana con líneas y minutos a pie.
> 3. Motor Analítico de Negocio:
>    - Underwriting Inmobiliario: Renta contractual según INCASÒL, ITP (10%), gastos (1,5%), CapEx según estado de conservación, NOI anual, Gross Yield y Net Initial Yield (NIY).
>    - Retail OCR Inverso: Cálculo de facturación mensual/anual mínima requerida, tickets diarios y tasa de captura peatonal requerida sobre el aforo de viandantes.
>    - Sinergias de Movilidad: Score de déficit de aparcamiento en cuenca (0 a 100) y presión de Área Verde/Azul.
>    - Vivienda MIVAU: Semáforo de la Ley 12/2023 por el Derecho a la Vivienda.
> 4. Endpoints requeridos:
>    - GET `/api/analizar`: recibe dirección, tipología, superficie, precio, fachada, humos y conservación; devuelve JSON completo con activo, finanzas, entorno, acustica, clima y metro.
>    - GET `/api/descargar-excel`: devuelve un archivo .xlsx generado con openpyxl de 5 pestañas formuladas.
>    - GET `/api/generar-informe-html`: renderiza vista de impresión con reglas @media print limpias (A4/Letter).
> 
> Genera el código íntegro y sin omisiones en `server.py`.
> 
> ```

## PASO 3: Conectar la Interfaz con el Backend (Sustituir Mock JS)

Ahora conectamos los botones, inputs y el mapa dinámico de `templates/index.html` con las rutas del backend FastAPI:

### Prompt 3 para Antigravity:

> ```
> Revisa `templates/index.html`. Debemos sustituir el script de prototipado estático (que contiene cálculos matemáticos locales y datos simulados) por un motor JavaScript asíncrono que consuma `/api/analizar` de FastAPI en tiempo real.
> 
> Requisitos del script (ubícalo al final de templates/index.html antes de </body>):
> 1. Inicialización de Leaflet.js:
>    - Configura el mapa en `#leaflet-map` con teselas de Carto Positron (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`).
>    - Crea una función `actualizarMarcadorMapa(lat, lon, direccion)` que centre la vista, sitúe un CircleMarker institucional (#02362f) con popup y dibuje un círculo de isócrona peatonal (300 m) con trazo discontinuo.
> 
> 2. Conexión Reactiva con FastAPI (`/api/analizar`):
>    - Al pulsar `#btn-analizar` o `#btn-recalcular` (o presionar Enter en `#input-direccion`):
>      * Lee los inputs: dirección, tipología, superficie, precio, fachada, humos y conservación.
>      * Llama vía `fetch()` a `/api/analizar?...`.
>      * Actualiza en el DOM:
>        - KPIs: `#kpi-score`, `#kpi-renta`, `#kpi-gross-yield`, `#kpi-niy` y subtítulo de NOI.
>        - Banners: Alerta Pla d'Usos, Déficit Parking (#badge-parking) y Metro cercano (#badge-metro).
>        - Pestaña Catastro: Ref. Catastral (#val-ref-catastral), año (#val-ano), distrito (#val-distrito) y datos del Registro competente (#val-registro-num, #val-registro-sede, #val-registro-tel).
>        - Tabla P&L: Actualizar celdas de precio, ITP, CapEx, inversión total, renta bruta anual y NOI.
>        - Peatones & Acústica: Viandantes/hora (#val-viandantes) y viabilidad de terraza (#val-terraza).
>        - Actualizar el mapa de Leaflet con las coordenadas reales devueltas por el geocodificador.
> 
> 3. Exportaciones:
>    - `#btn-descargar-excel`: redirige a `/api/descargar-excel` con los parámetros activos.
>    - `#btn-descargar-pdf`: abre en nueva pestaña `/api/generar-informe-html` para guardado o impresión.
> 
> 4. Búsqueda automática inicial al cargar la página con "Carrer de Balmes, 12".
> 
> ```

## PASO 4: Archivo de Requisitos y Comprobación de Arranque

Genera las dependencias y verifica la ejecución:

### Prompt 4 para Antigravity:

> ```
> Crea el archivo `requirements.txt` en la raíz del proyecto con las dependencias mínimas necesarias:
> - fastapi>=0.111.0
> - uvicorn>=0.30.0
> - jinja2>=3.1.4
> - requests>=2.31.0
> - pandas>=2.2.0
> - numpy>=1.26.0
> - openpyxl>=3.1.2
> 
> Por favor, revisa que no haya conflictos de rutas ni nombres de variables entre `templates/index.html` y `server.py`, e indícame el comando exacto para iniciar el servidor en local desde la terminal integrada de Antigravity.
> 
> ```

## PASO 5: Lanzamiento y Comprobación en Navegador

Abre la terminal integrada de Antigravity (`Ctrl + ~`) y ejecuta los siguientes comandos:

```
# 1. Instalar las dependencias de Python
pip install -r requirements.txt

# 2. Iniciar el servidor FastAPI con recarga en caliente
uvicorn server:app --reload --port 8000

```

Abre tu navegador en:
👉 **`http://localhost:8000`**

### Checklist de Comprobación Visual y Funcional:

1. **Carga Inmediata:** La interfaz carga en menos de 1 segundo con la estética de Stitch (verdes de competición y tonos piedra caliza).

2. **Sin Fuga de Branding:** No aparece "NN" ni marcas de terceros; la cabecera muestra "BCN LOCATION COPILOT v3.0".

3. **Visor Cartográfico Vivo:** En la Pestaña 1 aparece el mapa interactivo de Leaflet centrado en Balmes 12, permitiendo hacer zoom y arrastrar.

4. **Prueba de Búsqueda:** Escribe en la barra superior `"Passeig de Gràcia, 45"` o `"Rambla del Poblenou, 22"` y pulsa *Analizar Emplazamiento*.

   * El mapa debe desplazarse a las nuevas coordenadas.

   * El Registro de la Propiedad debe cambiar automáticamente (ej. Registro Nº 2 o Registro Nº 18).

   * El P&L, el semáforo OCR y los viandantes/hora deben recalcularse en función del distrito.

5. **Descargas:** Haz clic en *"Descargar Modelo (.xlsx)"* para obtener el libro Excel estructurado.