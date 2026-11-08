/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import { SolverResult } from '../math/types';
import { Sliders, RotateCcw, Eye, HelpCircle } from 'lucide-react';

interface Plot2DViewProps {
  solver: SolverResult;
  xRange: [number, number];
  c1Custom: number;
  c2Custom: number;
  onC1Change: (val: number) => void;
  onC2Change: (val: number) => void;
  onResetConstants: () => void;
}

export const Plot2DView: React.FC<Plot2DViewProps> = ({
  solver,
  xRange,
  c1Custom,
  c2Custom,
  onC1Change,
  onC2Change,
  onResetConstants,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Layer visibility toggles
  const [showFullY, setShowFullY] = useState(true);
  const [showYh, setShowYh] = useState(true);
  const [showYp, setShowYp] = useState(true);
  const [showTangent, setShowTangent] = useState(true);
  const [showInitialPt, setShowInitialPt] = useState(true);
  const [showFamily, setShowFamily] = useState(false);

  // Resolution of curve points
  const pointsCount = 400;

  // Compute curve data
  const plotData = useMemo(() => {
    const [xMin, xMax] = xRange;
    const safeXMin = Math.max(0.05, xMin);
    const step = (xMax - safeXMin) / (pointsCount - 1);

    const xArr: number[] = [];
    const yArr: number[] = [];
    const yhArr: number[] = [];
    const ypArr: number[] = [];

    for (let i = 0; i < pointsCount; i++) {
      const x = safeXMin + i * step;
      xArr.push(x);
      yArr.push(solver.evalY(x, c1Custom, c2Custom));
      yhArr.push(solver.evalYh(x, c1Custom, c2Custom));
      ypArr.push(solver.evalYp(x));
    }

    // Tangent line at initial condition (x0, y0) with slope yp0
    const { x0, y0, yp0 } = solver.initialConditions;
    const tangentSpan = 0.6 * (xMax - safeXMin);
    const xTan1 = Math.max(safeXMin, x0 - tangentSpan * 0.4);
    const xTan2 = Math.min(xMax, x0 + tangentSpan * 0.4);
    const yTan1 = y0 + yp0 * (xTan1 - x0);
    const yTan2 = y0 + yp0 * (xTan2 - x0);

    // Family of curves: vary c1 by [-1.5, -0.75, +0.75, +1.5]
    const familyTraces: Plotly.Data[] = [];
    if (showFamily) {
      const deltas = [-2, -1, 1, 2];
      deltas.forEach((delta, idx) => {
        const c1Val = c1Custom + delta;
        const famY = xArr.map((x) => solver.evalY(x, c1Val, c2Custom));
        familyTraces.push({
          x: xArr,
          y: famY,
          type: 'scatter',
          mode: 'lines',
          name: `Familia c₁=${c1Val.toFixed(2)}`,
          line: { color: `rgba(56, 189, 248, ${0.2 + idx * 0.15})`, width: 1.2, dash: 'dot' },
          hoverinfo: 'none',
        });
      });
    }

    const traces: Plotly.Data[] = [];

    // Family curves first (background)
    if (showFamily) {
      traces.push(...familyTraces);
    }

    // Homogeneous solution yh(x)
    if (showYh) {
      traces.push({
        x: xArr,
        y: yhArr,
        type: 'scatter',
        mode: 'lines',
        name: 'Homogénea y_h(x)',
        line: { color: '#34d399', width: 2, dash: 'dash' },
        hovertemplate: 'x: %{x:.3f}<br>y_h: %{y:.3f}<extra></extra>',
      });
    }

    // Particular solution yp(x)
    if (showYp) {
      traces.push({
        x: xArr,
        y: ypArr,
        type: 'scatter',
        mode: 'lines',
        name: 'Particular y_p(x)',
        line: { color: '#c084fc', width: 2, dash: 'dot' },
        hovertemplate: 'x: %{x:.3f}<br>y_p: %{y:.3f}<extra></extra>',
      });
    }

    // Tangent Line
    if (showTangent) {
      traces.push({
        x: [xTan1, xTan2],
        y: [yTan1, yTan2],
        type: 'scatter',
        mode: 'lines',
        name: `Tangente (m = ${yp0.toFixed(2)})`,
        line: { color: '#f59e0b', width: 2.2 },
        hovertemplate: 'Tangente: x=%{x:.3f}, y=%{y:.3f}<extra></extra>',
      });
    }

    // Full Solution y(x)
    if (showFullY) {
      traces.push({
        x: xArr,
        y: yArr,
        type: 'scatter',
        mode: 'lines',
        name: 'Solución General y(x)',
        line: { color: '#38bdf8', width: 3.5 },
        hovertemplate: '<b>Solución y(x)</b><br>x: %{x:.3f}<br>y: %{y:.3f}<extra></extra>',
      });
    }

    // Initial Condition Point
    if (showInitialPt) {
      traces.push({
        x: [x0],
        y: [y0],
        type: 'scatter',
        mode: 'markers+text',
        name: `Condición Inicial (${x0}, ${y0})`,
        text: [`P(${x0}, ${y0})`],
        textposition: 'top right',
        textfont: { family: 'Plus Jakarta Sans, sans-serif', size: 12, color: '#f59e0b' },
        marker: { size: 12, color: '#f59e0b', symbol: 'circle', line: { color: '#ffffff', width: 2 } },
        hovertemplate: `<b>Condición Inicial</b><br>x₀ = ${x0}<br>y(x₀) = ${y0}<br>y'(x₀) = ${yp0}<extra></extra>`,
      });
    }

    return traces;
  }, [solver, xRange, c1Custom, c2Custom, showFullY, showYh, showYp, showTangent, showInitialPt, showFamily]);

  // Render Plotly chart
  useEffect(() => {
    if (!containerRef.current) return;

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      paper_bgcolor: 'transparent',
      plot_bgcolor: '#090d16',
      margin: { l: 60, r: 24, t: 36, b: 50 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'rgba(15, 23, 42, 0.85)',
        bordercolor: '#334155',
        borderwidth: 1,
        font: { family: 'Plus Jakarta Sans, sans-serif', size: 11, color: '#cbd5e1' },
      },
      hoverlabel: {
        bgcolor: '#0f172a',
        bordercolor: '#38bdf8',
        font: { family: 'JetBrains Mono, monospace', size: 12, color: '#f8fafc' },
      },
      xaxis: {
        title: {
          text: 'Variable independiente x (x > 0)',
          font: { family: 'Plus Jakarta Sans, sans-serif', size: 13, color: '#94a3b8' },
        },
        gridcolor: '#1e293b',
        zerolinecolor: '#475569',
        tickfont: { family: 'JetBrains Mono, monospace', size: 11, color: '#94a3b8' },
        range: xRange,
      },
      yaxis: {
        title: {
          text: 'Variable dependiente y(x)',
          font: { family: 'Plus Jakarta Sans, sans-serif', size: 13, color: '#94a3b8' },
        },
        gridcolor: '#1e293b',
        zerolinecolor: '#475569',
        tickfont: { family: 'JetBrains Mono, monospace', size: 11, color: '#94a3b8' },
      },
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: 'de_lab_solucion_2d',
        height: 650,
        width: 1000,
        scale: 2,
      },
    };

    Plotly.react(containerRef.current, plotData, layout, config);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [plotData, xRange]);

  return (
    <div className="space-y-4">
      {/* Visualizer Top Bar Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            Capas:
          </span>
          <button
            onClick={() => setShowFullY(!showFullY)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showFullY
                ? 'bg-sky-500/15 border-sky-500/60 text-sky-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            ● Solución y(x)
          </button>
          <button
            onClick={() => setShowYh(!showYh)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showYh
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            ● Homogénea yh(x)
          </button>
          <button
            onClick={() => setShowYp(!showYp)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showYp
                ? 'bg-purple-500/15 border-purple-500/60 text-purple-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            ● Particular yp(x)
          </button>
          <button
            onClick={() => setShowTangent(!showTangent)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showTangent
                ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            — Tangente Inicial
          </button>
          <button
            onClick={() => setShowFamily(!showFamily)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showFamily
                ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            ◌ Familia de Soluciones
          </button>
        </div>

        <button
          onClick={onResetConstants}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar c₁ y c₂
        </button>
      </div>

      {/* Main Canvas Viewport */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <div ref={containerRef} className="w-full h-[540px]" />
      </div>

      {/* Interactive Constant Scrubbers */}
      <div className="grid md:grid-cols-2 gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Constante c₁ (Amplitud Cosinusoidal):
            </span>
            <span className="font-mono tabular-nums text-cyan-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {c1Custom.toFixed(4)}
            </span>
          </div>
          <input
            type="range"
            min={-10}
            max={10}
            step={0.05}
            value={c1Custom}
            onChange={(e) => onC1Change(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>-10.0</span>
            <span>Valor analítico exacto: {solver.c1.toFixed(4)}</span>
            <span>+10.0</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              Constante c₂ (Amplitud Sinusoidal):
            </span>
            <span className="font-mono tabular-nums text-purple-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {c2Custom.toFixed(4)}
            </span>
          </div>
          <input
            type="range"
            min={-10}
            max={10}
            step={0.05}
            value={c2Custom}
            onChange={(e) => onC2Change(parseFloat(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>-10.0</span>
            <span>Valor analítico exacto: {solver.c2.toFixed(4)}</span>
            <span>+10.0</span>
          </div>
        </div>
      </div>

      {/* Educational Annotation */}
      <div className="p-3.5 bg-slate-900/40 border border-slate-800/60 rounded-xl text-xs text-slate-400 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="text-slate-200 font-medium">Interpretación geométrica de las condiciones iniciales:</span> El punto <span className="text-amber-400 font-mono font-semibold">({solver.initialConditions.x0}, {solver.initialConditions.y0})</span> ancla la curva de la solución general en el plano cartesiano. La recta tangente dorada con pendiente exacta <span className="text-amber-400 font-mono font-semibold">m = {solver.initialConditions.yp0}</span> coincide de forma tangencial con la curva <span className="text-sky-400 font-mono">y(x)</span>, verificando físicamente la derivada inicial.
        </div>
      </div>
    </div>
  );
};
