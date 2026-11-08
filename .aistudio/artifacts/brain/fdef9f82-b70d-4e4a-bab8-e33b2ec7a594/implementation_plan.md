# Laboratorio Interactivo de Ecuaciones Diferenciales 2D y 3D

Laboratorio interactivo y simulador matemático universitario para el estudio, resolución analítica paso a paso, visualización gráfica 2D/3D y verificación numérica de ecuaciones diferenciales ordinarias, centrado en la familia de ecuaciones de Cauchy-Euler generalizadas y la ecuación de referencia $x^2y''-5xy'+13y=x^3\ln(x)$ con $y(1)=2, y'(1)=1$.

## Decisiones Críticas y Preferencias del Usuario

> [!IMPORTANT]
> Con base en la fase de consulta interactiva previa, las siguientes especificaciones fueron confirmadas y rigen el desarrollo:

- **Alcance del Motor Matemático**: Coeficientes libres para la familia generalizada de Cauchy-Euler ($a x^2 y'' + b x y' + c y = g(x)$) con catálogo curado de presets clásicos de cálculo y física matemática (osciladores con resonancia logarítmica, casos de raíces reales repetidas, raíces complejas conjugadas y raíces reales distintas).
- **Representación 3D ($z = y(x, c_1)$)**: Visualización de la superficie tridimensional paramétrica generada al variar simultáneamente la variable espacial $x$ y la constante de integración $c_1$ (con $c_2$ interactivo o fijado por las condiciones de contorno), con malla reticular científica, mapas de calor perceptuales (Viridis/Plasma) y controles orbitales de cámara.
- **Rigor de Verificación**: Explicación simbólica paso a paso detallando cada fase algebraica con MathJax/KaTeX, complementada con un validador numérico de alta precisión mediante el método de Runge-Kutta de 4º orden (RK4) y análisis del error residual $\|y_{\text{exacta}} - y_{\text{RK4}}\|$.

---

## 1. Visión General del Laboratorio

El laboratorio está concebido como una estación de trabajo de cálculo avanzado para estudiantes universitarios, docentes e investigadores. No es una calculadora de caja negra: desglosa las justificaciones teóricas de cada transformación algebraica, el cálculo del Wronskiano, la variación de parámetros y el ajuste exacto de condiciones iniciales.

### Módulos Principales
1. **Consola y Selector de Presets**: Carga inmediata de la ecuación fundamental del proyecto ($x^2y'' - 5xy' + 13y = x^3\ln x$) y selección de casos canónicos.
2. **Editor de Parámetros y Condiciones**: Configuración en tiempo real de coeficientes ($a, b, c$), término no homogéneo $g(x)$, intervalo $[x_{\min}, x_{\max}]$ y condiciones de Cauchy $(x_0, y_0, y'_0)$.
3. **Pizarrón Simbólico Paso a Paso (7 Fases)**:
   - *Fase 1: Identificación y Clasificación*: Orden, linealidad, variables, coeficientes variables y justificación de Cauchy-Euler.
   - *Fase 2: Ecuación Característica*: Sustitución $y = x^m$, polinomio auxiliar $a m(m-1) + b m + c = 0$, discriminante $\Delta = -16$, raíces complejas $m = 3 \pm 2i$.
   - *Fase 3: Base Homogénea Fundamental*: Justificación de $x^{3 \pm 2i} = x^3 e^{\pm 2i \ln x}$, formulación de $y_1 = x^3 \cos(2\ln x)$ y $y_2 = x^3 \sin(2\ln x)$, y solución $y_h(x)$.
   - *Fase 4: Solución Particular $y_p(x)$*: Demostración dual (método de variación de parámetros con Wronskiano $W(x) = 2x^5$ y cambio de variable canónico $x=e^t$), derivando exactamente $y_p(x) = \frac{1}{4}x^3\ln(x)$.
   - *Fase 5: Solución General*: Superposición $y(x) = y_h(x) + y_p(x)$.
   - *Fase 6: Ajuste de Condiciones Iniciales*: Sistema lineal en $x_0 = 1$ para $y(1) = 2 \implies c_1 = 2$ y $y'(1) = 1 \implies c_2 = -\frac{21}{8} = -2.625$.
   - *Fase 7: Verificación Rigurosa*: Sustitución simbólica que anula el residuo algebraico a 0 y comprobación numérica punto a punto.
4. **Laboratorio Gráfico 2D**: Curvas individuales de $y_h(x)$, $y_p(x)$, $y(x)$, punto de condición inicial $(1, 2)$, recta tangente con pendiente $m = 1$, campos de dirección y sliders para explorar la familia de curvas al alterar $c_1$ y $c_2$.
5. **Superficie Científica 3D**: Superficie tridimensional $z = y(x, c_1)$ renderizada con Plotly 3D y Three.js, permitiendo rotación, zoom ortogonal/perspectiva, proyección de curvas de nivel (isoclinas) y trayectoria de la solución particular con sus condiciones de frontera.
6. **Panel de Validación Numérica (RK4)**: Comparación cuantitativa entre la solución analítica cerrada y la integración numérica Runge-Kutta 4, con gráfico de error absoluto e informe de estabilidad.

---

## 2. Experiencia de Usuario y Diseño Visual

Siguiendo las pautas del **Science, Space & Biotech Design Reference** y **Education & Simulations**:

- **Paleta y Atmósfera**:
  - *Fondo general*: Obsidiana científica profunda (`#0B0F19` y `#111827`) con paneles de lectura en gris pizarra (`#1E293B`) y bordes nítidos de 1px (`#334155`).
  - *Acentos cromáticos funcionales*: Azul cobalto (`#38BDF8`) para la solución completa $y(x)$, verde esmeralda (`#34D399`) para la solución homogénea $y_h(x)$, violeta orquídea (`#C084FC`) para la solución particular $y_p(x)$, y ámbar de advertencia/condición inicial (`#F59E0B`) para el punto de tangencia $(x_0, y_0, y'_0)$.
- **Tipografía**:
  - Títulos y etiquetas de interfaz: *Plus Jakarta Sans* / *DM Sans*.
  - Ecuaciones matemáticas: Tipografía matemática serifa de MathJax/KaTeX.
  - Tablas, métricas, valores decimales y coordenadas: *JetBrains Mono* con `font-mono tabular-nums`.
- **Organización Espacial**:
  - *Top Bar*: Logotipo e identidad "LAB · ECUACIONES DIFERENCIALES", selector rápido de presets y selector de vistas (Teoría y Pasos, Laboratorio 2D, Espacio 3D, Validación Numérica).
  - *Consola Lateral Izquierda (340px)*: Controles numéricos, coeficientes, condiciones iniciales $y(x_0), y'(x_0)$, rango de graficación y precisión de malla.
  - *Área de Trabajo Central*: Lienzo dinámico que conmuta fluidamente entre el desarrollo simbólico desplegable paso a paso, el visor 2D interactivo y la superficie 3D.

---

## 3. Arquitectura del Motor Matemático y Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar                              │
│ [DE-Lab 2D/3D]  ───  [Presets: Cauchy-Euler Principal ▼]  ───  [Docs]  │
├───────────────────┬────────────────────────────────────────────────────┤
│ Parámetros & ODE  │ Pestañas de Vista:                                 │
│ ───────────────── │ [Resolución Paso a Paso] [Visor 2D] [Superficie 3D]│
│ a·x²y''+b·xy'+cy=g│ ───────────────────────────────────────────────────│
│ a: [ 1 ]          │                                                    │
│ b: [-5 ]          │  1. Motor Simbólico & Render MathJax               │
│ c: [ 13]          │     • Raíces: m = 3 ± 2i                           │
│ g: [ x^3*ln(x) ]  │     • Wronskiano: W(x) = 2x⁵                       │
│                   │     • yh = x³(c1·cos(2lnx) + c2·sin(2lnx))         │
│ Condiciones:      │     • yp = (1/4)·x³·ln(x)                          │
│ x0: 1, y0: 2      │                                                    │
│ y'0: 1            │  2. Visualizador Plotly 2D & 3D / Three.js         │
│                   │     • Curva y(x) + yh + yp                         │
│ Sliders Libres:   │     • Tangente en (1,2) con pendiente m=1          │
│ c1: [ 2.00 ]      │     • Superficie z = y(x, c1)                      │
│ c2: [-2.625]      │                                                    │
│                   │  3. Comparador Numérico RK4                        │
│ [Recomputar]      │     • Error max: 1.42e-14 (Precisión de máquina)   │
└───────────────────┴────────────────────────────────────────────────────┘
```

### Módulos de Código:
- `src/math/cauchyEulerSolver.ts`: Motor algebraico puro con evaluación simbólica, raíces analíticas del polinomio característico cuadrático (reales distintas, dobles, complejas), Wronskiano formal, variación de parámetros, sistema lineal $2\times 2$ para $c_1$ y $c_2$, y cálculo simbólico de derivadas primera y segunda para verificación de residuo nulo.
- `src/math/rungeKutta.ts`: Integrador numérico RK4 adaptativo para sistemas de segundo orden convertidos a primer orden:
  $y_1' = y_2$,
  $y_2' = \frac{g(x) - b x y_2 - c y_1}{a x^2}$.
- `src/components/MathView.tsx`: Renderizador de fórmulas algebraicas formateadas en LaTeX limpio, con desgloses detallados de cada una de las 7 fases solicitadas.
- `src/components/Plot2DView.tsx`: Visualizador interactivo 2D con capas conmutables ($y(x)$, $y_h(x)$, $y_p(x)$, recta tangente, punto inicial, deslizadores de $c_1, c_2$ y coordenadas al paso del cursor).
- `src/components/Plot3DView.tsx`: Superficie tridimensional interactiva $z = y(x, c_1)$ con paleta científica de color, curvas de nivel y curva de solución óptima remarcada en la superficie.
- `src/components/VerificationPanel.tsx`: Auditoría de sustitución simbólica en $x^2y'' - 5xy' + 13y$ y tabla comparativa paso a paso con RK4 y error local.
- `src/components/SidebarControls.tsx`: Panel ergonómico de parámetros con validación de entradas numéricas y guardas para singularidades en $x \le 0$.

---

## 4. Plan de Ejecución Secuencial

1. **Instalación de Dependencias**: Paquetes de matemáticas y renderizado científico: `mathjs`, `katex` (para renderizado instantáneo y robusto de fórmulas LaTeX), `three` y `@types/three` para soporte 3D avanzado y `plotly.js-dist-min` o componentes SVG/WebGL de alto rendimiento.
2. **Desarrollo del Motor Matemático Riguroso**:
   - Programación de `cauchyEulerSolver.ts` con derivaciones simbólicas exactas.
   - Implementación de `rungeKutta.ts` para resolución numérica paralela.
   - Pruebas matemáticas automáticas de la ecuación $x^2y''-5xy'+13y=x^3\ln(x)$ asegurando $c_1=2, c_2=-2.625, y_p=\frac{1}{4}x^3\ln(x)$ y residuo idéntico a cero.
3. **Construcción de la Interfaz y Componentes**:
   - Maquetación de la consola con tema oscuro científico y tipografía optimizada.
   - Paneles interactivos de las 7 Fases de resolución con explicaciones pedagógicas exhaustivas en español.
   - Creación de los visores 2D y 3D con manipulación en tiempo real.
   - Panel de control experimental para explorar coeficientes arbitrarios y presets.
4. **Validación, Lint y Compilación**:
   - Pruebas de compilación sin errores (`compile_applet` y `lint_applet`).
   - Verificación de renderizado en navegador y comprobación de interacción completa.
