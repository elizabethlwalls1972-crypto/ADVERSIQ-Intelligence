/**
 * TEMPORAL ARBITRAGE ENGINE — NSIL v2 Layer 17
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * The Unseen Gap in AI-Assisted Decision Making:
 *
 * Every current AI intelligence system — from commercial tools to academic
 * research platforms — evaluates decisions based on present-state information.
 * They answer: "Is this a good decision NOW?"
 *
 * But markets, geopolitics, and organizational opportunity have a temporal
 * structure. Things valuable in the future are often cheap or ignored today.
 * Things expensive today may be worthless tomorrow.
 *
 * This is TEMPORAL ARBITRAGE: the exploitation of pricing inefficiencies across
 * time horizons that arise from:
 *   1. Attention asymmetry (most actors are present-biased)
 *   2. Information decay rates (different information types depreciate differently)
 *   3. Regime change lag (markets reprice slowly after structural shifts)
 *   4. Narrative priming (stories about the future determine today's prices)
 *   5. Option mispricing (future paths are systematically under/over-valued)
 *
 * No existing intelligence platform has modeled temporal arbitrage as a
 * quantifiable, actionable score. This engine does exactly that.
 *
 * Mathematical Foundations:
 * ─────────────────────────
 * 1. TEMPORAL DISCOUNT CURVE (Robert Shiller's irrational discounting)
 *    Standard DCF uses constant discount rate r.
 *    Behavioral finance shows humans use hyperbolic discounting:
 *    V(t) = V₀ / (1 + k·t) where k is the impatience coefficient
 *    TAI_discount = [rational_PV − behavioral_PV] / rational_PV × 100
 *
 * 2. INFORMATION HALF-LIFE MODEL
 *    Different information types decay at different rates:
 *    I(t) = I₀ · e^(−λt) where λ is the domain-specific decay constant
 *    Slow-decaying information (structural, institutional) is systematically
 *    under-valued by actors focused on fast-moving information.
 *    TAI_info = Σ(slow_decay_info_value × weight) / total_info_value
 *
 * 3. REGIME CHANGE LAG DETECTION
 *    When a structural regime changes (policy, technology, climate),
 *    prices in affected markets re-align with a predictable lag.
 *    TAI_regime = (regime_change_signal_strength × lag_window) / repricing_speed
 *
 * 4. NARRATIVE TIMING INDEX (Shiller's Narrative Economics, 2019)
 *    Economic narratives spread virally and create price movements.
 *    Identifying narratives before they peak = temporal arbitrage.
 *    TAI_narrative = narrative_adoption_rate / narrative_saturation_level
 *
 * 5. OPTION VALUE OF WAITING (McDonald-Siegel Real Options, 1986)
 *    For irreversible investments under uncertainty, the option to wait has value:
 *    OVW = V·N(d1) − I·e^(−r·T)·N(d2)
 *    TAI_option = OVW / (V + I) — normalized option value of waiting vs. acting
 *
 * Formula Output:
 *   TAI™ (Temporal Arbitrage Index) — proprietary score 0–100
 *   TDI™ (Temporal Discount Index) — behavioral vs rational pricing gap
 *
 * @module TemporalArbitrageEngine
 * @version 1.0.0
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TemporalInput {
  /** The decision or investment being analyzed */
  decisionDescription: string;
  /** Domain context */
  domain: string;
  /** Present value / cost of acting NOW */
  presentValue?: number;
  /** Estimated future value (horizon as specified) */
  futureValue?: number;
  /** Time horizon in months */
  horizonMonths?: number;
  /** Current market/environment discount rate (annualized, e.g., 0.08 = 8%) */
  marketDiscountRate?: number;
  /** Structural regime signals (recent policy changes, tech shifts, etc.) */
  regimeSignals?: RegimeSignal[];
  /** Active narratives in the market/domain */
  narrativeSignals?: NarrativeSignal[];
  /** Whether this is an irreversible commitment */
  isIrreversible?: boolean;
  /** Uncertainty about the future value (0–1, where 1 = maximum uncertainty) */
  futureValueUncertainty?: number;
}

export interface RegimeSignal {
  description: string;
  strength: number;    // 0–1: how strong is the structural shift
  lagMonths: number;   // Estimated months before prices fully reflect this
  alreadyPriced: number; // 0–1: how much of this is already in current prices
}

export interface NarrativeSignal {
  narrative: string;
  adoptionLevel: number;  // 0–1: current penetration (0 = emerging, 1 = peak/saturated)
  spreadRate: number;     // 0–1: how fast it's spreading
  economicImpact: number; // 0–1: estimated magnitude of eventual price impact
}

export interface TemporalArbitrageWindow {
  type: 'REGIME_LAG' | 'NARRATIVE_PRIME' | 'HYPERBOLIC_DISCOUNT' | 'INFO_DECAY' | 'OPTION_VALUE';
  description: string;
  opportunityScore: number;  // 0–100: how exploitable is this window
  windowCloseMonths: number; // Estimated months until window closes
  confidence: number;        // 0–1
  actionThreshold: string;   // What triggers the optimal entry
}

export interface TemporalArbitrageReport {
  decisionDescription: string;
  domain: string;
  taiScore: number;              // TAI™ 0–100
  tdiScore: number;              // TDI™ 0–100 (behavioral vs rational gap)
  taiGrade: 'STRONG_ARBITRAGE' | 'MODERATE_ARBITRAGE' | 'NEUTRAL' | 'NEGATIVE_ARBITRAGE';
  optimalActionTiming: 'ACT_NOW' | 'WAIT_3M' | 'WAIT_6M' | 'WAIT_12M' | 'WAIT_INDEFINITE';
  temporalWindows: TemporalArbitrageWindow[];
  discountMispricing: number;    // % gap between rational and behavioral pricing
  informationDecayAdvantage: number; // How much slow-decay info is being missed by market
  regimeLagScore: number;        // Score of unexploited regime change lag
  narrativeTimingScore: number;  // How early in the narrative adoption curve
  optionValueOfWaiting: number;  // Normalized value of not committing yet
  keyInsights: string[];
  risks: string[];
  executionTimeMs: number;
}

// ─── Domain Information Decay Profiles ───────────────────────────────────────
// λ (lambda) = decay constant (higher = information becomes obsolete faster)
// Low λ = structural information (slow decay) = systematically under-priced

interface DomainDecayProfile {
  fastDecayInfo: { type: string; lambda: number }[];  // News, prices, sentiment
  slowDecayInfo: { type: string; lambda: number }[];  // Structure, institutions, culture
  typicalLagMonths: number;       // How long regime changes take to fully reprice
  behavioralImpatience: number;   // k in hyperbolic discount (higher = more impatient)
}

const DOMAIN_DECAY_PROFILES: Record<string, DomainDecayProfile> = {
  finance: {
    fastDecayInfo: [
      { type: 'price data', lambda: 0.85 },
      { type: 'earnings reports', lambda: 0.40 },
      { type: 'analyst forecasts', lambda: 0.55 },
    ],
    slowDecayInfo: [
      { type: 'institutional structure', lambda: 0.05 },
      { type: 'regulatory framework', lambda: 0.08 },
      { type: 'network topology', lambda: 0.06 },
    ],
    typicalLagMonths: 18,
    behavioralImpatience: 0.8,
  },
  technology: {
    fastDecayInfo: [
      { type: 'benchmark scores', lambda: 0.90 },
      { type: 'product announcements', lambda: 0.75 },
      { type: 'GitHub activity', lambda: 0.60 },
    ],
    slowDecayInfo: [
      { type: 'developer ecosystem lock-in', lambda: 0.07 },
      { type: 'technical debt topology', lambda: 0.04 },
      { type: 'learning curve advantage', lambda: 0.06 },
    ],
    typicalLagMonths: 9,
    behavioralImpatience: 0.9,
  },
  government: {
    fastDecayInfo: [
      { type: 'polling data', lambda: 0.70 },
      { type: 'budget announcements', lambda: 0.50 },
      { type: 'election results', lambda: 0.45 },
    ],
    slowDecayInfo: [
      { type: 'institutional legitimacy', lambda: 0.03 },
      { type: 'demographic trajectory', lambda: 0.02 },
      { type: 'constitutional structure', lambda: 0.01 },
    ],
    typicalLagMonths: 36,
    behavioralImpatience: 0.5,
  },
  energy: {
    fastDecayInfo: [
      { type: 'spot prices', lambda: 0.95 },
      { type: 'inventory reports', lambda: 0.80 },
      { type: 'weather forecasts', lambda: 0.98 },
    ],
    slowDecayInfo: [
      { type: 'infrastructure sunk costs', lambda: 0.03 },
      { type: 'learning curve on renewables', lambda: 0.05 },
      { type: 'regulatory pathway certainty', lambda: 0.07 },
    ],
    typicalLagMonths: 24,
    behavioralImpatience: 0.7,
  },
  default: {
    fastDecayInfo: [
      { type: 'current events', lambda: 0.70 },
      { type: 'market prices', lambda: 0.80 },
    ],
    slowDecayInfo: [
      { type: 'structural factors', lambda: 0.05 },
      { type: 'institutional capacity', lambda: 0.06 },
    ],
    typicalLagMonths: 18,
    behavioralImpatience: 0.65,
  },
};

// ─── Core Engine ──────────────────────────────────────────────────────────────

export class TemporalArbitrageEngine {

  /**
   * Full temporal arbitrage analysis.
   * Identifies when and where time-asymmetric pricing creates exploitable windows.
   */
  static analyze(input: TemporalInput): TemporalArbitrageReport {
    const start = Date.now();
    const domain = this.normalizeDomain(input.domain);
    const profile = DOMAIN_DECAY_PROFILES[domain] || DOMAIN_DECAY_PROFILES.default;

    // ── 1: Hyperbolic Discount Gap (TAI_discount) ────────────────────────────
    const discountMispricing = this.computeDiscountMispricing(input, profile);

    // ── 2: Information Decay Advantage (TAI_info) ────────────────────────────
    const infoDecayAdvantage = this.computeInfoDecayAdvantage(input, profile);

    // ── 3: Regime Change Lag (TAI_regime) ────────────────────────────────────
    const regimeLagScore = this.computeRegimeLag(input, profile);

    // ── 4: Narrative Timing Index (TAI_narrative) ────────────────────────────
    const narrativeTimingScore = this.computeNarrativeTiming(input);

    // ── 5: Option Value of Waiting (TAI_option) ───────────────────────────────
    const optionValueOfWaiting = this.computeOptionValue(input, profile);

    // ── TAI™ Composite ────────────────────────────────────────────────────────
    const weights = { discount: 0.25, info: 0.20, regime: 0.25, narrative: 0.15, option: 0.15 };
    const taiScore = Math.min(100, Math.max(0,
      discountMispricing * weights.discount +
      infoDecayAdvantage * weights.info +
      regimeLagScore * weights.regime +
      narrativeTimingScore * weights.narrative +
      optionValueOfWaiting * weights.option
    ));

    // ── TDI™: Behavioral vs Rational pricing gap ─────────────────────────────
    const tdiScore = Math.min(100, discountMispricing * 0.60 + infoDecayAdvantage * 0.40);

    // ── Grade & Timing ────────────────────────────────────────────────────────
    const taiGrade = taiScore >= 70 ? 'STRONG_ARBITRAGE' :
                     taiScore >= 50 ? 'MODERATE_ARBITRAGE' :
                     taiScore >= 35 ? 'NEUTRAL' : 'NEGATIVE_ARBITRAGE';

    const optimalTiming = this.determineOptimalTiming(taiScore, optionValueOfWaiting, input);

    // ── Temporal Windows ──────────────────────────────────────────────────────
    const windows = this.identifyTemporalWindows(input, profile, {
      discountMispricing, infoDecayAdvantage, regimeLagScore, narrativeTimingScore, optionValueOfWaiting
    });

    return {
      decisionDescription: input.decisionDescription,
      domain,
      taiScore: Math.round(taiScore * 10) / 10,
      tdiScore: Math.round(tdiScore * 10) / 10,
      taiGrade,
      optimalActionTiming: optimalTiming,
      temporalWindows: windows,
      discountMispricing: Math.round(discountMispricing * 10) / 10,
      informationDecayAdvantage: Math.round(infoDecayAdvantage * 10) / 10,
      regimeLagScore: Math.round(regimeLagScore * 10) / 10,
      narrativeTimingScore: Math.round(narrativeTimingScore * 10) / 10,
      optionValueOfWaiting: Math.round(optionValueOfWaiting * 10) / 10,
      keyInsights: this.generateInsights(taiScore, windows, input, profile),
      risks: this.generateRisks(taiScore, optionValueOfWaiting, input, profile),
      executionTimeMs: Date.now() - start,
    };
  }

  /** Quick TAI score for pipeline integration */
  static quickScore(input: Partial<TemporalInput>): number {
    const domain = this.normalizeDomain(input.domain || 'default');
    const profile = DOMAIN_DECAY_PROFILES[domain] || DOMAIN_DECAY_PROFILES.default;

    // Estimate from regime signals if provided
    const regimeBoost = (input.regimeSignals || [])
      .filter(s => s.alreadyPriced < 0.5 && s.strength > 0.5)
      .reduce((sum, s) => sum + (s.strength * (1 - s.alreadyPriced) * 30), 0);

    const narrativeBoost = (input.narrativeSignals || [])
      .filter(s => s.adoptionLevel < 0.3) // Early in adoption curve
      .reduce((sum, s) => sum + (s.economicImpact * (1 - s.adoptionLevel) * 20), 0);

    const baseScore = 40 + (1 - profile.behavioralImpatience) * 20;
    return Math.min(100, Math.max(0, baseScore + Math.min(30, regimeBoost) + Math.min(30, narrativeBoost)));
  }

  // ─── Private Computation Functions ───────────────────────────────────────

  private static computeDiscountMispricing(input: TemporalInput, profile: DomainDecayProfile): number {
    const T = (input.horizonMonths || 24) / 12;  // Convert to years
    const PV = input.presentValue || 100;
    const FV = input.futureValue || PV * (1 + (input.marketDiscountRate || 0.10) * T);
    const r = input.marketDiscountRate || 0.10;
    const k = profile.behavioralImpatience;

    // Rational DCF: PV_rational = FV / (1 + r)^T
    const pvRational = FV / Math.pow(1 + r, T);

    // Behavioral hyperbolic: PV_behavioral = FV / (1 + k·T)
    const pvBehavioral = FV / (1 + k * T);

    // Gap: if behavioral < rational, the market is over-discounting the future = arbitrage opportunity
    const gap = (pvRational - pvBehavioral) / pvRational;

    return Math.min(100, Math.max(0, gap * 200)); // Amplify to 0–100 scale
  }

  private static computeInfoDecayAdvantage(input: TemporalInput, profile: DomainDecayProfile): number {
    const T = (input.horizonMonths || 24) / 12;

    // Calculate how much of slow-decay information is still valid at horizon T
    // vs how much fast-decay info has become worthless
    const slowInfoValue = profile.slowDecayInfo.reduce((sum, info) => {
      const remaining = Math.exp(-info.lambda * T);
      return sum + remaining;
    }, 0) / profile.slowDecayInfo.length;

    const fastInfoDecayed = profile.fastDecayInfo.reduce((sum, info) => {
      const decayed = 1 - Math.exp(-info.lambda * T);
      return sum + decayed;
    }, 0) / profile.fastDecayInfo.length;

    // High score = slow info still valid while fast info has decayed = information advantage
    return Math.min(100, (slowInfoValue * 0.6 + fastInfoDecayed * 0.4) * 100);
  }

  private static computeRegimeLag(input: TemporalInput, profile: DomainDecayProfile): number {
    const signals = input.regimeSignals || [];

    if (signals.length === 0) {
      // Estimate baseline from domain typical lag
      return Math.min(100, (profile.typicalLagMonths / 48) * 60); // Normalized
    }

    const unexploitedSignal = signals.reduce((sum, signal) => {
      // Value = strength × unexploited fraction × time remaining before close
      const unexploited = signal.strength * (1 - signal.alreadyPriced);
      const timeScore = Math.min(1, signal.lagMonths / profile.typicalLagMonths);
      return sum + (unexploited * timeScore);
    }, 0);

    return Math.min(100, (unexploitedSignal / signals.length) * 100);
  }

  private static computeNarrativeTiming(input: TemporalInput): number {
    const signals = input.narrativeSignals || [];

    if (signals.length === 0) return 40; // Neutral baseline

    // Early-stage narratives (adoptionLevel < 0.3) with high impact = strong arbitrage
    const score = signals.reduce((sum, sig) => {
      const earlinessBonus = sig.adoptionLevel < 0.3 ? (1 - sig.adoptionLevel) * sig.economicImpact * 100 :
                             sig.adoptionLevel > 0.7 ? -sig.economicImpact * 30 : // Late = negative arbitrage
                             sig.economicImpact * 40;
      return sum + earlinessBonus;
    }, 0) / signals.length;

    return Math.min(100, Math.max(0, score));
  }

  private static computeOptionValue(input: TemporalInput, profile: DomainDecayProfile): number {
    if (!input.isIrreversible) return 30; // Reversible = low option value of waiting

    const T = (input.horizonMonths || 24) / 12;
    const sigma = input.futureValueUncertainty || 0.30;
    const PV = input.presentValue || 100;
    const FV = input.futureValue || PV;
    const r = input.marketDiscountRate || 0.08;

    // Simplified Black-Scholes-Merton option value approximation
    // d1 = [ln(V/I) + (r + σ²/2)·T] / (σ·√T)
    const V = FV;
    const I = PV;
    const d1 = (Math.log(V / I) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T) + 0.001);
    const d2 = d1 - sigma * Math.sqrt(T);

    // N(d1), N(d2) — standard normal CDF approximation
    const N = (x: number) => 0.5 * (1 + this.erf(x / Math.SQRT2));
    const optionValue = V * N(d1) - I * Math.exp(-r * T) * N(d2);

    // Normalize: high option value relative to investment = high TAI option component
    return Math.min(100, Math.max(0, (optionValue / I) * 100));
  }

  // Error function approximation (for N(d) in BSM without importing math libs)
  private static erf(x: number): number {
    const a1 =  0.254829592, a2 = -0.284496736, a3 =  1.421413741;
    const a4 = -1.453152027, a5 =  1.061405429, p  =  0.3275911;
    const sign = x < 0 ? -1 : 1;
    const t = 1.0 / (1.0 + p * Math.abs(x));
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  private static determineOptimalTiming(
    taiScore: number,
    optionValue: number,
    input: TemporalInput
  ): TemporalArbitrageReport['optimalActionTiming'] {
    // High option value of waiting + high TAI = wait for better entry
    if (optionValue > 70 && taiScore > 60) return 'WAIT_6M';
    if (optionValue > 85 && input.isIrreversible) return 'WAIT_12M';
    if (taiScore > 75 && optionValue < 40) return 'ACT_NOW'; // Window closing fast
    if (taiScore > 55) return 'WAIT_3M';
    if (taiScore < 30) return 'WAIT_INDEFINITE';
    return 'ACT_NOW';
  }

  private static identifyTemporalWindows(
    input: TemporalInput,
    profile: DomainDecayProfile,
    scores: { discountMispricing: number; infoDecayAdvantage: number; regimeLagScore: number; narrativeTimingScore: number; optionValueOfWaiting: number }
  ): TemporalArbitrageWindow[] {
    const windows: TemporalArbitrageWindow[] = [];

    if (scores.discountMispricing > 40) {
      windows.push({
        type: 'HYPERBOLIC_DISCOUNT',
        description: `Market participants are systematically over-discounting the ${input.domain} opportunity due to present-bias (behavioral impatience coefficient k=${profile.behavioralImpatience.toFixed(2)}).`,
        opportunityScore: scores.discountMispricing,
        windowCloseMonths: Math.round((input.horizonMonths || 24) * 0.6),
        confidence: 0.75,
        actionThreshold: 'Entry window: when short-term noise peaks and rational players exit temporarily.',
      });
    }

    if (scores.infoDecayAdvantage > 50) {
      windows.push({
        type: 'INFO_DECAY',
        description: `Slow-decay structural information (institutional capacity, regulatory framework) remains valid at the ${input.domain} horizon while most market actors are chasing fast-decaying signals.`,
        opportunityScore: scores.infoDecayAdvantage,
        windowCloseMonths: profile.typicalLagMonths,
        confidence: 0.70,
        actionThreshold: 'Entry window: before mainstream analysts shift attention from short-term metrics to structural factors.',
      });
    }

    if (scores.regimeLagScore > 55) {
      const totalLag = (input.regimeSignals || []).reduce((s, r) => s + r.lagMonths, 0) /
                       ((input.regimeSignals || []).length || 1) || profile.typicalLagMonths;
      windows.push({
        type: 'REGIME_LAG',
        description: `Detected structural regime change signals that are NOT yet fully priced into the market. Estimated ${Math.round(totalLag)} months until full repricing.`,
        opportunityScore: scores.regimeLagScore,
        windowCloseMonths: Math.round(totalLag),
        confidence: 0.65,
        actionThreshold: 'Entry window: before repricing completes. Monitor leading indicators for acceleration.',
      });
    }

    if (scores.narrativeTimingScore > 60) {
      windows.push({
        type: 'NARRATIVE_PRIME',
        description: `One or more economic narratives are in early adoption phase. Narrative prime mover advantage available — acting before narrative saturation locks in superior pricing.`,
        opportunityScore: scores.narrativeTimingScore,
        windowCloseMonths: 12,
        confidence: 0.60,
        actionThreshold: 'Entry window: within the next 2–3 narrative doubling cycles before mainstream media saturation.',
      });
    }

    if (scores.optionValueOfWaiting > 60) {
      windows.push({
        type: 'OPTION_VALUE',
        description: `The option to wait has significant value (McDonald-Siegel real options). Committing now would forfeit this option premium unnecessarily.`,
        opportunityScore: scores.optionValueOfWaiting,
        windowCloseMonths: Math.round((input.horizonMonths || 24) * 0.4),
        confidence: 0.70,
        actionThreshold: 'Entry window: when uncertainty resolves sufficiently to reduce option value below 20% of investment.',
      });
    }

    return windows;
  }

  private static generateInsights(
    taiScore: number,
    windows: TemporalArbitrageWindow[],
    input: TemporalInput,
    profile: DomainDecayProfile
  ): string[] {
    const insights: string[] = [];

    if (taiScore > 65) {
      insights.push(`Strong temporal arbitrage detected: the ${input.domain} market is systematically under-pricing future value with a behavioral impatience coefficient of ${profile.behavioralImpatience.toFixed(2)}.`);
    }

    for (const w of windows.slice(0, 2)) {
      insights.push(w.description);
    }

    insights.push(`Information advantage window: slow-decay structural information in ${input.domain} depreciates at ~${profile.slowDecayInfo[0]?.lambda.toFixed(2) ?? 0.05}λ/year vs fast-decay signals at ~${profile.fastDecayInfo[0]?.lambda.toFixed(2) ?? 0.70}λ/year — a ${Math.round((profile.fastDecayInfo[0]?.lambda ?? 0.70) / (profile.slowDecayInfo[0]?.lambda ?? 0.05))}× information half-life advantage.`);

    return insights.slice(0, 4);
  }

  private static generateRisks(
    taiScore: number,
    optionValue: number,
    input: TemporalInput,
    profile: DomainDecayProfile
  ): string[] {
    const risks: string[] = [];

    risks.push(`Regime change lag risk: estimated ${profile.typicalLagMonths}-month repricing window assumes no exogenous acceleration (crisis, major announcement). Black Swan event could collapse the window instantly.`);

    if (taiScore > 60 && optionValue < 30) {
      risks.push('Temporal arbitrage window appears narrow. Delay in execution risks closing the window — act within 30–60 days.');
    }

    if (input.isIrreversible) {
      risks.push('Irreversible commitment: option value of waiting is permanently forfeited at commitment point. Ensure uncertainty has resolved sufficiently before triggering.');
    }

    risks.push('Narrative timing risk: economic narratives can saturate faster than modeled if social amplification occurs (viral spread, media adoption). Monitor adoption velocity weekly.');

    return risks.slice(0, 3);
  }

  private static normalizeDomain(domain: string): string {
    const d = domain.toLowerCase();
    if (d.includes('tech') || d.includes('software') || d.includes('ai')) return 'technology';
    if (d.includes('fin') || d.includes('bank') || d.includes('invest')) return 'finance';
    if (d.includes('gov') || d.includes('public') || d.includes('policy')) return 'government';
    if (d.includes('energy') || d.includes('power') || d.includes('oil')) return 'energy';
    return 'default';
  }
}
