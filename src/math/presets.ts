/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PresetODE } from './types';

export const PRESET_ODES: PresetODE[] = [
  {
    id: 'primary-cauchy-euler',
    name: 'Caso de Estudio Principal: Cauchy-Euler con Término x³ ln(x)',
    description: 'x² y\'\' - 5x y\' + 13y = x³ ln(x) con y(1) = 2, y\'(1) = 1. Raíces complejas conjugadas m = 3 ± 2i y solución particular mediante variación de parámetros.',
    isPrimaryCase: true,
    params: {
      a: 1,
      b: -5,
      c: 13,
      nonHomogeneousType: 'x3_lnx',
      latexRHS: 'x^3\\ln(x)',
    },
    initialConditions: {
      x0: 1,
      y0: 2,
      yp0: 1,
    },
    defaultXRange: [0.3, 3.5],
  },
  {
    id: 'real-distinct-roots',
    name: 'Cauchy-Euler: Raíces Reales Distintas',
    description: 'x² y\'\' + 2x y\' - 6y = x² con y(1) = 1, y\'(1) = 2. Ecuación característica m² + m - 6 = 0 con raíces m₁ = 2, m₂ = -3.',
    params: {
      a: 1,
      b: 2,
      c: -6,
      nonHomogeneousType: 'x_pow_r',
      rPow: 2,
      latexRHS: 'x^2',
    },
    initialConditions: {
      x0: 1,
      y0: 1,
      yp0: 2,
    },
    defaultXRange: [0.4, 3.0],
  },
  {
    id: 'real-repeated-root',
    name: 'Cauchy-Euler: Raíz Real Doble (Caso Crítico)',
    description: 'x² y\'\' - 3x y\' + 4y = 0 con y(1) = 3, y\'(1) = 5. Polinomio auxiliar (m - 2)² = 0 con raíz doble m = 2.',
    params: {
      a: 1,
      b: -3,
      c: 4,
      nonHomogeneousType: 'zero',
      latexRHS: '0',
    },
    initialConditions: {
      x0: 1,
      y0: 3,
      yp0: 5,
    },
    defaultXRange: [0.3, 2.8],
  },
  {
    id: 'harmonic-euler-oscillator',
    name: 'Oscilador Armónico Euleriano Puro',
    description: 'x² y\'\' + x y\' + 4y = 0 con y(1) = 1, y\'(1) = 0. Raíces puramente imaginarias m = ± 2i dando origen a oscilaciones puras en escala logarítmica.',
    params: {
      a: 1,
      b: 1,
      c: 4,
      nonHomogeneousType: 'zero',
      latexRHS: '0',
    },
    initialConditions: {
      x0: 1,
      y0: 1,
      yp0: 0,
    },
    defaultXRange: [0.2, 5.0],
  },
  {
    id: 'polynomial-forcing',
    name: 'Cauchy-Euler con Excitación Polinómica x⁴',
    description: 'x² y\'\' - 2x y\' + 2y = x⁴ con y(1) = 0, y\'(1) = 1. Raíces homogéneas m = 1, 2 y término particular polinomial.',
    params: {
      a: 1,
      b: -2,
      c: 2,
      nonHomogeneousType: 'x_pow_r',
      rPow: 4,
      latexRHS: 'x^4',
    },
    initialConditions: {
      x0: 1,
      y0: 0,
      yp0: 1,
    },
    defaultXRange: [0.4, 2.5],
  },
];
