/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import { SolverResult } from '../math/types';
import { MathFormula } from './MathFormula';
import { Info, Box, Layers, Palette, RefreshCw } from 'lucide-react';

interface Plot3DViewProps {
  solver: SolverResult;
  xRange: [number, number];
  c2Value: number;
}

export const Plot3DView: React.FC<Plot3DViewProps> = ({ solver, xRange, c2Value }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Surface configuration
  const [colorScale, setColorScale] = useState<'Viridis' | 'Plasma' | 'Electric' | 'Cividis'>('Viridis');
  const [c1Range, setC1Range] = useState<[number, number]>([-5, 5]);
  const [gridResolution, setGridResolution] = useState<number>(45);
  const [showParticularTrajectory, setShowParticularTrajectory] = useState<boolean>(true);
  const [showContours, setShowContours] = useState<boolean>(true);

  // Compute 3D surface grid: z = y(x, c1; c2Value)
  const surfaceData = useMemo(() => {
    const [xMin, xMax] = xRange;
    const safeXMin = Math.max(0.08, xMin);
    const [c1Min, c1Max] = c1Range;

    const xVals: number[] = [];
    const c1Vals: number[] = [];
    const zMatrix: number[][] = [];

    const xStep = (xMax - safeXMin) / (gridResolution - 1);
    const c1Step = (c1Max - c1Min) / (gridResolution - 1);

    for (let j = 0; j < gridResolution; j++) {
      c1Vals.push(c1Min + j * c1Step);
    }

    for (let i = 0; i < gridResolution; i++) {
      const x = safeXMin + i * xStep;
      xVals.push(x);
      const row: number[] = [];
      for (let j = 0; j < gridResolution; j++) {
        const c1 = c1Vals[j];
        const z = solver.evalY(x, c1, c2Value);
        // Clamp extreme values for visualization stability
        const clampedZ = Math.max(-100, Math.min(100, z));
        row.push(clampedZ);
      }
      zMatrix.push(row);
    }

    // Trajectory corresponding to the exact initial condition c1*
    const trajX: number[] = [];
    const trajC1: number[] = [];
    const trajZ: number[] = [];

    const trajSteps = 120;
    const trajStep = (xMax - safeXMin) / (trajSteps - 1);
    for (let k = 0; k < trajSteps; k++) {
      const x = safeXMin + k * trajStep;
      trajX.push(x);
      trajC1.push(solver.c1);
      trajZ.push(solver.evalY(x, solver.c1, c2Value));
    }

    // Initial condition point P0 in 3D: (x0, c1, y0)
    const { x0, y0 } = solver.initialConditions;

    return {
      xVals,
      c1Vals,
      zMatrix,
      trajX,
      trajC1,
      trajZ,
      initialPt: { x: x0, c1: solver.c1, z: y0 },
    };
  }, [solver, xRange, c1Range, c2Value, gridResolution]);

  useEffect(() => {
    if (!containerRef.current) return;

    const surfaceTrace: Plotly.Data = {
      type: 'surface',
      x: surfaceData.xVals,
      y: surfaceData.c1Vals,
      z: surfaceData.zMatrix,
      colorscale: colorScale,
      opacity: 0.9,
      contours: {
        z: {
          show: showContours,
          usecolormap: true,
          highlightcolor: '#ffffff',
          project: { z: false },
        },
        x: {
          show: showContours,
          color: 'rgba(255,255,255,0.15)',
          project: { x: false },
        },
      },
      colorbar: {
        title: {
          text: 'z = y(x, c₁)',
          font: { family: 'Plus Jakarta Sans, sans-serif', size: 12, color: '#94a3b8' },
        },
        tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#94a3b8' },
        len: 0.7,
        thickness: 16,
      },
      hoverinfo: 'x+y+z',
      hovertemplate: '<b>Punto de Superficie</b><br>x: %{x:.3f}<br>c₁: %{y:.3f}<br>z = y(x, c₁): %{z:.3f}<extra></extra>',
    };

    const traces: Plotly.Data[] = [surfaceTrace];

    // Overlay the particular solution curve on the surface
    if (showParticularTrajectory) {
      const trajectoryTrace: Plotly.Data = {
        type: 'scatter3d',
        mode: 'lines',
        name: `Curva Exacta (c₁ = ${solver.c1.toFixed(3)})`,
        x: surfaceData.trajX,
        y: surfaceData.trajC1,
        z: surfaceData.trajZ,
        line: {
          color: '#f59e0b',
          width: 7,
        },
        hoverinfo: 'name+x+y+z',
        hovertemplate: '<b>Trayectoria Exacta</b><br>x: %{x:.3f}<br>c₁: %{y:.3f}<br>y(x): %{z:.3f}<extra></extra>',
      };

      const pointTrace: Plotly.Data = {
        type: 'scatter3d',
        mode: 'markers+text',
        name: `Condición Inicial P₀(${surfaceData.initialPt.x}, ${surfaceData.initialPt.z})`,
        x: [surfaceData.initialPt.x],
        y: [surfaceData.initialPt.c1],
        z: [surfaceData.initialPt.z],
        text: ['P₀'],
        textfont: { family: 'JetBrains Mono, monospace', size: 14, color: '#ffffff' },
        marker: {
          size: 8,
          color: '#ffffff',
          symbol: 'diamond',
          line: { color: '#f59e0b', width: 3 },
        },
        hovertemplate: '<b>Condición Inicial</b><br>x₀ = %{x}<br>c₁ = %{y:.3f}<br>y₀ = %{z}<extra></extra>',
      };

      traces.push(trajectoryTrace, pointTrace);
    }

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { l: 20, r: 20, t: 30, b: 20 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.95,
        bgcolor: 'rgba(15, 23, 42, 0.85)',
        bordercolor: '#334155',
        borderwidth: 1,
        font: { family: 'Plus Jakarta Sans, sans-serif', size: 11, color: '#cbd5e1' },
      },
      scene: {
        xaxis: {
          title: { text: 'Eje X (Dominio x > 0)', font: { size: 12, color: '#38bdf8' } },
          gridcolor: '#1e293b',
          zerolinecolor: '#38bdf8',
          tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#94a3b8' },
        },
        yaxis: {
          title: { text: 'Parámetro c₁', font: { size: 12, color: '#a855f7' } },
          gridcolor: '#1e293b',
          zerolinecolor: '#a855f7',
          tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#94a3b8' },
        },
        zaxis: {
          title: { text: 'z = y(x, c₁)', font: { size: 12, color: '#34d399' } },
          gridcolor: '#1e293b',
          zerolinecolor: '#34d399',
          tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#94a3b8' },
        },
        camera: {
          eye: { x: 1.6, y: -1.7, z: 1.2 },
        },
      },
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      toImageButtonOptions: {
        format: 'png',
        filename: 'de_lab_superficie_3d',
        height: 700,
        width: 1100,
        scale: 2,
      },
    };

    Plotly.react(containerRef.current, traces, layout, config);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [surfaceData, colorScale, showParticularTrajectory, showContours, solver.c1]);

  return (
    <div className="space-y-4">
      {/* 3D Visualizer Control Deck */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-400">Paleta Científica:</span>
            <select
              value={colorScale}
              onChange={(e) => setColorScale(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Viridis">Viridis (Estándar)</option>
              <option value="Plasma">Plasma (Térmica)</option>
              <option value="Electric">Electric (Alto Contraste)</option>
              <option value="Cividis">Cividis (Accesible)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParticularTrajectory(!showParticularTrajectory)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                showParticularTrajectory
                  ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              — Curva Solución Exacta
            </button>
            <button
              onClick={() => setShowContours(!showContours)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                showContours
                  ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              ▦ Isoclinas y Contornos
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Resolución de malla:</span>
          <select
            value={gridResolution}
            onChange={(e) => setGridResolution(parseInt(e.target.value))}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value={30}>Baja (30x30)</option>
            <option value={45}>Media (45x45)</option>
            <option value={60}>Alta (60x60)</option>
          </select>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <div ref={containerRef} className="w-full h-[580px]" />
      </div>

      {/* Scientific Clarification Note as requested by user prompt */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
          <Info className="w-4 h-4" />
          <span>Fundamento Matemático de la Representación Tridimensional:</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          La ecuación diferencial ordinaria original posee una única variable independiente (<MathFormula math="x" />), por lo que su solución matemática formal es una curva unidimensional <MathFormula math="y(x)" /> en el plano <MathFormula math="\mathbb{R}^2" />.
        </p>
        <p className="leading-relaxed text-slate-400">
          En este laboratorio científico, la representación tridimensional <MathFormula math="z = y(x, c_1)" /> parametriza la <strong className="text-slate-200">familia continua de soluciones de la ecuación diferencial</strong> al variar la constante de integración <MathFormula math="c_1" /> a lo largo del eje Y (manteniendo <MathFormula math="c_2 = {c2Value.toFixed(3)}" /> fijado o parametrizable). La línea dorada continua proyectada sobre la superficie representa la <strong className="text-amber-400">trayectoria integral única</strong> que satisface el problema de Cauchy con las condiciones iniciales exactas.
        </p>
      </div>
    </div>
  );
};
