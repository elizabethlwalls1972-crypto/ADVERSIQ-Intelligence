
export class ConfidenceCalibrationEngine {
  // Platt-style logistic calibration on a held-out correctness signal.
  calibrate(raw: number, temperature = 1.5): number {
    const z = (raw - 0.5) / temperature;
    return 1 / (1 + Math.exp(-z));
  }
  // Brier score for forecast evaluation.
  brier(forecast: number, actual: 0 | 1): number { return Math.pow(forecast - actual, 2); }
  reliabilityBins(forecasts: { f: number; a: 0|1 }[]): { bin: string; accuracy: number }[] {
    const bins: Record<string, {n:number; s:number}> = {};
    for (const { f, a } of forecasts) { const b = Math.floor(f * 10) / 10; bins[b] = bins[b] || { n: 0, s: 0 }; bins[b].n++; bins[b].s += a; }
    return Object.entries(bins).map(([b, v]) => ({ bin: b, accuracy: v.s / v.n }));
  }
}
export default ConfidenceCalibrationEngine;
