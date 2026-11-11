/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import { YogurtModelResult } from '../math/yogurtFermentationModel';
import { MathFormula } from './MathFormula';
import {
  Eye,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  SkipBack,
  Crosshair,
  Clock,
} from 'lucide-react';

interface Fermentation2DViewProps {
  model: YogurtModelResult;
  timeMax?: number;
  onParamChange: (param: any, value: number) => void;
  onResetParams: () => void;
}

type HorizonPreset = '8' | '16' | '24' | 'auto_int';

export const Fermentation2DView: React.FC<Fermentation2DViewProps> = ({
  model,
  onResetParams,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Layer toggles
  const [showLactose, setShowLactose] = useState<boolean>(true);
  const [showAcid, setShowAcid] = useState<boolean>(true);
  const [showTargetLine, setShowTargetLine] = useState<boolean>(true);
  const [showOptimalMarker, setShowOptimalMarker] = useState<boolean>(true);
  const [showIntersectionMarker, setShowIntersectionMarker] = useState<boolean>(true);
  const [showQualityZones, setShowQualityZones] = useState<boolean>(true);

  // Horizon selector (default 16h so both t* and S=P intersection are visible immediately)
  const [horizonPreset, setHorizonPreset] = useState<HorizonPreset>('16');

  // Interactive Time Animation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2);
  const [cursorTime, setCursorTime] = useState<number>(16);
  const [motionEnabled, setMotionEnabled] = useState<boolean>(true);
  const lastFrameTimeRef = useRef<number | null>(null);

  const effectiveTimeMax = useMemo(() => {
    if (horizonPreset === '8') return 8;
    if (horizonPreset === '16') return 16;
    if (horizonPreset === '24') return 24;
    const maxEvent = Math.max(
      model.isTargetReachable ? model.targetTimeHours : 8,
      model.intersectionTimeHours
    );
    return Math.max(8, Math.ceil(maxEvent * 1.15));
  }, [horizonPreset, model.isTargetReachable, model.targetTimeHours, model.intersectionTimeHours]);

  useEffect(() => {
    setCursorTime((prev) => Math.min(prev, effectiveTimeMax));
  }, [effectiveTimeMax]);

  useEffect(() => {
    if (!isPlaying || !motionEnabled) {
      lastFrameTimeRef.current = null;
      return;
    }

    lastFrameTimeRef.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const dtReal = (now - (lastFrameTimeRef.current ?? now)) / 1000;
      lastFrameTimeRef.current = now;

      setCursorTime((prev) => {
        const next = prev + dtReal * playbackSpeed;
        if (next >= effectiveTimeMax) {
          setIsPlaying(false);
          return effectiveTimeMax;
        }
        return next;
      });
    }, 35);

    return () => clearInterval(timer);
  }, [isPlaying, motionEnabled, playbackSpeed, effectiveTimeMax]);

  const activeTime = motionEnabled ? cursorTime : effectiveTimeMax;
  const pointsCount = 260;

  const chartData = useMemo(() => {
    const tFull: number[] = [];
    const sFull: number[] = [];
    const pFull: number[] = [];

    const step = effectiveTimeMax / (pointsCount - 1);
    for (let i = 0; i < pointsCount; i++) {
      const t = i * step;
      tFull.push(t);
      sFull.push(model.evalS(t));
      pFull.push(model.evalP(t));
    }

    const tActive: number[] = [];
    const sActive: number[] = [];
    const pActive: number[] = [];

    if (motionEnabled) {
      const activeSteps = Math.max(2, Math.round((activeTime / effectiveTimeMax) * 160));
      for (let i = 0; i <= activeSteps; i++) {
        const t = (i / activeSteps) * activeTime;
        tActive.push(t);
        sActive.push(model.evalS(t));
        pActive.push(model.evalP(t));
      }
    }

    const traces: Plotly.Data[] = [];

    // 1. Lactose Curve S(t) — Engineering Blue (#1D4ED8)
    if (showLactose) {
      if (motionEnabled) {
        traces.push({
          x: tFull,
          y: sFull,
          type: 'scatter',
          mode: 'lines',
          name: 'Guía S(t)',
          showlegend: false,
          line: { color: 'rgba(29, 78, 216, 0.20)', width: 1.5, dash: 'dot' },
          hoverinfo: 'skip',
        });
        traces.push({
          x: tActive,
          y: sActive,
          type: 'scatter',
          mode: 'lines',
          name: 'Lactosa S(t)',
          line: { color: '#1D4ED8', width: 2.8 },
          hovertemplate:
            '<b>Lactosa S(t)</b><br>Tiempo: %{x:.2f} h<br>Concentración: %{y:.2f} g/L<extra></extra>',
        });
        traces.push({
          x: [activeTime],
          y: [model.evalS(activeTime)],
          type: 'scatter',
          mode: 'markers',
          showlegend: false,
          marker: { size: 9, color: '#1D4ED8', line: { color: '#FFFFFF', width: 2 } },
          hovertemplate: `<b>S(t) en t = ${activeTime.toFixed(2)} h</b><br>S = ${model.evalS(activeTime).toFixed(2)} g/L<br>dS/dt = ${model.evalDS_dt(activeTime).toFixed(2)} g/(L·h)<extra></extra>`,
        });
      } else {
        traces.push({
          x: tFull,
          y: sFull,
          type: 'scatter',
          mode: 'lines',
          name: 'Lactosa S(t)',
          line: { color: '#1D4ED8', width: 2.8 },
          hovertemplate:
            '<b>Lactosa S(t)</b><br>Tiempo: %{x:.2f} h<br>Concentración: %{y:.2f} g/L<extra></extra>',
        });
      }
    }

    // 2. Lactic Acid Curve P(t) — Deep Charcoal (#0F172A)
    if (showAcid) {
      if (motionEnabled) {
        traces.push({
          x: tFull,
          y: pFull,
          type: 'scatter',
          mode: 'lines',
          name: 'Guía P(t)',
          showlegend: false,
          line: { color: 'rgba(15, 23, 42, 0.20)', width: 1.5, dash: 'dot' },
          hoverinfo: 'skip',
        });
        traces.push({
          x: tActive,
          y: pActive,
          type: 'scatter',
          mode: 'lines',
          name: 'Ácido Láctico P(t)',
          line: { color: '#0F172A', width: 3 },
          customdata: pActive.map((p) => p * 10),
          hovertemplate:
            '<b>Ácido Láctico P(t)</b><br>Tiempo: %{x:.2f} h<br>Acidez: %{y:.2f} g/L<br>°Dornic: %{customdata:.0f} °D<extra></extra>',
        });
        traces.push({
          x: [activeTime],
          y: [model.evalP(activeTime)],
          type: 'scatter',
          mode: 'markers',
          showlegend: false,
          marker: { size: 9, color: '#0F172A', line: { color: '#FFFFFF', width: 2 } },
          hovertemplate: `<b>P(t) en t = ${activeTime.toFixed(2)} h</b><br>P = ${model.evalP(activeTime).toFixed(2)} g/L (${model.evalDornic(activeTime)} °D)<br>dP/dt = +${model.evalDP_dt(activeTime).toFixed(2)} g/(L·h)<extra></extra>`,
        });
      } else {
        traces.push({
          x: tFull,
          y: pFull,
          type: 'scatter',
          mode: 'lines',
          name: 'Ácido Láctico P(t)',
          line: { color: '#0F172A', width: 3 },
          customdata: pFull.map((p) => p * 10),
          hovertemplate:
            '<b>Ácido Láctico P(t)</b><br>Tiempo: %{x:.2f} h<br>Acidez: %{y:.2f} g/L<br>°Dornic: %{customdata:.0f} °D<extra></extra>',
        });
      }
    }

    // 3. Target Acidity Line P = targetP
    if (showTargetLine) {
      traces.push({
        x: [0, effectiveTimeMax],
        y: [model.params.targetP, model.params.targetP],
        type: 'scatter',
        mode: 'lines',
        name: `Meta P* (${model.params.targetP} g/L)`,
        line: {
          color: model.isTargetReachable ? '#64748B' : '#B91C1C',
          width: 1.5,
          dash: 'dash',
        },
        hoverinfo: 'none',
      });
    }

    // 4. Critical Milestone Point t*
    if (showOptimalMarker && model.isTargetReachable && model.targetTimeHours <= effectiveTimeMax) {
      traces.push({
        x: [model.targetTimeHours],
        y: [model.params.targetP],
        type: 'scatter',
        mode: 'markers+text',
        name: `Detención t* (${model.targetTimeFormatted})`,
        text: [`t* = ${model.targetTimeFormatted}`],
        textposition: 'bottom right',
        textfont: { family: 'JetBrains Mono, monospace', size: 11, color: '#1D4ED8' },
        marker: { size: 11, color: '#1D4ED8', symbol: 'star', line: { color: '#FFFFFF', width: 1.5 } },
        hovertemplate: `<b>Punto Operativo de Enfriamiento (t*)</b><br>Tiempo: ${model.targetTimeFormatted} (${model.targetTimeHours.toFixed(2)} h)<br>Ácido P(t*): ${model.params.targetP.toFixed(2)} g/L (${Math.round(model.params.targetP * 10)} °D)<br>Lactosa S(t*): ${model.targetLactoseRemaining.toFixed(2)} g/L<extra></extra>`,
      });
    }

    // 5. Mathematical Intersection Marker: S(t_int) = P(t_int)
    if (showIntersectionMarker && model.intersectionTimeHours <= effectiveTimeMax) {
      traces.push({
        x: [model.intersectionTimeHours],
        y: [model.intersectionConc],
        type: 'scatter',
        mode: 'markers+text',
        name: `Cruce S(t) = P(t) (${model.intersectionTimeFormatted})`,
        text: [`S=P (${model.intersectionConc.toFixed(1)} g/L)`],
        textposition: 'top center',
        textfont: { family: 'JetBrains Mono, monospace', size: 11, color: '#0F172A' },
        marker: { size: 10, color: '#0F172A', symbol: 'diamond', line: { color: '#FFFFFF', width: 2 } },
        hovertemplate:
          `<b>Intersección Matemática S(t) = P(t)</b><br>` +
          `Tiempo t_int: ${model.intersectionTimeFormatted} (${model.intersectionTimeHours.toFixed(2)} h)<br>` +
          `Concentración S = P: ${model.intersectionConc.toFixed(2)} g/L<br>` +
          `Acidez equiv.: ${model.intersectionDornic} °D (${model.intersectionAcidityPct.toFixed(2)}%)<br>` +
          `dS/dt: ${model.intersectionDS_dt.toFixed(3)} g/(L·h) | dP/dt: +${model.intersectionDP_dt.toFixed(3)} g/(L·h)<br>` +
          `<i>Solo referencia matemática (sobre-acidificación)</i><extra></extra>`,
      });
    }

    return traces;
  }, [
    model,
    effectiveTimeMax,
    motionEnabled,
    activeTime,
    showLactose,
    showAcid,
    showTargetLine,
    showOptimalMarker,
    showIntersectionMarker,
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    const shapes: Partial<Plotly.Shape>[] = [];
    if (showQualityZones) {
      shapes.push({
        type: 'rect',
        xref: 'x',
        yref: 'y',
        x0: 0,
        x1: effectiveTimeMax,
        y0: 7.0,
        y1: 8.8,
        fillcolor: 'rgba(29, 78, 216, 0.05)',
        line: { width: 1, color: 'rgba(29, 78, 216, 0.30)', dash: 'dot' },
        layer: 'below',
      });
    }

    if (motionEnabled) {
      shapes.push({
        type: 'line',
        xref: 'x',
        yref: 'y',
        x0: activeTime,
        x1: activeTime,
        y0: 0,
        y1: Math.max(model.params.S0 * 1.05, 55),
        line: { color: '#94A3B8', width: 1.2, dash: 'dashdot' },
      });
    }

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      uirevision: `${effectiveTimeMax}-${model.params.S0}`,
      paper_bgcolor: '#FFFFFF',
      plot_bgcolor: '#FFFFFF',
      margin: { l: 58, r: 22, t: 24, b: 48 },
      showlegend: true,
      shapes,
      legend: {
        x: 0.99,
        xanchor: 'right',
        y: 0.98,
        bgcolor: 'rgba(255, 255, 255, 0.94)',
        bordercolor: '#E2E8F0',
        borderwidth: 1,
        font: { family: 'Plus Jakarta Sans, sans-serif', size: 11, color: '#334155' },
      },
      hoverlabel: {
        bgcolor: '#FFFFFF',
        bordercolor: '#1D4ED8',
        font: { family: 'JetBrains Mono, monospace', size: 11, color: '#0F172A' },
      },
      xaxis: {
        title: {
          text: `Tiempo de fermentación t (horas a ${model.params.temperature} °C)`,
          font: { family: 'Plus Jakarta Sans, sans-serif', size: 12, color: '#334155' },
        },
        showline: true,
        mirror: 'ticks',
        linecolor: '#334155',
        linewidth: 1,
        ticks: 'inside',
        gridcolor: '#E2E8F0',
        zerolinecolor: '#CBD5E1',
        tickfont: { family: 'JetBrains Mono, monospace', size: 11, color: '#475569' },
        range: [0, effectiveTimeMax],
      },
      yaxis: {
        title: {
          text: 'Concentración (g/L)',
          font: { family: 'Plus Jakarta Sans, sans-serif', size: 12, color: '#334155' },
        },
        showline: true,
        mirror: 'ticks',
        linecolor: '#334155',
        linewidth: 1,
        ticks: 'inside',
        gridcolor: '#E2E8F0',
        zerolinecolor: '#CBD5E1',
        tickfont: { family: 'JetBrains Mono, monospace', size: 11, color: '#475569' },
        range: [0, Math.max(model.params.S0 * 1.08, 55)],
      },
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: 'cinetica_fermentacion_yogur_2d',
        height: 650,
        width: 1000,
        scale: 2,
      },
    };

    Plotly.react(containerRef.current, chartData, layout, config);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartData, showQualityZones, effectiveTimeMax, model.params.S0, model.params.temperature, motionEnabled, activeTime]);

  const curS = model.evalS(activeTime);
  const curP = model.evalP(activeTime);
  const curDS = model.evalDS_dt(activeTime);
  const curDP = model.evalDP_dt(activeTime);
  const curDornic = model.evalDornic(activeTime);
  const curAcidityPct = model.evalAcidityPct(activeTime);
  const curQuality = model.getQualityStatus(curP);
  const intersectionOutsideWindow = model.intersectionTimeHours > effectiveTimeMax;

  const formatHM = (hrs: number) => {
    let h = Math.floor(hrs);
    let m = Math.round((hrs - h) * 60);
    if (m === 60) {
      h += 1;
      m = 0;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} h`;
  };

  const toggleBtnCls = (active: boolean) =>
    `px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
      active
        ? 'bg-blue-50 border-blue-700 text-blue-700 font-semibold'
        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
    }`;

  return (
    <div className="space-y-4">
      {/* Unified Clinical Control Deck */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
        {/* Layer toggles & Horizon selector */}
        <div className="p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mr-1.5 flex items-center gap-1 whitespace-nowrap">
              <Eye className="w-3.5 h-3.5 text-blue-700" />
              Capas
            </span>
            <button onClick={() => setShowLactose(!showLactose)} className={toggleBtnCls(showLactose)}>
              Lactosa S(t)
            </button>
            <button onClick={() => setShowAcid(!showAcid)} className={toggleBtnCls(showAcid)}>
              Ácido P(t)
            </button>
            <button onClick={() => setShowTargetLine(!showTargetLine)} className={toggleBtnCls(showTargetLine)}>
              Meta P* ({model.params.targetP} g/L)
            </button>
            {model.isTargetReachable && (
              <button onClick={() => setShowOptimalMarker(!showOptimalMarker)} className={toggleBtnCls(showOptimalMarker)}>
                ★ Óptimo t*
              </button>
            )}
            <button onClick={() => setShowIntersectionMarker(!showIntersectionMarker)} className={toggleBtnCls(showIntersectionMarker)}>
              ◆ Cruce S=P
            </button>
            <button onClick={() => setShowQualityZones(!showQualityZones)} className={toggleBtnCls(showQualityZones)}>
              Banda 7–8,8 g/L
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-md border border-slate-200">
              {([
                { key: '8', label: '8 h' },
                { key: '16', label: '16 h' },
                { key: '24', label: '24 h' },
                { key: 'auto_int', label: 'Ver cruce' },
              ] as { key: HorizonPreset; label: string }[]).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setHorizonPreset(item.key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    horizonPreset === item.key
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={onResetParams}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 rounded-md border border-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>
        </div>

        {/* Temporal Playback Bar */}
        <div className="p-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 rounded-b-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!motionEnabled) setMotionEnabled(true);
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
              {isPlaying ? 'Pausar' : 'Animar en Tiempo'}
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCursorTime(0);
                setMotionEnabled(true);
              }}
              title="Volver a t = 0"
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <SkipBack className="w-3.5 h-3.5" />
              t = 0
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setMotionEnabled(!motionEnabled);
              }}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                motionEnabled
                  ? 'bg-white text-slate-800 border-slate-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {motionEnabled ? 'Cursor Vivo' : 'Curva Fija'}
            </button>
          </div>

          {motionEnabled && (
            <div className="flex-1 min-w-[240px] flex flex-wrap items-center gap-3">
              <div className="flex-1 flex items-center gap-2.5">
                <span className="text-xs font-mono font-semibold text-slate-700 whitespace-nowrap tabular-nums">
                  t = {activeTime.toFixed(2)} h
                </span>
                <input
                  type="range"
                  min={0}
                  max={effectiveTimeMax}
                  step={0.05}
                  value={cursorTime}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCursorTime(parseFloat(e.target.value));
                  }}
                  className="w-full accent-blue-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono">
                {model.isTargetReachable && model.targetTimeHours <= effectiveTimeMax && (
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCursorTime(model.targetTimeHours);
                    }}
                    className="px-2 py-1 rounded bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 font-medium whitespace-nowrap shrink-0"
                  >
                    Ir a t*
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    if (model.intersectionTimeHours > effectiveTimeMax) {
                      setHorizonPreset('auto_int');
                    }
                    setCursorTime(model.intersectionTimeHours);
                  }}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-medium whitespace-nowrap shrink-0"
                >
                  Ir a S=P
                </button>
                <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 ml-1">
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 ${
                        playbackSpeed === spd
                          ? 'bg-blue-700 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {spd} h/s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Intersection Outside Current Horizon Notice */}
      {intersectionOutsideWindow && (
        <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              La intersección matemática <strong>S(t) = P(t)</strong> ocurre en{' '}
              <strong className="font-mono text-slate-900">{model.intersectionTimeFormatted}</strong> ({model.intersectionTimeHours.toFixed(2)} h), fuera de la ventana de {effectiveTimeMax} h.
            </span>
          </div>
          <button
            onClick={() => setHorizonPreset('auto_int')}
            className="px-3 py-1 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium whitespace-nowrap shrink-0"
          >
            Ampliar ventana hasta cruce
          </button>
        </div>
      )}

      {/* Main White Publication 2D Plot */}
      <div className="bg-white border border-slate-200 rounded-lg p-2 overflow-hidden">
        <div ref={containerRef} className="w-full h-[490px]" />
      </div>

      {/* Flat 5-Column Tabular Telemetry Strip */}
      <div className="bg-white border border-slate-200 rounded-lg grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        <div className="p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Tiempo t
          </span>
          <div className="text-xl font-mono font-bold text-slate-900 tabular-nums mt-1">
            {activeTime.toFixed(2)} <span className="text-xs font-normal text-slate-500">h</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums">{formatHM(activeTime)}</span>
        </div>

        <div className="p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Lactosa S(t)
          </span>
          <div className="text-xl font-mono font-bold text-blue-700 tabular-nums mt-1">
            {curS.toFixed(2)} <span className="text-xs font-normal text-slate-500">g/L</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums">
            dS/dt = {curDS.toFixed(3)} g/(L·h)
          </span>
        </div>

        <div className="p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Ácido Láctico P(t)
          </span>
          <div className="text-xl font-mono font-bold text-slate-900 tabular-nums mt-1">
            {curP.toFixed(2)} <span className="text-xs font-normal text-slate-500">g/L</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums">
            dP/dt = +{curDP.toFixed(3)} g/(L·h)
          </span>
        </div>

        <div className="p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Acidez Dornic
          </span>
          <div className="text-xl font-mono font-bold text-slate-900 tabular-nums mt-1">
            {curDornic} <span className="text-xs font-normal text-slate-500">°D</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums">
            {curAcidityPct.toFixed(2)}% ácido láctico
          </span>
        </div>

        <div className="p-4 col-span-2 md:col-span-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Estado del Yogur
          </span>
          <div
            className={`text-xs font-semibold mt-1.5 flex items-center gap-1.5 ${
              curQuality.phase === 'optimal'
                ? 'text-blue-700'
                : curQuality.phase === 'over'
                ? 'text-red-700'
                : 'text-slate-700'
            }`}
          >
            {curQuality.phase === 'optimal' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : curQuality.phase === 'sub' ? (
              <Clock className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{curQuality.label}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums block mt-1">
            P + b·S = {(curP + model.params.b * curS).toFixed(2)} g/L
          </span>
        </div>
      </div>

      {/* Warning Banner if Unreachable Target */}
      {!model.isTargetReachable && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-sm font-semibold text-red-900 block">Límite Estequiométrico Superado</strong>
            <p className="leading-relaxed">{model.unreachableReason}</p>
          </div>
        </div>
      )}

      {/* Structured Comparison Table: Operational Point t* vs Mathematical Intersection S=P */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/60">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Comparación de Puntos Notables: Detención Operativa (t*) vs. Cruce Matemático S(t) = P(t)
          </h3>
          <span className="text-xs font-mono text-slate-500">
            <MathFormula math="t_{\text{int}} = \frac{1}{k_1}\ln\!\left(\frac{1+b}{b}\right), \quad S=P=\frac{b}{1+b}S_0" />
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Magnitud / Criterio</th>
                <th className="py-2.5 px-4 font-semibold text-blue-700">★ Punto Operativo Óptimo (t*)</th>
                <th className="py-2.5 px-4 font-semibold text-slate-900">◆ Intersección S(t) = P(t)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-600">Tiempo transcurrido</td>
                <td className="py-2.5 px-4 font-mono tabular-nums font-semibold text-blue-700">
                  {model.isTargetReachable ? `${model.targetTimeFormatted} (${model.targetTimeHours.toFixed(2)} h)` : 'Inalcanzable'}
                </td>
                <td className="py-2.5 px-4 font-mono tabular-nums font-semibold text-slate-900">
                  {model.intersectionTimeFormatted} ({model.intersectionTimeHours.toFixed(2)} h · indep. de S₀)
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-600">Concentraciones [g/L]</td>
                <td className="py-2.5 px-4 font-mono tabular-nums">
                  P = {model.params.targetP.toFixed(2)} · S = {model.isTargetReachable ? model.targetLactoseRemaining.toFixed(2) : 'N/A'}
                </td>
                <td className="py-2.5 px-4 font-mono tabular-nums">
                  S = P = {model.intersectionConc.toFixed(2)} g/L
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-600">Acidez y consumo</td>
                <td className="py-2.5 px-4 font-mono tabular-nums">
                  {Math.round(model.params.targetP * 10)} °D ({(model.params.targetP / 10).toFixed(2)}%) · {model.targetLactoseConsumedPct.toFixed(1)}% lactosa consumida
                </td>
                <td className="py-2.5 px-4 font-mono tabular-nums">
                  {model.intersectionDornic} °D ({model.intersectionAcidityPct.toFixed(2)}%) · {model.intersectionConsumedPct.toFixed(1)}% lactosa consumida
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-600">Tasas instantáneas</td>
                <td className="py-2.5 px-4 font-mono tabular-nums">
                  Se detiene en 0 tras enfriar a 4 °C
                </td>
                <td className="py-2.5 px-4 font-mono tabular-nums">
                  dS/dt = {model.intersectionDS_dt.toFixed(2)} | dP/dt = +{model.intersectionDP_dt.toFixed(2)} g/(L·h)
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-600">Interpretación Agroindustrial</td>
                <td className="py-2.5 px-4 text-slate-700">
                  Instante recomendado para enfriar el tanque a 4 °C: coagulación firme de la caseína (pH ≈ 4,6) sin exceso ácido.
                </td>
                <td className="py-2.5 px-4 text-slate-700">
                  Referencia puramente matemática: implicaría sobre-acidificación extrema (sinéresis severa); en planta real las bacterias se inhiben antes.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
