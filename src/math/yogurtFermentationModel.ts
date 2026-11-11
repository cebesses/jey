/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface YogurtModelParams {
  S0: number; // Concentración inicial de lactosa (g/L), e.g. 50
  P0: number; // Ácido láctico inicial (g/L), e.g. 0
  k1: number; // Constante de consumo de lactosa (1/h), e.g. 0.06
  b: number;  // Rendimiento de ácido (g ácido / g lactosa), e.g. 0.70
  targetP: number; // Ácido láctico objetivo (g/L), e.g. 8.0 (0.8%)
  temperature: number; // Temperatura de fermentación (°C), e.g. 43
}

export interface HourlyTableRow {
  t: number;
  S: number;
  P: number;
  dornic: number;
  acidezPct: number;
}

export interface QualityStatus {
  phase: 'sub' | 'optimal' | 'over';
  label: string;
  description: string;
  color: string;
  coagulationState: string;
}

export interface YogurtModelResult {
  params: YogurtModelParams;
  bS0: number; // Asíntota máxima teórica b * S0 (35 g/L para 0.7*50)
  isTargetReachable: boolean;
  unreachableReason?: string;
  targetTimeHours: number; // t* para alcanzar targetP (e.g. 4.325 h o Infinity)
  targetTimeFormatted: string; // e.g. "4 h 20 min" o "Inalcanzable"
  targetLactoseRemaining: number; // S(t*) e.g. 38.6 g/L
  targetLactoseConsumedPct: number; // e.g. 22.86% (~23%)
  // Intersección matemática entre S(t) y P(t)
  intersectionTimeHours: number; // t_int = (1/k1) * ln((1+b)/b)
  intersectionTimeFormatted: string; // e.g. "14 h 47 min"
  intersectionConc: number; // S(t_int) = P(t_int) = S0 * b / (1 + b)
  intersectionDornic: number; // e.g. 206 °D
  intersectionAcidityPct: number; // e.g. 2.06 %
  intersectionConsumedPct: number; // e.g. 58.82 %
  intersectionDS_dt: number; // g/(L·h)
  intersectionDP_dt: number; // g/(L·h)
  halfLifeHours: number; // t_{1/2} = ln(2)/k1
  characteristicTimeHours: number; // tau = 1/k1
  evalS: (t: number) => number;
  evalP: (t: number) => number;
  evalDS_dt: (t: number) => number;
  evalDP_dt: (t: number) => number;
  evalDornic: (t: number) => number;
  evalAcidityPct: (t: number) => number;
  getQualityStatus: (P: number) => QualityStatus;
  hourlyTable: HourlyTableRow[];
  step1Latex: {
    odeLatex: string;
    separableLatex: string;
    integralLatex: string;
    generalLatex: string;
    particularLatex: string;
    numericLatex: string;
  };
  step2Latex: {
    odeLatex: string;
    substitutionLatex: string;
    integralLatex: string;
    particularLatex: string;
    numericLatex: string;
    conservationProofLatex: string;
    modelAssumptionsLatex: string;
  };
  targetCalculationLatex: {
    equationLatex: string;
    stepsLatex: string;
    resultLatex: string;
    consumptionLatex: string;
  };
  intersectionLatex: {
    equationLatex: string;
    stepsLatex: string;
    concLatex: string;
    ratesLatex: string;
  };
}

export const DEFAULT_YOGURT_PARAMS: YogurtModelParams = {
  S0: 50,
  P0: 0,
  k1: 0.06,
  b: 0.70,
  targetP: 8.0,
  temperature: 43,
};

function formatHoursMinutes(hours: number): string {
  if (!Number.isFinite(hours) || hours < 0) return 'Inalcanzable';
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  return `${h} h ${m} min`;
}

export function computeYogurtModel(params: YogurtModelParams = DEFAULT_YOGURT_PARAMS): YogurtModelResult {
  const { S0, k1, b, targetP } = params;
  const bS0 = b * S0;

  // Exact analytical solutions directly from the PDF:
  // S(t) = S0 * exp(-k1 * t)
  const evalS = (t: number): number => {
    if (t < 0) return S0;
    return S0 * Math.exp(-k1 * t);
  };

  // P(t) = b * S0 * (1 - exp(-k1 * t))
  const evalP = (t: number): number => {
    if (t < 0) return 0;
    return bS0 * (1 - Math.exp(-k1 * t));
  };

  // Instantaneous rates from the differential system [g/(L·h)]
  const evalDS_dt = (t: number): number => {
    return -k1 * evalS(t);
  };

  const evalDP_dt = (t: number): number => {
    return b * k1 * evalS(t);
  };

  // Acidez en grados Dornic (1 °D = 0.1 g/L de ácido láctico => °D = 10 * P)
  const evalDornic = (t: number): number => {
    return Math.round(evalP(t) * 10);
  };

  // Acidez en porcentaje (% m/v => % = P / 10)
  const evalAcidityPct = (t: number): number => {
    return evalP(t) / 10;
  };

  // Validación de alcanzabilidad matemática de la meta
  const isTargetReachable = targetP < bS0;
  let targetTimeHours = Infinity;
  let targetTimeFormatted = 'Inalcanzable';
  let unreachableReason: string | undefined = undefined;

  if (isTargetReachable) {
    const ratio = targetP / bS0;
    targetTimeHours = -Math.log(1 - ratio) / k1;
    targetTimeFormatted = formatHoursMinutes(targetTimeHours);
  } else {
    unreachableReason = `La acidez deseada (${targetP.toFixed(1)} g/L) no puede alcanzarse con los valores actuales: el valor asintótico máximo posible es b·S₀ = ${bS0.toFixed(1)} g/L.`;
  }

  const targetLactoseRemaining = isTargetReachable ? evalS(targetTimeHours) : 0;
  const targetLactoseConsumedPct = isTargetReachable ? ((S0 - targetLactoseRemaining) / S0) * 100 : 100;

  // Intersección matemática exacta entre S(t) y P(t)
  // S0 * exp(-k1*t) = b * S0 * (1 - exp(-k1*t)) => exp(-k1*t) = b/(1+b)
  const intersectionTimeHours = Math.log((1 + b) / b) / k1;
  const intersectionTimeFormatted = formatHoursMinutes(intersectionTimeHours);
  const intersectionConc = S0 * (b / (1 + b));
  const intersectionDornic = Math.round(intersectionConc * 10);
  const intersectionAcidityPct = intersectionConc / 10;
  const intersectionConsumedPct = (1 / (1 + b)) * 100;
  const intersectionDS_dt = -k1 * intersectionConc;
  const intersectionDP_dt = b * k1 * intersectionConc;
  const halfLifeHours = Math.log(2) / k1;
  const characteristicTimeHours = 1 / k1;

  // Quality status function based on target P = 8 g/L (0.8% acidez, pH ~4.6)
  const getQualityStatus = (P: number): QualityStatus => {
    if (P < 7.0) {
      return {
        phase: 'sub',
        label: 'Sub-fermentado',
        description: 'Producto sin coagular. La acidez no ha alcanzado 0,8% (8 g/L). Si se detiene ahora, queda un producto líquido.',
        color: '#38bdf8',
        coagulationState: 'Líquido (Sin coagular)',
      };
    } else if (P <= 8.8) {
      return {
        phase: 'optimal',
        label: 'Acidez Adecuada (0,8 %)',
        description: 'Acidez óptima alcanzada (P ≈ 8 g/L, 80 °D, pH cercano a 4,6). Momento exacto para detener el proceso por enfriamiento.',
        color: '#10b981',
        coagulationState: 'Coagulado Óptimo (Gel Firme)',
      };
    } else {
      return {
        phase: 'over',
        label: 'Sobre-acidificado',
        description: 'Se pasó del tiempo de fermentación. Acidez superior a 0,88% (P > 8,8 g/L). El yogur queda demasiado ácido y tiende a separar suero.',
        color: '#ef4444',
        coagulationState: 'Demasiado Ácido (Riesgo de Sinéresis)',
      };
    }
  };

  // Tabla horaria exacta de la página 5 del PDF (t = 0 a 6 h)
  const hourlyTable: HourlyTableRow[] = [];
  for (let t = 0; t <= 6; t++) {
    const sVal = evalS(t);
    const pVal = evalP(t);
    const dornic = Math.round(pVal * 10);
    const acidezPct = Number((pVal / 10).toFixed(2));
    hourlyTable.push({
      t,
      S: Number(sVal.toFixed(2)),
      P: Number(pVal.toFixed(2)),
      dornic,
      acidezPct,
    });
  }

  // Formatting helper for LaTeX
  const fmt = (n: number, d = 2) => Number(n.toFixed(d)).toString();

  // STEP 1 LATEX (Lactosa) - Direct from PDF p. 3
  const step1Latex = {
    odeLatex: `\\frac{dS}{dt} = -k_1 S`,
    separableLatex: `\\frac{dS}{S} = -k_1 dt`,
    integralLatex: `\\int \\frac{dS}{S} = \\int (-k_1) dt \\implies \\ln S = -k_1 t + C_1`,
    generalLatex: `S = e^{-k_1 t + C_1} = e^{C_1} \\cdot e^{-k_1 t} = C e^{-k_1 t}`,
    particularLatex: `S(0) = S_0 \\implies S_0 = C \\cdot e^0 = C \\implies S(t) = S_0 e^{-k_1 t}`,
    numericLatex: `S(t) = ${fmt(S0)} e^{-${fmt(k1, 2)} t}`,
  };

  // STEP 2 LATEX (Ácido Láctico) - Direct from PDF p. 4
  const step2Latex = {
    odeLatex: `\\frac{dP}{dt} = b k_1 S`,
    substitutionLatex: `\\frac{dP}{dt} = b k_1 S_0 e^{-k_1 t}`,
    integralLatex: `P = b k_1 S_0 \\int e^{-k_1 t} dt = b k_1 S_0 \\left(-\\frac{1}{k_1} e^{-k_1 t}\\right) + C = -b S_0 e^{-k_1 t} + C`,
    particularLatex: `P(0) = 0 \\implies 0 = -b S_0 + C \\implies C = b S_0 \\implies P(t) = b S_0 (1 - e^{-k_1 t})`,
    numericLatex: `b S_0 = (${fmt(b)})(${fmt(S0)}) = ${fmt(bS0)}, \\qquad P(t) = ${fmt(bS0)} (1 - e^{-${fmt(k1, 2)} t})`,
    conservationProofLatex: `P(t) + b S(t) = b S_0 (1 - e^{-k_1 t}) + b (S_0 e^{-k_1 t}) = b S_0 \\equiv ${fmt(bS0)} \\text{ g/L}`,
    modelAssumptionsLatex: `\\text{Parámetros del informe: } S_0 = 50 \\text{ g/L (leche con 45 a 50 g/L de lactosa)}. \\\\
k_1 = 0.06 \\text{ h}^{-1} \\text{ y } b = 0.70 \\text{ g/g son supuestos razonables elegidos para que los resultados sean} \\\\
\\text{coherentes con un yogur real (acidez cercana a 0.9\\% a las 5 h).}`,
  };

  // TARGET CALCULATION LATEX - Direct from PDF p. 5
  const targetRatio = isTargetReachable ? targetP / bS0 : 0;
  const expVal = 1 - targetRatio;
  const lnVal = isTargetReachable ? Math.log(expVal) : 0;

  const targetCalculationLatex = {
    equationLatex: `${fmt(bS0)} (1 - e^{-${fmt(k1, 2)} t}) = ${fmt(targetP)}`,
    stepsLatex: isTargetReachable
      ? `\\begin{aligned}
1 - e^{-${fmt(k1, 2)} t} &= \\frac{${fmt(targetP)}}{${fmt(bS0)}} = ${fmt(targetRatio, 4)} \\\\
e^{-${fmt(k1, 2)} t} &= 1 - ${fmt(targetRatio, 4)} = ${fmt(expVal, 4)} \\\\
\\text{Tomando logaritmo natural:} & \\\\
-${fmt(k1, 2)} t &= \\ln(${fmt(expVal, 4)}) = ${fmt(lnVal, 4)} \\\\
t &= \\frac{${fmt(-lnVal, 4)}}{${fmt(k1, 2)}} \\approx \\mathbf{${fmt(targetTimeHours, 2)} \\text{ h}} \\; (${targetTimeFormatted})
\\end{aligned}`
      : `\\text{Inalcanzable: } P^* = ${fmt(targetP)} \\ge b S_0 = ${fmt(bS0)} \\implies 1 - \\frac{P^*}{b S_0} \\le 0 \\implies \\ln(\\le 0) \\text{ no existe en } \\mathbb{R}.`,
    resultLatex: isTargetReachable
      ? `t^* \\approx ${fmt(targetTimeHours, 2)} \\text{ h} \\quad (${targetTimeFormatted})`
      : `\\text{Meta inalcanzable por límite de sustrato}`,
    consumptionLatex: isTargetReachable
      ? `\\begin{aligned}
S(t^*) &= ${fmt(S0)} e^{-${fmt(k1, 2)} (${fmt(targetTimeHours, 2)})} \\approx \\mathbf{${fmt(targetLactoseRemaining, 1)} \\text{ g/L}} \\\\
\\text{Lactosa consumida:} & \\quad \\approx ${fmt(targetLactoseConsumedPct, 1)}\\% \\text{ de la lactosa inicial.}
\\end{aligned}`
      : `\\text{N/A}`,
  };

  // INTERSECTION LATEX: S(t) = P(t)
  const ratioB = b / (1 + b);
  const ratioInv = (1 + b) / b;
  const intersectionLatex = {
    equationLatex: `S_0 e^{-k_1 t} = b S_0 (1 - e^{-k_1 t})`,
    stepsLatex: `\\begin{aligned}
e^{-k_1 t} &= b - b e^{-k_1 t} \\quad (S_0 \\text{ se cancela}) \\\\
(1 + b) e^{-k_1 t} &= b \\implies e^{-k_1 t} = \\frac{b}{1 + b} = \\frac{${fmt(b, 2)}}{${fmt(1 + b, 2)}} \\approx ${fmt(ratioB, 4)} \\\\
t_{\\text{int}} &= \\frac{1}{k_1} \\ln\\!\\left(\\frac{1 + b}{b}\\right) = \\frac{\\ln(${fmt(ratioInv, 4)})}{${fmt(k1, 2)}} \\approx \\mathbf{${fmt(intersectionTimeHours, 2)} \\text{ h}} \\; (${intersectionTimeFormatted})
\\end{aligned}`,
    concLatex: `S(t_{\\text{int}}) = P(t_{\\text{int}}) = S_0 \\left(\\frac{b}{1 + b}\\right) = ${fmt(S0)}\\left(\\frac{${fmt(b, 2)}}{${fmt(1 + b, 2)}}\\right) \\approx \\mathbf{${fmt(intersectionConc, 2)} \\text{ g/L}} \\; (${intersectionDornic}\\ ^\\circ\\text{D})`,
    ratesLatex: `\\left.\\frac{dS}{dt}\\right|_{t_{\\text{int}}} = ${fmt(intersectionDS_dt, 3)} \\text{ g/(L}\\cdot\\text{h)}, \\qquad \\left.\\frac{dP}{dt}\\right|_{t_{\\text{int}}} = +${fmt(intersectionDP_dt, 3)} \\text{ g/(L}\\cdot\\text{h)}`,
  };

  return {
    params,
    bS0,
    isTargetReachable,
    unreachableReason,
    targetTimeHours,
    targetTimeFormatted,
    targetLactoseRemaining,
    targetLactoseConsumedPct,
    intersectionTimeHours,
    intersectionTimeFormatted,
    intersectionConc,
    intersectionDornic,
    intersectionAcidityPct,
    intersectionConsumedPct,
    intersectionDS_dt,
    intersectionDP_dt,
    halfLifeHours,
    characteristicTimeHours,
    evalS,
    evalP,
    evalDS_dt,
    evalDP_dt,
    evalDornic,
    evalAcidityPct,
    getQualityStatus,
    hourlyTable,
    step1Latex,
    step2Latex,
    targetCalculationLatex,
    intersectionLatex,
  };
}
