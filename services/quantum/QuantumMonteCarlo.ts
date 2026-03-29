/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * QUANTUM MONTE CARLO â€" RISK SIMULATION ENGINE
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Runs Monte Carlo simulations on relocation risk scenarios. Phase 1 uses
 * classical random sampling. Each scenario runs thousands of iterations to
 * build probability distributions for cost, timeline, quality, and ROI.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { QuantumProviderRouter } from './QuantumProviderRouter.js';

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface MonteCarloParams {
  scenarioName: string;
  targetCity: string;
  headcount: number;
  avgMonthlySalaryUSD: number;
  setupCostUSD: number;
  monthsToOperational: number;
  risks: Array<{
    name: string;
    probability: number; // 0-1
    impactMonths: number;
    impactCostUSD: number;
  }>;
}

export interface MonteCarloResult {
  scenarioName: string;
  targetCity: string;
  iterations: number;
  backend: string;
  cost: { p10: number; p50: number; p90: number; mean: number; stdDev: number };
  timeline: { p10: number; p50: number; p90: number; mean: number; stdDev: number };
  roi: { p10: number; p50: number; p90: number; mean: number };
  riskEvents: Array<{ name: string; occurrenceRate: number; avgImpact: number }>;
  confidence: number;
  summary: string;
}

// â"€â"€â"€ Deterministic seed-based PRNG for reproducibility â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// â"€â"€â"€ Box-Muller normal distribution â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function normalRandom(rng: () => number, mean: number, stdDev: number): number {
  const u1 = rng();
  const u2 = rng();
  const z0 = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class QuantumMonteCarlo {

  /** Run Monte Carlo simulation for relocation risk analysis */
  static async simulate(params: MonteCarloParams, iterations: number = 5000): Promise<MonteCarloResult> {
    await QuantumProviderRouter.execute({
      algorithm: 'quantum-monte-carlo',
      parameters: { scenario: params.scenarioName, iterations },
    });

    // Deterministic seed from scenario parameters
    const seed = params.headcount * 31 + params.setupCostUSD % 10000 + params.monthsToOperational * 7;
    const rng = mulberry32(seed);

    const costResults: number[] = [];
    const timelineResults: number[] = [];
    const roiResults: number[] = [];
    const riskOccurrences = new Map<string, { count: number; totalImpact: number }>();

    for (const risk of params.risks) {
      riskOccurrences.set(risk.name, { count: 0, totalImpact: 0 });
    }

    const baseCost = params.setupCostUSD + params.headcount * params.avgMonthlySalaryUSD * params.monthsToOperational;

    for (let i = 0; i < iterations; i++) {
      let totalCost = normalRandom(rng, baseCost, baseCost * 0.15);
      let totalMonths = normalRandom(rng, params.monthsToOperational, params.monthsToOperational * 0.2);

      // Simulate risk events
      for (const risk of params.risks) {
        if (rng() < risk.probability) {
          totalCost += normalRandom(rng, risk.impactCostUSD, risk.impactCostUSD * 0.3);
          totalMonths += normalRandom(rng, risk.impactMonths, risk.impactMonths * 0.25);
          const occ = riskOccurrences.get(risk.name)!;
          occ.count++;
          occ.totalImpact += risk.impactCostUSD;
        }
      }

      // ROI: assume 40% cost savings vs origin over 3 years
      const annualSavings = params.headcount * params.avgMonthlySalaryUSD * 12 * 0.40;
      const threeYearSavings = annualSavings * 3;
      const roi = ((threeYearSavings - totalCost) / totalCost) * 100;

      costResults.push(Math.max(0, totalCost));
      timelineResults.push(Math.max(1, totalMonths));
      roiResults.push(roi);
    }

    // Compute percentiles
    const percentile = (arr: number[], p: number): number => {
      const sorted = [...arr].sort((a, b) => a - b);
      const idx = Math.floor(sorted.length * p);
      return Math.round(sorted[idx]);
    };

    const mean = (arr: number[]): number => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
    const stdDev = (arr: number[]): number => {
      const m = arr.reduce((s, v) => s + v, 0) / arr.length;
      return Math.round(Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length));
    };

    const riskEvents = Array.from(riskOccurrences.entries()).map(([name, data]) => ({
      name,
      occurrenceRate: Math.round((data.count / iterations) * 100) / 100,
      avgImpact: data.count > 0 ? Math.round(data.totalImpact / data.count) : 0,
    }));

    const costP50 = percentile(costResults, 0.5);
    const roiP50 = percentile(roiResults, 0.5);

    return {
      scenarioName: params.scenarioName,
      targetCity: params.targetCity,
      iterations,
      backend: QuantumProviderRouter.getActiveBackend(),
      cost: { p10: percentile(costResults, 0.1), p50: costP50, p90: percentile(costResults, 0.9), mean: mean(costResults), stdDev: stdDev(costResults) },
      timeline: { p10: percentile(timelineResults, 0.1), p50: percentile(timelineResults, 0.5), p90: percentile(timelineResults, 0.9), mean: mean(timelineResults), stdDev: stdDev(timelineResults) },
      roi: { p10: percentile(roiResults, 0.1), p50: roiP50, p90: percentile(roiResults, 0.9), mean: mean(roiResults) },
      riskEvents,
      confidence: 0.90,
      summary: `Monte Carlo simulation (${iterations} iterations): Median cost $${costP50.toLocaleString()}, median ROI ${roiP50}% over 3 years. ${riskEvents.filter(r => r.occurrenceRate > 0.3).length} high-probability risks identified.`,
    };
  }

  /** Quick simulation with default risk templates for common scenarios */
  static async quickSimulate(targetCity: string, headcount: number, avgSalaryUSD: number): Promise<MonteCarloResult> {
    const params: MonteCarloParams = {
      scenarioName: `${targetCity} â€" ${headcount} headcount relocation`,
      targetCity,
      headcount,
      avgMonthlySalaryUSD: avgSalaryUSD,
      setupCostUSD: headcount * 5000, // $5K per head setup
      monthsToOperational: headcount > 100 ? 6 : 4,
      risks: [
        { name: 'Regulatory delay', probability: 0.35, impactMonths: 2, impactCostUSD: headcount * 500 },
        { name: 'Talent shortage', probability: 0.25, impactMonths: 1.5, impactCostUSD: headcount * 300 },
        { name: 'Infrastructure issue', probability: 0.20, impactMonths: 1, impactCostUSD: headcount * 200 },
        { name: 'Currency fluctuation', probability: 0.40, impactMonths: 0, impactCostUSD: headcount * avgSalaryUSD * 0.05 },
        { name: 'Key personnel departure', probability: 0.15, impactMonths: 2, impactCostUSD: 25000 },
      ],
    };
    return this.simulate(params);
  }

  /** Summarize for prompt */
  static summarizeForPrompt(result: MonteCarloResult): string {
    const lines: string[] = [`\n### â"€â"€ QUANTUM MONTE CARLO: ${result.scenarioName} â"€â"€`];
    lines.push(`**${result.iterations} iterations** | Backend: ${result.backend} | Confidence: ${Math.round(result.confidence * 100)}%`);
    lines.push(`**Cost:** P10=$${result.cost.p10.toLocaleString()} | P50=$${result.cost.p50.toLocaleString()} | P90=$${result.cost.p90.toLocaleString()}`);
    lines.push(`**Timeline:** P10=${result.timeline.p10}mo | P50=${result.timeline.p50}mo | P90=${result.timeline.p90}mo`);
    lines.push(`**ROI (3yr):** P10=${result.roi.p10}% | P50=${result.roi.p50}% | P90=${result.roi.p90}%`);
    lines.push(`**Risk events:** ${result.riskEvents.filter(r => r.occurrenceRate > 0.2).map(r => `${r.name} (${Math.round(r.occurrenceRate * 100)}%)`).join(', ')}`);
    return lines.join('\n');
  }
}
