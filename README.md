---
title: BCN Location Intelligence Copilot v3.0
emoji: 🏢
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# 🏢 Barcelona Province Location Intelligence & Underwriting Copilot (v3.0)

Plataforma analítica geoespacial y motor de *underwriting* inmobiliario institucional para los **311 municipios de la Provincia de Barcelona**.

![Barcelona Real Estate Intelligence](https://raw.githubusercontent.com/friaseus-coder/bcn-location-copilot/main/static/img/cover.png) *(opcional)*

---

## 🎯 Objetivo y Capacidades

Diseñado para analistas de adquisiciones, fondos de inversión y family offices, el copilot automatiza el análisis técnico-económico de activos inmobiliarios (**Retail**, **Oficinas** y **Residencial**) mediante cascada analítica en tiempo real:

1. **Geocodificación y Toponimia Oficial**: Consulta asíncrona al geocodificador Pelias del **ICGC (Institut Cartogràfic i Geològic de Catalunya)** con autocompletado y resolución de portales.
2. **Auditoría Catastral Automatizada**: Conexión con la Sede Electrónica del **Catastro (OVC)** para obtener la Referencia Catastral oficial (14/20 dígitos), año de construcción y superficie construida.
3. **Análisis de Accesibilidad e Isócronas**: Cálculo de isócronas peatonales (5, 10 y 15 min) y métricas de proximidad peatonal con Leaflet GIS y teselas CartoDB Positron / OSM.
4. **Inteligencia Climática y Grados Día**: Integración con **Open-Meteo Historical Weather API** para cálculo estandarizado de $HDD_{18}$ (Grados Día de Calefacción) y $CDD_{21}$ (Grados Día de Refrigeración).
5. **Underwriting Financiero Institucional**:
   - **Net Initial Yield (NIY)** con cálculo de impuestos provinciales (ITP 10% / AJD 1.5%).
   - **Modelo OCR Inverso** para Retail: estimación de facturación mínima requerida, tickets/día y captura peatonal.
   - **Régimen de Contención de Rentas**: Chequeo del marco regulatorio (Ley 12/2023 por el Derecho a la Vivienda) en los 140 municipios catalanes declarados zona tensionada.
6. **Exportación Ejecutiva**: Generación de informes en **Excel (.xlsx)** y dosier técnico imprimible en formato HTML/PDF.

---

## 🏗️ Arquitectura Técnica

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11/3.14) con cliente HTTP asíncrono `httpx`.
- **Frontend**: HTML5 semántico, Tailwind CSS y [Leaflet.js v1.9.4](https://leafletjs.com/).
- **Despliegue**: Contenedor Docker configurado para [Hugging Face Spaces](https://huggingface.co/spaces) y servidores Linux/Cloud Run en puerto 7860.

---

## 🚀 Puesta en Marcha Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/friaseus-coder/bcn-location-copilot.git
cd bcn-location-copilot
```

### 2. Crear y activar entorno virtual
```bash
python -m venv .venv
# En Windows:
.venv\Scripts\activate
# En Linux/macOS:
source .venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Ejecutar el servidor
```bash
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

Acceder a la interfaz web en: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 🐳 Ejecución con Docker

```bash
docker build -t bcn-copilot:v3.0 .
docker run -p 7860:7860 bcn-copilot:v3.0
```

Acceder a la aplicación en: [http://localhost:7860](http://localhost:7860)

---

## 📄 Documentación de Referencia

- [BUSINESS_CONTEXT.md](BUSINESS_CONTEXT.md): Tesis de inversión institucional, fórmulas financieras y marco regulatorio (MIVAU, PEUAT, Pla d'Usos).
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md): Diagrama de arquitectura, contratos de API y fuentes de datos públicas.

---

## ⚖️ Licencia
Distribuido bajo licencia MIT. Consulta `LICENSE` para más detalles.
