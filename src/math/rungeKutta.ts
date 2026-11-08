/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SolverResult } from './types';

export interface RK4Point {
  x: number;
  yExact: number;
  yRK4: number;
  absError: number;
  relativeError: number;
  yPrimeExact: number;
  yPrimeRK4: number;
}

export interface RK4Result {
  points: RK4Point[];
  maxAbsError: number;
  meanAbsError: number;
  rmsError: number;
  stepSize: number;
  numSteps: number;
}

export function computeRungeKutta4(
  solver: SolverResult,
  xMin: number = 0.5,
  xMax: number = 3.0,
  steps: number = 100
): RK4Result {
  const { a, b, c } = solver.params;
  const { x0, y0, yp0 } = solver.initialConditions;

  // Differential system:
  // u1' = u2
  // u2' = (g(x) - b*x*u2 - c*u1) / (a * x^2)
  const f1 = (_x: number, _u1: number, u2: number): number => u2;
  const f2 = (x: number, u1: number, u2: number): number => {
    if (x <= 1e-6) return 0;
    const gVal = solver.evalG(x);
    return (gVal - b * x * u2 - c * u1) / (a * x * x);
  };

  // Perform integration forward from x0 to xMax
  const forwardPoints: { x: number; u: number; v: number }[] = [];
  const hForward = (xMax - x0) / (steps / 2);
  let curX = x0;
  let curU = y0;
  let curV = yp0;

  forwardPoints.push({ x: curX, u: curU, v: curV });

  for (let i = 0; i < steps / 2; i++) {
    const k1u = f1(curX, curU, curV);
    const k1v = f2(curX, curU, curV);

    const k2u = f1(curX + 0.5 * hForward, curU + 0.5 * hForward * k1u, curV + 0.5 * hForward * k1v);
    const k2v = f2(curX + 0.5 * hForward, curU + 0.5 * hForward * k1u, curV + 0.5 * hForward * k1v);

    const k3u = f1(curX + 0.5 * hForward, curU + 0.5 * hForward * k2u, curV + 0.5 * hForward * k2v);
    const k3v = f2(curX + 0.5 * hForward, curU + 0.5 * hForward * k2u, curV + 0.5 * hForward * k2v);

    const k4u = f1(curX + hForward, curU + hForward * k3u, curV + hForward * k3v);
    const k4v = f2(curX + hForward, curU + hForward * k3u, curV + hForward * k3v);

    curU += (hForward / 6) * (k1u + 2 * k2u + 2 * k3u + k4u);
    curV += (hForward / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    curX += hForward;

    forwardPoints.push({ x: curX, u: curU, v: curV });
  }

  // Perform integration backward from x0 to xMin (if xMin < x0 and xMin > 0)
  const backwardPoints: { x: number; u: number; v: number }[] = [];
  const safeXMin = Math.max(0.05, xMin);
  if (safeXMin < x0) {
    const hBackward = (safeXMin - x0) / (steps / 2); // negative
    curX = x0;
    curU = y0;
    curV = yp0;

    for (let i = 0; i < steps / 2; i++) {
      const k1u = f1(curX, curU, curV);
      const k1v = f2(curX, curU, curV);

      const k2u = f1(curX + 0.5 * hBackward, curU + 0.5 * hBackward * k1u, curV + 0.5 * hBackward * k1v);
      const k2v = f2(curX + 0.5 * hBackward, curU + 0.5 * hBackward * k1u, curV + 0.5 * hBackward * k1v);

      const k3u = f1(curX + 0.5 * hBackward, curU + 0.5 * hBackward * k2u, curV + 0.5 * hBackward * k2v);
      const k3v = f2(curX + 0.5 * hBackward, curU + 0.5 * hBackward * k2u, curV + 0.5 * hBackward * k2v);

      const k4u = f1(curX + hBackward, curU + hBackward * k3u, curV + hBackward * k3v);
      const k4v = f2(curX + hBackward, curU + hBackward * k3u, curV + hBackward * k3v);

      curU += (hBackward / 6) * (k1u + 2 * k2u + 2 * k3u + k4u);
      curV += (hBackward / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
      curX += hBackward;

      backwardPoints.unshift({ x: curX, u: curU, v: curV });
    }
  }

  // Combine backward and forward
  const allRaw = [...backwardPoints, ...forwardPoints];

  // Map to RK4Point and calculate error metrics
  let maxAbsError = 0;
  let sumAbsError = 0;
  let sumSqError = 0;

  const points: RK4Point[] = allRaw.map((pt) => {
    const yExact = solver.evalY(pt.x);
    const ypExact = solver.evalYPrime(pt.x);
    const absError = Math.abs(pt.u - yExact);
    const relativeError = Math.abs(yExact) > 1e-9 ? absError / Math.abs(yExact) : absError;

    if (absError > maxAbsError) maxAbsError = absError;
    sumAbsError += absError;
    sumSqError += absError * absError;

    return {
      x: pt.x,
      yExact,
      yRK4: pt.u,
      absError,
      relativeError,
      yPrimeExact: ypExact,
      yPrimeRK4: pt.v,
    };
  });

  const meanAbsError = points.length > 0 ? sumAbsError / points.length : 0;
  const rmsError = points.length > 0 ? Math.sqrt(sumSqError / points.length) : 0;

  return {
    points,
    maxAbsError,
    meanAbsError,
    rmsError,
    stepSize: Math.abs(hForward),
    numSteps: points.length,
  };
}
