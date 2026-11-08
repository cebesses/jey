/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PRESET_ODES } from './math/presets';
import { EquationParameters, InitialConditions, PresetODE } from './math/types';
import { solveCauchyEuler } from './math/cauchyEulerSolver';
import { SidebarControls } from './components/SidebarControls';
import { MathView } from './components/MathView';
import { Plot2DView } from './components/Plot2DView';
import { Plot3DView } from './components/Plot3DView';
import { VerificationPanel } from './components/VerificationPanel';
import { MathFormula } from './components/MathFormula';
import {
  BookOpen,
  LineChart,
  Box,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

type TabView = 'math' | 'plot2d' | 'plot3d' | 'verification';

export default function App() {
  const primaryPreset = PRESET_ODES[0];

  const [activePresetId, setActivePresetId] = useState<string>(primaryPreset.id);
  const [params, setParams] = useState<EquationParameters>(primaryPreset.params);
  const [initialConditions, setInitialConditions] = useState<InitialConditions>(primaryPreset.initialConditions);
  const [xRange, setXRange] = useState<[number, number]>(primaryPreset.defaultXRange);
  const [activeTab, setActiveTab] = useState<TabView>('math');

  // Compute solver result analytically
  const solver = useMemo(() => {
    return solveCauchyEuler(params, initialConditions);
  }, [params, initialConditions]);

  // Sliders for interactive c1 and c2 exploration in 2D/3D views
  const [c1Custom, setC1Custom] = useState<number>(solver.c1);
  const [c2Custom, setC2Custom] = useState<number>(solver.c2);

  // Sync custom constants when solver recomputes
  React.useEffect(() => {
    setC1Custom(solver.c1);
    setC2Custom(solver.c2);
  }, [solver.c1, solver.c2]);

  const handleSelectPreset = (preset: PresetODE) => {
    setActivePresetId(preset.id);
    setParams(preset.params);
    setInitialConditions(preset.initialConditions);
    setXRange(preset.defaultXRange);
  };

  const handleResetToPrimary = () => {
    handleSelectPreset(primaryPreset);
  };

  const handleResetConstants = () => {
    setC1Custom(solver.c1);
    setC2Custom(solver.c2);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar following the Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400 rotate-45 inline-block" />
            DE-Lab 2D/3D
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500 border-l border-slate-800 pl-3">
            Laboratorio Científico de Ecuaciones Diferenciales
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium text-slate-400 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('math')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'math'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Resolución Paso a Paso
          </button>

          <button
            onClick={() => setActiveTab('plot2d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'plot2d'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            Visualización 2D
          </button>

          <button
            onClick={() => setActiveTab('plot3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'plot3d'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Superficie 3D
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'verification'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verificación RK4
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetToPrimary}
            className="px-3.5 py-1.5 text-xs font-semibold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-lg shadow-cyan-950/50 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Caso Principal
          </button>
        </div>
      </header>

      {/* Hero Equation Active Banner */}
      <section className="border-b border-slate-800/60 bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>CASO ACTIVO:</span>
              <span className="text-slate-300 font-semibold">
                {PRESET_ODES.find((p) => p.id === activePresetId)?.name}
              </span>
            </div>
            <div className="text-lg md:text-xl font-mono text-white font-semibold flex items-center gap-3">
              <span className="text-cyan-400 font-serif italic text-base">EDO:</span>
              <MathFormula
                math={`${params.a !== 1 ? params.a : ''}x^2 y'' ${params.b >= 0 ? '+' : '-'} ${Math.abs(params.b)}x y' ${params.c >= 0 ? '+' : '-'} ${Math.abs(params.c)}y = ${params.latexRHS}`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono bg-slate-900/80 px-3.5 py-2 rounded-lg border border-slate-800 text-slate-300">
            <span className="text-slate-400">Condiciones:</span>
            <span className="text-amber-400 font-semibold">y({initialConditions.x0}) = {initialConditions.y0}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-semibold">y'({initialConditions.x0}) = {initialConditions.yp0}</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">c₁ = {solver.c1.toFixed(3)}</span>
            <span className="text-purple-400">c₂ = {solver.c2.toFixed(3)}</span>
          </div>
        </div>
      </section>

      {/* Main Scientific Console Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Parameter controls & ODE Customizer */}
        <SidebarControls
          params={params}
          initialConditions={initialConditions}
          xRange={xRange}
          activePresetId={activePresetId}
          onParamsChange={setParams}
          onInitialConditionsChange={setInitialConditions}
          onXRangeChange={setXRange}
          onSelectPreset={handleSelectPreset}
          onResetToPrimary={handleResetToPrimary}
        />

        {/* Right Stage: Interactive Workspaces */}
        <section className="flex-1 min-w-0">
          {activeTab === 'math' && <MathView solver={solver} />}

          {activeTab === 'plot2d' && (
            <Plot2DView
              solver={solver}
              xRange={xRange}
              c1Custom={c1Custom}
              c2Custom={c2Custom}
              onC1Change={setC1Custom}
              onC2Change={setC2Custom}
              onResetConstants={handleResetConstants}
            />
          )}

          {activeTab === 'plot3d' && (
            <Plot3DView solver={solver} xRange={xRange} c2Value={c2Custom} />
          )}

          {activeTab === 'verification' && (
            <VerificationPanel solver={solver} xRange={xRange} />
          )}
        </section>
      </main>

      {/* Scientific Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-xs text-slate-500 bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Laboratorio Interactivo de Ecuaciones Diferenciales 2D y 3D</span>
            <span>·</span>
            <span>Motor de Cálculo Simbólico & Runge-Kutta 4</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            x &gt; 0 · Cauchy-Euler Equidimensional
          </div>
        </div>
      </footer>
    </div>
  );
}
