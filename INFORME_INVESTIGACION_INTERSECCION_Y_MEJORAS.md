# Informe de Investigación y Análisis: Retroalimentación de la Sustentación (Modelo de Fermentación de Yogur)

## Resumen de lo Solicitado por el Profesor

Tras revisar la exposición del sistema de dos ecuaciones diferenciales y la demostración del simulador, las observaciones se agrupan en **tres puntos concretos**:

1. **Intersección entre las dos curvas en la gráfica 2D ($S(t) = P(t)$):** Investigar qué ocurre matemática, física y bioquímicamente cuando ambas variables se tocan/intersecan en el gráfico, qué valores toman los parámetros en ese instante y qué marcador explicativo debe añadirse.
2. **Inspección dinámica en la gráfica 3D:** Permitir que, al desplazarse por la superficie tridimensional, se observen en vivo todos los parámetros, su significado físico y cómo evolucionan sus **unidades respecto al tiempo**.
3. **Gráfica en movimiento (animación temporal):** Analizar la viabilidad de mostrar el movimiento de las curvas y puntos conforme transcurre el tiempo y varían los parámetros, conectado también con el **Simulador de Lote**.

---

## 1. Investigación del Punto Principal: La Intersección $S(t) = P(t)$

### 1.1 Deducción Matemática Exacta (Para el Documento y Tablero)

Partiendo de las soluciones analíticas del informe ($S_0 = 50\text{ g/L}$, $P_0 = 0\text{ g/L}$, $k_1 = 0{,}06\text{ h}^{-1}$, $b = 0{,}70\text{ g/g}$):

$$S(t) = S_0 e^{-k_1 t}, \qquad P(t) = b S_0 \left(1 - e^{-k_1 t}\right)$$

Para hallar el instante $t_{\text{int}}$ en que ambas curvas se intersecan, igualamos las concentraciones ($S(t) = P(t)$):

$$S_0 e^{-k_1 t} = b S_0 \left(1 - e^{-k_1 t}\right)$$

Dividiendo ambos lados por $S_0$ ($S_0 > 0$):

$$e^{-k_1 t} = b - b e^{-k_1 t}$$

Agrupando los términos exponenciales:

$$(1 + b) e^{-k_1 t} = b \implies e^{-k_1 t} = \frac{b}{1 + b}$$

Aplicando logaritmo natural a ambos lados:

$$-k_1 t = \ln\left(\frac{b}{1 + b}\right) \implies t_{\text{int}} = \frac{1}{k_1} \ln\left(\frac{1 + b}{b}\right) = \frac{1}{k_1} \ln\left(1 + \frac{1}{b}\right)$$

Sustituyendo $t_{\text{int}}$ en $S(t)$ o en $P(t)$ obtenemos la concentración común en el cruce ($C_{\text{int}}$):

$$S(t_{\text{int}}) = P(t_{\text{int}}) = S_0 \left(\frac{b}{1 + b}\right)$$

---

### 1.2 Cálculo Numérico con los Valores Patrón del Informe

Con $S_0 = 50\text{ g/L}$, $k_1 = 0{,}06\text{ h}^{-1}$ y $b = 0{,}70\text{ g/g}$:

- **Tiempo de intersección ($t_{\text{int}}$):**
  $$t_{\text{int}} = \frac{1}{0{,}06}\ln\left(\frac{1{,}70}{0{,}70}\right) = \frac{\ln(2{,}4286)}{0{,}06} = \frac{0{,}8873}{0{,}06} \approx \mathbf{14{,}79\text{ h}} \quad (\mathbf{14\text{ h } 47\text{ min}})$$
- **Concentración en el punto de intersección:**
  $$S(t_{\text{int}}) = P(t_{\text{int}}) = 50 \cdot \left(\frac{0{,}70}{1{,}70}\right) \approx \mathbf{20{,}59\text{ g/L}}$$
- **Acidez equivalente en ese instante:**
  $$\text{Porcentaje de acidez} = \frac{20{,}59}{10} \approx \mathbf{2{,}06\%}, \qquad \text{Grados Dornic} = 20{,}59 \times 10 \approx \mathbf{206\ ^\circ\text{D}}$$
- **Consumo de lactosa acumulado:**
  - Lactosa consumida: $50 - 20{,}59 = \mathbf{29{,}41\text{ g/L}}$ ($\mathbf{58{,}82\%}$ de la lactosa inicial).
  - Lactosa restante: $\mathbf{20{,}59\text{ g/L}}$ ($\mathbf{41{,}18\%}$ de la lactosa inicial).
- **Tasas o velocidades instantáneas en el cruce:**
  $$\left.\frac{dS}{dt}\right|_{t_{\text{int}}} = -k_1 S(t_{\text{int}}) = -(0{,}06)(20{,}59) \approx \mathbf{-1{,}235\text{ g/(L}\cdot\text{h)}}$$
  $$\left.\frac{dP}{dt}\right|_{t_{\text{int}}} = b k_1 S(t_{\text{int}}) = (0{,}70)(1{,}235) \approx \mathbf{+0{,}865\text{ g/(L}\cdot\text{h)}}$$
- **Verificación de la ley de conservación física del informe:**
  $$P(t_{\text{int}}) + b S(t_{\text{int}}) = 20{,}59 + (0{,}70)(20{,}59) = 1{,}70 \times 20{,}59 = \mathbf{35{,}00\text{ g/L}} = b S_0$$

---

### 1.3 Hallazgos Teóricos Clave para Explicar al Profesor

1. **Existencia y unicidad matemática garantizada:**
   Para cualquier lote con $S_0 > 0$, $k_1 > 0$ y $b > 0$, $S(t)$ es estrictamente decreciente desde $S_0$ hacia $0$, mientras que $P(t)$ es estrictamente creciente desde $0$ hacia su asíntota $b S_0 > 0$. Por el *Teorema del Valor Intermedio*, **siempre existe un único instante $t_{\text{int}} > 0$ donde ambas curvas se cortan**.
2. **El tiempo de cruce NO depende de la lactosa inicial $S_0$:**
   En la fórmula $t_{\text{int}} = \frac{1}{k_1}\ln\left(1 + \frac{1}{b}\right)$, el parámetro $S_0$ se cancela algebraicamente. Si la leche inicia con $45\text{ g/L}$ o con $60\text{ g/L}$, las curvas se siguen cruzando exactamente a las $14{,}79\text{ h}$ (si $k_1$ y $b$ no cambian); $S_0$ solo modifica la altura vertical del cruce ($C_{\text{int}}$).
3. **¿Por qué las velocidades NO son iguales en el cruce?**
   Aunque en $t_{\text{int}}$ la masa por litro de lactosa restante y de ácido producido son idénticas ($20{,}59\text{ g/L}$), sus pendientes tienen magnitudes distintas porque el rendimiento es $b = 0{,}70 < 1$:
   $$\frac{dP}{dt} = b \left|\frac{dS}{dt}\right| = 0{,}70 \left|\frac{dS}{dt}\right|$$
   La lactosa desaparece más rápido (en $\text{g/(L}\cdot\text{h)}$) de lo que aparece el ácido láctico.
4. **Relación con la vida media de la lactosa ($t_{1/2}$):**
   La mitad de la lactosa inicial ($25\text{ g/L}$) se consume en $t_{1/2} = \frac{\ln 2}{0{,}06} \approx \mathbf{11{,}55\text{ h}}$. Como $b < 1$, la curva $P(t)$ sube más lento de lo que baja $S(t)$, por lo que el cruce ocurre **después** de la vida media ($14{,}79\text{ h} > 11{,}55\text{ h}$). Solo si el rendimiento fuera $100\%$ en masa ($b = 1$), el cruce coincidiría exactamente con la vida media ($S = P = 25\text{ g/L}$).
5. **Significado industrial y limitación del modelo ideal (punto crítico de análisis):**
   - **No es el punto óptimo del yogur:** Para fabricar yogur comercial, el proceso debe detenerse mucho antes, a las **$t^* \approx 4{,}33\text{ h}$ ($4\text{ h } 20\text{ min}$)** cuando $P = 8{,}00\text{ g/L}$ ($0{,}8\%$ acidez, $80\ ^\circ\text{D}$, $\text{pH} \approx 4{,}6$).
   - **Qué significaría llegar a $t_{\text{int}} = 14{,}79\text{ h}$:** Alcanzar una acidez de **$2{,}06\%$ ($206\ ^\circ\text{D}$)**, produciendo un yogur extremadamente agrio, sobre-acidificado, con contracción del gel proteico y separación masiva de suero (sinéresis).
   - **Comportamiento biológico real frente al modelo lineal:** En un reactor real, cuando la acidez supera $\sim 1{,}2\% - 1{,}5\%$ ($\text{pH} < 4{,}0$), las propias bacterias lácticas sufren **inhibición por producto** (el exceso de ácido frena su metabolismo) antes de alcanzar $20{,}59\text{ g/L}$. En este modelo académico de dos EDOs lineales, $k_1$ se mantiene constante y por ello aparece ese cruce matemático exacto.

### 1.4 Comparativa: Intersección Operativa ($t^*$) vs. Intersección entre Curvas ($t_{\text{int}}$)

| Característica | Intersección Operativa (Meta del Informe) | Intersección entre Curvas ($S(t) = P(t)$) |
| :--- | :--- | :--- |
| **Definición matemática** | $P(t^*) = P^* = 8{,}0\text{ g/L}$ | $S(t_{\text{int}}) = P(t_{\text{int}})$ |
| **Fórmula del tiempo** | $t^* = -\frac{1}{k_1}\ln\left(1 - \frac{P^*}{b S_0}\right)$ | $t_{\text{int}} = \frac{1}{k_1}\ln\left(1 + \frac{1}{b}\right)$ |
| **Tiempo (datos base)** | **$4{,}33\text{ h}$** ($\approx 4\text{ h } 20\text{ min}$) | **$14{,}79\text{ h}$** ($14\text{ h } 47\text{ min}$) |
| **Lactosa $S(t)$** | $38{,}57\text{ g/L}$ ($77{,}14\%$ restante) | $20{,}59\text{ g/L}$ ($41{,}18\%$ restante) |
| **Ácido láctico $P(t)$** | $8{,}00\text{ g/L}$ ($0{,}80\%$ / $80\ ^\circ\text{D}$) | $20{,}59\text{ g/L}$ ($2{,}06\%$ / $206\ ^\circ\text{D}$) |
| **Lactosa consumida** | $\approx 23\%$ ($11{,}43\text{ g/L}$) | $58{,}82\%$ ($29{,}41\text{ g/L}$) |
| **Estado físico del yogur** | **Coagulación óptima** (enfriar a $4\ ^\circ\text{C}$) | **Sobre-acidificación extrema / Sinéresis** |

### 1.5 ¿Por qué en el simulador actual a veces se ve el cruce y a veces no? (Diagnóstico de Código)

- Actualmente, el gráfico 2D (`src/components/Fermentation2DView.tsx`) fija su eje horizontal por defecto en **$0$ a $8\text{ horas}$**.
- Con los valores base del PDF ($k_1 = 0{,}06\text{ h}^{-1}$, $b = 0{,}70$), la intersección ocurre a las **$14{,}79\text{ h}$**, fuera del rango visible.
- Sin embargo, si se aumenta $k_1$ en el panel lateral (que permite hasta $0{,}15\text{ h}^{-1}$), el cruce entra dentro de las 8 horas (por ejemplo, a las **$7{,}39\text{ h}$** con $k_1 = 0{,}12\text{ h}^{-1}$ o a las **$5{,}92\text{ h}$** con $k_1 = 0{,}15\text{ h}^{-1}$), y actualmente **no existe ningún marcador ni tarjeta informativa** para ese cruce.

**Tabla de sensibilidad de $t_{\text{int}}$ al variar $k_1$ (con $S_0 = 50\text{ g/L}$, $b = 0{,}70$):**

| $k_1$ ($\text{h}^{-1}$) | $t^*$ óptimo ($8\text{ g/L}$) | $t_{\text{int}}$ cruce ($S = P$) | Concentración en cruce | $\left.\frac{dS}{dt}\right\|_{t_{\text{int}}}$ | $\left.\frac{dP}{dt}\right\|_{t_{\text{int}}}$ | ¿Visible en $0\text{–}8\text{ h}$? |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| $0{,}04$ | $6{,}49\text{ h}$ | $22{,}18\text{ h}$ | $20{,}59\text{ g/L}$ | $-0{,}82\text{ g/(L}\cdot\text{h)}$ | $+0{,}58\text{ g/(L}\cdot\text{h)}$ | No |
| **$0{,}06$ (PDF)** | **$4{,}33\text{ h}$** | **$14{,}79\text{ h}$** | **$20{,}59\text{ g/L}$** | **$-1{,}24\text{ g/(L}\cdot\text{h)}$** | **$+0{,}86\text{ g/(L}\cdot\text{h)}$** | **No (requiere $t \ge 15\text{ h}$)** |
| $0{,}08$ | $3{,}24\text{ h}$ | $11{,}09\text{ h}$ | $20{,}59\text{ g/L}$ | $-1{,}65\text{ g/(L}\cdot\text{h)}$ | $+1{,}15\text{ g/(L}\cdot\text{h)}$ | No |
| $0{,}10$ | $2{,}60\text{ h}$ | $8{,}87\text{ h}$ | $20{,}59\text{ g/L}$ | $-2{,}06\text{ g/(L}\cdot\text{h)}$ | $+1{,}44\text{ g/(L}\cdot\text{h)}$ | No |
| $0{,}12$ | $2{,}16\text{ h}$ | $7{,}39\text{ h}$ | $20{,}59\text{ g/L}$ | $-2{,}47\text{ g/(L}\cdot\text{h)}$ | $+1{,}73\text{ g/(L}\cdot\text{h)}$ | **Sí** |
| $0{,}15$ | $1{,}73\text{ h}$ | $5{,}92\text{ h}$ | $20{,}59\text{ g/L}$ | $-3{,}09\text{ g/(L}\cdot\text{h)}$ | $+2{,}16\text{ g/(L}\cdot\text{h)}$ | **Sí** |

*(Umbral exacto: para $b = 0{,}70$, el cruce entra en $0\text{–}8\text{ h}$ cuando $k_1 \ge 0{,}1109\text{ h}^{-1}$.)*

---

## 2. Investigación sobre la Gráfica 3D: Parámetros, Significado y Unidades según el Tiempo

### 2.1 Diagnóstico de lo que Falta Actualmente en la Vista 3D

En el componente actual (`src/components/Fermentation3DView.tsx`), al mover el cursor sobre la superficie $z = P(t, k_1)$:
1. El tooltip flotante de Plotly solo muestra tres números básicos: `t (h)`, `k₁ (h⁻¹)` y `P (g/L)`.
2. **No muestra**: la lactosa residual $S(t, k_1)$, los grados Dornic ($^\circ\text{D}$), el porcentaje de acidez ($\%$), ni las velocidades instantáneas de reacción $\frac{dS}{dt}$ y $\frac{dP}{dt}$ en ese punto.
3. **No explica el significado ni las unidades en función del tiempo** en un panel fijo mientras se explora la malla (el tooltip tapa parte del gráfico 3D y desaparece al rotar).
4. **Desajuste técnico detectado:** La malla 3D actualmente grafica $k_1 \in [0{,}02,\; 0{,}12]\text{ h}^{-1}$, mientras que el slider de la barra lateral (`src/components/FermentationSidebar.tsx`) llega hasta $0{,}15\text{ h}^{-1}$; si el usuario selecciona $k_1 = 0{,}15$, la línea de trayectoria del lote se sale del borde de la superficie 3D.

### 2.2 Análisis Dimensional Completo: ¿Cómo son las Unidades según el Tiempo $t$?

Para responder con precisión sobre cómo están expresados los parámetros y sus unidades al moverse por el eje temporal:

| Símbolo | Magnitud | Unidades | Dependencia con $t$ | Significado Físico / Biológico |
| :--- | :--- | :--- | :--- | :--- |
| $t$ | Tiempo de fermentación | $\text{h}$ (horas) | Variable independiente | Duración acumulada del proceso en el biorreactor a $43\ ^\circ\text{C}$. |
| $S(t)$ | Concentración de lactosa | $\text{g/L}$ | **Varía con $t$** (exponencial decreciente) | Masa de azúcar disponible por cada litro de leche en el instante $t$. |
| $P(t)$ | Ácido láctico producido | $\text{g/L}$ | **Varía con $t$** (crece hacia $bS_0$) | Masa de ácido láctico acumulado por litro en el instante $t$. |
| $\text{Acidez}$ | Acidez titulable / Dornic | $\%\text{ m/v}$ y $^\circ\text{D}$ | **Varía con $t$** ($^\circ\text{D} = 10 P$, $\% = P/10$) | Equivalencia industrial ($1\ ^\circ\text{D} = 0{,}1\text{ g/L}$ de ácido láctico). |
| $\frac{dS}{dt}$ | Tasa de consumo de lactosa | $\text{g/(L}\cdot\text{h)}$ | **Varía con $t$** ($-k_1 S(t)$) | Gramos de lactosa por litro que desaparecen en cada hora en ese instante. Es máxima en $t=0$ ($-3{,}00\text{ g/(L}\cdot\text{h)}$) y tiende a $0$. |
| $\frac{dP}{dt}$ | Tasa de producción de ácido | $\text{g/(L}\cdot\text{h)}$ | **Varía con $t$** ($+b k_1 S(t)$) | Gramos de ácido láctico por litro que se forman por hora en ese instante (máxima en $t=0$: $+2{,}10\text{ g/(L}\cdot\text{h)}$). |
| $k_1$ | Constante cinética | $\text{h}^{-1}$ ($1/\text{h}$) | Constante del cultivo (eje $Y$ en 3D) | Velocidad relativa de consumo de lactosa. Su inverso $\tau = 1/k_1$ ($\text{h}$) es el tiempo característico del sistema ($16{,}67\text{ h}$ para $k_1 = 0{,}06$). |
| $b$ | Rendimiento estequiométrico | $\text{g/g}$ (adimensional) | Constante del modelo | Gramos de ácido láctico generados por cada gramo de lactosa consumida ($0{,}70$). |
| $S_0$ | Lactosa inicial | $\text{g/L}$ | Condición inicial ($t=0$) | Concentración de partida de la leche ($50\text{ g/L}$). |

### 2.3 Comportamiento Deseable para un Inspector 3D en Tiempo Real

Cuando decidan actualizar esta vista, el análisis muestra que lo ideal sería:
- Vincular el evento de movimiento sobre la gráfica 3D (`plotly_hover`) —más un par de deslizadores de inspección puntual $(t, k_1)$ por si se expone desde pantalla táctil o proyector— a un **Panel Inspector Fijo** junto al lienzo 3D.
- Al mover el cursor por cualquier zona de la superficie, ese panel mostraría simultáneamente:
  1. Posición $(t,\; k_1)$ con unidades explícitas.
  2. Estado instantáneo: $S(t)$ en $\text{g/L}$, $P(t)$ en $\text{g/L}$, $^\circ\text{D}$ y $\%$.
  3. Velocidades instantáneas: $\frac{dS}{dt}$ y $\frac{dP}{dt}$ en $\text{g/(L}\cdot\text{h)}$.
  4. Estado de calidad del yogur en esa coordenada (*Sin coagular*, *Ventana óptima $0{,}8\%$*, *Sobre-acidificado*) y balance $P + bS = bS_0$.
- Opcionalmente, añadir un selector para superponer la segunda superficie $z = S(t, k_1)$ en la misma escena 3D, lo que permitiría visualizar la **curva tridimensional de intersección $S(t, k_1) = P(t, k_1)$** a medida que cambia $k_1$.

---

## 3. Investigación sobre la "Gráfica en Movimiento" y Conexión con el Lote

### 3.1 ¿Es Posible Implementar Gráficas en Movimiento sin Cambiar las EDOs?

**Sí, es completamente factible y pedagógicamente muy potente.** No requiere complicar ni modificar el sistema de dos ecuaciones diferenciales ni añadir modelos numéricos complejos.

Matemáticamente, el movimiento consiste en evaluar de forma continua las soluciones exactas en función de un tiempo dinámico $t_{\text{actual}} \in [0,\; t_{\max}]$:

$$\big(t_{\text{actual}},\; S(t_{\text{actual}})\big), \qquad \big(t_{\text{actual}},\; P(t_{\text{actual}})\big)$$

Mientras una curva punteada tenue muestra toda la trayectoria teórica de fondo (para no perder la referencia), la curva sólida y los marcadores avanzan en tiempo real o mediante un deslizador manual de tiempo.

### 3.2 Qué Aporta Visualmente el Movimiento en Cada Vista del Simulador

1. **En la Gráfica 2D (Cinética Animada):**
   - Observar cómo al principio ($t = 0\text{–}2\text{ h}$) las partículas de $S(t)$ y $P(t)$ avanzan verticalmente con **mayor pendiente** (consumo rápido de lactosa a $-3{,}00\text{ g/(L}\cdot\text{h)}$) y cómo esa pendiente se va **frenando exponencialmente** conforme se agota el sustrato.
   - Ver el momento exacto en que la partícula de $P(t)$ atraviesa la línea meta de $8\text{ g/L}$ ($0{,}8\%$) en $t^* = 4{,}33\text{ h}$.
   - Al extender el horizonte temporal (por ejemplo a $16\text{ h}$) o subir $k_1$, observar en directo el instante en que **los dos puntos móviles $S(t)$ y $P(t)$ se cruzan** en $20{,}59\text{ g/L}$.
   - Responder en vivo cuando se mueven los controles de $k_1$, $b$ o $S_0$ mientras la gráfica está en movimiento.
2. **En el Simulador de Lote (`src/components/FermentationBatchControl.tsx`):**
   - Actualmente el Simulador de Lote tiene cronómetro, barra de coagulación y medidores numéricos (`°D`, `P`, `S`), pero **no tiene una gráfica que se dibuje mientras corre el reloj del lote**.
   - Al añadir una gráfica en tiempo real sincronizada con el reloj del lote (`simTime`):
     - Mientras el reactor está en incubación ($43\ ^\circ\text{C}$), la gráfica dibuja en vivo $S(t)$ y $P(t)$ segundo a segundo.
     - Al pulsar **"Detener (Enfriar a 4 °C)"**, biológicamente la actividad bacteriana se frena ($k_1 \to 0 \implies \frac{dS}{dt} = 0,\; \frac{dP}{dt} = 0$), por lo que se vería literalmente cómo ambas curvas **dejan de evolucionar y se congelan como líneas horizontales planas** a partir de la hora de enfriamiento (por ejemplo en $t = 4{,}33\text{ h}$, manteniendo la acidez estable en $80\ ^\circ\text{D}$).
3. **En la Gráfica 3D:**
   - Un marcador móvil puede recorrer la trayectoria del lote actual sobre la superficie $P(t, k_1)$ conforme avanza $t$, actualizando en paralelo el panel de parámetros y unidades.

---

## 4. Lista de Revisión para el Documento Teórico (Antes de Modificar el Simulador)

Cuando revisen el documento teórico para luego definir los ajustes finales en el código, conviene validar estos 4 puntos:

1. **Sección nueva sobre la intersección $S(t) = P(t)$ en el informe:**
   - Incluir la deducción de $t_{\text{int}} = \frac{1}{k_1}\ln\!\left(\frac{1+b}{b}\right) \approx 14{,}79\text{ h}$ y $S = P \approx 20{,}59\text{ g/L}$ ($206\ ^\circ\text{D}$, $58{,}82\%$ de lactosa consumida).
   - Aclarar la diferencia entre el **punto operativo real ($t^* = 4{,}3\text{ h}$, $P = 8\text{ g/L}$)** y el **punto matemático de cruce ($14{,}79\text{ h}$)**, explicando por qué en la realidad no se llega a ese cruce (sobre-acidificación/sinéresis e inhibición bacteriana).
2. **Horizonte temporal en 2D:**
   - Decidir si mantener la gráfica 2D por defecto en $0\text{–}8\text{ h}$ con un selector rápido a $0\text{–}16\text{ h}$ / $0\text{–}20\text{ h}$ para poder mostrar el cruce $S(t) = P(t)$ incluso con los parámetros base ($k_1 = 0{,}06$), más el marcador explicativo automático cuando dicho cruce caiga dentro del rango visible.
3. **Unidades y Panel Inspector 3D:**
   - Confirmar qué variables desean fijar en el inspector al moverse por el gráfico 3D ($t$, $k_1$, $S(t)$, $P(t)$, $^\circ\text{D}$, $\%$, $\frac{dS}{dt}$ y $\frac{dP}{dt}$ en $\text{g/(L}\cdot\text{h)}$), y si quieren poder alternar/ver la superficie $S(t, k_1)$ además de $P(t, k_1)$ (ampliando $k_1$ de la malla hasta $0{,}15\text{ h}^{-1}$ para que coincida con el slider).
4. **Gráfica en Movimiento:**
   - Confirmar si desean la animación temporal con botón *Play/Pausa* y barra deslizadora de tiempo $t$ tanto en la pestaña **Cinética 2D** (y partícula móvil en **3D**) como una gráfica en vivo sincronizada dentro del **Simulador de Lote** que muestre cómo se estabilizan las curvas al enfriar a $4\ ^\circ\text{C}$.
