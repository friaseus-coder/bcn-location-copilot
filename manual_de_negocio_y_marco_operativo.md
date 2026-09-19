# Manual de Negocio, Tesis de Inversión y Marco Operativo
## BCN Location Intelligence & Underwriting Copilot (v3.0)

Este documento define la base conceptual, económica, analítica y regulatoria de la plataforma. Está diseñado para que cualquier analista, comercial, comité de inversión o agente autónomo en **Antigravity IDE** comprenda el propósito estratégico del sistema, los casos de uso reales, la metodología de cálculo y el entorno normativo de Barcelona.

---

## 1. Resumen Ejecutivo y Tesis de Inversión

### 1.1. El Problema del Mercado Inmobiliario
El análisis inmobiliario tradicional en Barcelona padece una fragmentación estructural:
* **Silos de información:** El análisis físico (Catastro), la seguridad jurídica (Registro de la Propiedad), el mercado financiero (fianzas de alquiler) y el marco regulatorio (planeamiento urbanístico municipal) se consultan de manera aislada y manual.
* **Costes recurrentes excesivos:** Las soluciones comerciales de *Location Intelligence* (Geoblink, Carto, Brainsre) conllevan licencias anuales de entre $10.000\text{ \euro}$ y $30.000\text{ \euro}$, centrándose primordialmente en datos agregados de tarjetas bancarias sin resolver la realidad jurídica ni el triaje catastral directo.
* **Sesgo de oferta (*Asking Prices*):** La mayoría de herramientas toman como referencia los precios anunciados en portales inmobiliarios, los cuales incorporan márgenes de negociación artificiales de entre el $+5\%$ y el $+20\%$.
* **Puntos ciegos regulatorios:** Barcelona cuenta con un entramado normativo sumamente restrictivo (Pla d'Usos en distritos centrales, Plan PEUAT para hospedaje turístico y la declaración de Zona Tensionada bajo la Ley Estatal 12/2023). Ignorar estas restricciones en la fase preliminar suele desembocar en adquisiciones inviables o litigios costosos.

### 1.2. La Solución del Sistema: Triaje Institucional en Menos de 60 Segundos
La plataforma opera como un **Copiloto de Triaje y Underwriting Rápido** que:
1. Normaliza y valida la dirección contra el callejero oficial del Institut Cartogràfic i Geològic de Catalunya (ICGC).
2. Extrae de forma instantánea la realidad física catastral (superficie, año de edificación, uso principal) y resuelve la demarcación competente del Registro de la Propiedad para solicitar la Nota Simple informativa.
3. Cruza el activo con la base oficial de contratos reales registrados en **INCASÒL**, eliminando el sesgo de portales.
4. Audita la viabilidad legal y operativa según el uso previsto: **Retail** (OCR y flujo peatonal acústico), **Oficinas** (vacancia de submercado y accesibilidad metropolitana) y **Residencial** (topes de renta vinculantes MIVAU y esfuerzo de los hogares).
5. Calcula los retornos operativos netos institucionales ($NOI$, $Gross\ Yield$, $Net\ Initial\ Yield$ y *Payback*) contemplando costes fiscales autonómicos (ITP 10%), gastos arancelarios y CapEx de adecuación.
6. Evalúa las sinergias de movilidad urbana y presión de estacionamiento en calzada (Área Verde/Azul).
7. Opera bajo una política estricta de **Coste Cero Permanente (0,00 €)** sustentada en infraestructuras de datos abiertos oficiales.

---

## 2. Perfiles de Usuario y Casos de Uso Clave

```
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   PERFILES DE USUARIO                                  │
 ├────────────────────────────┬─────────────────────────────┬─────────────────────────────┤
 │ 1. BROKER / COMERCIAL      │ 2. ANALISTA DE ADQUISICIONES│ 3. ASSET & MOBILITY MANAGER │
 │    (Retail & Negociación)  │    (Underwriting Financiero)│    (Infraestructura Urbana) │
 ├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
 │ • Validación de licencias  │ • Cuenta de explotación P&L │ • Déficit de aparcamiento   │
 │ • Sostenibilidad de rentas │ • Retornos netos (NIY/NOI)  │ • Paquetes de abonados      │
 │ • Captura peatonal en acera│ • Tope legal Ley Vivienda   │ • Sensibilidad a lluvia/CDD │
 └────────────────────────────┴─────────────────────────────┴─────────────────────────────┘
```

### 2.1. El Comercial Inmobiliario (Broker & Expansión de Retail)
* **Objetivo:** Filtrar activos con rapidez, evitar operaciones inviables y disponer de argumentos cuantitativos objetivos para negociar con propietarios e inquilinos.
* **Flujo de Trabajo:**
  1. Introduce la dirección que le ofrece un propietario (ej. *Carrer de Balmes, 12*).
  2. Comprueba si el tramo cuenta con suspensión de licencias para hostelería (C3), platos preparados (*takeaway*) o supermercados de conveniencia 24h mediante el semáforo del Pla d'Usos.
  3. Verifica el ancho de la acera para certificar si la ordenanza municipal permite instalar terraza exterior ($\ge 4,5\text{ m}$ libres).
  4. Utiliza el **Modelo de Esfuerzo Comercial (OCR)** para defender la renta ante el futuro inquilino: demuestra cuántas ventas y cuántos tickets diarios necesita el negocio para pagar el alquiler de forma holgada.
  5. Contrapone el precio pedido por el propietario frente a la mediana real de INCASÒL, identificando el *spread* de sobreprecio para ajustar la oferta inicial.

### 2.2. El Analista de Inversiones (Underwriting & Private Equity)
* **Objetivo:** Proyectar la viabilidad financiera, estimar con rigor el flujo de caja operativo antes de deuda e impuestos, y descartar activos con rentabilidades ficticias.
* **Flujo de Trabajo:**
  1. Introduce el precio de compraventa y selecciona el estado de conservación del inmueble (*Listo*, *Adecuación ligera* o *Reforma integral*).
  2. El sistema calcula automáticamente la inversión total requerida ($CapEx + \text{ITP } 10\% + \text{Notaría/Registro } 1,5\%$).
  3. Genera la cuenta de explotación proyectada deduciendo los gastos operativos reales no repercutibles: IBI municipal de Barcelona ($0,66\%$ sobre base catastral estimada), seguro de continente, gastos ordinarios de comunidad, reserva de reposición de CapEx ($2\%$) y vacancia estructural ($3\%$).
  4. Obtiene el **Net Initial Yield (NIY)** y el **Net Operating Income (NOI)** real, evitando confusiones con la rentabilidad bruta simple.
  5. En residencial, evalúa el impacto de la Ley Estatal 12/2023: si el fondo es Gran Tenedor ($\ge 5$ viviendas), la renta se ajusta de inmediato al tope superior del Sistema Estatal de Referencia (MIVAU).

### 2.3. El Gestor de Movilidad y Aparcamientos (Asset & Mobility Management)
* **Objetivo:** Detectar desequilibrios entre la demanda de estacionamiento y la capacidad física de los edificios circundantes para paquetizar servicios y monetizar plazas vinculadas.
* **Flujo de Trabajo:**
  1. Analiza el **Índice de Déficit de Aparcamiento en Cuenca** ($0$ a $100$) y la saturación del estacionamiento regulado en superficie (Área Verde y Azul).
  2. Si evalúa un edificio de oficinas o residencial que carece de parking subterráneo en una zona con déficit superior a $85/100$ (ej. Eixample o Gràcia), el activo se identifica como un tractor de demanda cautiva para parkings próximos.
  3. Permite paquetizar contratos mixtos: arrendamiento de oficinas o locales combinados con abonos de aparcamiento para directivos, flotas y trabajadores.
  4. Cruza el factor de lluvia del último año móvil: en jornadas lluviosas ($>1\text{ mm}$), la demanda de rotación bajo techo se incrementa entre un $+15\%$ y un $+25\%$.

---

## 3. Lógica y Reglas de Negocio por Tipología de Activo

### 3.1. Local Comercial (Retail & Restauración)

#### A. Modelo de Sostenibilidad Comercial: OCR Inverso (*Occupancy Cost Ratio*)
El fallo más frecuente en retail consiste en fijar una renta que asfixia financieramente al operador a los 12-18 meses. El sistema calcula la facturación mínima necesaria:

$$\text{Ventas Anuales Requeridas} = \frac{\text{Renta Anual Contractual} + \text{Gastos Comunes}}{\text{OCR Objetivo por Sector}}$$

$$\text{Ventas Mensuales Requeridas} = \frac{\text{Ventas Anuales Requeridas}}{12}$$

* **Benchmarks de OCR Sostenible en Barcelona:**
  * *Alimentación / Supermercados:* $5,0\% - 6,5\%$ (Márgenes brutos estrechos, alta rotación de inventario).
  * *Servicios personales / Salud / Clínicas:* $8,0\% - 10,0\%$ (Alto valor añadido de mano de obra).
  * *Restauración y Hostelería:* $9,5\% - 12,0\%$ (Coste de producto $30\%$ + personal $35\%$).
  * *Moda, Calzado y Complementos:* $12,0\% - 15,0\%$ (Requiere máxima exposición de escaparate).

#### B. Modelo de Captura Peatonal Requerida
El sistema contrasta la facturación necesaria con el aforo de viandantes diurno derivado de la energía acústica:

1. **Tickets Diarios Requeridos:**
   $$\text{Tickets / Día} = \frac{\text{Ventas Mensuales Requeridas}}{\text{Ticket Medio Estimado} \times 26\text{ Días Comerciales}}$$

2. **Aforo Peatonal Total Diario frente a Fachada:**
   $$\text{Peatones / Día} = \text{Viandantes en Hora Punta} \times 11\text{ Horas Comerciales Diarias}$$

3. **Tasa de Captura Peatonal Requerida ($CR$):**
   $$CR\text{ (\%)} = \left( \frac{\text{Tickets / Día}}{\text{Peatones / Día}} \right) \times 100$$

* **Semáforo de Viabilidad:**
  * $CR \le 1,8\%$: 🟢 **Alta Viabilidad.** Flujo abundante; el operador solo necesita atraer a menos de 2 de cada 100 viandantes.
  * $1,9\% \le CR \le 3,5\%$: 🟡 **Viabilidad Exigente.** Requiere enseñas reconocidas o fuerte inversión en atracción.
  * $CR > 3,5\%$: 🔴 **Riesgo Severo de Impago.** Desfase entre la renta solicitada y el paso real de la calle.

#### C. Zonificación por Profundidad de Local (Método Colbert)
No todos los metros cuadrados de un bajo comercial tienen el mismo rendimiento:
$$\text{Superficie Computable Ponderada} = (\text{Zona A}_{\le 10\text{m}} \times 1,0) + (\text{Zona B}_{10-20\text{m}} \times 0,5) + (\text{Zona C / Sótano} \times 0,25)$$

---

### 3.2. Oficinas e Inmuebles Terciarios

* **Coste Total de Ocupación (*Total Cost of Occupancy* - TCO):**
  Los contratos corporativos se estructuran en renta fría (*Cold Rent*) más gastos repercutibles (*Service Charges*):
  $$\text{TCO Mensual} = (\text{Renta Neta Contractual} + \text{Service Charges Estimados}) \times \text{Superficie Útil}$$
  * *Benchmark de Service Charges en Barcelona:* Prime CBD ($4,50 - 6,80\text{ \euro/m}^2/\text{mes}$), 22@ ($3,20 - 4,80\text{ \euro/m}^2/\text{mes}$), Periferia ($1,80 - 2,80\text{ \euro/m}^2/\text{mes}$).
* **Densidad Operativa de Empleados:**
  * Modelo estándar corporativo: $10 - 12\text{ m}^2\text{ útiles / puesto de trabajo (FTE)}$.
  * Modelo flexible / *Hot-desking*: $7 - 9\text{ m}^2\text{ útiles / puesto de trabajo}$.
* **Tasa de Vacancia del Submercado Terciario:**
  * CBD (Diagonal / Passeig de Gràcia / Eixample centro): $< 4,5\% - 5,5\%$ de vacancia. Poder de fijación de rentas en favor del arrendador.
  * 22@ Norte (por encima de Av. Diagonal): $18,0\% - 23,5\%$ de vacancia. Presión a la baja y necesidad de provisionar entre 6 y 12 meses de carencia (*rent-free periods*).

---

### 3.3. Vivienda Residencial (Alquiler Habitual)

* **Semáforo de Esfuerzo Familiar de la Sección Censal (INE ADRH):**
  Determina si las familias residentes en el entorno micro inmediato pueden asumir la renta proyectada:
  $$\text{Ratio de Esfuerzo (\%)} = \left( \frac{\text{Renta Mensual Estimada}}{\text{Renta Neta Media Hogar Mensual (INE)}} \right) \times 100$$
  * $\le 30,0\%$: 🟢 **Entorno Altamente Solvente.** Capacidad de absorción local holgada; riesgo de mora mínimo.
  * $31,0\% - 40,0\%$: 🟡 **Zona Tensionada.** Exige avales bancarios o contratación de seguro de impago de alquiler.
  * $> 40,0\%$: 🔴 **Riesgo Crítico de Insolvencia.** Renta fuera del alcance local; el piso solo podrá colocarse a perfiles expatriados o conmuters internacionales.
* **Tope Regulatorio Vinculante (Ley Estatal 12/2023 por el Derecho a la Vivienda):**
  Toda Barcelona está clasificada como zona de mercado tensionado. Para tenedores de $\ge 5$ inmuebles residenciales en Cataluña, la renta queda limitada obligatoriamente por el límite superior del Índice de Precios del MIVAU ($14,50\text{ \euro/m}^2/\text{mes}$ en secciones centrales), eliminando cualquier cálculo especulativo basado en portales.

---

## 4. Marco Regulatorio y Urbanístico Municipal de Barcelona

### 4.1. Pla d'Usos (Ciutat Vella, Eixample, Gràcia y Sant Martí)
Regula las condiciones de concesión de licencias para actividades de pública concurrencia:
* **Restauración (Licencias C3 / C2):** Prohibición absoluta de concesión de nuevas licencias en zonas de contención máxima sin la baja previa (traspaso) de un establecimiento en la misma corona viaria.
* **Platos preparados y obradores (*Takeaway / Dark Kitchens*):** Fuertes restricciones de densidad máxima por tramo y radio de 100 metros.
* **Comercios de conveniencia / 24 Horas:** Distancia mínima obligatoria de 150 a 300 metros entre establecimientos de la misma categoría para frenar la proliferación indiscriminada.

### 4.2. PEUAT (Pla Especial Urbanístic d'Allotjaments Turístics)
Delimita cuatro zonas geográficas respecto al hospedaje turístico:
* **Zona 1 (Decrecimiento neto - Ciutat Vella, Poblenou costero, Eixample centro):** 0 nuevas licencias de Viviendas de Uso Turístico (HUT) y 0 nuevos hoteles. Si un hotel o HUT causa baja, la plaza se extingue.
* **Zona 2 (Mantenimiento condicionado):** No se permite incrementar el número global de plazas turísticas.
* **Zona 3 (Crecimiento contenido periférico):** Solo se admiten nuevas licencias si se producen bajas consolidadas en las Zonas 1 y 2.

### 4.3. Ordenanza Municipal de Terrazas
Para autorizar la ocupación de la vía pública con mesas y veladores, la calle debe cumplir:
* Anchura total de acera $\ge 4,50\text{ metros}$.
* Pasillo peatonal continuo y recto $\ge 1,80\text{ metros}$ totalmente libre de obstáculos, arbolado y alcorques.
* Ausencia de declaración de Zona Acústicamente Tensionada en Horario Nocturno (ZATHN) en el tramo.

---

## 5. Formulación Matemática de Rentabilidad y Retornos

### 5.1. Inversión Inicial Total (Base del Capital Desembolsado)
$$\text{Inversión Total} = \text{Precio de Compra} \times (1 + \text{ITP}_{10\%} + \text{Gastos}_{1,5\%}) + \text{CapEx Adecuación}$$

Donde el CapEx se modela paramétricamente según el estado físico seleccionado:
* *Listo para entrar / Buen estado:* $0\text{ \euro/m}^2$.
* *Requiere adecuación ligera:* $180\text{ \euro/m}^2$.
* *Para reforma integral:* $650\text{ \euro/m}^2$.

### 5.2. Net Operating Income (NOI)
$$\text{NOI Anual} = \text{Renta Bruta Anual Contractual} - \text{OpEx Operativo Total}$$

Siendo el OpEx operativo anual la suma de:
* **IBI Barcelona:** Calculado al $0,66\%$ sobre el valor catastral estimado ($50\%$ del precio de mercado).
* **Seguro de Continente y Comunidad:** Estimado en $14\text{ \euro/m}^2\text{ al año}$.
* **Reserva de Reposición CapEx:** Provisión técnica del $2,0\%$ de los ingresos brutos.
* **Vacancia Estructural:** $3,0\%$ de los ingresos brutos (equivalente a 1 mes cada 3 años).

### 5.3. Ratios de Rentabilidad Institucional
* **Gross Yield (Rentabilidad Bruta):**
  $$\text{Gross Yield (\%)} = \left( \frac{\text{Renta Bruta Anual Contractual}}{\text{Precio de Adquisición}} \right) \times 100$$
* **Net Initial Yield (NIY Institucional):**
  $$\text{Net Initial Yield (\%)} = \left( \frac{\text{NOI}}{\text{Inversión Inicial Total}} \right) \times 100$$
* **Payback Desapalancado (Años de Retorno):**
  $$\text{Payback} = \frac{\text{Inversión Inicial Total}}{\text{NOI}}$$