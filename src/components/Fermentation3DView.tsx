/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import { YogurtModelResult } from '../math/yogurtFermentationModel';
import { MathFormula } from './MathFormula';
import {
  Palette,
  Info,
  AlertTriangle,
  Play,
  Pause,
  SkipBack,
  CheckCircle2,
  Clock,
  Crosshair,
} from 'lucide-react';

interface Fermentation3DViewProps {
  model: YogurtModelResult;
  timeMax?: number;
}

interface ProbeState {
  t: number;
  k1: number;
  source: 'hover' | 'cursor';
}

type HorizonPreset3D = '8' | '16' | '24';

export const Fermentation3DView: React.FC<Fermentation3DViewProps> = ({ model }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [colorScale, setColorScale] = useState<'Blues' | 'Cividis' | 'Greys' | 'Viridis'>('Blues');
  const [gridRes, setGridRes] = useState<number>(40);
  const [horizonHours, setHorizonHours] = useState<HorizonPreset3D>('16');
  const [showTargetPlane, setShowTargetPlane] = useState<boolean>(true);
  const [showBatchCurve, setShowBatchCurve] = useState<boolean>(true);
  const [showLactoseSurface, setShowLactoseSurface] = useState<boolean>(false);
  const [showContours, setShowContours] = useState<boolean>(true);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [cursorTime, setCursorTime] = useState<number>(
    model.isTargetReachable ? Math.min(16, model.targetTimeHours) : 4.3
  );
  const [probe, setProbe] = useState<ProbeState>({
    t: model.isTargetReachable ? model.targetTimeHours : 4.3,
    k1: model.params.k1,
    source: 'cursor',
  });
  const lastFrameRef = useRef<number | null>(null);

  const effectiveTimeMax = useMemo(() => Number(horizonHours), [horizonHours]);

  useEffect(() => {
    setCursorTime((prev) => Math.min(prev, effectiveTimeMax));
  }, [effectiveTimeMax]);

  useEffect(() => {
    setProbe({
      t: cursorTime,
      k1: model.params.k1,
      source: 'cursor',
    });
  }, [cursorTime, model.params.k1]);

  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null;
      return;
    }

    lastFrameRef.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const dt = (now - (lastFrameRef.current ?? now)) / 1000;
      lastFrameRef.current = now;

      setCursorTime((prev) => {
        const next = prev + dt * 2.0;
        if (next >= effectiveTimeMax) {
          setIsPlaying(false);
          return effectiveTimeMax;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isPlaying, effectiveTimeMax]);

  // Surface mesh aligned with sidebar range k1 in [0.02, 0.15]
  const surfaceData = useMemo(() => {
    const k1Min = 0.02;
    const k1Max = 0.15;

    const tVals: number[] = [];
    const k1Vals: number[] = [];
    const zAcidMatrix: number[][] = [];
    const zLactoseMatrix: number[][] = [];

    const tStep = effectiveTimeMax / (gridRes - 1);
    const k1Step = (k1Max - k1Min) / (gridRes - 1);

    for (let j = 0; j < gridRes; j++) {
      k1Vals.push(k1Min + j * k1Step);
    }

    const { S0, b } = model.params;
    const bS0 = b * S0;

    for (let i = 0; i < gridRes; i++) {
      const t = i * tStep;
      tVals.push(t);
      const rowP: number[] = [];
      const rowS: number[] = [];
      for (let j = 0; j < gridRes; j++) {
        const k1 = k1Vals[j];
        rowP.push(bS0 * (1 - Math.exp(-k1 * t)));
        rowS.push(S0 * Math.exp(-k1 * t));
      }
      zAcidMatrix.push(rowP);
      zLactoseMatrix.push(rowS);
    }

    const batchT: number[] = [];
    const batchK1: number[] = [];
    const batchZ: number[] = [];
    const nTraj = 90;
    for (let i = 0; i < nTraj; i++) {
      const t = (i / (nTraj - 1)) * effectiveTimeMax;
      batchT.push(t);
      batchK1.push(model.params.k1);
      batchZ.push(model.evalP(t));
    }

    const intCurveT: number[] = [];
    const intCurveK1: number[] = [];
    const intCurveZ: number[] = [];
    const intHeight = S0 * (b / (1 + b));
    const lnRatio = Math.log((1 + b) / b);
    for (let j = 0; j < 60; j++) {
      const k1 = k1Min + (j / 59) * (k1Max - k1Min);
      const tInt = lnRatio / k1;
      if (tInt <= effectiveTimeMax) {
        intCurveT.push(tInt);
        intCurveK1.push(k1);
        intCurveZ.push(intHeight);
      }
    }

    return {
      tVals,
      k1Vals,
      zAcidMatrix,
      zLactoseMatrix,
      batchT,
      batchK1,
      batchZ,
      intCurveT,
      intCurveK1,
      intCurveZ,
      critPoint: model.isTargetReachable
        ? { t: model.targetTimeHours, k1: model.params.k1, z: model.params.targetP }
        : null,
    };
  }, [model, effectiveTimeMax, gridRes]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const surfaceTrace: Plotly.Data = {
      type: 'surface',
      name: 'Ácido P(t, k₁)',
      x: surfaceData.tVals,
      y: surfaceData.k1Vals,
      z: surfaceData.zAcidMatrix,
      colorscale: colorScale,
      reversescale: colorScale === 'Blues' || colorScale === 'Greys',
      opacity: showLactoseSurface ? 0.85 : 0.94,
      contours: {
        z: {
          show: showContours,
          usecolormap: false,
          color: 'rgba(15, 23, 42, 0.25)',
          highlightcolor: '#1D4ED8',
          project: { z: false },
        },
        x: {
          show: showContours,
          color: 'rgba(15, 23, 42, 0.08)',
        },
      },
      colorbar: {
        title: {
          text: 'P (g/L)',
          font: { family: 'Plus Jakarta Sans, sans-serif', size: 11, color: '#334155' },
        },
        tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#475569' },
        len: 0.65,
        thickness: 12,
      },
      hoverinfo: 'x+y+z',
      hovertemplate:
        '<b>Ácido Láctico P(t, k₁)</b><br>Tiempo t: %{x:.2f} h<br>Constante k₁: %{y:.3f} h⁻¹<br>Ácido P: %{z:.2f} g/L<extra></extra>',
    };

    const traces: Plotly.Data[] = [surfaceTrace];

    if (showLactoseSurface) {
      traces.push({
        type: 'surface',
        name: 'Lactosa S(t, k₁)',
        x: surfaceData.tVals,
        y: surfaceData.k1Vals,
        z: surfaceData.zLactoseMatrix,
        opacity: 0.42,
        showscale: false,
        colorscale: [
          [0, 'rgba(148, 163, 184, 0.35)'],
          [1, 'rgba(51, 65, 85, 0.70)'],
        ],
        hovertemplate:
          '<b>Lactosa S(t, k₁)</b><br>Tiempo t: %{x:.2f} h<br>Constante k₁: %{y:.3f} h⁻¹<br>Lactosa S: %{z:.2f} g/L<extra></extra>',
      });

      if (surfaceData.intCurveT.length > 1) {
        traces.push({
          type: 'scatter3d',
          mode: 'lines',
          name: 'Curva de Cruce S(t,k₁) = P(t,k₁)',
          x: surfaceData.intCurveT,
          y: surfaceData.intCurveK1,
          z: surfaceData.intCurveZ,
          line: { color: '#1D4ED8', width: 7 },
          hovertemplate:
            '<b>Curva de Intersección S = P</b><br>t_int: %{x:.2f} h<br>k₁: %{y:.3f} h⁻¹<br>S = P = %{z:.2f} g/L<extra></extra>',
        });
      }
    }

    if (showBatchCurve) {
      traces.push({
        type: 'scatter3d',
        mode: 'lines',
        name: `Lote Actual (k₁ = ${model.params.k1.toFixed(2)} h⁻¹)`,
        x: surfaceData.batchT,
        y: surfaceData.batchK1,
        z: surfaceData.batchZ,
        line: { color: '#0F172A', width: 6 },
        hovertemplate:
          '<b>Lote Actual</b><br>Tiempo: %{x:.2f} h<br>k₁: %{y:.3f} h⁻¹<br>P(t): %{z:.2f} g/L<extra></extra>',
      });

      const particleZ = model.evalP(cursorTime);
      traces.push({
        type: 'scatter3d',
        mode: 'markers',
        name: `Partícula Móvil (t = ${cursorTime.toFixed(2)} h)`,
        x: [cursorTime],
        y: [model.params.k1],
        z: [particleZ],
        marker: {
          size: 7,
          color: '#1D4ED8',
          symbol: 'circle',
          line: { color: '#FFFFFF', width: 2 },
        },
        hovertemplate: `<b>Partícula en Tiempo Real</b><br>t = ${cursorTime.toFixed(2)} h<br>k₁ = ${model.params.k1.toFixed(2)} h⁻¹<br>P = ${particleZ.toFixed(2)} g/L (${Math.round(particleZ * 10)} °D)<extra></extra>`,
      });

      if (surfaceData.critPoint && surfaceData.critPoint.t <= effectiveTimeMax) {
        traces.push({
          type: 'scatter3d',
          mode: 'markers+text',
          name: `Óptimo t* (${model.targetTimeFormatted})`,
          x: [surfaceData.critPoint.t],
          y: [surfaceData.critPoint.k1],
          z: [surfaceData.critPoint.z],
          text: ['t*'],
          textfont: { family: 'JetBrains Mono, monospace', size: 12, color: '#0F172A' },
          marker: { size: 7, color: '#0F172A', symbol: 'diamond', line: { color: '#FFFFFF', width: 2 } },
          hovertemplate: `<b>Punto Óptimo de Enfriamiento</b><br>Tiempo: ${model.targetTimeFormatted}<br>k₁ = %{y:.3f} h⁻¹<br>Ácido P = %{z:.2f} g/L<extra></extra>`,
        });
      }
    }

    if (showTargetPlane) {
      const planeZ: number[][] = [];
      for (let i = 0; i < surfaceData.tVals.length; i++) {
        const row = [];
        for (let j = 0; j < surfaceData.k1Vals.length; j++) {
          row.push(model.params.targetP);
        }
        planeZ.push(row);
      }

      const planeColor = model.isTargetReachable
        ? 'rgba(29, 78, 216, 0.22)'
        : 'rgba(185, 28, 28, 0.25)';

      traces.push({
        type: 'surface',
        name: `Plano P* (${model.params.targetP} g/L)`,
        x: surfaceData.tVals,
        y: surfaceData.k1Vals,
        z: planeZ,
        opacity: 0.28,
        showscale: false,
        colorscale: [
          [0, planeColor],
          [1, planeColor],
        ],
        hoverinfo: 'skip',
      });
    }

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      uirevision: 'keep-camera-3d',
      paper_bgcolor: '#FFFFFF',
      plot_bgcolor: '#FFFFFF',
      margin: { l: 8, r: 8, t: 16, b: 8 },
      showlegend: true,
      legend: {
        x: 0.01,
        y: 0.99,
        bgcolor: 'rgba(255, 255, 255, 0.92)',
        bordercolor: '#E2E8F0',
        borderwidth: 1,
        font: { family: 'Plus Jakarta Sans, sans-serif', size: 11, color: '#334155' },
      },
      hoverlabel: {
        bgcolor: '#FFFFFF',
        bordercolor: '#1D4ED8',
        font: { family: 'JetBrains Mono, monospace', size: 11, color: '#0F172A' },
      },
      scene: {
        xaxis: {
          title: { text: 'Tiempo t (h)', font: { size: 11, color: '#334155' } },
          showbackground: true,
          backgroundcolor: '#F8FAFC',
          gridcolor: '#CBD5E1',
          linecolor: '#475569',
          zerolinecolor: '#64748B',
          tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#475569' },
        },
        yaxis: {
          title: { text: 'Constante k₁ (1/h)', font: { size: 11, color: '#334155' } },
          showbackground: true,
          backgroundcolor: '#F8FAFC',
          gridcolor: '#CBD5E1',
          linecolor: '#475569',
          zerolinecolor: '#64748B',
          tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#475569' },
        },
        zaxis: {
          title: {
            text: showLactoseSurface ? 'Concentración S / P (g/L)' : 'Ácido Láctico P (g/L)',
            font: { size: 11, color: '#334155' },
          },
          showbackground: true,
          backgroundcolor: '#F8FAFC',
          gridcolor: '#CBD5E1',
          linecolor: '#475569',
          zerolinecolor: '#64748B',
          tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#475569' },
        },
        camera: {
          eye: { x: 1.7, y: -1.55, z: 1.05 },
        },
      },
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      toImageButtonOptions: {
        format: 'png',
        filename: 'superficie_cinetica_fermentacion_3d',
        height: 700,
        width: 1100,
        scale: 2,
      },
    };

    Plotly.react(el, traces, layout, config);

    const handlePlotlyHover = (evt: any) => {
      if (evt?.points && evt.points.length > 0) {
        const pt = evt.points[0];
        if (typeof pt.x === 'number' && typeof pt.y === 'number') {
          setProbe({
            t: Math.max(0, pt.x),
            k1: Math.max(0.01, pt.y),
            source: 'hover',
          });
        }
      }
    };

    (el as any).on?.('plotly_hover', handlePlotlyHover);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      (el as any).removeAllListeners?.('plotly_hover');
    };
  }, [
    surfaceData,
    colorScale,
    showTargetPlane,
    showBatchCurve,
    showLactoseSurface,
    showContours,
    model,
    cursorTime,
    effectiveTimeMax,
  ]);

  const { S0, b } = model.params;
  const bS0 = b * S0;
  const probeS = S0 * Math.exp(-probe.k1 * probe.t);
  const probeP = bS0 * (1 - Math.exp(-probe.k1 * probe.t));
  const probeDornic = Math.round(probeP * 10);
  const probePct = probeP / 10;
  const probeLactoseRemainingPct = (probeS / S0) * 100;
  const probeDS_dt = -probe.k1 * probeS;
  const probeDP_dt = b * probe.k1 * probeS;
  const probeTau = 1 / probe.k1;
  const probeQuality = model.getQualityStatus(probeP);

  const toggleBtnCls = (active: boolean) =>
    `px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
      active
        ? 'bg-blue-50 border-blue-700 text-blue-700 font-semibold'
        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
    }`;

  return (
    <div className="space-y-4">
      {/* Top 3D Control Deck */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
        <div className="p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mr-1">
              <Palette className="w-3.5 h-3.5 text-blue-700" />
              <select
                value={colorScale}
                onChange={(e) => setColorScale(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-700"
              >
                <option value="Blues">Blues (Científico)</option>
                <option value="Cividis">Cividis</option>
                <option value="Greys">Escala Grises</option>
                <option value="Viridis">Viridis</option>
              </select>
            </div>

            <button onClick={() => setShowBatchCurve(!showBatchCurve)} className={toggleBtnCls(showBatchCurve)}>
              Trayectoria Lote
            </button>
            <button onClick={() => setShowTargetPlane(!showTargetPlane)} className={toggleBtnCls(showTargetPlane)}>
              Plano P* ({model.params.targetP} g/L)
            </button>
            <button onClick={() => setShowLactoseSurface(!showLactoseSurface)} className={toggleBtnCls(showLactoseSurface)}>
              + Superficie S(t, k₁) y Cruce
            </button>
            <button onClick={() => setShowContours(!showContours)} className={toggleBtnCls(showContours)}>
              Isoclinas
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-md border border-slate-200">
              {(['8', '16', '24'] as HorizonPreset3D[]).map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizonHours(h)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    horizonHours === h ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {h} h
                </button>
              ))}
            </div>

            <select
              value={gridRes}
              onChange={(e) => setGridRes(parseInt(e.target.value))}
              className="bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-700 font-mono focus:outline-none focus:border-blue-700"
            >
              <option value={30}>Malla 30×30</option>
              <option value={40}>Malla 40×40</option>
              <option value={55}>Malla 55×55</option>
            </select>
          </div>
        </div>

        {/* 3D Particle Playback */}
        <div className="p-3.5 flex flex-wrap items-center gap-3 bg-slate-50/50 rounded-b-lg">
          <button
            onClick={() => {
              if (cursorTime >= effectiveTimeMax) setCursorTime(0);
              setIsPlaying(!isPlaying);
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              isPlaying
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-blue-700 text-white hover:bg-blue-800'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pausar 3D' : 'Recorrer Tiempo en 3D'}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCursorTime(0);
            }}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <SkipBack className="w-3.5 h-3.5" />
            t = 0
          </button>

          <div className="flex-1 min-w-[220px] flex items-center gap-2.5">
            <span className="text-xs font-mono font-semibold text-slate-700 whitespace-nowrap tabular-nums">
              t = {cursorTime.toFixed(2)} h
            </span>
            <input
              type="range"
              min={0}
              max={effectiveTimeMax}
              step={0.1}
              value={cursorTime}
              onChange={(e) => {
                setIsPlaying(false);
                setCursorTime(parseFloat(e.target.value));
              }}
              className="w-full accent-blue-700 cursor-pointer"
            />
          </div>

          <span className="text-[11px] text-slate-500 hidden xl:inline">
            Desplaza el puntero sobre la superficie 3D para leer parámetros y unidades en vivo
          </span>
        </div>
      </div>

      {/* Warning if Target Plane is Above Ceiling */}
      {!model.isTargetReachable && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
          <span>
            <strong>Advertencia 3D:</strong> El plano P* ({model.params.targetP} g/L) supera la asíntota máxima ({model.bS0.toFixed(1)} g/L); no existe corte real.
          </span>
        </div>
      )}

      {/* Split Workspace: 3D Viewport + Clean Tabular Inspector */}
      <div className="grid xl:grid-cols-3 gap-4 items-stretch">
        {/* Main 3D Plot (2 cols) */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-lg p-2 overflow-hidden min-h-[540px]">
          <div ref={containerRef} className="w-full h-[540px]" />
        </div>

        {/* Clean Specification Table Inspector (1 col) */}
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200 flex flex-col justify-between">
          <div className="p-4 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5" />
                Inspector en Vivo
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {probe.source === 'hover' ? 'Cursor en malla 3D' : 'Partícula del lote'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Parámetros, tasas instantáneas y unidades según el instante seleccionado.
            </p>
          </div>

          {/* Coordinates: t & k1 */}
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="p-3.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Tiempo t</span>
                <span className="font-mono">Eje X</span>
              </div>
              <div className="text-xl font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                {probe.t.toFixed(2)} <span className="text-xs font-normal text-slate-500">h</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Variable temporal</div>
            </div>

            <div className="p-3.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Constante k₁</span>
                <span className="font-mono">Eje Y</span>
              </div>
              <div className="text-xl font-mono font-bold text-blue-700 tabular-nums mt-0.5">
                {probe.k1.toFixed(3)} <span className="text-xs font-normal text-slate-500">h⁻¹</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                τ = 1/k₁ = {probeTau.toFixed(1)} h
              </div>
            </div>
          </div>

          {/* Concentrations P & S */}
          <div className="divide-y divide-slate-200">
            <div className="p-3.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-slate-900">Ácido Láctico P(t, k₁)</div>
                <div className="text-[11px] text-slate-500">
                  Varía con t · {probeDornic} °D · {probePct.toFixed(2)}%
                </div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <span className="text-lg font-bold text-slate-900">{probeP.toFixed(2)}</span>
                <span className="text-xs text-slate-500 ml-1">g/L</span>
              </div>
            </div>

            <div className="p-3.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-slate-900">Lactosa Restante S(t, k₁)</div>
                <div className="text-[11px] text-slate-500">
                  Varía con t · {probeLactoseRemainingPct.toFixed(1)}% disponible
                </div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <span className="text-lg font-bold text-blue-700">{probeS.toFixed(2)}</span>
                <span className="text-xs text-slate-500 ml-1">g/L</span>
              </div>
            </div>
          </div>

          {/* Instantaneous Rates */}
          <div className="p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold uppercase tracking-wider text-slate-500">
                Velocidades Instantáneas
              </span>
              <span className="font-mono text-slate-500">g/(L·h)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs tabular-nums">
              <div>
                <span className="text-slate-500 block text-[11px]">Consumo dS/dt</span>
                <span className="text-blue-700 font-bold">{probeDS_dt.toFixed(3)}</span>{' '}
                <span className="text-slate-500 text-[11px]">g/(L·h)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Producción dP/dt</span>
                <span className="text-slate-900 font-bold">+{probeDP_dt.toFixed(3)}</span>{' '}
                <span className="text-slate-500 text-[11px]">g/(L·h)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Desaparecen {Math.abs(probeDS_dt).toFixed(2)} g/L·h de lactosa y se forman {probeDP_dt.toFixed(2)} g/L·h de ácido (b = {b.toFixed(2)} g/g).
            </p>
          </div>

          {/* Quality & Balance */}
          <div className="p-3.5 bg-slate-50/70 rounded-b-lg space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Estado en coordenada</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  probeQuality.phase === 'optimal'
                    ? 'text-blue-700'
                    : probeQuality.phase === 'over'
                    ? 'text-red-700'
                    : 'text-slate-700'
                }`}
              >
                {probeQuality.phase === 'optimal' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : probeQuality.phase === 'sub' ? (
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                )}
                {probeQuality.label}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
              <span>Conservación P + b·S</span>
              <span className="text-slate-900 font-semibold">
                {(probeP + b * probeS).toFixed(2)} g/L (= b·S₀)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensional Guide */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span>Significado de Ejes, Unidades Temporales y Cruce en 3D</span>
        </div>
        <p className="leading-relaxed">
          La superficie principal <MathFormula math="z = P(t, k_1) = b S_0 (1 - e^{-k_1 t})" /> muestra la concentración de ácido láctico en <strong className="text-slate-900">g/L</strong> frente al tiempo <MathFormula math="t" /> (<strong className="text-slate-900">h</strong>) y a la constante cinética <MathFormula math="k_1" /> (<strong className="text-slate-900">h⁻¹</strong>). Al activar <strong className="text-blue-700">+ Superficie S(t, k₁) y Cruce</strong>, la línea azul traza todos los puntos <MathFormula math="S(t, k_1) = P(t, k_1)" /> cuya altura permanece constante en <MathFormula math="\frac{b}{1+b}S_0" /> mientras el tiempo de cruce varía como <MathFormula math="t_{\text{int}}(k_1) = \frac{\ln(1+1/b)}{k_1}" />.
        </p>
      </div>
    </div>
  );
};
