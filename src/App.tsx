/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  DEFAULT_YOGURT_PARAMS,
  YogurtModelParams,
  computeYogurtModel,
} from './math/yogurtFermentationModel';
import { FermentationSidebar } from './components/FermentationSidebar';
import { FermentationMathView } from './components/FermentationMathView';
import { Fermentation2DView } from './components/Fermentation2DView';
import { Fermentation3DView } from './components/Fermentation3DView';
import { FermentationBatchControl } from './components/FermentationBatchControl';
import { FermentationTheoryTab } from './components/FermentationTheoryTab';
import { MathFormula } from './components/MathFormula';
import { RotateCcw } from 'lucide-react';

type TabView = 'math' | 'plot2d' | 'plot3d' | 'batch' | 'theory';

export default function App() {
  const [params, setParams] = useState<YogurtModelParams>(DEFAULT_YOGURT_PARAMS);
  const [activeTab, setActiveTab] = useState<TabView>('plot2d');

  // Compute model results reactively
  const model = useMemo(() => {
    return computeYogurtModel(params);
  }, [params]);

  const handleParamChange = (param: keyof YogurtModelParams, value: any) => {
    setParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleResetToPDF = () => {
    setParams(DEFAULT_YOGURT_PARAMS);
  };

  const navItems: { id: TabView; label: string }[] = [
    { id: 'math', label: 'Tablero EDO' },
    { id: 'plot2d', label: 'Cinética 2D' },
    { id: 'plot3d', label: 'Superficie 3D' },
    { id: 'batch', label: 'Control de Lote' },
    { id: 'theory', label: 'Cruce y Dinámica' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Clean 3-Zone Clinical Header */}
      <header className="bg-white border-b border-slate-200 px-6 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8 h-14">
          {/* Zone 1: Single-line Wordmark */}
          <span className="text-sm font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            AGRO-LAB · Fermentación Láctea
          </span>

          {/* Zone 2: Clean Underline Navigation Tabs */}
          <nav className="flex items-center gap-6 h-full overflow-x-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`h-full flex items-center text-xs transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? 'border-blue-700 text-blue-700 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0">
            <button
              onClick={handleResetToPDF}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Valores PDF
            </button>
          </div>
        </div>
      </header>

      {/* Subtle Technical Reference Ledger Strip */}
      <section className="bg-white border-b border-slate-200 px-6 py-2.5">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <span className="font-semibold text-slate-900">Ingeniería Agroindustrial</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span>S. thermophilus y L. bulgaricus ({params.temperature} °C)</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="font-mono text-blue-700">
              <MathFormula math="S(t) = S_0 e^{-k_1 t}" />
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono text-slate-900">
              <MathFormula math="P(t) = b S_0 (1 - e^{-k_1 t})" />
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-slate-600 tabular-nums">
            <span>
              Meta: <strong className="text-slate-900">0,8% (80 °D)</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <span>
              pH ref.: <strong className="text-slate-900">~4,60</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <span>
              Detención t*: <strong className="text-blue-700">{model.targetTimeFormatted}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <span>
              Cruce S=P: <strong className="text-slate-900">{model.intersectionTimeFormatted}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Main Split Console Body */}
      <main className="max-w-[1440px] mx-auto w-full px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6 items-start">
        <FermentationSidebar
          params={params}
          model={model}
          onParamChange={handleParamChange}
          onResetToPDF={handleResetToPDF}
        />

        <section className="flex-1 min-w-0 w-full">
          {activeTab === 'math' && <FermentationMathView model={model} />}

          {activeTab === 'plot2d' && (
            <Fermentation2DView
              model={model}
              onParamChange={handleParamChange}
              onResetParams={handleResetToPDF}
            />
          )}

          {activeTab === 'plot3d' && <Fermentation3DView model={model} />}

          {activeTab === 'batch' && <FermentationBatchControl model={model} />}

          {activeTab === 'theory' && (
            <FermentationTheoryTab model={model} onNavigateTab={setActiveTab} />
          )}
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-3.5 px-6 text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Ingeniería Agroindustrial · Modelamiento de la Fermentación del Yogur mediante Sistemas EDO
          </span>
          <span className="font-mono tabular-nums text-slate-500">
            S₀ = 50 g/L · k₁ = 0,06 h⁻¹ · b = 0,70 g/g · t* = 4,3 h
          </span>
        </div>
      </footer>
    </div>
  );
}
