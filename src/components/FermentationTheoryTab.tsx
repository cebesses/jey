/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { YogurtModelResult } from '../math/yogurtFermentationModel';
import { MathFormula } from './MathFormula';
import {
  Crosshair,
  Ruler,
  Activity,
  Snowflake,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Layers,
} from 'lucide-react';

export type LabTabTarget = 'math' | 'plot2d' | 'plot3d' | 'batch' | 'theory';

interface FermentationTheoryTabProps {
  model: YogurtModelResult;
  onNavigateTab: (tab: LabTabTarget) => void;
}

export const FermentationTheoryTab: React.FC<FermentationTheoryTabProps> = ({
  model,
  onNavigateTab,
}) => {
  const { S0, k1, b } = model.params;

  const sensitivityRows = [0.04, 0.06, 0.08, 0.10, 0.12, 0.15].map((kVal) => {
    const tInt = Math.log((1 + b) / b) / kVal;
    const cInt = S0 * (b / (1 + b));
    const tOpt =
      model.params.targetP < model.bS0
        ? -Math.log(1 - model.params.targetP / model.bS0) / kVal
        : Infinity;
    const dS = -kVal * cInt;
    const dP = b * kVal * cInt;
    return {
      kVal,
      tOpt,
      tInt,
      cInt,
      dS,
      dP,
      inEightHours: tInt <= 8,
    };
  });

  return (
    <div className="space-y-5">
      {/* Document Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 block">
          Ingeniería Agroindustrial · Marco Conceptual Complementario
        </span>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Acercamiento entre Curvas, Unidades Temporales y Comportamiento Dinámico
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          Análisis técnico de los fenómenos matemáticos, dimensionales y de proceso que complementan el sistema de dos ecuaciones diferenciales: qué ocurre cuando las concentraciones de lactosa <MathFormula math="S(t)" /> y ácido láctico <MathFormula math="P(t)" /> se aproximan e intersecan, cómo evolucionan sus unidades en el tiempo y qué representa la detención térmica en planta láctea.
        </p>
      </div>

      {/* SECTION 01: APPROACH & INTERSECTION S(t) = P(t) */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <Crosshair className="w-4 h-4 text-blue-700 shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                01. ¿Qué Ocurre cuando S(t) y P(t) se Acercan y se Intersecan?
              </h3>
              <p className="text-xs text-slate-500">
                Análisis del punto de equiconcentración másica S(t) = P(t) frente al punto óptimo de detención t*
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('plot2d')}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            Ver cruce en Gráfica 2D
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Column Flat Approach Summary */}
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 border border-slate-200 rounded-md text-xs leading-relaxed">
          <div className="p-4 space-y-1">
            <span className="font-semibold text-blue-700 block">1. Trayectoria de acercamiento</span>
            <p className="text-slate-600">
              En <MathFormula math="t = 0" />, toda la masa está en la lactosa (<MathFormula math={`S(0) = ${S0}\\text{ g/L}`} />) y el ácido inicia en <MathFormula math="P(0) = 0" />. Conforme avanza el lote, <MathFormula math="S(t)" /> desciende hacia <MathFormula math="0" /> y <MathFormula math="P(t)" /> crece hacia <MathFormula math={`bS_0 = ${model.bS0.toFixed(1)}\\text{ g/L}`} />, cerrando continuamente la brecha vertical entre ambas curvas.
            </p>
          </div>

          <div className="p-4 space-y-1">
            <span className="font-semibold text-slate-900 block">2. Instante exacto del encuentro</span>
            <p className="text-slate-600">
              Dado que una función decrece continuamente desde <MathFormula math="S_0 > 0" /> hasta <MathFormula math="0" /> y la otra crece desde <MathFormula math="0" /> hasta <MathFormula math="bS_0 > 0" />, por continuidad <strong>se intersecan en un único tiempo</strong> <MathFormula math="t_{\text{int}}" /> donde la concentración de lactosa remanente iguala a la de ácido formado.
            </p>
          </div>

          <div className="p-4 space-y-1">
            <span className="font-semibold text-slate-900 block">3. Separación posterior y asíntota</span>
            <p className="text-slate-600">
              Superado <MathFormula math="t_{\text{int}}" />, las curvas invierten su posición relativa: el ácido láctico supera la concentración de lactosa remanente (<MathFormula math="P(t) > S(t)" />), aproximándose asintóticamente a <MathFormula math={`bS_0 = ${model.bS0.toFixed(1)}\\text{ g/L}`} /> mientras <MathFormula math="S(t) \to 0" />.
            </p>
          </div>
        </div>

        {/* Algebraic Deduction & Key Properties */}
        <div className="grid lg:grid-cols-2 gap-4 items-stretch">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs text-slate-800">
            <span className="font-semibold uppercase tracking-wider text-slate-500 block">
              Deducción Algebraica de la Intersección
            </span>
            <MathFormula math={model.intersectionLatex.equationLatex} block />
            <MathFormula math={model.intersectionLatex.stepsLatex} block />
            <MathFormula math={model.intersectionLatex.concLatex} block />
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col justify-between space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-500 block">
              Propiedades Fundamentales de S(t) = P(t)
            </span>

            <ul className="space-y-2.5 text-slate-700 leading-relaxed">
              <li>
                <strong className="text-slate-900">1. Independencia de S₀:</strong> El término <MathFormula math="S_0" /> se cancela en la igualdad. Modificar la lactosa inicial cambia la altura del encuentro (<MathFormula math="\frac{b}{1+b}S_0" />), pero el tiempo <MathFormula math="t_{\text{int}}" /> permanece invariable si <MathFormula math="k_1" /> y <MathFormula math="b" /> son fijos.
              </li>
              <li>
                <strong className="text-blue-700">2. Velocidades diferentes en el cruce:</strong> Aunque <MathFormula math="S = P" />, sus tasas de cambio difieren porque <MathFormula math={`b = ${b.toFixed(2)} < 1`} />. La lactosa cae a <MathFormula math={`${model.intersectionDS_dt.toFixed(3)}\\text{ g/(L}\\cdot\\text{h)}`} />, mientras el ácido sube a <MathFormula math={`+${model.intersectionDP_dt.toFixed(3)}\\text{ g/(L}\\cdot\\text{h)}`} />.
              </li>
              <li>
                <strong className="text-slate-900">3. Posterior a la vida media (t₁/₂):</strong> El 50% de la lactosa se consume en <MathFormula math={`t_{1/2} = \\frac{\\ln 2}{k_1} = ${model.halfLifeHours.toFixed(2)}\\text{ h}`} />. Como <MathFormula math="b < 1" />, el cruce ocurre después (<MathFormula math={`${model.intersectionTimeHours.toFixed(2)}\\text{ h}`} />), tras consumirse el <MathFormula math={`${model.intersectionConsumedPct.toFixed(1)}\\%`} /> del sustrato.
              </li>
              <li>
                <strong className="text-slate-900">4. Conservación verificada:</strong> En ese instante se cumple <MathFormula math={`P + bS = ${model.intersectionConc.toFixed(2)} + (${b.toFixed(2)})(${model.intersectionConc.toFixed(2)}) = ${model.bS0.toFixed(2)}\\text{ g/L}`} />.
              </li>
            </ul>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Diferencia entre el Punto Operativo del Yogur y la Intersección Matemática
          </span>
          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-sans font-semibold">Criterio</th>
                  <th className="py-2.5 px-3 font-sans font-semibold text-blue-700">Punto Operativo Óptimo (t*)</th>
                  <th className="py-2.5 px-3 font-sans font-semibold text-slate-900">Intersección entre Curvas (S = P)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Condición matemática</td>
                  <td className="py-2.5 px-3">P(t*) = {model.params.targetP.toFixed(2)} g/L</td>
                  <td className="py-2.5 px-3">S(t_int) = P(t_int)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Tiempo transcurrido</td>
                  <td className="py-2.5 px-3 text-blue-700 font-semibold">
                    {model.isTargetReachable
                      ? `${model.targetTimeHours.toFixed(2)} h (${model.targetTimeFormatted})`
                      : 'Inalcanzable'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-semibold">
                    {model.intersectionTimeHours.toFixed(2)} h ({model.intersectionTimeFormatted})
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Lactosa restante S</td>
                  <td className="py-2.5 px-3">
                    {model.isTargetReachable
                      ? `${model.targetLactoseRemaining.toFixed(2)} g/L (${(100 - model.targetLactoseConsumedPct).toFixed(1)}%)`
                      : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3">
                    {model.intersectionConc.toFixed(2)} g/L ({(100 - model.intersectionConsumedPct).toFixed(1)}%)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Ácido láctico P</td>
                  <td className="py-2.5 px-3">
                    {model.params.targetP.toFixed(2)} g/L ({Math.round(model.params.targetP * 10)} °D ·{' '}
                    {(model.params.targetP / 10).toFixed(2)}%)
                  </td>
                  <td className="py-2.5 px-3">
                    {model.intersectionConc.toFixed(2)} g/L ({model.intersectionDornic} °D ·{' '}
                    {model.intersectionAcidityPct.toFixed(2)}%)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Lactosa consumida</td>
                  <td className="py-2.5 px-3">{model.targetLactoseConsumedPct.toFixed(1)}%</td>
                  <td className="py-2.5 px-3">{model.intersectionConsumedPct.toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Estado fisicoquímico</td>
                  <td className="py-2.5 px-3 font-sans text-blue-700 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Coagulación firme (enfriar a 4 °C)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-red-700 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Sobre-acidificación extrema y sinéresis
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Agroindustrial Limitation Note */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-xs text-slate-800 flex items-start gap-3 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-red-900 block mb-0.5">
              Significado Agroindustrial y Alcance del Modelo Lineal
            </strong>
            El punto <MathFormula math="S(t) = P(t)" /> no corresponde a una meta operativa en planta láctea. Alcanzar{' '}
            <MathFormula math={`${model.intersectionDornic}\\ ^\\circ\\text{D}`} /> (<MathFormula math={`${model.intersectionAcidityPct.toFixed(2)}\\%`} /> de acidez) produce contracción del coágulo con expulsión severa de suero (sinéresis). En la fermentación real, al superar{' '}
            <MathFormula math="1{,}2\% - 1{,}5\%" /> de acidez (<MathFormula math="\text{pH} < 4{,}0" />), la inhibición ácida frena el metabolismo bacteriano antes de alcanzar ese cruce; su aparición responde a que el modelo de dos EDOs mantiene <MathFormula math="k_1" /> constante.
          </div>
        </div>

        {/* Sensitivity Table by k1 */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Sensibilidad respecto a k₁ dentro de las primeras 8 horas (S₀ = {S0} g/L, b = {b.toFixed(2)})
          </span>
          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-semibold">k₁ (h⁻¹)</th>
                  <th className="py-2 px-3 font-semibold">Óptimo t* (h)</th>
                  <th className="py-2 px-3 font-semibold text-blue-700">Cruce t_int (h)</th>
                  <th className="py-2 px-3 font-semibold">Valor S = P</th>
                  <th className="py-2 px-3 font-semibold">dS/dt en cruce</th>
                  <th className="py-2 px-3 font-semibold">dP/dt en cruce</th>
                  <th className="py-2 px-3 font-sans font-semibold">Horizonte 0–8 h</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {sensitivityRows.map((row) => (
                  <tr
                    key={row.kVal}
                    className={Math.abs(row.kVal - k1) < 0.005 ? 'bg-blue-50/70 text-slate-950 font-semibold' : ''}
                  >
                    <td className="py-2 px-3">{row.kVal.toFixed(2)}</td>
                    <td className="py-2 px-3">{Number.isFinite(row.tOpt) ? `${row.tOpt.toFixed(2)} h` : 'N/A'}</td>
                    <td className="py-2 px-3 text-blue-700 font-semibold">{row.tInt.toFixed(2)} h</td>
                    <td className="py-2 px-3">{row.cInt.toFixed(2)} g/L</td>
                    <td className="py-2 px-3 text-blue-700">{row.dS.toFixed(2)} g/(L·h)</td>
                    <td className="py-2 px-3">+{row.dP.toFixed(2)} g/(L·h)</td>
                    <td className="py-2 px-3 font-sans">
                      {row.inEightHours ? (
                        <span className="text-blue-700 font-medium">Visible dentro de 8 h</span>
                      ) : (
                        <span className="text-slate-500">Requiere ≥ {Math.ceil(row.tInt)} h</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 02: PARAMETERS, MEANING & UNITS OVER TIME */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-4 h-4 text-blue-700 shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                02. Parámetros, Significado Físico y Unidades según el Tiempo (Lectura 3D)
              </h3>
              <p className="text-xs text-slate-500">
                Análisis dimensional completo al recorrer la superficie tridimensional P(t, k₁) y S(t, k₁)
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('plot3d')}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            Inspeccionar en Superficie 3D
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Símbolo</th>
                <th className="py-2.5 px-3 font-semibold">Magnitud</th>
                <th className="py-2.5 px-3 font-semibold">Unidades</th>
                <th className="py-2.5 px-3 font-semibold">Comportamiento en t</th>
                <th className="py-2.5 px-3 font-semibold">Significado en el Tanque de Fermentación Láctea</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">t</td>
                <td className="py-2.5 px-3">Tiempo de fermentación</td>
                <td className="py-2.5 px-3 font-mono text-slate-900">h (horas)</td>
                <td className="py-2.5 px-3">Variable independiente (Eje X)</td>
                <td className="py-2.5 px-3 text-slate-600">Duración acumulada desde la inoculación a 43 °C.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-blue-700">S(t)</td>
                <td className="py-2.5 px-3">Concentración de lactosa</td>
                <td className="py-2.5 px-3 font-mono text-blue-700">g/L</td>
                <td className="py-2.5 px-3">Varía con t (decae a 0)</td>
                <td className="py-2.5 px-3 text-slate-600">Gramos de azúcar aún disponibles por litro en ese instante.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">P(t)</td>
                <td className="py-2.5 px-3">Ácido láctico acumulado</td>
                <td className="py-2.5 px-3 font-mono text-slate-900">g/L · °D · %</td>
                <td className="py-2.5 px-3">Varía con t (crece a b·S₀)</td>
                <td className="py-2.5 px-3 text-slate-600">Masa de ácido formada por litro (1 °D = 0,1 g/L; 0,8% = 8 g/L).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-blue-700">dS/dt</td>
                <td className="py-2.5 px-3">Tasa de consumo de lactosa</td>
                <td className="py-2.5 px-3 font-mono text-blue-700">g/(L·h)</td>
                <td className="py-2.5 px-3">Varía con t (tiende a 0)</td>
                <td className="py-2.5 px-3 text-slate-600">
                  Velocidad instantánea de desaparición; negativa y máxima en t = 0 ({(-k1 * S0).toFixed(2)} g/(L·h)).
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">dP/dt</td>
                <td className="py-2.5 px-3">Tasa de síntesis de ácido</td>
                <td className="py-2.5 px-3 font-mono text-slate-900">g/(L·h)</td>
                <td className="py-2.5 px-3">Varía con t (tiende a 0)</td>
                <td className="py-2.5 px-3 text-slate-600">
                  Rapidez de acidificación por hora; positiva y máxima en t = 0 (+{(b * k1 * S0).toFixed(2)} g/(L·h)).
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">k₁</td>
                <td className="py-2.5 px-3">Constante cinética</td>
                <td className="py-2.5 px-3 font-mono text-slate-900">h⁻¹</td>
                <td className="py-2.5 px-3">Constante del cultivo (Eje Y)</td>
                <td className="py-2.5 px-3 text-slate-600">
                  Fracción consumida por hora; τ = 1/k₁ ({model.characteristicTimeHours.toFixed(2)} h) define la escala temporal.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">b</td>
                <td className="py-2.5 px-3">Rendimiento estequiométrico</td>
                <td className="py-2.5 px-3 font-mono text-slate-900">g/g</td>
                <td className="py-2.5 px-3">Constante de conversión</td>
                <td className="py-2.5 px-3 text-slate-600">
                  Gramos de ácido producidos por cada gramo de lactosa consumida ({b.toFixed(2)} g/g).
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 flex items-start gap-3 leading-relaxed">
          <Layers className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-0.5">Lectura geométrica en tres dimensiones</strong>
            Al superponer <MathFormula math="P(t, k_1)" /> y <MathFormula math="S(t, k_1)" />, la intersección traza una{' '}
            <strong>curva espacial continua</strong>: su altura vertical es invariante en{' '}
            <MathFormula math={`z = \\frac{b}{1+b}S_0 = ${model.intersectionConc.toFixed(2)}\\text{ g/L}`} />, mientras el instante del cruce describe la hipérbola{' '}
            <MathFormula math="t_{\text{int}}(k_1) = \frac{\ln(1+1/b)}{k_1}" />.
          </div>
        </div>
      </section>

      {/* SECTION 03: TEMPORAL MOTION & THERMAL ARREST */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-blue-700 shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                03. Dinámica del Movimiento Temporal y Detención por Enfriamiento
              </h3>
              <p className="text-xs text-slate-500">
                Interpretación cinética al observar las curvas evolucionar en tiempo real en planta agroindustrial
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('batch')}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            Probar en Control de Lote
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 border border-slate-200 rounded-md text-xs leading-relaxed">
          <div className="p-4 space-y-1.5">
            <span className="font-semibold text-slate-900 text-sm block">
              Desaceleración exponencial durante la marcha
            </span>
            <p className="text-slate-600">
              Al recorrer la trayectoria desde <MathFormula math="t = 0" />, la variación por hora es mayor al comienzo porque el sustrato es abundante. A medida que se agota la lactosa, las pendientes{' '}
              <MathFormula math="\frac{dS}{dt} = -k_1 S" /> y <MathFormula math="\frac{dP}{dt} = b k_1 S" /> disminuyen exponencialmente hacia cero.
            </p>
          </div>

          <div className="p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-blue-700 text-sm">
              <Snowflake className="w-4 h-4 shrink-0" />
              <span>Efecto matemático del enfriamiento a 4 °C</span>
            </div>
            <p className="text-slate-600">
              Al alcanzar la meta (<MathFormula math={`P = ${model.params.targetP}\\text{ g/L}`} />, <MathFormula math="80\ ^\circ\text{D}" />) en{' '}
              <MathFormula math={`t^* = ${model.targetTimeFormatted}`} /> y enfriar el tanque a <MathFormula math="4\ ^\circ\text{C}" />, el cultivo entra en latencia (<MathFormula math="k_1 \to 0" />). Con ello <MathFormula math="\frac{dS}{dt} = 0" /> y <MathFormula math="\frac{dP}{dt} = 0" />, fijando horizontalmente las curvas para preservar la calidad comercial del yogur.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
