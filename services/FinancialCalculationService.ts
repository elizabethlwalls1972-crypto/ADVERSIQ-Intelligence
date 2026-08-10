// ─────────────────────────────────────────────────────────────────────────────
// FinancialCalculationService.ts  -  Reusable NPV / IRR / payback / WACC engine
// ─────────────────────────────────────────────────────────────────────────────
// Fills the gap identified in the codebase audit: no dedicated financial
// calculation service existed.  This provides production-grade implementations
// of Net Present Value, Internal Rate of Return (Newton-Raphson), Weighted
// Average Cost of Capital, payback period, and multi-scenario projection,
// all consumable from BrainIntegrationService and any component.
// ─────────────────────────────────────────────────────────────────────────────

export interface CashFlowSeries {
  /** Year-0 is the initial investment (typically negative) */
  cashFlows: number[];
  /** Label for the series (e.g. "Base Case") */
  label?: string;
}

export interface NPVResult {
  npv: number;
  discountRate: number;
  cashFlows: number[];
  presentValues: number[];
}

export interface IRRResult {
  irr: number;           // decimal (0.12 = 12 %)
  irrPercent: number;    // 12.0
  converged: boolean;
  iterations: number;
}

export interface PaybackResult {
  /** Simple payback in years (undiscounted) */
  simplePaybackYears: number;
  /** Discounted payback in years */
  discountedPaybackYears: number;
  /** Whether payback is achieved within the horizon */
  achieved: boolean;
}

export interface ScenarioProjection {
  label: string;
  revenueByYear: number[];
  profitByYear: number[];
  cumulativeCashFlow: number[];
  npv: number;
  irr: IRRResult;
  payback: PaybackResult;
  returnMultiple: number;
}

export interface FinancialSnapshot {
  npv: NPVResult;
  irr: IRRResult;
  payback: PaybackResult;
  wacc: number | null;
  scenarios: {
    base: ScenarioProjection;
    downside: ScenarioProjection;
    upside: ScenarioProjection;
  };
  sensitivityDrivers: Array<{
    driver: string;
    baseIRR: number;
    stressedIRR: number;
    deltaPercent: number;
  }>;
  computedAt: string;
}

export class FinancialCalculationService {

  // ── NPV ──────────────────────────────────────────────────────────────────

  /**
   * Calculate Net Present Value for a series of cash flows.
   * cashFlows[0] = year-0 (typically negative investment).
   */
  static calculateNPV(cashFlows: number[], discountRate: number): NPVResult {
    const rate = Math.max(discountRate, 0);
    const presentValues = cashFlows.map((cf, t) => cf / Math.pow(1 + rate, t));
    const npv = presentValues.reduce((sum, pv) => sum + pv, 0);
    return { npv, discountRate: rate, cashFlows, presentValues };
  }

  // ── IRR (Newton-Raphson) ────────────────────────────────────────────────

  /**
   * Calculate Internal Rate of Return using Newton-Raphson iteration.
   * Much more robust than the fixed-step method previously in MultiScenarioPlanner.
   */
  static calculateIRR(cashFlows: number[], guess: number = 0.10, maxIter: number = 200, tolerance: number = 1e-7): IRRResult {
    let rate = guess;

    for (let i = 0; i < maxIter; i++) {
      let npv = 0;
      let dNpv = 0; // derivative of NPV w.r.t. rate

      for (let t = 0; t < cashFlows.length; t++) {
        const discountFactor = Math.pow(1 + rate, t);
        npv += cashFlows[t] / discountFactor;
        if (t > 0) {
          dNpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
        }
      }

      if (Math.abs(npv) < tolerance) {
        return { irr: rate, irrPercent: +(rate * 100).toFixed(2), converged: true, iterations: i + 1 };
      }

      if (Math.abs(dNpv) < 1e-15) {
        // derivative too small - try bisection fallback
        return this.calculateIRRBisection(cashFlows, maxIter, tolerance);
      }

      rate = rate - npv / dNpv;

      // Guard against divergence
      if (rate < -0.99) rate = -0.99;
      if (rate > 10) rate = 10;
    }

    // Fall back to bisection if Newton didn't converge
    return this.calculateIRRBisection(cashFlows, maxIter, tolerance);
  }

  /** Bisection fallback for IRR when Newton-Raphson fails to converge */
  private static calculateIRRBisection(cashFlows: number[], maxIter: number, tolerance: number): IRRResult {
    let lo = -0.99;
    let hi = 10.0;

    const npvAt = (r: number) => cashFlows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0);

    for (let i = 0; i < maxIter; i++) {
      const mid = (lo + hi) / 2;
      const val = npvAt(mid);
      if (Math.abs(val) < tolerance) {
        return { irr: mid, irrPercent: +(mid * 100).toFixed(2), converged: true, iterations: i + 1 };
      }
      if (npvAt(lo) * val < 0) {
        hi = mid;
      } else {
        lo = mid;
      }
    }

    const mid = (lo + hi) / 2;
    return { irr: mid, irrPercent: +(mid * 100).toFixed(2), converged: false, iterations: maxIter };
  }

  // ── Payback Period ──────────────────────────────────────────────────────

  /**
   * Simple and discounted payback period (years).
   * cashFlows[0] is year-0 investment (negative).
   */
  static calculatePayback(cashFlows: number[], discountRate: number): PaybackResult {
    // Simple payback
    let cumulative = 0;
    let simplePayback = cashFlows.length;
    for (let t = 0; t < cashFlows.length; t++) {
      cumulative += cashFlows[t];
      if (cumulative >= 0 && t > 0) {
        // Interpolate within the year
        const prevCum = cumulative - cashFlows[t];
        simplePayback = t - 1 + Math.abs(prevCum) / cashFlows[t];
        break;
      }
    }

    // Discounted payback
    let discCumulative = 0;
    let discPayback = cashFlows.length;
    let achieved = false;
    for (let t = 0; t < cashFlows.length; t++) {
      const pv = cashFlows[t] / Math.pow(1 + discountRate, t);
      discCumulative += pv;
      if (discCumulative >= 0 && t > 0) {
        const prevPV = discCumulative - pv;
        discPayback = t - 1 + Math.abs(prevPV) / pv;
        achieved = true;
        break;
      }
    }

    return {
      simplePaybackYears: +simplePayback.toFixed(2),
      discountedPaybackYears: +discPayback.toFixed(2),
      achieved,
    };
  }

  // ── WACC ────────────────────────────────────────────────────────────────

  /**
   * Weighted Average Cost of Capital.
   * @param equityWeight  fraction of equity (0-1)
   * @param costOfEquity  expected return (decimal)
   * @param debtWeight    fraction of debt (0-1)
   * @param costOfDebt    interest rate (decimal)
   * @param taxRate       corporate tax rate (decimal)
   */
  static calculateWACC(
    equityWeight: number,
    costOfEquity: number,
    debtWeight: number,
    costOfDebt: number,
    taxRate: number,
  ): number {
    return equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - taxRate);
  }

  // ── Multi-Scenario Projection ───────────────────────────────────────────

  /**
   * Project a 5-year scenario from base assumptions.
   */
  static projectScenario(
    label: string,
    capitalInvestment: number,
    baseRevenue: number,
    growthRate: number,
    operatingMargin: number,
    discountRate: number,
  ): ScenarioProjection {
    const years = 5;
    const revenueByYear: number[] = [];
    const profitByYear: number[] = [];
    const cashFlows: number[] = [-capitalInvestment];

    for (let y = 1; y <= years; y++) {
      const rev = baseRevenue * Math.pow(1 + growthRate, y);
      const profit = rev * operatingMargin;
      revenueByYear.push(+rev.toFixed(0));
      profitByYear.push(+profit.toFixed(0));
      cashFlows.push(+profit.toFixed(0));
    }

    const cumulativeCashFlow: number[] = [];
    let running = -capitalInvestment;
    cumulativeCashFlow.push(running);
    for (const p of profitByYear) {
      running += p;
      cumulativeCashFlow.push(+running.toFixed(0));
    }

    const npvResult = this.calculateNPV(cashFlows, discountRate);
    const irrResult = this.calculateIRR(cashFlows);
    const payback = this.calculatePayback(cashFlows, discountRate);
    const totalCashReturned = profitByYear.reduce((s, p) => s + p, 0);
    const returnMultiple = capitalInvestment > 0 ? +(totalCashReturned / capitalInvestment).toFixed(2) : 0;

    return {
      label,
      revenueByYear,
      profitByYear,
      cumulativeCashFlow,
      npv: npvResult.npv,
      irr: irrResult,
      payback,
      returnMultiple,
    };
  }

  // ── Sensitivity Analysis ────────────────────────────────────────────────

  /**
   * Compute how a +/- 10 % shift in each driver changes IRR.
   */
  static sensitivityAnalysis(
    baseCashFlows: number[],
    drivers: Array<{ name: string; affectedYears: number[]; magnitude: number }>,
  ): Array<{ driver: string; baseIRR: number; stressedIRR: number; deltaPercent: number }> {
    const baseIRR = this.calculateIRR(baseCashFlows).irrPercent;
    return drivers.map(d => {
      const stressed = [...baseCashFlows];
      for (const y of d.affectedYears) {
        if (y >= 0 && y < stressed.length) {
          stressed[y] *= (1 - d.magnitude * 0.10);
        }
      }
      const stressedIRR = this.calculateIRR(stressed).irrPercent;
      return {
        driver: d.name,
        baseIRR,
        stressedIRR,
        deltaPercent: +(stressedIRR - baseIRR).toFixed(2),
      };
    });
  }

  // ── Full Financial Snapshot ─────────────────────────────────────────────

  /**
   * Build a complete financial snapshot for a deal/project.
   * This is the main entry point consumed by BrainIntegrationService.
   */
  static computeSnapshot(params: {
    capitalInvestment: number;
    baseRevenue: number;
    growthRate: number;          // decimal, e.g. 0.15 = 15 %
    operatingMargin: number;     // decimal, e.g. 0.25 = 25 %
    discountRate: number;        // decimal, e.g. 0.10 = 10 %
    downsideRevenueImpact?: number;  // fraction reduction, e.g. 0.30 = 30 % lower
    upsideRevenueImpact?: number;    // fraction increase, e.g. 0.20 = 20 % higher
  }): FinancialSnapshot {
    const {
      capitalInvestment,
      baseRevenue,
      growthRate,
      operatingMargin,
      discountRate,
      downsideRevenueImpact = 0.30,
      upsideRevenueImpact = 0.20,
    } = params;

    // Base case
    const base = this.projectScenario('Base Case', capitalInvestment, baseRevenue, growthRate, operatingMargin, discountRate);

    // Downside: lower revenue growth
    const downGrowth = growthRate * (1 - downsideRevenueImpact);
    const downMargin = operatingMargin * (1 - downsideRevenueImpact * 0.5);
    const downside = this.projectScenario('Downside', capitalInvestment, baseRevenue, downGrowth, downMargin, discountRate);

    // Upside: higher revenue growth
    const upGrowth = growthRate * (1 + upsideRevenueImpact);
    const upMargin = Math.min(operatingMargin * (1 + upsideRevenueImpact * 0.3), 0.60);
    const upside = this.projectScenario('Upside', capitalInvestment, baseRevenue, upGrowth, upMargin, discountRate);

    // Build base cash flows for NPV/IRR
    const baseCashFlows = [-capitalInvestment, ...base.profitByYear];
    const npv = this.calculateNPV(baseCashFlows, discountRate);
    const irr = this.calculateIRR(baseCashFlows);
    const payback = this.calculatePayback(baseCashFlows, discountRate);

    // Sensitivity
    const sensitivityDrivers = this.sensitivityAnalysis(baseCashFlows, [
      { name: 'Revenue Growth', affectedYears: [1, 2, 3, 4, 5], magnitude: 1.0 },
      { name: 'Operating Margin', affectedYears: [1, 2, 3, 4, 5], magnitude: 0.8 },
      { name: 'Capital Investment', affectedYears: [0], magnitude: 1.5 },
      { name: 'Market Conditions', affectedYears: [2, 3, 4], magnitude: 0.6 },
    ]);

    // WACC estimate (typical emerging-market project)
    const wacc = this.calculateWACC(0.60, 0.14, 0.40, 0.06, 0.25);

    return {
      npv,
      irr,
      payback,
      wacc,
      scenarios: { base, downside, upside },
      sensitivityDrivers,
      computedAt: new Date().toISOString(),
    };
  }

  // ── Prompt formatting ───────────────────────────────────────────────────

  static formatForPrompt(snapshot: FinancialSnapshot): string {
    const lines: string[] = [
      '### FINANCIAL ANALYSIS ENGINE',
      `NPV: $${(snapshot.npv.npv / 1_000_000).toFixed(2)}M @ ${(snapshot.npv.discountRate * 100).toFixed(1)}% discount`,
      `IRR: ${snapshot.irr.irrPercent}%${snapshot.irr.converged ? '' : ' (approx)'}`,
      `Payback: ${snapshot.payback.simplePaybackYears}yr simple / ${snapshot.payback.discountedPaybackYears}yr discounted`,
      `WACC: ${snapshot.wacc !== null ? (snapshot.wacc * 100).toFixed(1) + '%' : 'N/A'}`,
      '',
      '**Scenarios**:',
      `  Base: NPV $${(snapshot.scenarios.base.npv / 1_000_000).toFixed(2)}M | IRR ${snapshot.scenarios.base.irr.irrPercent}% | ${snapshot.scenarios.base.returnMultiple}x`,
      `  Downside: NPV $${(snapshot.scenarios.downside.npv / 1_000_000).toFixed(2)}M | IRR ${snapshot.scenarios.downside.irr.irrPercent}%`,
      `  Upside: NPV $${(snapshot.scenarios.upside.npv / 1_000_000).toFixed(2)}M | IRR ${snapshot.scenarios.upside.irr.irrPercent}%`,
      '',
      '**Sensitivity** (IRR delta per 10% stress):',
      ...snapshot.sensitivityDrivers.map(d => `  ${d.driver}: ${d.deltaPercent > 0 ? '+' : ''}${d.deltaPercent}pp`),
    ];
    return lines.join('\n');
  }
}
