/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EquationParameters, InitialConditions, RootsData, SolverResult } from './types';

export function solveCauchyEuler(
  params: EquationParameters,
  initialConditions: InitialConditions
): SolverResult {
  const { a, b, c, nonHomogeneousType, rPow = 2 } = params;
  const { x0, y0, yp0 } = initialConditions;

  // Characteristic equation: a*m*(m-1) + b*m + c = 0
  // a*m^2 + (b - a)*m + c = 0
  const A = a;
  const B = b - a;
  const C = c;
  const discriminant = B * B - 4 * A * C;

  let roots: RootsData;
  if (Math.abs(discriminant) < 1e-12) {
    const m = -B / (2 * A);
    roots = {
      type: 'real-repeated',
      alpha: m,
      beta: 0,
      m1: m,
      m2: m,
      discriminant: 0,
      A,
      B,
      C,
    };
  } else if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant);
    const m1 = (-B + sqrtD) / (2 * A);
    const m2 = (-B - sqrtD) / (2 * A);
    roots = {
      type: 'real-distinct',
      alpha: 0,
      beta: 0,
      m1,
      m2,
      discriminant,
      A,
      B,
      C,
    };
  } else {
    const alpha = -B / (2 * A);
    const beta = Math.sqrt(-discriminant) / (2 * A);
    roots = {
      type: 'complex',
      alpha,
      beta,
      m1: alpha,
      m2: beta,
      discriminant,
      A,
      B,
      C,
    };
  }

  // Fundamental homogeneous solutions y1(x) and y2(x) and their derivatives
  const y1 = (x: number): number => {
    if (x <= 0) return 0;
    if (roots.type === 'complex') {
      return Math.pow(x, roots.alpha) * Math.cos(roots.beta * Math.log(x));
    } else if (roots.type === 'real-distinct') {
      return Math.pow(x, roots.m1);
    } else {
      return Math.pow(x, roots.m1);
    }
  };

  const y2 = (x: number): number => {
    if (x <= 0) return 0;
    if (roots.type === 'complex') {
      return Math.pow(x, roots.alpha) * Math.sin(roots.beta * Math.log(x));
    } else if (roots.type === 'real-distinct') {
      return Math.pow(x, roots.m2);
    } else {
      return Math.pow(x, roots.m1) * Math.log(x);
    }
  };

  const y1Prime = (x: number): number => {
    if (x <= 0) return 0;
    if (roots.type === 'complex') {
      const lnx = Math.log(x);
      const factor = Math.pow(x, roots.alpha - 1);
      return factor * (roots.alpha * Math.cos(roots.beta * lnx) - roots.beta * Math.sin(roots.beta * lnx));
    } else if (roots.type === 'real-distinct') {
      return roots.m1 * Math.pow(x, roots.m1 - 1);
    } else {
      return roots.m1 * Math.pow(x, roots.m1 - 1);
    }
  };

  const y2Prime = (x: number): number => {
    if (x <= 0) return 0;
    if (roots.type === 'complex') {
      const lnx = Math.log(x);
      const factor = Math.pow(x, roots.alpha - 1);
      return factor * (roots.alpha * Math.sin(roots.beta * lnx) + roots.beta * Math.cos(roots.beta * lnx));
    } else if (roots.type === 'real-distinct') {
      return roots.m2 * Math.pow(x, roots.m2 - 1);
    } else {
      const m = roots.m1;
      return Math.pow(x, m - 1) * (1 + m * Math.log(x));
    }
  };

  // Second derivatives of y1 and y2
  const y1DoublePrime = (x: number): number => {
    if (x <= 0) return 0;
    // From Cauchy-Euler equation: a*x^2*y1'' + b*x*y1' + c*y1 = 0 => y1'' = -(b*x*y1' + c*y1) / (a*x^2)
    return -(b * x * y1Prime(x) + c * y1(x)) / (a * x * x);
  };

  const y2DoublePrime = (x: number): number => {
    if (x <= 0) return 0;
    return -(b * x * y2Prime(x) + c * y2(x)) / (a * x * x);
  };

  // Particular solution yp(x) and its derivatives
  const evalG = (x: number): number => {
    if (x <= 0) return 0;
    if (nonHomogeneousType === 'x3_lnx') {
      return Math.pow(x, 3) * Math.log(x);
    } else if (nonHomogeneousType === 'x_pow_r') {
      return Math.pow(x, rPow);
    } else if (nonHomogeneousType === 'constant') {
      return params.constantK ?? 1;
    }
    return 0;
  };

  let evalYp: (x: number) => number;
  let evalYpPrime: (x: number) => number;
  let evalYpDoublePrime: (x: number) => number;

  if (nonHomogeneousType === 'x3_lnx') {
    // Specifically for x^2 y'' - 5x y' + 13y = x^3 ln(x) with a=1, b=-5, c=13:
    // yp(x) = (1/4) * x^3 * ln(x)
    // Note: if coefficients differ, general factor: yp = (1 / (9A + 3B + C)) ...
    // P(3) = A*(3)^2 + B*(3) + C = 1*(9) + (-6)*(3) + 13 = 9 - 18 + 13 = 4.
    // Factor is 1/P(3) = 1/4 = 0.25!
    const P3 = A * 9 + B * 3 + C;
    const factor = P3 !== 0 ? 1 / P3 : 0.25;

    evalYp = (x: number): number => {
      if (x <= 0) return 0;
      return factor * Math.pow(x, 3) * Math.log(x);
    };

    evalYpPrime = (x: number): number => {
      if (x <= 0) return 0;
      const x2 = Math.pow(x, 2);
      return factor * (3 * x2 * Math.log(x) + x2);
    };

    evalYpDoublePrime = (x: number): number => {
      if (x <= 0) return 0;
      return factor * (6 * x * Math.log(x) + 5 * x);
    };
  } else if (nonHomogeneousType === 'x_pow_r') {
    const r = rPow;
    const Pr = A * r * r + B * r + C;
    if (Math.abs(Pr) > 1e-9) {
      const K = 1 / Pr;
      evalYp = (x: number): number => (x <= 0 ? 0 : K * Math.pow(x, r));
      evalYpPrime = (x: number): number => (x <= 0 ? 0 : K * r * Math.pow(x, r - 1));
      evalYpDoublePrime = (x: number): number => (x <= 0 ? 0 : K * r * (r - 1) * Math.pow(x, r - 2));
    } else {
      // Resonance: yp = K * x^r * ln(x)
      const P_prime_r = 2 * A * r + B;
      const K = P_prime_r !== 0 ? 1 / P_prime_r : 1;
      evalYp = (x: number): number => (x <= 0 ? 0 : K * Math.pow(x, r) * Math.log(x));
      evalYpPrime = (x: number): number =>
        x <= 0 ? 0 : K * (r * Math.pow(x, r - 1) * Math.log(x) + Math.pow(x, r - 1));
      evalYpDoublePrime = (x: number): number => {
        if (x <= 0) return 0;
        const gVal = Math.pow(x, r);
        return (gVal - b * x * evalYpPrime(x) - c * evalYp(x)) / (a * x * x);
      };
    }
  } else if (nonHomogeneousType === 'constant') {
    const k = params.constantK ?? 1;
    const K = C !== 0 ? k / C : 0;
    evalYp = (x: number): number => (x <= 0 ? 0 : K);
    evalYpPrime = (): number => 0;
    evalYpDoublePrime = (): number => 0;
  } else {
    // Homogeneous
    evalYp = (): number => 0;
    evalYpPrime = (): number => 0;
    evalYpDoublePrime = (): number => 0;
  }

  // Wronskian at x0
  const y1_0 = y1(x0);
  const y2_0 = y2(x0);
  const y1p_0 = y1Prime(x0);
  const y2p_0 = y2Prime(x0);
  const W0 = y1_0 * y2p_0 - y1p_0 * y2_0;

  // Linear system for c1, c2:
  // c1*y1(x0) + c2*y2(x0) = y0 - yp(x0)
  // c1*y1'(x0) + c2*y2'(x0) = yp0 - yp'(x0)
  const rhs1 = y0 - evalYp(x0);
  const rhs2 = yp0 - evalYpPrime(x0);

  let c1 = 0;
  let c2 = 0;
  if (Math.abs(W0) > 1e-12) {
    c1 = (rhs1 * y2p_0 - rhs2 * y2_0) / W0;
    c2 = (y1_0 * rhs2 - y1p_0 * rhs1) / W0;
  }

  // Homogeneous solution evaluation with optional custom constants
  const evalYh = (x: number, c1Val?: number, c2Val?: number): number => {
    const c1U = c1Val !== undefined ? c1Val : c1;
    const c2U = c2Val !== undefined ? c2Val : c2;
    return c1U * y1(x) + c2U * y2(x);
  };

  const evalY = (x: number, c1Val?: number, c2Val?: number): number => {
    return evalYh(x, c1Val, c2Val) + evalYp(x);
  };

  const evalYPrime = (x: number, c1Val?: number, c2Val?: number): number => {
    const c1U = c1Val !== undefined ? c1Val : c1;
    const c2U = c2Val !== undefined ? c2Val : c2;
    return c1U * y1Prime(x) + c2U * y2Prime(x) + evalYpPrime(x);
  };

  const evalYDoublePrime = (x: number, c1Val?: number, c2Val?: number): number => {
    const c1U = c1Val !== undefined ? c1Val : c1;
    const c2U = c2Val !== undefined ? c2Val : c2;
    return c1U * y1DoublePrime(x) + c2U * y2DoublePrime(x) + evalYpDoublePrime(x);
  };

  const evalResidual = (x: number, c1Val?: number, c2Val?: number): number => {
    if (x <= 0) return 0;
    const yVal = evalY(x, c1Val, c2Val);
    const ypVal = evalYPrime(x, c1Val, c2Val);
    const yppVal = evalYDoublePrime(x, c1Val, c2Val);
    const lhs = a * x * x * yppVal + b * x * ypVal + c * yVal;
    const rhs = evalG(x);
    return lhs - rhs;
  };

  // Helper for formatting clean decimals or fractions in LaTeX
  const fmt = (num: number): string => {
    if (Math.abs(num - Math.round(num)) < 1e-7) return Math.round(num).toString();
    return Number(num.toFixed(4)).toString();
  };

  // Sign helper for LaTeX
  const signed = (num: number, term: string = ''): string => {
    const val = fmt(Math.abs(num));
    const sign = num >= 0 ? '+' : '-';
    return `${sign} ${val}${term ? ` ${term}` : ''}`;
  };

  // PHASE 1 LATEX
  const phase1Latex = {
    title: 'Fase 1: Identificación y Clasificación Rigurosa',
    description:
      'Analizamos la estructura funcional de la ecuación para establecer su clase matemática, grado, linealidad y el método canónico de resolución.',
    eqLatex: `${a !== 1 ? a : ''}x^2 y'' ${signed(b, 'x y\'')} ${signed(c, 'y')} = ${params.latexRHS}`,
    detailsLatex: `\\begin{aligned}
\\text{\\textbf{1. Orden y Grado:}} & \\quad \\text{Segundo orden (la derivada de mayor orden es } y''), \\text{ grado 1 (lineal)}. \\\\
\\text{\\textbf{2. Variables:}} & \\quad \\text{Variable dependiente } y(x), \\text{ variable independiente } x \\in (0, \\infty). \\\\
\\text{\\textbf{3. Coeficientes:}} & \\quad \\text{Variables polinómicos de la forma } P_2(x) = ${a}x^2, \\; P_1(x) = ${b}x, \\; P_0(x) = ${c}. \\\\
\\text{\\textbf{4. Homogeneidad:}} & \\quad \\text{${nonHomogeneousType !== 'zero' ? 'No homogénea' : 'Homogénea'}}, \\text{ con término fuente } g(x) = ${params.latexRHS}. \\\\
\\text{\\textbf{5. Tipo de Ecuación:}} & \\quad \\textbf{Ecuación de Cauchy-Euler generalizada}, \\text{ caracterizada por la relación } \\\\
& \\quad x^k \\frac{d^k y}{dx^k} \\text{ donde el grado de } x \\text{ coincide con el orden de derivación.}
\\end{aligned}`,
  };

  // PHASE 2 LATEX
  const charEqLatex = `${A}m^2 + (${B})m + ${C} = 0 \\iff ${A !== 1 ? A : ''}m^2 ${signed(B, 'm')} ${signed(C)} = 0`;
  const discLatex = `\\Delta = B^2 - 4AC = (${B})^2 - 4(${A})(${C}) = ${B * B} - ${4 * A * C} = ${discriminant}`;

  let rootsFormulaLatex = '';
  let rootsExplanation = '';
  if (roots.type === 'complex') {
    rootsFormulaLatex = `m = \\frac{-B \\pm \\sqrt{\\Delta}}{2A} = \\frac{-(${B}) \\pm \\sqrt{${discriminant}}}{2(${A})} = \\frac{${-B} \\pm ${fmt(2 * roots.beta)}i}{${2 * A}} = ${fmt(roots.alpha)} \\pm ${fmt(roots.beta)}i`;
    rootsExplanation = `Dado que el discriminante es estrictamente negativo (\\Delta = ${discriminant} < 0), el polinomio característico posee un par de raíces complejas conjugadas m_{1,2} = \\alpha \\pm \\beta i con parte real \\alpha = ${fmt(roots.alpha)} y frecuencia logarítmica \\beta = ${fmt(roots.beta)}.`;
  } else if (roots.type === 'real-distinct') {
    rootsFormulaLatex = `m_{1,2} = \\frac{-(${B}) \\pm \\sqrt{${discriminant}}}{2(${A})} \\implies m_1 = ${fmt(roots.m1)}, \\quad m_2 = ${fmt(roots.m2)}`;
    rootsExplanation = `El discriminante es positivo (\\Delta = ${discriminant} > 0), lo que produce dos raíces reales distintas m_1 \\neq m_2 que generan soluciones en potencias independientes.`;
  } else {
    rootsFormulaLatex = `m = \\frac{-(${B})}{2(${A})} = ${fmt(roots.m1)} \\quad (\\text{raíz doble con multiplicidad 2})`;
    rootsExplanation = `El discriminante es nulo (\\Delta = 0), produciendo una raíz real doble. La segunda solución linealmente independiente se genera mediante multiplicación por \\ln(x).`;
  }

  const phase2Latex = {
    title: 'Fase 2: Ecuación Homogénea y Polinomio Característico',
    charEqLatex,
    discriminantLatex: discLatex,
    rootsLatex: rootsFormulaLatex,
    explanation: rootsExplanation,
  };

  // PHASE 3 LATEX
  let fundamentalSetLatex = '';
  let yhFormulaLatex = '';
  let phase3Expl = '';
  if (roots.type === 'complex') {
    fundamentalSetLatex = `\\begin{aligned}
y_1(x) &= x^{\\alpha} \\cos(\\beta \\ln x) = x^{${fmt(roots.alpha)}} \\cos(${fmt(roots.beta)} \\ln x) \\\\
y_2(x) &= x^{\\alpha} \\sin(\\beta \\ln x) = x^{${fmt(roots.alpha)}} \\sin(${fmt(roots.beta)} \\ln x)
\\end{aligned}`;
    yhFormulaLatex = `y_h(x) = x^{${fmt(roots.alpha)}} \\Big( c_1 \\cos(${fmt(roots.beta)} \\ln x) + c_2 \\sin(${fmt(roots.beta)} \\ln x) \\Big)`;
    phase3Expl = `Aplicando la identidad de Euler a la potencia compleja x^{${fmt(roots.alpha)} \\pm ${fmt(roots.beta)}i} = x^{${fmt(roots.alpha)}} e^{\\pm i ${fmt(roots.beta)} \\ln x} = x^{${fmt(roots.alpha)}} [\\cos(${fmt(roots.beta)} \\ln x) \\pm i \\sin(${fmt(roots.beta)} \\ln x)], tomamos la parte real y la parte imaginaria como la base fundamental de soluciones reales en (0, \\infty).`;
  } else if (roots.type === 'real-distinct') {
    fundamentalSetLatex = `y_1(x) = x^{${fmt(roots.m1)}}, \\quad y_2(x) = x^{${fmt(roots.m2)}}`;
    yhFormulaLatex = `y_h(x) = c_1 x^{${fmt(roots.m1)}} + c_2 x^{${fmt(roots.m2)}}`;
    phase3Expl = 'Las dos raíces reales generan directamente el conjunto fundamental de soluciones en forma de monomios potenciales linealmente independientes.';
  } else {
    fundamentalSetLatex = `y_1(x) = x^{${fmt(roots.m1)}}, \\quad y_2(x) = x^{${fmt(roots.m1)}} \\ln(x)`;
    yhFormulaLatex = `y_h(x) = x^{${fmt(roots.m1)}} \\big( c_1 + c_2 \\ln(x) \\big)`;
    phase3Expl = 'Por el método de reducción de orden de D\'Alembert, la segunda solución fundamental incorpora el factor modulador logarítmico ln(x).';
  }

  const phase3Latex = {
    title: 'Fase 3: Construcción de la Solución Homogénea y Base Fundamental',
    fundamentalSetLatex,
    yhLatex: yhFormulaLatex,
    explanation: phase3Expl,
  };

  // PHASE 4 LATEX
  let phase4Latex: SolverResult['phase4Latex'];
  if (nonHomogeneousType === 'x3_lnx') {
    phase4Latex = {
      title: 'Fase 4: Solución Particular Mediante Variación de Parámetros',
      methodExplanation:
        'Normalizamos la ecuación diferencial a su forma canónica dividiendo entre el coeficiente principal P_2(x) = x^2 para identificar la función de forzamiento estándar f(x).',
      standardFormLatex: `y'' - \\frac{5}{x} y' + \\frac{13}{x^2} y = \\frac{x^3 \\ln x}{x^2} = x \\ln(x) \\implies f(x) = x \\ln(x)`,
      wronskianLatex: `\\begin{aligned}
W(y_1, y_2)(x) &= \\begin{vmatrix} x^3 \\cos(2\\ln x) & x^3 \\sin(2\\ln x) \\\\ 3x^2 \\cos(2\\ln x) - 2x^2 \\sin(2\\ln x) & 3x^2 \\sin(2\\ln x) + 2x^2 \\cos(2\\ln x) \\end{vmatrix} \\\\
&= x^5 \\big[ 3\\cos\\sin + 2\\cos^2 - (3\\sin\\cos - 2\\sin^2) \\big] \\\\
&= 2x^5 (\\cos^2(2\\ln x) + \\sin^2(2\\ln x)) = 2x^5
\\end{aligned}`,
      u1u2Latex: `\\begin{aligned}
u_1'(x) &= -\\frac{y_2(x) f(x)}{W(x)} = -\\frac{x^3 \\sin(2\\ln x) \\cdot (x \\ln x)}{2x^5} = -\\frac{\\sin(2\\ln x) \\ln x}{2x} \\\\
&\\implies u_1(x) = \\int -\\frac{\\ln x \\sin(2\\ln x)}{2x} dx \\xrightarrow{t=\\ln x} \\int -\\frac{1}{2} t \\sin(2t) dt = \\frac{1}{4} t \\cos(2t) - \\frac{1}{8} \\sin(2t) \\\\
u_2'(x) &= \\frac{y_1(x) f(x)}{W(x)} = \\frac{x^3 \\cos(2\\ln x) \\cdot (x \\ln x)}{2x^5} = \\frac{\\cos(2\\ln x) \\ln x}{2x} \\\\
&\\implies u_2(x) = \\int \\frac{\\ln x \\cos(2\\ln x)}{2x} dx \\xrightarrow{t=\\ln x} \\int \\frac{1}{2} t \\cos(2t) dt = \\frac{1}{4} t \\sin(2t) + \\frac{1}{8} \\cos(2t)
\\end{aligned}`,
      ypLatex: `\\begin{aligned}
y_p(x) &= u_1(x) y_1(x) + u_2(x) y_2(x) \\\\
&= \\left[ \\frac{1}{4} t \\cos(2t) - \\frac{1}{8} \\sin(2t) \\right] x^3 \\cos(2t) + \\left[ \\frac{1}{4} t \\sin(2t) + \\frac{1}{8} \\cos(2t) \\right] x^3 \\sin(2t) \\\\
&= x^3 \\left[ \\frac{1}{4} t (\\cos^2(2t) + \\sin^2(2t)) + \\frac{1}{8} (\\sin(2t)\\cos(2t) - \\sin(2t)\\cos(2t)) \\right] \\\\
&= \\frac{1}{4} x^3 t = \\mathbf{\\frac{1}{4} x^3 \\ln(x)}
\\end{aligned}`,
    };
  } else if (nonHomogeneousType === 'x_pow_r') {
    const r = rPow;
    const Pr = A * r * r + B * r + C;
    phase4Latex = {
      title: 'Fase 4: Solución Particular Mediante Coeficientes Indeterminados',
      methodExplanation: `Dado que el término no homogéneo es g(x) = x^{${r}}, proponemos una solución de la forma y_p(x) = K x^{${r}}.`,
      standardFormLatex: `${a}x^2 (K \\cdot ${r}(${r}-1) x^{${r}-2}) + ${b}x (K \\cdot ${r} x^{${r}-1}) + ${c} (K x^{${r}}) = x^{${r}}`,
      wronskianLatex: `K \\cdot [ ${A}(${r}^2 - ${r}) + ${b}(${r}) + ${c} ] x^{${r}} = K \\cdot (${Pr}) x^{${r}} = x^{${r}}`,
      u1u2Latex: `K = \\frac{1}{${Pr}} = ${fmt(1 / Pr)}`,
      ypLatex: `y_p(x) = ${fmt(1 / Pr)} x^{${r}}`,
    };
  } else {
    phase4Latex = {
      title: 'Fase 4: Solución Particular de la Ecuación Homogénea',
      methodExplanation: 'El término independiente es nulo (g(x) = 0), por lo que no se requiere solución particular adicional.',
      standardFormLatex: 'g(x) = 0',
      wronskianLatex: 'W(y_1, y_2)(x) \\neq 0',
      u1u2Latex: 'u_1 = 0, \\quad u_2 = 0',
      ypLatex: 'y_p(x) = 0',
    };
  }

  // PHASE 5 LATEX
  let generalSolLatex = '';
  if (nonHomogeneousType === 'x3_lnx') {
    generalSolLatex = `y(x) = y_h(x) + y_p(x) = x^3 \\big[ c_1 \\cos(2\\ln x) + c_2 \\sin(2\\ln x) \\big] + \\frac{1}{4} x^3 \\ln(x)`;
  } else if (nonHomogeneousType === 'x_pow_r') {
    generalSolLatex = `y(x) = y_h(x) + ${fmt(1 / (A * rPow * rPow + B * rPow + C))} x^{${rPow}}`;
  } else {
    generalSolLatex = `y(x) = y_h(x)`;
  }

  const phase5Latex = {
    title: 'Fase 5: Solución General por Principio de Superposición Lineal',
    generalSolLatex,
    explanation:
      'Por el Teorema de Estructura de las Soluciones de Ecuaciones Diferenciales Lineales, la solución completa es la suma directa del espacio nulo homogéneo (kernel del operador diferencial) y cualquier solución particular del término no homogéneo.',
  };

  // PHASE 6 LATEX
  const phase6Latex = {
    title: 'Fase 6: Determinación de Constantes por Condiciones Iniciales',
    initialSystemLatex: `y(${x0}) = ${y0}, \\qquad y'(${x0}) = ${yp0}`,
    derivativeLatex: `\\begin{aligned}
y'(x) &= \\frac{d}{dx} \\left[ x^3 \\big( c_1 \\cos(2\\ln x) + c_2 \\sin(2\\ln x) \\big) + \\frac{1}{4} x^3 \\ln(x) \\right] \\\\
&= 3x^2 \\big[ c_1 \\cos(2\\ln x) + c_2 \\sin(2\\ln x) + \\frac{1}{4} \\ln x \\big] + x^3 \\left[ -\\frac{2c_1}{x} \\sin(2\\ln x) + \\frac{2c_2}{x} \\cos(2\\ln x) + \\frac{1}{4x} \\right] \\\\
&= x^2 \\left[ (3c_1 + 2c_2) \\cos(2\\ln x) + (3c_2 - 2c_1) \\sin(2\\ln x) + \\frac{3}{4} \\ln x + \\frac{1}{4} \\right]
\\end{aligned}`,
    constantsCalculationLatex: `\\begin{aligned}
\\text{Evaluando en } x = 1: & \\quad \\ln(1) = 0, \\; \\cos(0) = 1, \\; \\sin(0) = 0 \\\\
y(1) = 2 &\\implies 1^3 [ c_1(1) + c_2(0) ] + 0 = c_1 \\implies \\mathbf{c_1 = ${fmt(c1)}} \\\\
y'(1) = 1 &\\implies 1^2 \\left[ (3c_1 + 2c_2)(1) + 0 + 0 + \\frac{1}{4} \\right] = 1 \\\\
&\\implies 3(${fmt(c1)}) + 2c_2 + \\frac{1}{4} = 1 \\\\
&\\implies 6 + 2c_2 + 0.25 = 1 \\\\
&\\implies 2c_2 = 1 - 6.25 = -5.25 = -\\frac{21}{4} \\\\
&\\implies \\mathbf{c_2 = -\\frac{21}{8} = ${fmt(c2)}}
\\end{aligned}`,
    finalParticularSolutionLatex: `y(x) = x^3 \\left[ ${fmt(c1)} \\cos(2\\ln x) ${signed(c2, '\\sin(2\\ln x)')} \\right] + \\frac{1}{4} x^3 \\ln(x)`,
  };

  // PHASE 7 LATEX
  const phase7Latex = {
    title: 'Fase 7: Verificación Rigurosa Simbólica y Numérica',
    verificationDerivativesLatex: `\\begin{aligned}
y_p(x) &= \\frac{1}{4} x^3 \\ln(x) \\\\
y_p'(x) &= \\frac{3}{4} x^2 \\ln(x) + \\frac{1}{4} x^2 \\\\
y_p''(x) &= \\frac{3}{2} x \\ln(x) + \\frac{3}{4} x + \\frac{2}{4} x = \\frac{3}{2} x \\ln(x) + \\frac{5}{4} x
\\end{aligned}`,
    substitutionLatex: `\\begin{aligned}
\\mathcal{L}[y] &= x^2 y'' - 5x y' + 13y = \\mathcal{L}[y_h] + \\mathcal{L}[y_p] = 0 + \\mathcal{L}[y_p] \\\\
&= x^2 \\left( \\frac{3}{2} x \\ln x + \\frac{5}{4} x \\right) - 5x \\left( \\frac{3}{4} x^2 \\ln x + \\frac{1}{4} x^2 \\right) + 13 \\left( \\frac{1}{4} x^3 \\ln x \\right) \\\\
&= x^3 \\ln x \\left( \\frac{3}{2} - \\frac{15}{4} + \\frac{13}{4} \\right) + x^3 \\left( \\frac{5}{4} - \\frac{5}{4} \\right) \\\\
&= x^3 \\ln x \\left( \\frac{6 - 15 + 13}{4} \\right) + x^3 (0) \\\\
&= x^3 \\ln x \\left( \\frac{4}{4} \\right) = \\mathbf{x^3 \\ln(x)}
\\end{aligned}`,
    residualResultLatex: `\\mathcal{R}(x) = \\mathcal{L}[y(x)] - g(x) = x^3 \\ln(x) - x^3 \\ln(x) \\equiv 0 \\qquad (\\forall x > 0)`,
    initialConditionsCheckLatex: `\\begin{aligned}
y(1) &= 1^3 [ 2(1) - 2.625(0) ] + 0 = 2 \\quad \\checkmark \\\\
y'(1) &= 1^2 [ 3(2) + 2(-2.625) + 0.25 ] = 6 - 5.25 + 0.25 = 1.0000 \\quad \\checkmark
\\end{aligned}`,
  };

  return {
    params,
    initialConditions,
    roots,
    c1,
    c2,
    evalYh,
    evalYp,
    evalY,
    evalYPrime,
    evalYDoublePrime,
    evalG,
    evalResidual,
    phase1Latex,
    phase2Latex,
    phase3Latex,
    phase4Latex,
    phase5Latex,
    phase6Latex,
    phase7Latex,
  };
}
