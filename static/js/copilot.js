/**
 * BCN Location Intelligence & Underwriting Copilot (v3.0)
 * Frontend Interactive Controller
 *
 * Conecta la interfaz de usuario con la API REST de FastAPI:
 * - Visor cartográfico Leaflet con CartoDB Positron e isócronas peatonales
 * - Autocompletado asíncrono con debounce (ICGC Pelias)
 * - Resolución automática en cascada al introducir número/piso
 * - Inyección de datos catastrales, registrales, financieros, OCR y acústicos
 * - Exportación de libro Excel (.xlsx) e impresión de dossier ejecutivo
 */

(function () {
  'use strict';

  // ==========================================
  // ESTADO GLOBAL Y VARIABLES DE MÓDULO
  // ==========================================
  // URL base oficial del servicio en Render.com
  const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('onrender.com'))
    ? '' 
    : 'https://bcn-location-api.onrender.com';

  let map = null;
  let assetLayerGroup = null;
  let isochroneLayerGroup = null;
  let currentMarker = null;
  let isochroneCircles = {};
  let currentIsochroneMinutes = 5;
  let debounceTimer = null;
  let ultimoAnalisisTimestamp = 0;
  let currentCoords = { lat: 41.3888, lon: 2.1590 };

  // Formateadores numéricos institucional es-ES
  const formatEuro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const formatDec = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatInt = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });

  // ==========================================
  // 1. INICIALIZACIÓN DEL MAPA LEAFLET
  // ==========================================
  function inicializarMapa() {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer || map) return;

    // Coordenadas por defecto (Barcelona Centro / Plaza Catalunya - Eixample)
    const defLat = 41.3888;
    const defLon = 2.1590;
    const defZoom = 13;

    // Inicializar instancia de Leaflet
    map = L.map('leaflet-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([defLat, defLon], defZoom);

    // Teselas libres de OpenStreetMap (100% abiertas, sin API key ni marcas de agua)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Controles en esquina superior derecha
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Grupos de capas vectoriales independientes
    isochroneLayerGroup = L.featureGroup().addTo(map);
    assetLayerGroup = L.featureGroup().addTo(map);

    // Marcador inicial por defecto
    actualizarMarcadorYIsocronas(defLat, defLon, 'Carrer de Balmes, 12, Barcelona', '08019A014000320001KL');

    // Exponer mapa globalmente y redimensionar
    window.leafletMap = map;
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 250);
  }

  /**
   * Actualiza el marcador del activo y dibuja las isócronas peatonales (5, 10 y 15 min)
   */
  function actualizarMarcadorYIsocronas(lat, lon, direccion, refCatastral) {
    if (!map || !assetLayerGroup || !isochroneLayerGroup) return;

    currentCoords = { lat, lon };

    // Limpiar capas previas
    assetLayerGroup.clearLayers();
    isochroneLayerGroup.clearLayers();
    isochroneCircles = {};

    // 1. Polígonos circulares de isócrona peatonal (80 m/min según estándar de movilidad)
    // 5 min = ~300 m | 10 min = ~650 m | 15 min = ~1000 m
    const isocronasConfig = [
      { min: 15, radio: 1000, color: '#02362f', fillOpacity: 0.03, dashArray: '6, 8', weight: 1.0 },
      { min: 10, radio: 650, color: '#b45309', fillOpacity: 0.04, dashArray: '5, 6', weight: 1.2 },
      { min: 5, radio: 300, color: '#02362f', fillOpacity: 0.08, dashArray: '3, 4', weight: 1.8 }
    ];

    isocronasConfig.forEach(cfg => {
      const circle = L.circle([lat, lon], {
        radius: cfg.radio,
        color: cfg.color,
        fillColor: cfg.color,
        fillOpacity: cfg.fillOpacity,
        weight: cfg.weight,
        dashArray: cfg.dashArray
      }).addTo(isochroneLayerGroup);

      isochroneCircles[cfg.min] = circle;
    });

    resaltarIsocronaActiva(currentIsochroneMinutes);

    // 2. Marcador del Activo (British Racing Green institucional)
    currentMarker = L.circleMarker([lat, lon], {
      radius: 8,
      fillColor: '#02362f',
      color: '#ffffff',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 0.95
    }).addTo(assetLayerGroup);

    // Popup institucional con información catastral
    const popupContent = `
      <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width: 180px; padding: 2px;">
        <div style="font-size:10px; font-weight:700; color:#02362f; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2px;">
          Activo Inmobiliario
        </div>
        <div style="font-size:12px; font-weight:600; color:#1a211f; margin-bottom:4px;">
          ${direccion || 'Ubicación seleccionada'}
        </div>
        <div style="font-size:10px; color:#78807d; border-top:1px solid #dedad2; padding-top:4px;">
          Ref: <b style="color:#02362f; font-family:'JetBrains Mono',monospace;">${refCatastral || 'Consultando OVC...'}</b>
        </div>
      </div>
    `;

    currentMarker.bindPopup(popupContent);
  }

  /**
   * Resalta visualmente el radio de la isócrona seleccionada en los botones
   */
  function resaltarIsocronaActiva(minutos) {
    currentIsochroneMinutes = minutos;
    [5, 10, 15].forEach(m => {
      const circle = isochroneCircles[m];
      if (!circle) return;
      if (m === minutos) {
        circle.setStyle({
          weight: 2.2,
          fillOpacity: 0.12,
          color: '#02362f'
        });
      } else {
        circle.setStyle({
          weight: 1.0,
          fillOpacity: 0.03,
          color: m === 10 ? '#b45309' : '#02362f'
        });
      }
    });
  }

  // ==========================================
  // 2. AUTOCOMPLETADO ASÍNCRONO DE VÍAS (ICGC)
  // ==========================================
  function inicializarAutocompletado() {
    const inputCalle = document.getElementById('input-calle');
    const selectMunicipio = document.getElementById('select-municipio');
    const sugerenciasContainer = document.getElementById('sugerencias-vias');

    if (!inputCalle || !sugerenciasContainer) return;

    inputCalle.addEventListener('input', function (e) {
      const texto = e.target.value.trim();

      clearTimeout(debounceTimer);

      if (texto.length < 2) {
        sugerenciasContainer.innerHTML = '';
        sugerenciasContainer.classList.add('hidden');
        return;
      }

      debounceTimer = setTimeout(() => {
        const municipio = selectMunicipio ? selectMunicipio.value : 'Barcelona';
        consultarSugerenciasICGC(texto, municipio);
      }, 250);
    });

    // Cerrar contenedor al hacer clic fuera
    document.addEventListener('click', function (e) {
      if (!inputCalle.contains(e.target) && !sugerenciasContainer.contains(e.target)) {
        sugerenciasContainer.classList.add('hidden');
      }
    });
  }

  /**
   * Consulta el endpoint de autocompletado en backend
   */
  async function consultarSugerenciasICGC(texto, municipio) {
    const sugerenciasContainer = document.getElementById('sugerencias-vias');
    if (!sugerenciasContainer) return;

    try {
      const url = `${API_BASE_URL}/api/autocompletar?texto=${encodeURIComponent(texto)}&municipio=${encodeURIComponent(municipio)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        sugerenciasContainer.classList.add('hidden');
        return;
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.sugerencias || data.results || []);

      if (items.length === 0) {
        sugerenciasContainer.innerHTML = `
          <div class="px-3 py-2 text-outline text-[12px] italic">
            No se encontraron vías coincidentes en ${municipio}
          </div>
        `;
        sugerenciasContainer.classList.remove('hidden');
        return;
      }

      // Renderizar listado de sugerencias
      sugerenciasContainer.innerHTML = '';
      items.slice(0, 7).forEach(item => {
        const nombreVia = typeof item === 'string' ? item : (item.nombre || item.calle || item.label || item.name);
        const tipoVia = item.tipo || item.layer || 'Vía Urbana';

        const row = document.createElement('div');
        row.className = 'px-3 py-2 cursor-pointer hover:bg-stone-surface/60 transition-colors flex items-center justify-between text-body-sm text-charcoal-text';
        row.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-outline text-[15px]">signpost</span>
            <span class="font-medium">${nombreVia}</span>
          </div>
          <span class="font-label-tabular-sm text-outline text-[10px] uppercase">${tipoVia}</span>
        `;

        row.addEventListener('click', function () {
          const inputCalle = document.getElementById('input-calle');
          const inputNumero = document.getElementById('input-numero');
          
          if (inputCalle) inputCalle.value = nombreVia;
          sugerenciasContainer.classList.add('hidden');

          // Trasladar automáticamente el foco al número de policía (no disparar análisis hasta pulsar Analizar)
          if (inputNumero) {
            inputNumero.focus();
            inputNumero.select();
          }
        });

        sugerenciasContainer.appendChild(row);
      });

      sugerenciasContainer.classList.remove('hidden');

    } catch (err) {
      console.warn('Error al autocompletar vía:', err);
      sugerenciasContainer.classList.add('hidden');
    }
  }

  // ==========================================
  // 3. RESOLUCIÓN AUTOMÁTICA EN CASCADA (AUTO-TRIGGER)
  // ==========================================
  function inicializarDisparadores() {
    const inputNumero = document.getElementById('input-numero');
    const inputPiso = document.getElementById('input-piso');
    const inputCalle = document.getElementById('input-calle');
    const selectMunicipio = document.getElementById('select-municipio');
    const btnAnalizar = document.getElementById('btn-analizar');

    // Permitir pulsar Enter en cualquier campo de la barra de búsqueda para ejecutar análisis
    [inputCalle, inputNumero, inputPiso].forEach(el => {
      if (!el) return;
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          ejecutarAnalisisCompleto();
        }
      });
    });

    // Al cambiar de municipio, actualizar el contexto territorial pero NO ejecutar análisis
    if (selectMunicipio) {
      selectMunicipio.addEventListener('change', () => {
        const sugerenciasContainer = document.getElementById('sugerencias-vias');
        if (sugerenciasContainer) {
          sugerenciasContainer.innerHTML = '';
          sugerenciasContainer.classList.add('hidden');
        }

        const nuevoMun = selectMunicipio.value;
        const badgeMun = document.getElementById('val-municipio-distrito-badge');
        if (badgeMun) {
          badgeMun.textContent = `${nuevoMun} • Prov. Barcelona`;
        }

        const calleVal = inputCalle ? inputCalle.value.trim() : '';
        if (calleVal && calleVal.length >= 2) {
          consultarSugerenciasICGC(calleVal, nuevoMun);
        }
      });
    }

    // BOTÓN PRINCIPAL ANALIZAR: Es el ÚNICO que dispara el análisis, el mapa y los datos
    if (btnAnalizar) {
      btnAnalizar.addEventListener('click', (e) => {
        e.preventDefault();
        ejecutarAnalisisCompleto();
      });
    }
  }

  function verificarYDispararAnalisis() {
    const calle = document.getElementById('input-calle')?.value.trim() || '';
    if (calle.length >= 2) {
      const now = Date.now();
      if (now - ultimoAnalisisTimestamp > 250) {
        ultimoAnalisisTimestamp = now;
        ejecutarAnalisisCompleto();
      }
    }
  }

  // ==========================================
  // 4. FUNCIÓN ejecutarAnalisisCompleto()
  // ==========================================
  async function ejecutarAnalisisCompleto() {
    const municipio = document.getElementById('select-municipio')?.value || 'Barcelona';
    const calle = document.getElementById('input-calle')?.value.trim() || 'Carrer de Balmes';
    const numero = document.getElementById('input-numero')?.value.trim() || '12';
    const piso = document.getElementById('input-piso')?.value.trim() || '';
    const tipologia = document.getElementById('select-tipologia')?.value || 'retail';
    const superficie = parseFloat(document.getElementById('input-superficie')?.value) || 110;
    const precio = parseFloat(document.getElementById('input-precio')?.value) || 320000;
    const fachada = document.getElementById('select-fachada')?.value || 'chaflan';
    const humos = document.getElementById('check-humos')?.checked || false;
    const conservacion = document.getElementById('select-conservacion')?.value || 'ligera';

    // Montar dirección completa para feedback y consulta
    const direccionCompleta = `${calle}, ${numero}${piso ? ', ' + piso : ''}, ${municipio}`;

    // Actualizar input oculto de compatibilidad
    const inputDireccion = document.getElementById('input-direccion');
    if (inputDireccion) inputDireccion.value = direccionCompleta;

    // Toast indicador de carga
    mostrarToastFeedback('Resolviendo Catastro OVC y capas territoriales...');

    // Estado visual en botón
    const btnAnalizar = document.getElementById('btn-analizar');
    const originalText = btnAnalizar ? btnAnalizar.innerHTML : '';
    if (btnAnalizar) {
      btnAnalizar.disabled = true;
      btnAnalizar.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span><span>Consultando...</span>`;
    }

    try {
      const params = new URLSearchParams({
        municipio: municipio,
        calle: calle,
        numero: numero,
        piso: piso,
        direccion: direccionCompleta,
        tipologia: tipologia,
        superficie: superficie.toString(),
        precio: precio.toString(),
        fachada: fachada,
        humos: humos ? 'true' : 'false',
        conservacion: conservacion
      });

      const response = await fetch(`${API_BASE_URL}/api/analizar?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error en servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      aplicarDatosEnInterfaz(data);
      mostrarToastFeedback(`Activo verificado: ${municipio} • Ref. OVC OK`);

    } catch (err) {
      console.warn('Fallo en conexión backend, ejecutando modelo de cálculo local resiliente:', err);
      aplicarCalculoResilienteLocal(municipio, calle, numero, piso, tipologia, superficie, precio, humos, conservacion);
      mostrarToastFeedback(`Modelo estimado (Modo Local Resiliente)`);
    } finally {
      if (btnAnalizar) {
        btnAnalizar.disabled = false;
        btnAnalizar.innerHTML = originalText;
      }
    }
  }

  // ==========================================
  // INYECCIÓN DE DATOS EN EL DOM
  // ==========================================
  function aplicarDatosEnInterfaz(data) {
    if (!data) return;

    const activo = data.activo || {};
    const finanzas = data.finanzas || {};
    const entorno = data.entorno || {};
    const ocr = entorno.ocr || {};
    const acustica = data.acustica || {};
    const ruido = acustica.ruido || {};
    const clima = data.clima || {};
    const metro = data.metro || {};
    const regulacion = data.regulacion || {};

    // A. Metros cuadrados, año Catastro, Cuota IBI y Ficha Lateral
    const supM2 = activo.superficie ? Math.round(activo.superficie) : 110;
    const anoConstruccion = activo.ano_construccion || 1928;
    const tipoFinca = activo.tipo_finca || (anoConstruccion < 1960 ? 'Finca Clásica' : 'Edificación Moderna');
    const cuotaIbi = finanzas.ibi || 1248;
    const ibiMensual = finanzas.ibi_mensual || Math.round(cuotaIbi / 12);

    setText('disp-superficie', `${supM2} m²`);
    setText('disp-ano', `${anoConstruccion}`);
    setText('disp-tipo-finca', tipoFinca);
    setText('disp-ibi', formatEuro.format(cuotaIbi) + '/año');
    setText('disp-ibi-mes', formatEuro.format(ibiMensual) + '/mes');
    setText('disp-conservacion', 'Buen Estado (Habitable)');
    
    // Compatibilidad interna
    const precioTotal = finanzas.precio || 320000;
    const precioM2 = Math.round(precioTotal / supM2);
    setText('disp-precio', formatEuro.format(precioTotal));
    setText('disp-precio-m2', `${formatInt.format(precioM2)} €/m²`);
    
    if (activo.tipologia) {
      const tipoNombres = { 'retail': 'Local Comercial (Retail)', 'residencial': 'Vivienda Residencial', 'oficina': 'Oficina / Terciario' };
      setText('disp-tipologia', tipoNombres[activo.tipologia] || 'Inmueble Urbano');
    }

    const inputSup = document.getElementById('input-superficie');
    if (inputSup) inputSup.value = supM2;
    const inputPre = document.getElementById('input-precio');
    if (inputPre) inputPre.value = precioTotal;

    setText('val-ano', activo.ano_construccion ? `${activo.ano_construccion} (${activo.tipo_finca || 'Finca Consolidada'})` : '1928 (Finca Clásica)');

    // B. Referencia Catastral y Ficha Registral
    setText('val-ref-catastral', activo.ref_catastral || '08019A014000320001KL');
    setText('val-ref-catastral-side', activo.ref_catastral || '08019A014000320001KL');
    setText('val-calificacion-side', activo.calificacion_urbanistica || 'Clave 13b (Densif.)');
    setText('val-municipio-distrito', activo.distrito || activo.municipio || 'L\'Eixample');
    setText('val-municipio-distrito-badge', `${activo.municipio || 'Barcelona'} • ${activo.distrito || 'Eixample'}`);

    const reg = activo.registro || {};
    setText('val-registro-num', reg.num || 'Registro de la Propiedad Competente');
    if (document.getElementById('val-registro-sede')) {
      document.getElementById('val-registro-sede').innerHTML = `
        <span class="material-symbols-outlined text-[14px] text-outline">location_on</span>
        <span>${reg.sede || 'Dirección de la sede registral'}</span>
      `;
    }
    if (document.getElementById('val-registro-tel')) {
      document.getElementById('val-registro-tel').innerHTML = `
        <span class="material-symbols-outlined text-[14px]">call</span>
        <span>${reg.tel || '+34 933 01 24 55'}</span>
      `;
    }

    // C. Banners Superiores y Tarjeta Lateral Pla d'Usos
    if (document.getElementById('badge-regulacion')) {
      const tituloReg = regulacion.titulo || "Regulación Especial Activa (Pla d'Usos)";
      const truncEl = document.getElementById('badge-regulacion').querySelector('.truncate');
      if (truncEl) truncEl.textContent = tituloReg;
    }

    // Actualizar Tarjeta Lateral Plan de Usos debajo de Ficha Técnica
    setText('val-pla-dusos-titulo', regulacion.titulo || "Pla d'Usos Eixample (Hostelería & Terrazas)");
    setText('val-pla-dusos-desc', regulacion.descripcion || "Sector afectado por el Pla Especial d'Usos. Suspensión de nuevas licencias de restauración C3 y verificación obligatoria del Índice MIVAU.");
    setText('val-pla-dusos-badge', regulacion.alerta ? "REGULADO" : "CONFORME");
    setText('val-pla-dusos-tensionado', regulacion.zona_tensionada ? "Zona Tensionada MIVAU" : "Régimen General");

    if (document.getElementById('badge-parking')) {
      const sinergia = finanzas.sinergia_parking || {};
      const defScore = sinergia.deficit_aparcamiento_score || '90 / 100';
      const presCalz = sinergia.presion_calzada || 'Alta Presión Área Verde/Azul';
      document.getElementById('badge-parking').querySelector('.truncate').textContent = `${defScore} (${presCalz})`;
    }

    if (document.getElementById('badge-transporte')) {
      const textoMetro = metro.texto || (metro.estacion ? `Metro ${metro.estacion} (${metro.lineas || 'Líneas'}) a ${metro.distancia_m || 280} m` : 'Metro Universitat a 280 m');
      document.getElementById('badge-transporte').querySelector('.truncate').textContent = textoMetro;
    }

    // D. 4 KPIs Superiores
    const scoreVal = activo.score || 86;
    setText('kpi-score', `${scoreVal} / 100`);
    const barScore = document.getElementById('kpi-score-bar');
    if (barScore) barScore.style.width = `${Math.min(100, Math.max(0, scoreVal))}%`;

    const rentaMensual = finanzas.renta_mensual || 3850;
    setText('kpi-renta', `${formatInt.format(rentaMensual)} €/m`);

    const grossYield = finanzas.gross_yield || 7.22;
    setText('kpi-gross-yield', `${formatDec.format(grossYield)} %`);

    const niy = finanzas.niy || 5.68;
    setText('kpi-niy', `${formatDec.format(niy)} %`);

    const noiVal = finanzas.noi || 41294;
    setText('kpi-noi-sub', `NOI: ${formatInt.format(noiVal)} €/año (c/CapEx)`);

    // E. Panel Exclusivo: Renta INCASÒL (Zona más baja / Barrio) & IBI Municipal
    const rentaAnual = finanzas.renta_anual_bruta || (rentaMensual * 12);
    const cuotaIbi = finanzas.ibi || 1248;
    const ibiMensual = finanzas.ibi_mensual || Math.round(cuotaIbi / 12);
    const netoAnual = finanzas.neto_anual_post_ibi || (rentaAnual - cuotaIbi);
    const netoMensual = finanzas.neto_mensual_post_ibi || Math.round(netoAnual / 12);

    setText('val-incasol-zona', finanzas.zona_incasol || `${activo.distrito || 'Sector Eixample'} (${activo.municipio || 'Barcelona'})`);
    setText('val-incasol-m2', `${formatDec.format(finanzas.renta_m2 || 21.20)} €/m²`);
    setText('val-incasol-mensual', `${formatEuro.format(rentaMensual)}/mes`);
    setText('val-incasol-anual', `${formatEuro.format(rentaAnual)}/año`);

    setText('val-ibi-municipio', `Padrón IBI Ajuntament de ${activo.municipio || 'Barcelona'}`);
    setText('val-ibi-mensual', `-${formatEuro.format(ibiMensual)}/mes`);
    setText('val-ibi-anual', `-${formatEuro.format(cuotaIbi)}/año`);

    setText('val-neto-mensual', `${formatEuro.format(netoMensual)}/mes`);
    setText('val-neto-anual', `${formatEuro.format(netoAnual)}/año`);

    // Sincronización de elementos de compatibilidad interna
    setText('row-precio', formatEuro.format(finanzas.precio || 320000));
    setText('row-itp', formatEuro.format(finanzas.itp || 32000));
    setText('row-ajd', formatEuro.format(finanzas.ajd || 4800));
    setText('row-capex', formatEuro.format(finanzas.capex || 0));
    setText('row-inversion-total', formatEuro.format(finanzas.inversion_total || 356800));
    setText('row-renta-anual', formatEuro.format(rentaAnual));
    setText('row-ibi', '-' + formatEuro.format(cuotaIbi));
    setText('row-comunidad', '-' + formatEuro.format(finanzas.comunidad || 1100));
    setText('row-seguro', '-' + formatEuro.format(finanzas.seguro || 450));
    setText('row-reserva', '-' + formatEuro.format(finanzas.reserva || 1000));
    setText('row-noi', formatEuro.format(noiVal));

    if (finanzas.payback) setText('box-payback', `${formatDec.format(finanzas.payback)} años`);
    if (finanzas.cap_rate) setText('box-cap-rate', `${formatDec.format(finanzas.cap_rate)} %`);
    if (finanzas.tir) setText('box-tir', `${formatDec.format(finanzas.tir)} %`);

    // F. Entorno Demográfico y Comercial - Granularidad Mínima
    if (entorno.renta_ine) {
      setText('val-renta-ine', formatEuro.format(entorno.renta_ine));
    }
    if (entorno.renta_ine_seccion) {
      setText('val-renta-ine-seccion', entorno.renta_ine_seccion);
    }
    if (entorno.renta_ine_granularidad) {
      setText('val-renta-ine-granularidad', entorno.renta_ine_granularidad);
    }
    if (entorno.poblacion_flotante) {
      setText('val-poblacion-flotante', entorno.poblacion_flotante);
    }
    if (entorno.poblacion_flotante_desc) {
      setText('val-poblacion-flotante-desc', entorno.poblacion_flotante_desc);
    }
    if (entorno.poblacion_flotante_badge) {
      setText('badge-poblacion-flotante', entorno.poblacion_flotante_badge);
    }
    if (entorno.poblacion_flotante_granularidad) {
      setText('val-poblacion-flotante-granularidad', entorno.poblacion_flotante_granularidad);
    }
    if (entorno.competencia) {
      setText('val-competencia', entorno.competencia);
    }
    if (entorno.competencia_desc) {
      setText('val-competencia-desc', entorno.competencia_desc);
    }
    if (entorno.competencia_badge) {
      setText('badge-competencia', entorno.competencia_badge);
    }
    if (entorno.competencia_granularidad) {
      setText('val-competencia-granularidad', entorno.competencia_granularidad);
    }

    if (ocr.facturacion_mensual_req) {
      setText('val-ocr-facturacion', formatEuro.format(ocr.facturacion_mensual_req));
    }
    if (ocr.tickets_dia_req) {
      setText('val-ocr-tickets', `${formatInt.format(ocr.tickets_dia_req)} tickets/día`);
    }
    if (ocr.tasa_captura_req) {
      setText('val-ocr-captura', `${formatDec.format(ocr.tasa_captura_req)} %`);
    }
    if (ocr.riesgo_impago) {
      setText('val-ocr-riesgo', ocr.riesgo_impago);
    }
    if (ocr.ratio_saludable) {
      setText('val-ocr-ratio', `OCR Objetivo: ${ocr.ratio_saludable}`);
    }

    // G. Acústica & Viandantes (Micro-granularidad de tramo y fachada)
    if (acustica.viandantes_hora) {
      setText('val-viandantes', `${formatInt.format(acustica.viandantes_hora)} viandantes / hora`);
    }
    if (acustica.viandantes_tramo) {
      setText('val-viandantes-tramo', acustica.viandantes_tramo);
    }
    if (acustica.viandantes_fuente) {
      setText('val-viandantes-fuente', acustica.viandantes_fuente);
    }
    if (acustica.apto_terraza !== undefined) {
      const elTerraza = document.getElementById('val-terraza');
      if (elTerraza) {
        const esApto = acustica.apto_terraza;
        const statusTexto = acustica.terraza_status || (esApto ? 'Viabilidad Alta' : 'Restricción de Terraza');
        elTerraza.innerHTML = `
          <span class="material-symbols-outlined ${esApto ? 'text-primary' : 'text-error'} text-[20px] flex-shrink-0">
            ${esApto ? 'check_circle' : 'cancel'}
          </span>
          <div class="flex flex-col">
            <span class="font-body-sm text-body-sm font-bold ${esApto ? 'text-primary' : 'text-error'}">
              ${statusTexto}
            </span>
            <span class="font-body-sm text-body-sm text-on-surface-variant text-[11px] leading-snug">
              ${acustica.terraza_detalle || (esApto ? 'Acera > 4.5 m de anchura total. Ancho libre garantizado.' : 'Anchura de acera o ZATHN restringe veladores.')}
            </span>
          </div>
        `;
      }
    }
    if (acustica.terraza_fuente) {
      setText('val-terraza-fuente', acustica.terraza_fuente);
    }

    // Barras de Ruido dBA y Diagnóstico ZATHN / Fachada
    const dbaVianLd = ruido.vianants_ld || 62;
    setText('val-ruido-vianants-ld', `${dbaVianLd} dBA`);
    setBarWidth('bar-ruido-vianants-ld', dbaVianLd);

    const dbaVianLe = ruido.vianants_le || 59;
    setText('val-ruido-vianants-le', `${dbaVianLe} dBA`);
    setBarWidth('bar-ruido-vianants-le', dbaVianLe);

    const dbaOciLn = ruido.oci_ln || 48;
    setText('val-ruido-oci-ln', `${dbaOciLn} dBA`);
    setBarWidth('bar-ruido-oci-ln', dbaOciLn);
    if (ruido.oci_desc) {
      setText('val-ruido-oci-desc', ruido.oci_desc);
    }

    const dbaTransit = ruido.transit_ld || 66;
    setText('val-ruido-transit-ld', `${dbaTransit} dBA`);
    setBarWidth('bar-ruido-transit-ld', dbaTransit);
    if (ruido.transit_desc) {
      setText('val-ruido-transit-desc', ruido.transit_desc);
    }
    if (ruido.fuente) {
      setText('val-ruido-fuente', ruido.fuente);
    }

    // 6 Tarjetas de Clima 365 días
    if (clima.dias_lluvia !== undefined) setText('clima-dias-lluvia', `${clima.dias_lluvia} días`);
    if (clima.precipitacion_mm !== undefined) setText('clima-precipitacion', `${clima.precipitacion_mm} mm`);
    if (clima.olas_calor !== undefined) setText('clima-ola-calor', `${clima.olas_calor} días`);
    if (clima.noches_tropicales !== undefined) setText('clima-noches-tropicales', `${clima.noches_tropicales} noches`);
    if (clima.hdd !== undefined) setText('clima-hdd', `${clima.hdd} HDD`);
    if (clima.cdd !== undefined) setText('clima-cdd', `${clima.cdd} CDD`);

    // H. Pestaña Dinámica de Movilidad & Parking
    const mov = data.movilidad || data.metro || {};
    if (mov.deficit_score !== undefined) setText('mov-deficit-score', `${mov.deficit_score} / 100`);
    if (mov.deficit_desc) setText('mov-deficit-desc', mov.deficit_desc);
    if (mov.ocupacion_pct !== undefined) setText('mov-ocupacion-pct', `${mov.ocupacion_pct} % Ocupación`);
    if (mov.ocupacion_desc) setText('mov-ocupacion-desc', mov.ocupacion_desc);
    if (mov.puntos_ev) setText('mov-puntos-ev', mov.puntos_ev);
    if (mov.puntos_ev_desc) setText('mov-puntos-ev-desc', mov.puntos_ev_desc);

    const p1 = mov.parking1 || {};
    if (p1.nombre) setText('mov-p1-nombre', p1.nombre);
    if (p1.desc) setText('mov-p1-desc', p1.desc);
    if (p1.tag) setText('mov-p1-tag', p1.tag);

    const p2 = mov.parking2 || {};
    if (p2.nombre) setText('mov-p2-nombre', p2.nombre);
    if (p2.desc) setText('mov-p2-desc', p2.desc);
    if (p2.tag) setText('mov-p2-tag', p2.tag);

    if (mov.dum_desc) setText('mov-dum-desc', mov.dum_desc);
    if (mov.sensibilidad_lluvia) setText('mov-clima-impacto', mov.sensibilidad_lluvia);
    if (mov.sensibilidad_desc) setText('mov-clima-desc', mov.sensibilidad_desc);

    const micro = mov.micromovilidad || {};
    if (micro.nombre) setText('mov-micro-nombre', micro.nombre);
    if (micro.desc) setText('mov-micro-desc', micro.desc);
    if (micro.rotacion) setText('mov-micro-tag', micro.rotacion);

    // I. Movimiento de Cámara Leaflet y actualización de marcador
    if (activo.lat && activo.lon && map) {
      const lat = parseFloat(activo.lat);
      const lon = parseFloat(activo.lon);
      actualizarMarcadorYIsocronas(lat, lon, activo.direccion, activo.ref_catastral);
      map.flyTo([lat, lon], 17, {
        animate: true,
        duration: 1.0
      });
      if (currentMarker) {
        setTimeout(() => currentMarker.openPopup(), 400);
      }
    }
  }

  // ==========================================
  // CÁLCULO RESILIENTE LOCAL (FALLBACK EN CASO OFFLINE)
  // ==========================================
  function aplicarCalculoResilienteLocal(municipio, calle, numero, piso, tipologia, sup, precio, humos, conservacion) {
    let euroM2Mes = 35.0;
    if (tipologia === 'oficina') euroM2Mes = 22.5;
    if (tipologia === 'residencial') euroM2Mes = 19.8;
    if (tipologia === 'retail' && humos) euroM2Mes *= 1.15;

    let capexUnitario = 180;
    if (conservacion === 'listo') capexUnitario = 0;
    if (conservacion === 'reforma') capexUnitario = 650;

    const capex = sup * capexUnitario;
    const itp = precio * 0.10;
    const ajd = precio * 0.015;
    const inversionTotal = precio + itp + ajd + capex;

    const rentaMensual = Math.round(sup * euroM2Mes);
    const rentaAnual = rentaMensual * 12;

    const ibi = Math.round(precio * 0.0039);
    const comunidad = Math.round(sup * 10);
    const seguro = 450;
    const reserva = Math.round(rentaAnual * 0.022);
    const noi = rentaAnual - (ibi + comunidad + seguro + reserva);

    const grossYield = (rentaAnual / precio) * 100;
    const netYield = (noi / inversionTotal) * 100;
    const payback = inversionTotal / (noi || 1);

    // Formatear dirección
    const dir = `${calle}, ${numero}${piso ? ', ' + piso : ''}, ${municipio}`;

    const mockData = {
      activo: {
        direccion: dir,
        municipio: municipio,
        distrito: municipio === 'Barcelona' ? 'Eixample' : 'Centre',
        lat: currentCoords.lat,
        lon: currentCoords.lon,
        ref_catastral: '08019A0' + Math.floor(100000000000 + Math.random() * 900000000000) + 'KL',
        ano_construccion: 1935,
        superficie: sup,
        score: 84,
        registro: {
          num: `Registro de la Propiedad de ${municipio}`,
          sede: `Plaza Mayor, 1, ${municipio}`,
          tel: '+34 932 15 89 21'
        }
      },
      regulacion: {
        titulo: tipologia === 'residencial' ? 'Zona Tensionada (Ley Vivienda 12/2023)' : "Pla d'Usos Sector Comercial",
      },
      finanzas: {
        precio: precio,
        renta_mensual: rentaMensual,
        renta_anual_bruta: rentaAnual,
        itp: itp,
        ajd: ajd,
        capex: capex,
        inversion_total: inversionTotal,
        ibi: ibi,
        comunidad: comunidad,
        seguro: seguro,
        reserva: reserva,
        noi: noi,
        gross_yield: grossYield,
        niy: netYield,
        payback: payback,
        cap_rate: (noi / inversionTotal) * 100,
        tir: netYield + 2.5,
        sinergia_parking: {
          deficit_aparcamiento_score: '88 / 100',
          presion_calzada: 'Alta Ocupación'
        }
      },
      entorno: {
        renta_ine: 36800,
        ocr: {
          facturacion_mensual_req: Math.round(rentaMensual / 0.125),
          tickets_dia_req: Math.round(rentaMensual / (0.125 * 26 * 2.8)),
          tasa_captura_req: 3.1,
          riesgo_impago: 'Bajo (1.5/10)',
          ratio_saludable: '12.5%'
        }
      },
      acustica: {
        viandantes_hora: 390,
        apto_terraza: true,
        ruido: { vianants_ld: 61, vianants_le: 58, oci_ln: 47, transit_ld: 64 }
      },
      clima: {
        dias_lluvia: 48,
        precipitacion_mm: 512,
        olas_calor: 22,
        noches_tropicales: 68,
        hdd: 780,
        cdd: 460
      },
      metro: {
        texto: 'Estación Central a 320 m (4 min a pie)'
      }
    };

    aplicarDatosEnInterfaz(mockData);
  }

  // ==========================================
  // 5. CONEXIÓN DE DESCARGAS Y REPORTES
  // ==========================================
  function inicializarAccionesDescarga() {
    // Botón Descargar Excel (.xlsx)
    const btnExcel = document.getElementById('btn-descargar-excel');
    if (btnExcel) {
      btnExcel.addEventListener('click', function (e) {
        e.preventDefault();

        const municipio = document.getElementById('select-municipio')?.value || 'Barcelona';
        const calle = document.getElementById('input-calle')?.value.trim() || 'Balmes';
        const numero = document.getElementById('input-numero')?.value.trim() || '12';
        const tipologia = document.getElementById('select-tipologia')?.value || 'retail';
        const sup = document.getElementById('input-superficie')?.value || '110';
        const precio = document.getElementById('input-precio')?.value || '320000';

        mostrarToastFeedback('Generando libro Excel oficial (.xlsx) formulado...');

        const query = new URLSearchParams({
          municipio: municipio,
          calle: calle,
          numero: numero,
          tipologia: tipologia,
          superficie: sup,
          precio: precio
        });

        // Forzar descarga directa desde endpoint FastAPI
        window.location.href = `${API_BASE_URL}/api/descargar-excel?${query.toString()}`;
      });
    }

    // Botón Descargar / Imprimir PDF
    const btnPdf = document.getElementById('btn-descargar-pdf');
    if (btnPdf) {
      btnPdf.addEventListener('click', function (e) {
        e.preventDefault();
        mostrarToastFeedback('Compilando dossier ejecutivo institucional...');
        setTimeout(() => {
          window.print();
        }, 500);
      });
    }
  }

  // ==========================================
  // HELPERS DE MANIPULACIÓN DEL DOM
  // ==========================================
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setBarWidth(id, percent) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }

  function mostrarToastFeedback(mensaje) {
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast(mensaje);
      return;
    }
    const toast = document.getElementById('action-toast');
    const txt = document.getElementById('toast-text');
    if (!toast || !txt) return;

    txt.textContent = mensaje;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3200);
  }

  // Exponer función globalmente para botones externos
  window.ejecutarAnalisisCompleto = ejecutarAnalisisCompleto;
  window.recalcularModelo = ejecutarAnalisisCompleto;

  // Modificar función window.cambiarIsocrona para recalcular los círculos en Leaflet
  const originalCambiarIsocrona = window.cambiarIsocrona;
  window.cambiarIsocrona = function (minutos) {
    if (typeof originalCambiarIsocrona === 'function') {
      originalCambiarIsocrona(minutos);
    }
    resaltarIsocronaActiva(minutos);
  };

  // ==========================================
  // ARRANQUE LIMPIO AL CARGAR EL DOM
  // ==========================================
  document.addEventListener('DOMContentLoaded', function () {
    inicializarMapa();
    inicializarAutocompletado();
    inicializarDisparadores();
    inicializarAccionesDescarga();
  });

})();
