/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RootType = 'complex' | 'real-distinct' | 'real-repeated';

export interface RootsData {
  type: RootType;
  // For complex: alpha ± beta * i
  alpha: number;
  beta: number;
  // For real: m1, m2
  m1: number;
  m2: number;
  discriminant: number;
  A: number; // a
  B: number; // b - a
  C: number; // c
}

export interface InitialConditions {
  x0: number;
  y0: number;
  yp0: number;
}

export interface EquationParameters {
  a: number; // x^2 y''
  b: number; // x y'
  c: number; // y
  nonHomogeneousType: 'x3_lnx' | 'x_pow_r' | 'constant' | 'zero';
  rPow?: number; // if x^r
  constantK?: number;
  latexRHS: string;
}

export interface SolverResult {
  params: EquationParameters;
  initialConditions: InitialConditions;
  roots: RootsData;
  c1: number;
  c2: number;
  // Functions for numerical evaluation
  evalYh: (x: number, c1Val?: number, c2Val?: number) => number;
  evalYp: (x: number) => number;
  evalY: (x: number, c1Val?: number, c2Val?: number) => number;
  evalYPrime: (x: number, c1Val?: number, c2Val?: number) => number;
  evalYDoublePrime: (x: number, c1Val?: number, c2Val?: number) => number;
  evalG: (x: number) => number;
  evalResidual: (x: number, c1Val?: number, c2Val?: number) => number;
  // Step-by-step LaTeX documentation
  phase1Latex: {
    title: string;
    description: string;
    eqLatex: string;
    detailsLatex: string;
  };
  phase2Latex: {
    title: string;
    charEqLatex: string;
    discriminantLatex: string;
    rootsLatex: string;
    explanation: string;
  };
  phase3Latex: {
    title: string;
    fundamentalSetLatex: string;
    yhLatex: string;
    explanation: string;
  };
  phase4Latex: {
    title: string;
    methodExplanation: string;
    standardFormLatex: string;
    wronskianLatex: string;
    u1u2Latex: string;
    ypLatex: string;
  };
  phase5Latex: {
    title: string;
    generalSolLatex: string;
    explanation: string;
  };
  phase6Latex: {
    title: string;
    initialSystemLatex: string;
    derivativeLatex: string;
    constantsCalculationLatex: string;
    finalParticularSolutionLatex: string;
  };
  phase7Latex: {
    title: string;
    verificationDerivativesLatex: string;
    substitutionLatex: string;
    residualResultLatex: string;
    initialConditionsCheckLatex: string;
  };
}

export interface PresetODE {
  id: string;
  name: string;
  description: string;
  params: EquationParameters;
  initialConditions: InitialConditions;
  defaultXRange: [number, number];
  isPrimaryCase?: boolean;
}
