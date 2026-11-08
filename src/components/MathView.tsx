/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SolverResult } from '../math/types';
import { MathFormula } from './MathFormula';
import { CheckCircle2, ChevronDown, ChevronRight, BookOpen, Layers, ShieldCheck, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface MathViewProps {
  solver: SolverResult;
}

export const MathView: React.FC<MathViewProps> = ({ solver }) => {
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
  });

  const togglePhase = (phaseNum: number) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseNum]: !prev[phaseNum],
    }));
  };

  const expandAll = () => {
    setExpandedPhases({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
  };

  const collapseAll = () => {
    setExpandedPhases({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false });
  };

  return (
    <div className="space-y-6">
      {/* Header bar for Math View */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Desarrollo Matemático Paso a Paso Riguroso</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Resolución Analítica Completa en 7 Fases
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Procedimiento algebraico demostrativo con justificación de métodos, cálculo de Wronskiano y comprobación formal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Expandir Todo
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            Colapsar Todo
          </button>
        </div>
      </div>

      {/* FASE 1: Identificación y Clasificación */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
        <button
          onClick={() => togglePhase(1)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 font-mono text-sm font-semibold border border-cyan-800/60">
              01
            </span>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">
                {solver.phase1Latex.title}
              </h3>
              <span className="text-xs text-slate-400">Orden, grado, linealidad y naturaleza de coeficientes</span>
            </div>
          </div>
          {expandedPhases[1] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>

        {expandedPhases[1] && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 space-y-4 text-sm text-slate-300">
            <p className="text-slate-300 leading-relaxed">{solver.phase1Latex.description}</p>
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800/70 text-cyan-300">
              <MathFormula math={solver.phase1Latex.eqLatex} block />
            </div>
            <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800/50">
              <MathFormula math={solver.phase1Latex.detailsLatex} block />
            </div>
            <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg text-xs text-cyan-200/90 leading-relaxed">
              <strong className="text-cyan-300">Principio Fundamental de Cauchy-Euler:</strong> Una ecuación diferencial es de tipo Cauchy-Euler (o equidimensional) si cada derivada de orden <MathFormula math="k" /> está multiplicada exactamente por <MathFormula math="x^k" />. Esta simetría dimensional permite la transformación invariante mediante el cambio de variable dependiente <MathFormula math="x = e^t" /> o la propuesta exponencial <MathFormula math="y = x^m" />.
            </div>
          </div>
        )}
      </div>

      {/* FASE 2: Ecuación Homogénea y Polinomio Característico */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
        <button
          onClick={() => togglePhase(2)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-950 text-indigo-400 font-mono text-sm font-semibold border border-indigo-800/60">
              02
            </span>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">
                {solver.phase2Latex.title}
              </h3>
              <span className="text-xs text-slate-400">Propuesta y = xᵐ, desarrollo algebraico y análisis de discriminante</span>
            </div>
          </div>
          {expandedPhases[2] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>

        {expandedPhases[2] && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 space-y-4 text-sm text-slate-300">
            <p className="leading-relaxed">
              Consideramos la ecuación homogénea asociada igualando a cero:
            </p>
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/70">
              <MathFormula math={`${solver.params.a}x^2 y'' ${solver.params.b >= 0 ? '+' : '-'} ${Math.abs(solver.params.b)}x y' ${solver.params.c >= 0 ? '+' : '-'} ${Math.abs(solver.params.c)}y = 0`} block />
            </div>
            <p className="leading-relaxed">
              Proponemos como solución tentativa <MathFormula math="y = x^m" /> para <MathFormula math="x > 0" />. Calculamos sus derivadas ordinarias:
            </p>
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
              <MathFormula math="y' = m x^{m-1}, \\qquad y'' = m(m-1) x^{m-2}" block />
            </div>
            <p className="leading-relaxed">
              Sustituyendo en la ecuación homogénea y factorizando <MathFormula math="x^m \neq 0" />:
            </p>
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800/70 space-y-2">
              <MathFormula math={`x^m \\Big[ ${solver.params.a} m(m-1) ${solver.params.b >= 0 ? '+' : '-'} ${Math.abs(solver.params.b)} m ${solver.params.c >= 0 ? '+' : '-'} ${Math.abs(solver.params.c)} \\Big] = 0`} block />
              <MathFormula math={solver.phase2Latex.charEqLatex} block />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                <span className="text-xs uppercase text-slate-400 font-semibold block mb-1">Discriminante Cuadrático</span>
                <MathFormula math={solver.phase2Latex.discriminantLatex} block />
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                <span className="text-xs uppercase text-slate-400 font-semibold block mb-1">Raíces de la Ecuación</span>
                <MathFormula math={solver.phase2Latex.rootsLatex} block />
              </div>
            </div>
            <p className="text-slate-300 italic">{solver.phase2Latex.explanation}</p>
          </div>
        )}
      </div>

      {/* FASE 3: Solución Homogénea */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
        <button
          onClick={() => togglePhase(3)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-mono text-sm font-semibold border border-emerald-800/60">
              03
            </span>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">
                {solver.phase3Latex.title}
              </h3>
              <span className="text-xs text-slate-400">Conjunto fundamental {'{'}y₁(x), y₂(x){'}'} e identidad de Euler</span>
            </div>
          </div>
          {expandedPhases[3] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>

        {expandedPhases[3] && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 space-y-4 text-sm text-slate-300">
            <p className="leading-relaxed">{solver.phase3Latex.explanation}</p>
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/60">
              <span className="text-xs font-semibold uppercase text-emerald-400 block mb-2">Base Fundamental Linealmente Independiente:</span>
              <MathFormula math={solver.phase3Latex.fundamentalSetLatex} block />
            </div>
            <div className="bg-emerald-950/30 p-4 rounded-lg border border-emerald-800/40 text-emerald-200">
              <span className="text-xs font-semibold uppercase text-emerald-300 block mb-1">Solución Homogénea General:</span>
              <MathFormula math={solver.phase3Latex.yhLatex} block />
            </div>
          </div>
        )}
      </div>

      {/* FASE 4: Solución Particular y Variación de Parámetros */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
        <button
          onClick={() => togglePhase(4)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-950 text-purple-400 font-mono text-sm font-semibold border border-purple-800/60">
              04
            </span>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">
                {solver.phase4Latex.title}
              </h3>
              <span className="text-xs text-slate-400">Forma canónica, determinante de Wronski, integrales de Lagrange y cálculo de yp(x)</span>
            </div>
          </div>
          {expandedPhases[4] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>

        {expandedPhases[4] && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 space-y-4 text-sm text-slate-300">
            <p className="leading-relaxed">{solver.phase4Latex.methodExplanation}</p>
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/70">
              <span className="text-xs uppercase text-slate-400 font-semibold block mb-1">Forma Estándar y Término Fuente f(x)</span>
              <MathFormula math={solver.phase4Latex.standardFormLatex} block />
            </div>

            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/60">
              <span className="text-xs uppercase text-purple-300 font-semibold block mb-2">Cálculo del Wronskiano W(y₁, y₂)(x)</span>
              <MathFormula math={solver.phase4Latex.wronskianLatex} block />
            </div>

            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/60">
              <span className="text-xs uppercase text-purple-300 font-semibold block mb-2">Integrales de Coeficientes Variables u₁(x) y u₂(x)</span>
              <MathFormula math={solver.phase4Latex.u1u2Latex} block />
            </div>

            <div className="bg-purple-950/30 p-4 rounded-lg border border-purple-800/40 text-purple-200">
              <span className="text-xs font-semibold uppercase text-purple-300 block mb-1">Solución Particular Obtenida:</span>
              <MathFormula math={solver.phase4Latex.ypLatex} block />
            </div>

            <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-xs text-slate-400">
              <strong className="text-slate-200">Método Alternativo Canónico (Cambio x = eᵗ):</strong> Al transformar la ecuación a coeficientes constantes <MathFormula math="\frac{d^2Y}{dt^2} - 6\frac{dY}{dt} + 13Y = t e^{3t}" />, se observa inmediatamente que <MathFormula math="r=3" /> no anula el polinomio auxiliar (<MathFormula math="P(3)=4" />). Proponiendo <MathFormula math="Y_p(t) = (At+B)e^{3t}" /> se obtiene directamente <MathFormula math="A=\frac{1}{4}, B=0" />, validando <MathFormula math="y_p(x) = \frac{1}{4}x^3\ln(x)" /> con independencia absoluta de método.
            </div>
          </div>
        )}
      </div>

      {/* FASE 5: Solución General */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
        <button
          onClick={() => togglePhase(5)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-950 text-blue-400 font-mono text-sm font-semibold border border-blue-800/60">
              05
            </span>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">
                {solver.phase5Latex.title}
              </h3>
              <span className="text-xs text-slate-400">Principio de superposición: y(x) = yh(x) + yp(x)</span>
            </div>
          </div>
          {expandedPhases[5] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>

        {expandedPhases[5] && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 space-y-4 text-sm text-slate-300">
            <p className="leading-relaxed">{solver.phase5Latex.explanation}</p>
            <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-800/40 text-blue-200">
              <span className="text-xs font-semibold uppercase text-blue-300 block mb-1">Familia Completa de Soluciones (Solución General):</span>
              <MathFormula math={solver.phase5Latex.generalSolLatex} block />
            </div>
          </div>
        )}
      </div>

      {/* FASE 6: Condiciones Iniciales y Cálculo de c1, c2 */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
        <button
          onClick={() => togglePhase(6)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-950 text-amber-400 font-mono text-sm font-semibold border border-amber-800/60">
              06
            </span>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">
                {solver.phase6Latex.title}
              </h3>
              <span className="text-xs text-slate-400">Aplicación del Problema de Cauchy y cálculo de constantes de integración</span>
            </div>
          </div>
          {expandedPhases[6] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>

        {expandedPhases[6] && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 space-y-4 text-sm text-slate-300">
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/70">
              <span className="text-xs uppercase text-amber-300 font-semibold block mb-1">Condiciones Iniciales Prescritas</span>
              <MathFormula math={solver.phase6Latex.initialSystemLatex} block />
            </div>
            <p className="leading-relaxed">
              Diferenciamos analíticamente la solución general respecto a <MathFormula math="x" /> aplicando la regla del producto y de la cadena:
            </p>
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/60">
              <MathFormula math={solver.phase6Latex.derivativeLatex} block />
            </div>
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/60">
              <span className="text-xs uppercase text-amber-300 font-semibold block mb-2">Sustitución en el Punto x₀ = 1 y Resolución del Sistema:</span>
              <MathFormula math={solver.phase6Latex.constantsCalculationLatex} block />
            </div>
            <div className="bg-amber-950/30 p-4 rounded-lg border border-amber-800/40 text-amber-200">
              <span className="text-xs font-semibold uppercase text-amber-300 block mb-1">Solución Particular Única del Problema de Valor Inicial:</span>
              <MathFormula math={solver.phase6Latex.finalParticularSolutionLatex} block />
            </div>
          </div>
        )}
      </div>

      {/* FASE 7: Verificación Rigurosa Simbólica y Numérica */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
        <button
          onClick={() => togglePhase(7)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-950 text-teal-400 font-mono text-sm font-semibold border border-teal-800/60">
              07
            </span>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">
                {solver.phase7Latex.title}
              </h3>
              <span className="text-xs text-slate-400">Demostración de residuo algebraico idénticamente nulo R(x) ≡ 0</span>
            </div>
          </div>
          {expandedPhases[7] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>

        {expandedPhases[7] && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 space-y-4 text-sm text-slate-300">
            <p className="leading-relaxed">
              Para garantizar que el resultado no proviene de aproximaciones arbitrarias, calculamos las derivadas de orden superior y sustituimos en el operador diferencial original <MathFormula math="\mathcal{L}[y] = x^2 y'' - 5xy' + 13y" />:
            </p>
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/60">
              <span className="text-xs uppercase text-teal-300 font-semibold block mb-2">Derivadas Primera y Segunda de yp(x):</span>
              <MathFormula math={solver.phase7Latex.verificationDerivativesLatex} block />
            </div>
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/60">
              <span className="text-xs uppercase text-teal-300 font-semibold block mb-2">Sustitución en el Operador Diferencial:</span>
              <MathFormula math={solver.phase7Latex.substitutionLatex} block />
            </div>
            <div className="bg-teal-950/30 p-4 rounded-lg border border-teal-800/40 text-teal-200 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold uppercase text-teal-300 block mb-1">Residuo Simbólico Exacto:</span>
                <MathFormula math={solver.phase7Latex.residualResultLatex} block />
                <p className="text-xs text-teal-300/80 mt-1">
                  El operador cancela exactamente todos los monomios auxiliares y regenera idénticamente el término no homogéneo.
                </p>
              </div>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/60">
              <span className="text-xs uppercase text-slate-400 font-semibold block mb-2">Comprobación de Condiciones de Contorno:</span>
              <MathFormula math={solver.phase7Latex.initialConditionsCheckLatex} block />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
