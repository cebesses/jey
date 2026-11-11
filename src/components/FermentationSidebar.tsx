/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { YogurtModelParams, YogurtModelResult } from '../math/yogurtFermentationModel';
import { MathFormula } from './MathFormula';
import {
  SlidersHorizontal,
  RotateCcw,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface FermentationSidebarProps {
  params: YogurtModelParams;
  model: YogurtModelResult;
  onParamChange: (param: keyof YogurtModelParams, value: any) => void;
  onResetToPDF: () => void;
}

export const FermentationSidebar: React.FC<FermentationSidebarProps> = ({
  params,
  model,
  onParamChange,
  onResetToPDF,
}) => {
  return (
    <aside className="w-full lg:w-[300px] shrink-0 bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
      {/* 1. Target Cooling Point & Mathematical Crossover */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            Detención Óptima (t*)
          </span>
          <button
            onClick={onResetToPDF}
            title="Restablecer valores del informe PDF"
            className="text-[11px] font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            PDF
          </button>
        </div>

        {model.isTargetReachable ? (
          <div className="space-y-2.5">
            <div>
              <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums tracking-tight">
                {model.targetTimeFormatted}
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                t ≈ {model.targetTimeHours.toFixed(2).replace('.', ',')} h · {params.temperature} °C
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Acidez meta</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {Math.round(model.params.targetP * 10)} °D ({(model.params.targetP / 10).toFixed(2).replace('.', ',')}%)
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Lactosa S(t*)</span>
                <span className="font-mono font-semibold text-blue-700 tabular-nums">
                  {model.targetLactoseRemaining.toFixed(1).replace('.', ',')} g/L
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Lactosa consumida</span>
                <span className="font-mono text-slate-700 tabular-nums">
                  ≈ {model.targetLactoseConsumedPct.toFixed(1).replace('.', ',')}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 space-y-1 text-xs text-red-700">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Meta Inalcanzable</span>
            </div>
            <p className="text-[11px] leading-relaxed text-red-700/90">
              {model.unreachableReason}
            </p>
          </div>
        )}

        {/* Intersection Summary Sub-row */}
        <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Cruce S(t) = P(t)
          </span>
          <div className="flex justify-between font-mono tabular-nums">
            <span className="text-slate-500">Tiempo t_int</span>
            <span className="text-slate-900 font-semibold">
              {model.intersectionTimeHours.toFixed(2)} h ({model.intersectionTimeFormatted})
            </span>
          </div>
          <div className="flex justify-between font-mono tabular-nums">
            <span className="text-slate-500">Concentración</span>
            <span className="text-slate-900 font-semibold">
              {model.intersectionConc.toFixed(2)} g/L ({model.intersectionDornic} °D)
            </span>
          </div>
        </div>
      </div>

      {/* 2. System Parameters */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" />
          <span>Parámetros del Sistema (PDF p. 2)</span>
        </div>

        {/* S0: Initial Lactose */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline text-xs">
            <label htmlFor="param-s0" className="text-slate-700 font-medium">
              Lactosa Inicial S₀
            </label>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {params.S0} g/L
            </span>
          </div>
          <input
            id="param-s0"
            type="range"
            min={30}
            max={65}
            step={1}
            value={params.S0}
            onChange={(e) => onParamChange('S0', parseFloat(e.target.value))}
            className="w-full accent-blue-700 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>30 g/L</span>
            <span>Leche: 45–50</span>
            <span>65 g/L</span>
          </div>
        </div>

        {/* k1: Kinetic Constant */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline text-xs">
            <label htmlFor="param-k1" className="text-slate-700 font-medium">
              Constante cinética k₁
            </label>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {params.k1.toFixed(2).replace('.', ',')} h⁻¹
            </span>
          </div>
          <input
            id="param-k1"
            type="range"
            min={0.02}
            max={0.15}
            step={0.01}
            value={params.k1}
            onChange={(e) => onParamChange('k1', parseFloat(e.target.value))}
            className="w-full accent-blue-700 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0,02</span>
            <span>PDF: 0,06 h⁻¹</span>
            <span>0,15</span>
          </div>
        </div>

        {/* b: Acid Yield */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline text-xs">
            <label htmlFor="param-b" className="text-slate-700 font-medium">
              Rendimiento ácido b
            </label>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {params.b.toFixed(2).replace('.', ',')} g/g
            </span>
          </div>
          <input
            id="param-b"
            type="range"
            min={0.45}
            max={0.90}
            step={0.05}
            value={params.b}
            onChange={(e) => onParamChange('b', parseFloat(e.target.value))}
            className="w-full accent-blue-700 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0,45</span>
            <span>PDF: 0,70 g/g</span>
            <span>0,90</span>
          </div>
        </div>

        {/* targetP: Target Acidity */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline text-xs">
            <label htmlFor="param-targetp" className="text-slate-700 font-medium">
              Acidez Objetivo P*
            </label>
            <span className="font-mono font-semibold text-blue-700 tabular-nums">
              {params.targetP.toFixed(1).replace('.', ',')} g/L ({Math.round(params.targetP * 10)} °D)
            </span>
          </div>
          <input
            id="param-targetp"
            type="range"
            min={5.0}
            max={Math.min(25.0, model.bS0 * 0.95)}
            step={0.5}
            value={params.targetP}
            onChange={(e) => onParamChange('targetP', parseFloat(e.target.value))}
            className="w-full accent-blue-700 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>5 g/L</span>
            <span>Meta: 8 g/L</span>
            <span>Máx: {model.bS0.toFixed(0)} g/L</span>
          </div>
        </div>
      </div>

      {/* 3. Mathematical Reference Footer */}
      <div className="p-4 bg-slate-50 rounded-b-lg space-y-2.5 text-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
          Sistema EDO (PDF p. 3)
        </span>
        <div className="space-y-1 text-slate-900 text-center py-1">
          <div>
            <MathFormula math="\frac{dS}{dt} = -k_1 S, \quad S(0) = S_0" />
          </div>
          <div>
            <MathFormula math="\frac{dP}{dt} = b k_1 S, \quad P(0) = 0" />
          </div>
        </div>
        <div className="pt-2 border-t border-slate-200 text-center text-slate-700">
          <MathFormula math={`P(t) + b S(t) = ${model.bS0.toFixed(1)} \\text{ g/L}`} />
        </div>
      </div>
    </aside>
  );
};
