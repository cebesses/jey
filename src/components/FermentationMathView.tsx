/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { YogurtModelResult } from '../math/yogurtFermentationModel';
import { MathFormula } from './MathFormula';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  Presentation,
} from 'lucide-react';

interface FermentationMathViewProps {
  model: YogurtModelResult;
}

export const FermentationMathView: React.FC<FermentationMathViewProps> = ({ model }) => {
  const [boardMode, setBoardMode] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    fundamentos: true,
    variables: true,
    step1: true,
    step2: true,
    comprobacion: true,
    tiempo: true,
    tabla: true,
    interseccion: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setExpandedSections({
      fundamentos: true,
      variables: true,
      step1: true,
      step2: true,
      comprobacion: true,
      tiempo: true,
      tabla: true,
      interseccion: true,
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      fundamentos: false,
      variables: false,
      step1: false,
      step2: false,
      comprobacion: false,
      tiempo: false,
      tabla: false,
      interseccion: false,
    });
  };

  const proseClass = boardMode ? 'text-base leading-relaxed' : 'text-sm leading-relaxed';
  const formulaBoxClass = boardMode
    ? 'bg-slate-50 border border-slate-900/20 rounded-md p-4 text-slate-950 text-lg'
    : 'bg-slate-50 border border-slate-200 rounded-md p-3.5 text-slate-900';
  const badgeClass = boardMode
    ? 'flex items-center justify-center w-7 h-7 rounded bg-blue-700 text-white font-mono text-xs font-semibold shrink-0'
    : 'flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-xs font-semibold shrink-0';

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Desarrollo Analítico · Sistema de Dos Ecuaciones</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Resolución Paso a Paso del Modelo Cinético
          </h2>
          <p className="text-xs text-slate-600">
            Desarrollo completo del informe de Ingeniería Agroindustrial: separación de variables, método de sustitución, balance físico e intersección.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBoardMode(!boardMode)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              boardMode
                ? 'bg-blue-700 text-white border-blue-700 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            {boardMode ? 'Modo Tablero Activo' : 'Modo Tablero'}
          </button>
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            Expandir
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            Colapsar
          </button>
        </div>
      </div>

      {/* Unified Monograph Accordion Stack */}
      <div
        className={`bg-white rounded-lg divide-y divide-slate-200 overflow-hidden ${
          boardMode ? 'border-2 border-slate-900' : 'border border-slate-200'
        }`}
      >
        {/* 01. FUNDAMENTOS Y PREGUNTA CLAVE */}
        <div>
          <button
            onClick={() => toggleSection('fundamentos')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={badgeClass}>01</span>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Fundamentos y Pregunta Clave de Proceso
                </h3>
                <span className="text-xs text-slate-500">
                  Balance de materia y cinética de primer orden dC/dt = -k·C
                </span>
              </div>
            </div>
            {expandedSections.fundamentos ? (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {expandedSections.fundamentos && (
            <div className={`px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-slate-700 ${proseClass}`}>
              <p>
                El yogur se obtiene al inocular leche con bacterias lácticas (<em>Streptococcus thermophilus</em> y{' '}
                <em>Lactobacillus bulgaricus</em>) y mantenerla a unos <strong>43 °C</strong>. Las bacterias consumen la lactosa y la transforman en ácido láctico; ese ácido baja el pH, coagula las proteínas y da la acidez característica del producto.
              </p>

              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-md text-slate-800 flex items-start gap-3">
                <FlaskConical className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-blue-800 block text-xs uppercase tracking-wider">
                    Objetivo Operativo en Planta Láctea
                  </strong>
                  <p className="text-sm leading-relaxed">
                    ¿Cuánto tiempo debe fermentar la leche para alcanzar la acidez adecuada de{' '}
                    <strong>0,8 % de ácido láctico</strong> (pH cercano a <strong>4,6</strong>) y detener el proceso por enfriamiento?
                  </p>
                  <p className="text-xs text-slate-600">
                    Pasarse da un yogur demasiado ácido; quedarse corto, un producto sin coagular.
                  </p>
                </div>
              </div>

              <div className={formulaBoxClass}>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                  Balance para cualquier sustancia dentro del fermentador
                </span>
                <MathFormula math="\frac{dC}{dt} = \text{producción} - \text{consumo}" block />
                <p className="text-xs text-slate-600 mt-2">
                  Cinética de primer orden (cuando la velocidad de consumo es proporcional a la concentración presente):
                </p>
                <MathFormula math="\frac{dC}{dt} = -k C" block />
                <p className="text-xs text-slate-600">
                  donde <MathFormula math="k > 0" /> es la constante de velocidad (unidades h⁻¹). Su solución es una exponencial decreciente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 02. VARIABLES Y PARÁMETROS DEL INFORME */}
        <div>
          <button
            onClick={() => toggleSection('variables')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={badgeClass}>02</span>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Variables, Parámetros y Justificación de Ecuaciones
                </h3>
                <span className="text-xs text-slate-500">
                  Tabla del PDF p. 2: S₀ = 50 g/L, k₁ = 0,06 h⁻¹, b = 0,70 g/g
                </span>
              </div>
            </div>
            {expandedSections.variables ? (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {expandedSections.variables && (
            <div className={`px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-slate-700 ${proseClass}`}>
              <div className="overflow-x-auto border border-slate-200 rounded-md">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Símbolo</th>
                      <th className="py-2.5 px-3 font-semibold">Significado</th>
                      <th className="py-2.5 px-3 font-semibold">Unidad</th>
                      <th className="py-2.5 px-3 font-semibold text-blue-700">Valor Usado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">t</td>
                      <td className="py-2 px-3 font-sans text-slate-700">Tiempo de fermentación</td>
                      <td className="py-2 px-3 text-slate-500">h</td>
                      <td className="py-2 px-3 text-slate-900">0 a 6</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-blue-700">S(t)</td>
                      <td className="py-2 px-3 font-sans text-slate-700">Concentración de lactosa</td>
                      <td className="py-2 px-3 text-slate-500">g/L</td>
                      <td className="py-2 px-3 text-blue-700 font-semibold">S₀ = 50</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">P(t)</td>
                      <td className="py-2 px-3 font-sans text-slate-700">Ácido láctico producido</td>
                      <td className="py-2 px-3 text-slate-500">g/L</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">P₀ = 0</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">k₁</td>
                      <td className="py-2 px-3 font-sans text-slate-700">Constante de consumo de lactosa</td>
                      <td className="py-2 px-3 text-slate-500">h⁻¹</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">0,06</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">b</td>
                      <td className="py-2 px-3 font-sans text-slate-700">Rendimiento de ácido (g ácido / g lactosa)</td>
                      <td className="py-2 px-3 text-slate-500">g/g</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">0,70</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Justificación de los valores:</strong> La leche contiene cerca de 45 a 50 g/L de lactosa, por eso{' '}
                <MathFormula math="S_0 = 50" />. Los valores de <MathFormula math="k_1" /> y <MathFormula math="b" /> son supuestos razonables elegidos para que los resultados sean coherentes con un yogur real (acidez cercana a 0,9 % a las 5 h).
              </p>

              <div className={formulaBoxClass}>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1 text-center">
                  Sistema Completo y Condiciones Iniciales (PDF p. 3)
                </span>
                <MathFormula math="\frac{dS}{dt} = -k_1 S" block />
                <MathFormula math="\frac{dP}{dt} = b k_1 S" block />
                <MathFormula math="S(0) = 50, \qquad P(0) = 0" block />
              </div>
            </div>
          )}
        </div>

        {/* 03. PASO 1 - RESOLVER LACTOSA S(t) */}
        <div>
          <button
            onClick={() => toggleSection('step1')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={badgeClass}>03</span>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Paso 1. Resolver la Lactosa S(t)
                </h3>
                <span className="text-xs text-slate-500">Separación de variables e integración directa</span>
              </div>
            </div>
            {expandedSections.step1 ? (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {expandedSections.step1 && (
            <div className={`px-5 pb-5 pt-2 border-t border-slate-100 space-y-3 text-slate-700 ${proseClass}`}>
              <p>Partimos de la ecuación de primer orden para la lactosa:</p>
              <div className={formulaBoxClass}>
                <MathFormula math="\frac{dS}{dt} = -k_1 S" block />
              </div>

              <p>Separamos las variables (S a un lado y t al otro):</p>
              <div className={formulaBoxClass}>
                <MathFormula math="\frac{dS}{S} = -k_1 dt" block />
              </div>

              <p>Integramos ambos miembros:</p>
              <div className={formulaBoxClass}>
                <MathFormula math="\int \frac{dS}{S} = \int (-k_1) dt \implies \ln S = -k_1 t + C_1" block />
              </div>

              <p>Aplicamos exponencial a ambos lados y renombramos <MathFormula math="C = e^{C_1}" />:</p>
              <div className={formulaBoxClass}>
                <MathFormula math="S = e^{-k_1 t + C_1} = e^{C_1} \cdot e^{-k_1 t} = C e^{-k_1 t}" block />
              </div>

              <p>
                Evaluando <MathFormula math="S(0) = S_0" />: <MathFormula math="S_0 = C \cdot e^0 = C" />, por lo tanto{' '}
                <MathFormula math="C = S_0" />.
              </p>

              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-md text-slate-900">
                <strong className="text-[11px] uppercase tracking-wider text-blue-700 block mb-1">Resultado Paso 1</strong>
                <MathFormula math="S(t) = S_0 e^{-k_1 t}" block />
                <div className="text-xs text-slate-700 text-center mt-1">
                  Con valores del informe: <MathFormula math="S(t) = 50 e^{-0,06 t}" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 04. PASO 2 - RESOLVER ÁCIDO LÁCTICO P(t) */}
        <div>
          <button
            onClick={() => toggleSection('step2')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={badgeClass}>04</span>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Paso 2. Resolver el Ácido Láctico P(t)
                </h3>
                <span className="text-xs text-slate-500">
                  Sustitución de S(t), cambio de variable u = -k₁t y cancelación de k₁
                </span>
              </div>
            </div>
            {expandedSections.step2 ? (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {expandedSections.step2 && (
            <div className={`px-5 pb-5 pt-2 border-t border-slate-100 space-y-3 text-slate-700 ${proseClass}`}>
              <p>Partimos de la ecuación diferencial para la formación de ácido:</p>
              <div className={formulaBoxClass}>
                <MathFormula math="\frac{dP}{dt} = b k_1 S" block />
              </div>

              <p>Sustituimos la solución hallada <MathFormula math="S(t) = S_0 e^{-k_1 t}" />:</p>
              <div className={formulaBoxClass}>
                <MathFormula math="\frac{dP}{dt} = b k_1 S_0 e^{-k_1 t} \implies P = b k_1 S_0 \int e^{-k_1 t} dt" block />
              </div>

              <p>
                Por sustitución, sea <MathFormula math="u = -k_1 t" />, entonces <MathFormula math="du = -k_1 dt" />, es decir,{' '}
                <MathFormula math="dt = \frac{du}{-k_1}" />:
              </p>
              <div className={formulaBoxClass}>
                <MathFormula math="\int e^{-k_1 t} dt = \int e^u \frac{du}{-k_1} = -\frac{1}{k_1} e^{-k_1 t}" block />
              </div>

              <p>Sustituimos y cancelamos <MathFormula math="k_1" />:</p>
              <div className={formulaBoxClass}>
                <MathFormula math="P = b k_1 S_0 \left(-\frac{1}{k_1} e^{-k_1 t}\right) + C = -b S_0 e^{-k_1 t} + C" block />
              </div>

              <p>Con la condición inicial <MathFormula math="P(0) = 0" />:</p>
              <div className={formulaBoxClass}>
                <MathFormula math="0 = -b S_0 + C \implies C = b S_0" block />
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-md text-slate-900">
                <strong className="text-[11px] uppercase tracking-wider text-blue-700 block mb-1">Resultado Paso 2</strong>
                <MathFormula math="P(t) = b S_0 (1 - e^{-k_1 t})" block />
                <div className="text-xs text-slate-700 text-center mt-1">
                  Con valores del informe: <MathFormula math="b S_0 = (0,70)(50) = 35" />, así que{' '}
                  <MathFormula math="P(t) = 35 (1 - e^{-0,06 t})" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 05. COMPROBACIÓN FÍSICA */}
        <div>
          <button
            onClick={() => toggleSection('comprobacion')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={badgeClass}>05</span>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Comprobación Física: P(t) + b·S(t) = b·S₀
                </h3>
                <span className="text-xs text-slate-500">
                  El ácido producido coincide exactamente con la lactosa convertida
                </span>
              </div>
            </div>
            {expandedSections.comprobacion ? (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {expandedSections.comprobacion && (
            <div className={`px-5 pb-5 pt-2 border-t border-slate-100 space-y-3 text-slate-700 ${proseClass}`}>
              <div className={formulaBoxClass}>
                <MathFormula math="P(t) + b S(t) = b S_0 (1 - e^{-k_1 t}) + b (S_0 e^{-k_1 t}) = b S_0" block />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Comprobación física:</strong> <MathFormula math="P(t) + b S(t) = b S_0" /> en todo instante. El ácido láctico acumulado corresponde estequiométricamente a la fracción <MathFormula math="b" /> de lactosa consumida.
              </p>
            </div>
          )}
        </div>

        {/* 06. RESULTADOS NUMÉRICOS (TABLA PDF p. 5) */}
        <div>
          <button
            onClick={() => toggleSection('tabla')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={badgeClass}>06</span>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Resultados Numéricos (Tabla PDF p. 5)
                </h3>
                <span className="text-xs text-slate-500">
                  Solución evaluada de 0 a 6 h con los parámetros actuales del modelo
                </span>
              </div>
            </div>
            {expandedSections.tabla ? (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {expandedSections.tabla && (
            <div className="px-5 pb-5 pt-2 border-t border-slate-100">
              <div className="overflow-x-auto border border-slate-200 rounded-md">
                <table className="w-full text-left text-xs font-mono tabular-nums">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">t (h)</th>
                      <th className="py-2.5 px-3 font-semibold text-blue-700">S (g/L)</th>
                      <th className="py-2.5 px-3 font-semibold text-slate-900">P (g/L)</th>
                      <th className="py-2.5 px-3 font-semibold text-slate-700">Acidez (°D)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {model.hourlyTable.map((row) => (
                      <tr key={row.t} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-bold text-slate-900">{row.t}</td>
                        <td className="py-2 px-3 text-blue-700 font-semibold">{row.S.toFixed(2).replace('.', ',')}</td>
                        <td className="py-2 px-3 text-slate-900 font-semibold">{row.P.toFixed(2).replace('.', ',')}</td>
                        <td className="py-2 px-3 text-slate-700">{row.dornic}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 07. TIEMPO PARA ALCANZAR 0.8% DE ÁCIDO LÁCTICO */}
        <div>
          <button
            onClick={() => toggleSection('tiempo')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={badgeClass}>07</span>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Tiempo de Detención Óptima t* para P = {model.params.targetP.toFixed(1)} g/L
                </h3>
                <span className="text-xs text-slate-500">
                  Deducción logarítmica de t* y fracción de lactosa consumida
                </span>
              </div>
            </div>
            {expandedSections.tiempo ? (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {expandedSections.tiempo && (
            <div className={`px-5 pb-5 pt-2 border-t border-slate-100 space-y-3 text-slate-700 ${proseClass}`}>
              <p>Igualamos la solución analítica de <MathFormula math="P(t)" /> con el objetivo <MathFormula math={`P^* = ${model.params.targetP.toFixed(1)}\\text{ g/L}`} />:</p>
              <div className={formulaBoxClass}>
                <MathFormula math={model.targetCalculationLatex.equationLatex} block />
                <MathFormula math={model.targetCalculationLatex.stepsLatex} block />
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-md text-slate-900">
                <strong className="text-[11px] uppercase tracking-wider text-blue-700 block mb-1">
                  Condición en el instante t*
                </strong>
                <MathFormula math={model.targetCalculationLatex.consumptionLatex} block />
              </div>
            </div>
          )}
        </div>

        {/* 08. ANÁLISIS DE INTERSECCIÓN ENTRE CURVAS: S(t) = P(t) */}
        <div>
          <button
            onClick={() => toggleSection('interseccion')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={badgeClass}>08</span>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Análisis de Intersección entre Curvas: S(t) = P(t)
                </h3>
                <span className="text-xs text-slate-500">
                  Equiconcentración másica, independencia de S₀ e interpretación agroindustrial
                </span>
              </div>
            </div>
            {expandedSections.interseccion ? (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {expandedSections.interseccion && (
            <div className={`px-5 pb-5 pt-2 border-t border-slate-100 space-y-3 text-slate-700 ${proseClass}`}>
              <p>
                Igualamos la concentración de lactosa restante <MathFormula math="S(t)" /> con la de ácido láctico acumulado{' '}
                <MathFormula math="P(t)" />:
              </p>
              <div className={formulaBoxClass}>
                <MathFormula math={model.intersectionLatex.equationLatex} block />
                <MathFormula math={model.intersectionLatex.stepsLatex} block />
                <MathFormula math={model.intersectionLatex.concLatex} block />
                <MathFormula math={model.intersectionLatex.ratesLatex} block />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 space-y-1.5 leading-relaxed">
                <strong className="text-slate-900 uppercase tracking-wider block">
                  Interpretación Física y Agroindustrial
                </strong>
                <p>
                  1. <strong>Independencia de S₀:</strong> El instante del cruce <MathFormula math="t_{\text{int}}" /> no depende de la lactosa inicial; depende únicamente de <MathFormula math="k_1" /> y <MathFormula math="b" />.
                </p>
                <p>
                  2. <strong>Velocidades distintas en el cruce:</strong> Aunque <MathFormula math="S = P" />, la lactosa disminuye más rápido de lo que se acumula el ácido porque <MathFormula math={`b = ${model.params.b.toFixed(2)} < 1`} />.
                </p>
                <p>
                  3. <strong>Límite agroindustrial:</strong> Con los datos del informe (<MathFormula math="14\text{ h } 47\text{ min}" />), la acidez alcanzaría{' '}
                  <MathFormula math={`${model.intersectionDornic}\\ ^\\circ\\text{D}`} /> (<MathFormula math={`${model.intersectionAcidityPct.toFixed(2)}\\%`} />), provocando sobre-acidificación extrema y sinéresis. En la industria real el metabolismo bacteriano se detiene antes por inhibición ácida.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
