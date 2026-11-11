# Rediseño Integral: Laboratorio Clínico de Ingeniería Agroindustrial

Transformación visual y estructural completa del simulador hacia una estética sobria de laboratorio blanco clínico con un único acento azul de ingeniería, disposición asimétrica con panel lateral limpio y gráficas tipo publicación científica en 2D y 3D, manteniendo íntegramente el sistema de dos ecuaciones diferenciales, la animación temporal, la inspección tridimensional y el análisis de intersección.

## Decisiones Críticas y Preferencias Confirmadas

> [!IMPORTANT]
> Direcciones de diseño confirmadas para reemplazar la estética oscura multicolor actual:

- **Estética y Paleta de Color**: Laboratorio blanco clínico sobre lienzo claro (`#FFFFFF` y `#F8FAFC`) con tipografía oscura de alto contraste (`#0F172A`) y un solo acento azul calibrado (`#1D4ED8`) como color protagonista en controles activos y trazos principales.
- **Estructura y Forma de Visualización**: Consola dividida limpia con barra de navegación superior de una sola línea, franja de resumen técnico sin recuadros recargados, panel lateral izquierdo sobrio de parámetros y escenario principal amplio centrado en la gráfica o lámina matemática.
- **Gráficas 2D, 3D y Tarjetas de Datos**: Gráficas estilo publicación científica sobre fondo blanco con marco cerrado de ejes, retícula tenue, trazos de alto contraste diferenciados por tono neutro/azul y estilo de línea (sin brillos ni rellenos llamativos), y lectura numérica tabular plana en lugar de tarjetas de colores apiladas.

---

## 1. Visión General y Enfoque del Rediseño

### Propósito y Audiencia
Herramienta académica y de ingeniería de procesos lácteos diseñada para **Ingeniería Agroindustrial**. Permite analizar, deducir paso a paso y simular el comportamiento cinético del consumo de lactosa $S(t)$ y la síntesis de ácido láctico $P(t)$ durante la fermentación del yogur a $43\ ^\circ\text{C}$, respondiendo con precisión profesional al cálculo de detención por enfriamiento ($t^*$), al cruce entre curvas ($S(t) = P(t)$) y a la evolución de unidades en función del tiempo.

### Modelo Matemático Preservado
Se mantiene intacto el sistema acoplado de dos ecuaciones diferenciales ordinarias de primer orden del informe base:
- Consumo de lactosa: $\frac{dS}{dt} = -k_1 S$, $S(0) = S_0 = 50\text{ g/L} \implies S(t) = S_0 e^{-k_1 t}$.
- Producción de ácido láctico: $\frac{dP}{dt} = b k_1 S$, $P(0) = 0\text{ g/L} \implies P(t) = b S_0 (1 - e^{-k_1 t})$.
- Balance de materia: $P(t) + b S(t) = b S_0 = 35\text{ g/L}$.
- Tiempo óptimo de detención ($0{,}8\%$ de acidez / $80\ ^\circ\text{D}$): $t^* \approx 4{,}33\text{ h}$ ($4\text{ h } 20\text{ min}$).
- Intersección matemática de concentraciones ($S(t) = P(t)$): $t_{\text{int}} = \frac{1}{k_1}\ln\!\left(\frac{1+b}{b}\right) \approx 14{,}79\text{ h}$ con $S = P \approx 20{,}59\text{ g/L}$.

---

## 2. Experiencia de Usuario y Diseño Visual

### Paleta Clínica y Regla 60-30-10
- **60% Lienzo Dominante Blanco / Alabastro**: Fondo principal en blanco puro (`#FFFFFF`) y papel técnico suave (`#F8FAFC`) para el área de gráficas y hojas de cálculo matemático.
- **30% Superficies Estructurales y Tinta**: Paneles planos en gris pizarra claro (`#F1F5F9` / `#FFFFFF`) delimitados únicamente por líneas divisorias finas de `1px` (`#E2E8F0` / `#CBD5E1`). Texto principal en pizarra profunda (`#0F172A`), texto secundario en gris medio (`#475569`) y etiquetas dimensionales en gris neutro (`#64748B`).
- **10% Acento Único Azul de Ingeniería**: Azul cobalto calibrado (`#1D4ED8` y `#2563EB`) concentrado estrictamente en pestaña activa, botón principal de restablecimiento, controles de reproducción, deslizadores y curva principal de lactosa; la segunda curva y trazos secundarios emplean tinta grafito (`#0F172A`) y líneas discontinuas para distinguir series como en revistas científicas (eliminando el arcoíris de morados, cianes, ámbares y brillos neón).

### Tipografía y Disciplina Tabular
- **Interfaz y Títulos**: *Plus Jakarta Sans* con pesos sobrios (`500` y `600`), títulos balanceados sin negritas exageradas ni rótulos en mayúsculas gritonas.
- **Telemetría, Ejes y Tablas**: *JetBrains Mono* con numerales tabulares (`tabular-nums`) para evitar saltos horizontales al animar las curvas o inspeccionar puntos.
- **Expresiones Algebraicas**: Fórmulas KaTeX centradas sobre bandas neutras `#F8FAFC` con borde fino `#E2E8F0`.

### Reorganización Espacial ("Forma de Ver la Información")
1. **Barra Superior Minimalista (3 Zonas)**: Marca en una sola línea (`AGRO-LAB · Fermentación Láctea`), cinco enlaces textuales limpios con subrayado inferior activo (`Tablero EDO`, `Cinética 2D`, `Superficie 3D`, `Simulador de Lote`, `Cruce y Dinámica`) y una única acción principal (`Valores PDF`).
2. **Franja Técnica Superior Compacta**: Línea horizontal limpia bajo la cabecera que muestra las dos soluciones analíticas y los tiempos clave ($t^*$ y $t_{\text{int}}$) separados por divisores tipográficos simples.
3. **Consola Dividida Asimétrica**:
   - *Panel Izquierdo Sobrio (`300px`)*: Deslizadores limpios con etiquetas numéricas alineadas a la derecha para $S_0$, $k_1$, $b$ y $P^*$, más una tabla compacta de dos filas con los tiempos críticos ($t^*$ y cruce $S=P$), sin cajas de colores saturados.
   - *Escenario Principal*:
     - **Tablero EDO y Cruce y Dinámica**: Presentados como láminas limpias tipo monografía universitaria sobre fondo blanco, con divisiones horizontales finas, tablas técnicas de precisión y un modo opcional de alto contraste tipo pizarra académica.
     - **Cinética 2D**: Gráfica científica con marco cerrado de 4 lados, fondo blanco, trazos azul/grafito de grosor preciso, marcadores geométricos sobrios (`★` para $t^*$ y `◆` para el cruce $S=P$), barra limpia de animación temporal (`Reproducir`, deslizador de tiempo $t$, saltos rápidos) y tira inferior de métricas tabulares separadas por divisores verticales (sin tarjetas anidadas).
     - **Superficie 3D**: Escena 3D sobre fondo blanco/pizarra muy claro con escala científica sobria (*Cividis* o rampa azul-grafito), malla de lactosa opcional con curva de cruce y panel lateral organizado como **tabla de especificación técnica en vivo** (parámetro, valor, unidad y significado respecto al tiempo).
     - **Simulador de Lote**: Tanque de fermentación láctea con barra de progreso lineal limpia, cronómetro monocromático de laboratorio, controles directos (`Iniciar`, `Detener a 4 °C`) y gráfica sincronizada que traza el arresto horizontal al enfriar.

---

## 3. Decisiones de Producto y Compromisos Técnicos

- **Eliminación de Tarjetas Dentro de Tarjetas**:
  - *Enfoque elegido*: Sustituir múltiples contenedores redondeados de distintos colores por secciones separadas con aire, divisores de `1px` y tablas técnicas.
  - *Por qué*: Aporta claridad visual inmediata, facilita la lectura durante una sustentación universitaria y da aspecto de software profesional de ingeniería.
- **Gráficas Científicas Sobrias sin Degradados ni Sombras**:
  - *Enfoque elegido*: Configurar Plotly en 2D y 3D con fondo `#FFFFFF`, ejes cerrados en grafito `#334155`, cuadrícula `#E2E8F0`, diferenciación por grosor/estilo de línea además del color (azul cobalto vs grafito oscuro) y rampa monocromática/sobria en 3D.
  - *Alternativa descartada*: Mantener fondos oscuros con líneas neón o rellenos translúcidos multicolores.
- **Preservación de Funcionalidad Completa**:
  - *Enfoque elegido*: Mantener intactos el motor cinético, la animación temporal en 2D/3D/Lote, el inspector por puntero en 3D y la pestaña formal *Cruce y Dinámica*.

---

## 4. Arquitectura y Flujo de Datos del Sistema

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Barra Superior Blanca (3 Zonas · Navegación por Subrayado · Acción Única) │
├─────────────────────────┬─────────────────────────────────────────────────┤
│ Panel Lateral Sobrio    │ Escenario Principal (Fondo Blanco Clínico)      │
│ ─────────────────────── │ ─────────────────────────────────────────────── │
│ Parámetros del Cultivo  │ [1] Tablero EDO: Lámina paso a paso + Paso 08   │
│ • S₀ (g/L)              │ [2] Cinética 2D: Gráfica publicación + Animación│
│ • k₁ (1/h)              │     + Marcadores t* y Cruce S=P + Comparativa   │
│ • b  (g/g)              │ [3] Superficie 3D: Malla sobria P(t,k₁) / S     │
│ • P* (g/L y °D)         │     + Tabla Inspector de Unidades en vivo       │
│                         │ [4] Control de Lote: Gráfica viva + Arresto 4°C │
│ Lectura de Hitos        │ [5] Cruce y Dinámica: Monografía Agroindustrial │
│ • t* detención (h)      │                                                 │
│ • t_int cruce S=P (h)   │                                                 │
└─────────────────────────┴─────────────────────────────────────────────────┘
```

### Mapeo de Estado e Interacción
- **Estado Central Reactivo**: Los parámetros ($S_0$, $k_1$, $b$, $P^*$, temperatura) alimentan de forma inmediata el cálculo analítico de curvas, derivadas instantáneas, puntos críticos ($t^*$ y $t_{\text{int}}$), tablas horarias y fórmulas KaTeX en las cinco vistas.
- **Eventos de Exploración y Movimiento**:
  - En **Cinética 2D**, el cursor temporal $t$ anima las trayectorias sobre la guía teórica y actualiza en vivo la tira de telemetría tabular sin resetear el zoom del usuario.
  - En **Superficie 3D**, tanto el puntero sobre la malla como el deslizador de partícula actualizan en tiempo real la tabla dimensional de unidades y tasas instantáneas conservando la rotación de la cámara.
  - En **Control de Lote**, el temporizador de proceso traza la evolución real del lote y congela horizontalmente ambas curvas ($dS/dt = 0$, $dP/dt = 0$) al activar el enfriamiento a $4\ ^\circ\text{C}$.
