/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EquationParameters, InitialConditions, PresetODE } from '../math/types';
import { PRESET_ODES } from '../math/presets';
import { MathFormula } from './MathFormula';
import { Settings, Bookmark, SlidersHorizontal, Compass, RotateCcw, Sparkles } from 'lucide-react';

interface SidebarControlsProps {
  params: EquationParameters;
  initialConditions: InitialConditions;
  xRange: [number, number];
  activePresetId: string;
  onParamsChange: (newParams: EquationParameters) => void;
  onInitialConditionsChange: (newIC: InitialConditions) => void;
  onXRangeChange: (newRange: [number, number]) => void;
  onSelectPreset: (preset: PresetODE) => void;
  onResetToPrimary: () => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  params,
  initialConditions,
  xRange,
  activePresetId,
  onParamsChange,
  onInitialConditionsChange,
  onXRangeChange,
  onSelectPreset,
  onResetToPrimary,
}) => {
  const handleAChange = (val: number) => {
    if (val === 0) val = 1; // avoid division by zero
    onParamsChange({ ...params, a: val });
  };

  const handleBChange = (val: number) => {
    onParamsChange({ ...params, b: val });
  };

  const handleCChange = (val: number) => {
    onParamsChange({ ...params, c: val });
  };

  const handleNonHomogeneousChange = (type: EquationParameters['nonHomogeneousType']) => {
    let latexRHS = '0';
    if (type === 'x3_lnx') latexRHS = 'x^3\\ln(x)';
    else if (type === 'x_pow_r') latexRHS = `x^{${params.rPow ?? 2}}`;
    else if (type === 'constant') latexRHS = `${params.constantK ?? 1}`;

    onParamsChange({
      ...params,
      nonHomogeneousType: type,
      latexRHS,
    });
  };

  const handleRPowChange = (r: number) => {
    onParamsChange({
      ...params,
      rPow: r,
      latexRHS: `x^{${r}}`,
    });
  };

  return (
    <aside className="w-full lg:w-84 shrink-0 space-y-4">
      {/* Preset Selector Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5" />
            Catálogo de Casos Canónicos
          </span>
          <button
            onClick={onResetToPrimary}
            title="Restablecer caso de estudio principal"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Caso Base
          </button>
        </div>

        <select
          value={activePresetId}
          onChange={(e) => {
            const found = PRESET_ODES.find((p) => p.id === e.target.value);
            if (found) onSelectPreset(found);
          }}
          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
        >
          {PRESET_ODES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
          {PRESET_ODES.find((p) => p.id === activePresetId)?.description}
        </p>
      </div>

      {/* ODE Parameters Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Coeficientes de Cauchy-Euler</span>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-center">
          <div className="text-xs text-slate-400 mb-1">Estructura General:</div>
          <MathFormula math="a x^2 y'' + b x y' + c y = g(x)" />
        </div>

        {/* Inputs a, b, c */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Coef. a (x²y'')</label>
            <input
              type="number"
              value={params.a}
              step={1}
              onChange={(e) => handleAChange(parseFloat(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-slate-100 font-mono text-center focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Coef. b (xy')</label>
            <input
              type="number"
              value={params.b}
              step={1}
              onChange={(e) => handleBChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-slate-100 font-mono text-center focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Coef. c (y)</label>
            <input
              type="number"
              value={params.c}
              step={1}
              onChange={(e) => handleCChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-slate-100 font-mono text-center focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Término Independiente g(x) */}
        <div className="space-y-1.5 text-xs">
          <label className="text-[11px] font-semibold text-slate-400 block">Término No Homogéneo g(x):</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleNonHomogeneousChange('x3_lnx')}
              className={`py-1.5 px-2 rounded-lg border text-xs font-mono transition-colors text-center ${
                params.nonHomogeneousType === 'x3_lnx'
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              x³ ln(x)
            </button>
            <button
              onClick={() => handleNonHomogeneousChange('x_pow_r')}
              className={`py-1.5 px-2 rounded-lg border text-xs font-mono transition-colors text-center ${
                params.nonHomogeneousType === 'x_pow_r'
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              xʳ (potencia)
            </button>
            <button
              onClick={() => handleNonHomogeneousChange('constant')}
              className={`py-1.5 px-2 rounded-lg border text-xs font-mono transition-colors text-center ${
                params.nonHomogeneousType === 'constant'
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Constante (k=1)
            </button>
            <button
              onClick={() => handleNonHomogeneousChange('zero')}
              className={`py-1.5 px-2 rounded-lg border text-xs font-mono transition-colors text-center ${
                params.nonHomogeneousType === 'zero'
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              0 (Homogénea)
            </button>
          </div>

          {params.nonHomogeneousType === 'x_pow_r' && (
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Exponente r de xʳ:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRPowChange(r)}
                    className={`w-7 h-7 rounded font-mono text-xs border ${
                      params.rPow === r
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Initial Conditions Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Compass className="w-3.5 h-3.5" />
          <span>Condiciones Iniciales (Cauchy)</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Punto x₀</label>
            <input
              type="number"
              value={initialConditions.x0}
              step={0.1}
              min={0.1}
              onChange={(e) => {
                const val = Math.max(0.01, parseFloat(e.target.value) || 1);
                onInitialConditionsChange({ ...initialConditions, x0: val });
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-amber-300 font-mono text-center focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Valor y(x₀)</label>
            <input
              type="number"
              value={initialConditions.y0}
              step={0.5}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                onInitialConditionsChange({ ...initialConditions, y0: val });
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-amber-300 font-mono text-center focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Pendiente y'(x₀)</label>
            <input
              type="number"
              value={initialConditions.yp0}
              step={0.5}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                onInitialConditionsChange({ ...initialConditions, yp0: val });
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-amber-300 font-mono text-center focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="text-[10px] text-slate-500 italic">
          * Para Cauchy-Euler, el dominio de existencia se define estrictamente en x &gt; 0.
        </div>
      </div>

      {/* Interval Boundaries Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Intervalo de Graficación [x_min, x_max]</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">x_min</label>
            <input
              type="number"
              value={xRange[0]}
              step={0.1}
              min={0.05}
              max={xRange[1] - 0.2}
              onChange={(e) => {
                const val = Math.max(0.05, parseFloat(e.target.value) || 0.1);
                onXRangeChange([val, xRange[1]]);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-slate-200 font-mono text-center focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">x_max</label>
            <input
              type="number"
              value={xRange[1]}
              step={0.5}
              min={xRange[0] + 0.2}
              max={15}
              onChange={(e) => {
                const val = Math.max(xRange[0] + 0.2, parseFloat(e.target.value) || 4);
                onXRangeChange([xRange[0], val]);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-slate-200 font-mono text-center focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
