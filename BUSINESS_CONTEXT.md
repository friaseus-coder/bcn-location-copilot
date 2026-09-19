# BUSINESS CONTEXT & INVESTMENT THESIS
## Barcelona Province Location Intelligence & Underwriting Copilot (v3.0)

Este documento establece la base conceptual, económica, analítica y regulatoria para la toma de decisiones de inversión inmobiliaria institucional en los 311 municipios de la Provincia de Barcelona. Constituye la fuente de verdad matemática y operativa para analistas, comités de inversión y agentes autónomos en **Antigravity IDE**.

---

## 1. Tesis de Inversión Institucional por Tipología de Activo

El mercado inmobiliario de la Provincia de Barcelona presenta dinámicas asimétricas marcadas por la escasez de suelo, un marco regulatorio estricto y una polarización de rentas. El sistema modela tres clases de activos principales:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   TESIS DE INVERSIÓN PROVINCIAL                                  │
├───────────────────────────────┬───────────────────────────────┬──────────────────────────────────┤
│ 1. LOCAL COMERCIAL (RETAIL)   │ 2. TERCIARIO Y OFICINAS       │ 3. VIVIENDA RESIDENCIAL          │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ • Arbitraje de sobreprecio    │ • Polarización CBD vs 22@     │ • Blindaje legal Gran Tenedor    │
│ • OCR Inverso (<10,5%)        │ • Total Cost of Occupancy     │ • Esfuerzo de hogares (<30%)     │
│ • Viabilidad de terrazas      │ • Densidad FTE (10 m²/puesto) │ • Tope vinculante Índice MIVAU   │
│ • Flujo peatonal acústico     │ • Conectividad ferroviaria    │ • 140 municipios tensionados     │
└───────────────────────────────┴───────────────────────────────┴──────────────────────────────────┘
```

### 1.1. Locales Comerciales en Planta Baja (Retail & Restauración)
* **Tesis Central:** El valor de un bajo comercial no reside en el metro cuadrado construido, sino en la capacidad de facturación del operador antes de alcanzar su punto de asfixia financiera.
* **Sesgo de Asking Prices:** Los portales inmobiliarios muestran rentas ofertadas infladas entre un $+10\%$ y $+25\%$. El sistema ancla el underwriting a las series de fianzas reales depositadas en el **INCASÒL**, garantizando rentabilidades sustentadas en contratos efectivos.
* **Factor Diferencial Físico:**
  - **Salida de Humos:** La existencia de chimenea reglamentaria según CTE DB-SI y ordenanza municipal incrementa la renta de mercado en un $+15\%$ al habilitar licencias de hostelería (C3) y obradores.
  - **Fachada y Chaflán:** Los chaflanes del Eixample Cerdà ($>10\text{ m}$ de desarrollo) ofrecen mayor ángulo de visibilidad comercial y doble flujo peatonal respecto a tramos interiores estrechos ($<3\text{ m}$).

### 1.2. Oficinas e Inmuebles Terciarios
* **Tesis Central:** Los ocupantes corporativos evalúan el *Total Cost of Occupancy* (TCO), combinando la renta fría (*Cold Rent*) con los gastos de comunidad e impuestos repercutibles (*Service Charges*).
* **Dinámica Suburbana y Metropolitana:** Mientras el Prime CBD (Passeig de Gràcia / Diagonal) mantiene vacancias por debajo del $5\%$, áreas de expansión terciaria como el 22@ Norte o polígonos periféricos experimentan desocupación superior al $18\%$, obligando a computar carencias contractuales de 6 a 12 meses.
* **Eficiencia Operativa:** Ratio objetivo de ocupación de $10\text{ m}^2\text{ útiles / FTE}$ (Full-Time Equivalent).

### 1.3. Vivienda Residencial (Alquiler Habitual)
* **Tesis Central:** Inversión patrimonial defensiva condicionada por la declaración formal de **Zona de Mercado Residencial Tensionado**.
* **Límites Vinculantes:** Para propietarios calificados como Grandes Tenedores ($\ge 5$ inmuebles residenciales en Cataluña), la renta máxima queda sujeta imperativamente al límite superior del **Índice de Precios del MIVAU** o a la renta del contrato anterior minorada.
* **Tasa de Esfuerzo Local:** El alquiler no debe superar el $30\%$ de la renta neta media de la sección censal (fuente: INE Atlas de Distribución de Renta de los Hogares - ADRH) para neutralizar el riesgo de morosidad.

---

## 2. Formulación Matemática Institucional (LaTeX)

### 2.1. Inversión Inicial Total
La base de capital desembolsado contempla el precio pactado, la fiscalidad autonómica catalana, los aranceles arancelarios y el gasto de reposición física:

$$\text{Inversión Total} = P \times (1 + \text{ITP} + \text{AJD}) + \text{CapEx}$$

Donde:
* $P$: Precio de compraventa pactado en euros (€).
* $\text{ITP} = 0{,}10$ ($10{,}0\%$ según tipo impositivo general en Cataluña).
* $\text{AJD} = 0{,}015$ ($1{,}50\%$ correspondiente a Notaría, Registro de la Propiedad y Gestoría colegiada).
* $\text{CapEx} = S \times C_{\text{conservación}}$:
  * *Listo para entrar / Buen estado:* $0\text{ \euro/m}^2$.
  * *Requiere adecuación ligera:* $180\text{ \euro/m}^2$.
  * *Para reforma integral:* $650\text{ \euro/m}^2$.

### 2.2. Net Operating Income (NOI)
El flujo operativo neto anual descuenta los costes operativos no repercutibles:

$$\text{NOI} = \text{Renta Bruta Anual} - \text{OpEx Total}$$

$$\text{Renta Bruta Anual} = S \times R_{\text{m}^2/\text{mes}} \times 12$$

$$\text{OpEx Total} = \text{IBI} + \text{Comunidad} + \text{Seguro} + \text{Reserva Técnica}$$

Donde:
* $\text{IBI} = P \times 0{,}0039$ ($0{,}39\%$ del valor de adquisición, equivalente a un tipo municipal del $0{,}66\%$ sobre una base catastral valorada al $50\%$).
* $\text{Comunidad} = S \times 12\text{ \euro/año}$ (gastos ordinarios de comunidad y conservación de elementos comunes).
* $\text{Seguro} = 450\text{ \euro/año}$ (póliza multirriesgo continente y responsabilidad civil).
* $\text{Reserva Técnica} = \text{Renta Bruta Anual} \times 0{,}022$ ($2{,}2\%$ de provisión técnica para reposición de instalaciones y vacancia).

### 2.3. Ratios de Rentabilidad Institucional
* **Gross Yield (Rentabilidad Bruta Simple):**
  $$\text{Gross Yield (\%)} = \left( \frac{\text{Renta Bruta Anual}}{P} \right) \times 100$$

* **Net Initial Yield (NIY - Rentabilidad Neta Inicial):**
  $$\text{NIY (\%)} = \left( \frac{\text{NOI}}{\text{Inversión Total}} \right) \times 100$$

* **Payback Desapalancado (Años de Recuperación del Capital):**
  $$\text{Payback} = \frac{\text{Inversión Total}}{\text{NOI}}$$

* **Cap Rate (Tasa de Capitalización Operativa):**
  $$\text{Cap Rate (\%)} = \left( \frac{\text{NOI}}{\text{Inversión Total}} \right) \times 100$$

---

## 3. Modelo de Sostenibilidad Comercial: OCR Inverso (*Occupancy Cost Ratio*)

El ratio de esfuerzo comercial define el porcentaje máximo de ventas que un inquilino de retail puede destinar al pago del alquiler sin incurrir en pérdidas de explotación:

$$\text{OCR} = \frac{\text{Renta Anual Contractual}}{\text{Ventas Anuales Totales}}$$

El sistema aplica el **Modelo de OCR Inverso** para calcular la viabilidad operativa requerida:

### 3.1. Facturación Mensual y Anual Requerida
Fijando un benchmark prudencial institucional para Barcelona de $\text{OCR}_{\text{objetivo}} = 10{,}5\%$ ($0{,}105$):

$$\text{Ventas Mensuales Requeridas} = \frac{\text{Renta Mensual}}{\text{OCR}_{\text{objetivo}}} = \frac{\text{Renta Mensual}}{0{,}105}$$

$$\text{Ventas Anuales Requeridas} = \text{Ventas Mensuales Requeridas} \times 12$$

### 3.2. Tickets Diarios Requeridos
Considerando un ticket medio estándar en retail de $T_m = 18{,}00\text{ \euro}$ y $26$ días comerciales de apertura mensual:

$$\text{Tickets Diarios Requeridos} = \frac{\text{Ventas Mensuales Requeridas}}{T_m \times 26} = \frac{\text{Ventas Mensuales Requeridas}}{18 \times 26}$$

### 3.3. Tasa de Captura Peatonal Requerida ($CR$)
El aforo total diurno que discurre frente a la fachada se calcula sobre una jornada comercial activa de $11$ horas:

$$\text{Aforo Diario Frente a Fachada} = \text{Viandantes en Hora Punta} \times 11$$

$$\text{CR (\%)} = \left( \frac{\text{Tickets Diarios Requeridos}}{\text{Aforo Diario Frente a Fachada}} \right) \times 100$$

* **Criterios Institucionales del Semáforo de Riesgo:**
  * $CR \le 2{,}2\%$: 🟢 **Riesgo Bajo (1,4 / 10).** Emplazamiento de alto tráfico con margen de solvencia holgado.
  * $2{,}2\% < CR \le 3{,}8\%$: 🟡 **Riesgo Medio (2,8 / 10).** Viabilidad exigente; requiere marca consolidada o fuerte tracción omnicanal.
  * $CR > 3{,}8\%$: 🔴 **Riesgo Alto (4,5 / 10).** Sobreprecio contractual incompatible con el tránsito peatonal real de la vía.

---

## 4. Auditoría de Confort Térmico y Demanda Energética (Open-Meteo)

La serie retrospectiva de 365 días reales (Open-Meteo Archive API) modela el impacto de la climatología sobre la afluencia comercial, la operatividad de terrazas y los costes operacionales de climatización (HVAC):

### 4.1. Grados Día de Calefacción ($HDD_{18}$ - Heating Degree Days)
Mide la severidad invernal acumulada para mantener una temperatura base de confort interior de $18\text{ \textdegree C}$:

$$\text{HDD}_{18} = \sum_{i=1}^{365} \max\left(0,\, 18 - \frac{T_{\max, i} + T_{\min, i}}{2}\right)$$

### 4.2. Grados Día de Refrigeración ($CDD_{21}$ - Cooling Degree Days)
Mide la exigencia estival de aire acondicionado debida al calor y al efecto isla térmica urbana sobre una base de $21\text{ \textdegree C}$:

$$\text{CDD}_{21} = \sum_{i=1}^{365} \max\left(0,\, \frac{T_{\max, i} + T_{\min, i}}{2} - 21\right)$$

### 4.3. Coste Operacional de Climatización (HVAC)
El consumo energético derivado se proyecta con la ecuación:

$$\text{Coste HVAC (\euro/año)} = S \times \left( \text{Consumo Base} + \alpha \cdot \text{CDD}_{21} \right) \times \text{Precio kWh}$$

Con un consumo medio estandarizado en la Provincia de Barcelona de $92\text{ kWh/m}^2/\text{año}$, resultando en un coste estimado de $1.820\text{ \euro/año}$ para una superficie tipo de $110\text{ m}^2$.

---

## 5. Marco Normativo y Urbanístico Provincial

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   MATRIZ REGULATORIA PROVINCIAL                                  │
├───────────────────────────────┬───────────────────────────────┬──────────────────────────────────┤
│ PLA D'USOS DE BARCELONA       │ PEUAT (ALOJAMIENTOS TURÍSTICOS│ LEY ESTATAL 12/2023 (MIVAU)      │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ • Suspensión C3 en Ciutat     │ • Zona 1: Decrecimiento neto  │ • 140 municipios tensionados     │
│   Vella, Eixample y Gràcia    │   (0 nuevas licencias HUT)    │ • Límite superior Índice MIVAU   │
│ • Distancias mínimas (150 m)  │ • Zona 2: Mantenimiento       │ • Congelación contrato anterior  │
│ • Terrazas: acera >= 4,5 m    │ • Extinción de plazas al cese │ • Penalización fiscal IBI +50%   │
└───────────────────────────────┴───────────────────────────────┴──────────────────────────────────┘
```

### 5.1. Pla d'Usos de Barcelona (Ciutat Vella, Eixample, Gràcia y Sant Martí)
* **Restauración (Licencias C3 y C2):** Prohibición absoluta de otorgamiento de nuevas licencias en zonas saturadas sin el traspaso y baja simultánea de un establecimiento preexistente en la misma corona viaria.
* **Actividades de Conveniencia y Platos Preparados (*Takeaway / Dark Kitchens*):** Exigencia de radio de dispersión de entre 150 y 300 metros respecto a otros operadores similares.
* **Ordenanza de Terrazas:**
  - Anchura total mínima de acera $\ge 4{,}50\text{ metros}$.
  - Pasillo peatonal continuo y rectilíneo libre de obstáculos $\ge 1{,}80\text{ metros}$.
  - Incompatibilidad en tramos declarados Zona Acústicamente Tensionada en Horario Nocturno (ZATHN).

### 5.2. PEUAT (Pla Especial Urbanístic d'Allotjaments Turístics)
* **Zona 1 (Decrecimiento neto - Centro urbano y frentes marítimos):** Densidad nula. Si un hotel o vivienda turística (HUT) cesa su actividad, la licencia se extingue definitivamente sin reposición.
* **Zona 2 (Mantenimiento condicionado):** Cupo congelado; no se admiten incrementos en el parque de camas turísticas.

### 5.3. Régimen de Contención de Rentas de la Ley 12/2023 (MIVAU)
* **Alcance Territorial:** Declaración vinculante en **140 municipios de Cataluña**, abarcando la práctica totalidad de los municipios de la Provincia de Barcelona (Barcelona, L'Hospitalet, Badalona, Sabadell, Terrassa, Mataró, Sant Cugat, Cornellà, Granollers, Manresa, Castelldefels, etc.).
* **Condición de Gran Tenedor:** Persona física o jurídica titular de 5 o más inmuebles residenciales urbanos en la comunidad autónoma.
* **Impacto en el Underwriting:**
  - La renta queda topada estrictamente por el valor superior del Sistema Estatal de Referencia (MIVAU).
  - En renovaciones de contratos previos, la renta no puede superar la del último contrato vigente en los últimos 5 años, más la variación acumulada del índice de referencia legal.
