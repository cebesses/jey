/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import { YogurtModelResult } from '../math/yogurtFermentationModel';
import {
  Play,
  Pause,
  RotateCcw,
  Snowflake,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  AlertTriangle,
  Activity,
} from 'lucide-react';

interface FermentationBatchControlProps {
  model: YogurtModelResult;
}

export const FermentationBatchControl: React.FC<FermentationBatchControlProps> = ({ model }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [simTime, setSimTime] = useState<number>(0);
  const [horizonHours, setHorizonHours] = useState<8 | 16>(8);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(20);
  const [isChilled, setIsChilled] = useState<boolean>(false);
  const [chilledAtTime, setChilledAtTime] = useState<number | null>(null);
  const [currentTemp, setCurrentTemp] = useState<number>(model.params.temperature);

  const lastRealTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isChilled) {
      setCurrentTemp(model.params.temperature);
    }
  }, [model.params.temperature, isChilled]);

  useEffect(() => {
    setSimTime((prev) => Math.min(prev, horizonHours));
  }, [horizonHours]);

  useEffect(() => {
    if (!isRunning || isChilled) {
      lastRealTimeRef.current = null;
      return;
    }

    lastRealTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const lastTime = lastRealTimeRef.current || now;
      const realElapsedSec = (now - lastTime) / 1000;
      lastRealTimeRef.current = now;

      const deltaSimHours = (realElapsedSec * speedMultiplier) / 60;

      setSimTime((prevTime) => {
        const nextTime = prevTime + deltaSimHours;
        if (nextTime >= horizonHours) {
          setIsRunning(false);
          return horizonHours;
        }
        return nextTime;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isRunning, isChilled, speedMultiplier, horizonHours]);

  const effectiveReactionTime = chilledAtTime !== null ? chilledAtTime : simTime;
  const currentS = model.evalS(effectiveReactionTime);
  const currentP = model.evalP(effectiveReactionTime);
  const currentDS = isChilled ? 0 : model.evalDS_dt(effectiveReactionTime);
  const currentDP = isChilled ? 0 : model.evalDP_dt(effectiveReactionTime);
  const currentDornic = Math.round(currentP * 10);
  const currentLactoseConsumed = Number((((model.params.S0 - currentS) / model.params.S0) * 100).toFixed(1));

  const quality = model.getQualityStatus(currentP);

  const formatHM = (hrs: number) => {
    let h = Math.floor(hrs);
    let m = Math.round((hrs - h) * 60);
    if (m === 60) {
      h += 1;
      m = 0;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} h`;
  };
  const formattedSimTime = formatHM(effectiveReactionTime);

  const handleStartPause = () => {
    if (isChilled) return;
    if (simTime >= horizonHours) setSimTime(0);
    setIsRunning(!isRunning);
  };

  const handleStopAndChill = () => {
    if (isChilled || simTime === 0) return;
    setIsRunning(false);
    setIsChilled(true);
    setChilledAtTime(simTime);
    setCurrentTemp(4);
  };

  const handleResetBatch = () => {
    setIsRunning(false);
    setIsChilled(false);
    setChilledAtTime(null);
    setSimTime(0);
    setCurrentTemp(model.params.temperature);
  };

  const handleJumpToOptimal = () => {
    if (model.isTargetReachable) {
      if (model.targetTimeHours > horizonHours) {
        setHorizonHours(16);
      }
      setSimTime(model.targetTimeHours);
      setIsRunning(false);
      setIsChilled(false);
      setChilledAtTime(null);
      setCurrentTemp(model.params.temperature);
    }
  };

  // White publication Plotly data
  const batchChartData = useMemo(() => {
    const tGuide: number[] = [];
    const sGuide: number[] = [];
    const pGuide: number[] = [];

    const stepsGuide = 160;
    for (let i = 0; i <= stepsGuide; i++) {
      const t = (i / stepsGuide) * horizonHours;
      tGuide.push(t);
      sGuide.push(model.evalS(t));
      pGuide.push(model.evalP(t));
    }

    const activeEnd = chilledAtTime !== null ? chilledAtTime : simTime;
    const tLive: number[] = [];
    const sLive: number[] = [];
    const pLive: number[] = [];
    const liveSteps = Math.max(2, Math.round((activeEnd / horizonHours) * 120));
    for (let i = 0; i <= liveSteps; i++) {
      const t = (i / liveSteps) * activeEnd;
      tLive.push(t);
      sLive.push(model.evalS(t));
      pLive.push(model.evalP(t));
    }

    const traces: Plotly.Data[] = [
      {
        x: tGuide,
        y: sGuide,
        type: 'scatter',
        mode: 'lines',
        showlegend: false,
        line: { color: 'rgba(29, 78, 216, 0.20)', width: 1.5, dash: 'dot' },
        hoverinfo: 'skip',
      },
      {
        x: tGuide,
        y: pGuide,
        type: 'scatter',
        mode: 'lines',
        showlegend: false,
        line: { color: 'rgba(15, 23, 42, 0.20)', width: 1.5, dash: 'dot' },
        hoverinfo: 'skip',
      },
      {
        x: tLive,
        y: sLive,
        type: 'scatter',
        mode: 'lines',
        name: 'Lactosa S(t) en lote',
        line: { color: '#1D4ED8', width: 2.8 },
        hovertemplate: '<b>S(t)</b>: %{y:.2f} g/L en t = %{x:.2f} h<extra></extra>',
      },
      {
        x: tLive,
        y: pLive,
        type: 'scatter',
        mode: 'lines',
        name: 'Ácido P(t) en lote',
        line: { color: '#0F172A', width: 3 },
        hovertemplate: '<b>P(t)</b>: %{y:.2f} g/L en t = %{x:.2f} h<extra></extra>',
      },
      {
        x: [0, horizonHours],
        y: [model.params.targetP, model.params.targetP],
        type: 'scatter',
        mode: 'lines',
        name: `Meta (${model.params.targetP} g/L)`,
        line: { color: '#64748B', width: 1.5, dash: 'dash' },
        hoverinfo: 'skip',
      },
    ];

    if (chilledAtTime !== null) {
      const plateauEnd = Math.min(horizonHours, chilledAtTime + Math.max(1.5, horizonHours - chilledAtTime));
      traces.push(
        {
          x: [chilledAtTime, plateauEnd],
          y: [currentS, currentS],
          type: 'scatter',
          mode: 'lines',
          name: 'Lactosa detenida (4 °C)',
          line: { color: '#1D4ED8', width: 2.5, dash: 'dash' },
          hovertemplate: `<b>Detenido a 4 °C</b><br>S = ${currentS.toFixed(2)} g/L (dS/dt = 0)<extra></extra>`,
        },
        {
          x: [chilledAtTime, plateauEnd],
          y: [currentP, currentP],
          type: 'scatter',
          mode: 'lines',
          name: 'Ácido estabilizado (4 °C)',
          line: { color: '#0F172A', width: 2.5, dash: 'dash' },
          hovertemplate: `<b>Detenido a 4 °C</b><br>P = ${currentP.toFixed(2)} g/L (dP/dt = 0)<extra></extra>`,
        },
        {
          x: [chilledAtTime, chilledAtTime],
          y: [currentS, currentP],
          type: 'scatter',
          mode: 'markers',
          showlegend: false,
          marker: { size: 9, color: ['#1D4ED8', '#0F172A'], line: { color: '#FFFFFF', width: 2 } },
          hoverinfo: 'skip',
        }
      );
    } else {
      traces.push({
        x: [activeEnd, activeEnd],
        y: [currentS, currentP],
        type: 'scatter',
        mode: 'markers',
        showlegend: false,
        marker: { size: 9, color: ['#1D4ED8', '#0F172A'], line: { color: '#FFFFFF', width: 2 } },
        hoverinfo: 'skip',
      });
    }

    if (model.intersectionTimeHours <= horizonHours) {
      traces.push({
        x: [model.intersectionTimeHours],
        y: [model.intersectionConc],
        type: 'scatter',
        mode: 'markers',
        name: `Cruce S=P (${model.intersectionTimeFormatted})`,
        marker: { size: 9, color: '#0F172A', symbol: 'diamond', line: { color: '#FFFFFF', width: 1.5 } },
        hovertemplate: `<b>Cruce S=P</b><br>t = ${model.intersectionTimeFormatted}<br>S = P = ${model.intersectionConc.toFixed(2)} g/L<extra></extra>`,
      });
    }

    return traces;
  }, [model, horizonHours, simTime, chilledAtTime, currentS, currentP]);

  useEffect(() => {
    if (!chartRef.current) return;

    const shapes: Partial<Plotly.Shape>[] = [];
    if (chilledAtTime !== null) {
      shapes.push({
        type: 'line',
        xref: 'x',
        yref: 'y',
        x0: chilledAtTime,
        x1: chilledAtTime,
        y0: 0,
        y1: Math.max(model.params.S0 * 1.05, 55),
        line: { color: '#1D4ED8', width: 1.5, dash: 'dashdot' },
      });
    }

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      uirevision: `${horizonHours}-${model.params.S0}`,
      paper_bgcolor: '#FFFFFF',
      plot_bgcolor: '#FFFFFF',
      margin: { l: 52, r: 18, t: 16, b: 42 },
      showlegend: true,
      shapes,
      legend: {
        x: 0.99,
        xanchor: 'right',
        y: 0.98,
        bgcolor: 'rgba(255, 255, 255, 0.92)',
        bordercolor: '#E2E8F0',
        borderwidth: 1,
        font: { family: 'Plus Jakarta Sans, sans-serif', size: 10, color: '#334155' },
      },
      hoverlabel: {
        bgcolor: '#FFFFFF',
        bordercolor: '#1D4ED8',
        font: { family: 'JetBrains Mono, monospace', size: 11, color: '#0F172A' },
      },
      xaxis: {
        title: { text: 'Tiempo de lote t (h)', font: { size: 11, color: '#334155' } },
        showline: true,
        mirror: 'ticks',
        linecolor: '#334155',
        linewidth: 1,
        ticks: 'inside',
        gridcolor: '#E2E8F0',
        zerolinecolor: '#CBD5E1',
        tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#475569' },
        range: [0, horizonHours],
      },
      yaxis: {
        title: { text: 'Concentración (g/L)', font: { size: 11, color: '#334155' } },
        showline: true,
        mirror: 'ticks',
        linecolor: '#334155',
        linewidth: 1,
        ticks: 'inside',
        gridcolor: '#E2E8F0',
        zerolinecolor: '#CBD5E1',
        tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#475569' },
        range: [0, Math.max(model.params.S0 * 1.08, 55)],
      },
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: false,
    };

    Plotly.react(chartRef.current, batchChartData, layout, config);

    const handleResize = () => {
      if (chartRef.current) {
        Plotly.Plots.resize(chartRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [batchChartData, horizonHours, model.params.S0, chilledAtTime]);

  const coagulationProgress = Math.min(100, Math.round((currentP / 8.0) * 100));

  return (
    <div className="space-y-4">
      {/* Header Control Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <Activity className="w-3.5 h-3.5" />
            <span>Control Agroindustrial de Lote en Vivo</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Control de Proceso en Tiempo Real y Gráfica Sincronizada
          </h2>
          <p className="text-xs text-slate-600">
            Evolución simultánea de S(t) y P(t) durante el lote y estabilización horizontal al enfriar el tanque a 4 °C.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-md border border-slate-200">
            {([8, 16] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizonHours(h)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  horizonHours === h ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lote {h} h
              </button>
            ))}
          </div>

          {model.isTargetReachable && (
            <button
              onClick={handleJumpToOptimal}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saltar a t* ({model.targetTimeFormatted})
            </button>
          )}
          <button
            onClick={handleResetBatch}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar Lote
          </button>
        </div>
      </div>

      {/* Main Split Batch Cockpit */}
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* Left: Tanque de Fermentación Láctea */}
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {/* Header & Temperature */}
          <div className="p-4 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-700 shrink-0" />
              Tanque de Fermentación Láctea
            </span>
            <div className="text-xs font-mono font-semibold tabular-nums whitespace-nowrap">
              {currentTemp > 10 ? (
                <span className="text-slate-900 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-blue-700" />
                  {currentTemp} °C
                </span>
              ) : (
                <span className="text-blue-700 flex items-center gap-1">
                  <Snowflake className="w-3.5 h-3.5 text-blue-700" />
                  {currentTemp} °C
                </span>
              )}
            </div>
          </div>

          {/* Coagulation Bar */}
          <div className="p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Avance hacia Coagulación (0,8%)</span>
              <span className="font-mono text-blue-700 font-bold tabular-nums">{coagulationProgress}%</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  currentP > 8.8 ? 'bg-red-700' : 'bg-blue-700'
                }`}
                style={{ width: `${Math.min(100, (currentP / 12.0) * 100)}%` }}
              />
            </div>

            <div className="text-xs font-semibold text-slate-900">
              Estado:{' '}
              <span
                className={
                  quality.phase === 'optimal'
                    ? 'text-blue-700'
                    : quality.phase === 'over'
                    ? 'text-red-700'
                    : 'text-slate-700'
                }
              >
                {quality.coagulationState}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{quality.description}</p>
          </div>

          {/* Chronometer & Action Controls */}
          <div className="p-4 space-y-3">
            <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-md">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">
                Tiempo de Fermentación
              </span>
              <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight mt-0.5 tabular-nums">
                {formattedSimTime}
              </div>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                {effectiveReactionTime.toFixed(2)} horas acumuladas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleStartPause}
                disabled={isChilled}
                className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                  isChilled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : isRunning
                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                    : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Iniciar Lote
                  </>
                )}
              </button>

              <button
                onClick={handleStopAndChill}
                disabled={isChilled || simTime === 0}
                className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                  isChilled
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : simTime === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <Snowflake className="w-3.5 h-3.5" />
                {isChilled ? 'Detenido a 4 °C' : 'Detener (4 °C)'}
              </button>
            </div>

            {/* Clock Multiplier */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <span>Velocidad</span>
              <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 border border-slate-200 rounded-md font-mono">
                {[10, 20, 40, 60].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSpeedMultiplier(spd)}
                    disabled={isChilled}
                    className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap shrink-0 transition-colors ${
                      speedMultiplier === spd
                        ? 'bg-white text-blue-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd} min/s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Plot + Flat Telemetry Strip */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <span className="text-xs font-semibold text-slate-800">
                Curva de Fermentación del Lote en Tiempo Real
              </span>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                dS/dt = {currentDS.toFixed(2)} g/(L·h) · dP/dt = {currentDP >= 0 ? '+' : ''}
                {currentDP.toFixed(2)} g/(L·h)
              </span>
            </div>
            <div ref={chartRef} className="w-full h-[275px]" />
          </div>

          {/* 4-Column Flat KPI Strip */}
          <div className="bg-white border border-slate-200 rounded-lg grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="p-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Acidez Dornic
              </span>
              <div className="text-2xl font-mono font-bold text-slate-900 my-1 tabular-nums">
                {currentDornic} <span className="text-xs font-normal text-slate-500">°D</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Meta: 80 °D</span>
                {currentDornic >= 75 && currentDornic <= 85 && (
                  <span className="text-blue-700 font-semibold">Óptimo</span>
                )}
              </div>
            </div>

            <div className="p-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                pH de Referencia
              </span>
              <div className="text-2xl font-mono font-bold text-slate-900 my-1 tabular-nums">
                {currentP >= 7.0 ? '~4,60' : '> 5,5'}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Meta: 4,60</span>
                {currentP >= 7.5 && currentP <= 8.5 && (
                  <span className="text-blue-700 font-semibold">Coagulación</span>
                )}
              </div>
            </div>

            <div className="p-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Ácido Láctico P(t)
              </span>
              <div className="text-2xl font-mono font-bold text-slate-900 my-1 tabular-nums">
                {currentP.toFixed(2)} <span className="text-xs font-normal text-slate-500">g/L</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                {(currentP / 10).toFixed(2)}% acidez
              </div>
            </div>

            <div className="p-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Lactosa S(t)
              </span>
              <div className="text-2xl font-mono font-bold text-blue-700 my-1 tabular-nums">
                {currentS.toFixed(2)} <span className="text-xs font-normal text-slate-500">g/L</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                -{currentLactoseConsumed}% consumida
              </div>
            </div>
          </div>

          {/* Quality Verdict */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {quality.phase === 'optimal' ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                ) : quality.phase === 'sub' ? (
                  <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                )}
                <h3 className="font-semibold text-slate-900 text-sm">
                  Dictamen del Lote:{' '}
                  <span
                    className={
                      quality.phase === 'optimal'
                        ? 'text-blue-700'
                        : quality.phase === 'over'
                        ? 'text-red-700'
                        : 'text-slate-700'
                    }
                  >
                    {quality.label}
                  </span>
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {isChilled
                  ? `Detenido a 4 °C en t = ${chilledAtTime?.toFixed(2)} h (dS/dt = 0, dP/dt = 0)`
                  : `P + b·S = ${(currentP + model.params.b * currentS).toFixed(2)} g/L (= ${model.bS0.toFixed(2)} g/L)`}
              </span>
            </div>

            {quality.phase === 'over' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Alerta de Control de Calidad:</strong> El lote sobrepasó 0,88% de acidez. Se debió detener por enfriamiento cerca de las {model.targetTimeFormatted}.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
