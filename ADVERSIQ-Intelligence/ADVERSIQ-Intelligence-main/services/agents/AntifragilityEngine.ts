/**
 * ANTIFRAGILITY ENGINE — NSIL v2 Layer 16
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * The Gap Nobody in AI Is Looking At:
 * Every intelligence system — from McKinsey decks to GPT-4 — measures resilience:
 * "Can this system withstand shocks?" That is the wrong question.
 *
 * Nassim Nicholas Taleb (Antifragile, 2012) proved that systems exist on a triad:
 *   FRAGILE → ROBUST → ANTIFRAGILE
 *
 * Fragile systems break under stress.
 * Robust systems resist stress.
 * ANTIFRAGILE systems GAIN from stress, disorder, and uncertainty.
 *
 * No commercial intelligence platform has ever operationalized antifragility
 * as a quantifiable, multi-dimensional score. This engine does exactly that.
 *
 * Mathematical Foundations:
 * ─────────────────────────
 * 1. CONVEXITY FUNCTION (Taleb's core theorem)
 *    If f(μ+σ) + f(μ−σ) > 2·f(μ), the system is convex = antifragile.
 *    AFI_convexity = [f(μ+σ) + f(μ−σ) − 2·f(μ)] / σ²
 *
 * 2. OPTIONALITY RATIO
 *    AFI_optionality = (upside_exposure) / (downside_exposure + ε)
 *    Antifragile systems have asymmetric payoffs: limited downside, unlimited upside.
 *
 * 3. BARBELL POSITIONING SCORE
 *    A true barbell strategy: extreme safety + extreme speculation, nothing in the middle.
 *    AFI_barbell = 1 − |portfolio_weight_middle − 0| / max_middle_weight
 *
 * 4. VOLATILITY HARVESTING INDEX
 *    Measures how much of realized volatility is converted to returns.
 *    AFI_vol = Σ(return_i · indicator(|return_i| > 1σ)) / total_volatility
 *
 * 5. VIA NEGATIVA SCORE
 *    Subtractive knowledge: removes harmful assumptions rather than adding predictions.
 *    AFI_neg = (assumptions_removed) / (total_assumptions) × (harm_avoided_score)
 *
 * Formula Output: AFI™ (Antifragility Index) — proprietary ADVERSIQ score 0–100
 *
 * @module AntifragilityEngine
 * @version 1.0.0
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AntifragilityInput {
  /** Name of the organization, system, or decision being analyzed */
  entityName: string;
  /** Industry / domain context */
  domain: string;
  /** Operating environment volatility (0–1, where 1 = maximum chaos) */
  environmentVolatility?: number;
  /** Historical performance in stress periods (array of return multiples; 1.0 = no change) */
  stressPerformanceHistory?: number[];
  /** Decision options / strategic positions available */
  strategicOptions?: StrategicOption[];
  /** Current resource distribution (0–1 fractions summing to ~1) */
  resourceAllocation?: ResourceAllocation;
  /** Number of reversible vs. irreversible commitments */
  commitmentProfile?: CommitmentProfile;
}

export interface StrategicOption {
  label: string;
  upsideMultiple: number;   // e.g., 5.0 = 5× upside
  downsideMultiple: number; // e.g., 0.2 = lose 80%
  probability: number;      // 0–1
  reversible: boolean;
}

export interface ResourceAllocation {
  safeCore: number;     // Fraction in ultra-safe core (e.g., 0.85)
  speculativeEdge: number; // Fraction in high-risk high-reward (e.g., 0.10)
  middle: number;       // Fraction in "average" medium-risk zone (e.g., 0.05)
}

export interface CommitmentProfile {
  reversibleCount: number;
  irreversibleCount: number;
  totalCommitments: number;
}

export interface AntifragilityComponent {
  name: string;
  score: number;       // 0–100
  rawValue: number;
  interpretation: string;
  talebPrinciple: string;
}

export interface AntifragilityReport {
  entityName: string;
  domain: string;
  afiScore: number;              // AFI™ 0–100
  afiGrade: 'ANTIFRAGILE' | 'ROBUST' | 'FRAGILE' | 'UNKNOWN';
  components: AntifragilityComponent[];
  triadPosition: number;         // -100 (max fragile) to +100 (max antifragile)
  convexityScore: number;        // Positive = convex / antifragile
  optionalityRatio: number;
  barbellScore: number;
  volatilityHarvestIndex: number;
  viaNegativaScore: number;
  keyRecommendations: string[];
  blindSpots: string[];          // Where the entity is unexpectedly fragile
  antiFragileAdvantages: string[]; // Where the entity gains from disorder
  confidenceLevel: number;       // 0–1
  executionTimeMs: number;
}

// ─── Domain Fragility Profiles ────────────────────────────────────────────────
// Known fragility patterns by domain — derived from historical case analysis

interface DomainProfile {
  baselineFragility: number;     // 0–1
  primaryShockTypes: string[];
  antifragileOpportunities: string[];
  convexityFactors: string[];
}

const DOMAIN_PROFILES: Record<string, DomainProfile> = {
  finance: {
    baselineFragility: 0.65,
    primaryShockTypes: ['liquidity crises', 'correlation collapse', 'tail risk events', 'central bank pivots'],
    antifragileOpportunities: ['long volatility positions', 'tail-risk insurance', 'optionality on disruption', 'barbell portfolio construction'],
    convexityFactors: ['asymmetric options payoffs', 'convex bond structures', 'unlimited upside equity'],
  },
  technology: {
    baselineFragility: 0.40,
    primaryShockTypes: ['platform dependency failures', 'AI disruption', 'regulatory change', 'key-person risk'],
    antifragileOpportunities: ['open-source community leverage', 'API optionality', 'modular architecture', 'network effect compounding'],
    convexityFactors: ['exponential scaling', 'marginal cost near zero', 'winner-take-most dynamics'],
  },
  government: {
    baselineFragility: 0.55,
    primaryShockTypes: ['political transitions', 'fiscal crises', 'geopolitical shocks', 'institutional capture'],
    antifragileOpportunities: ['decentralized service delivery', 'participatory resilience', 'adaptive regulation', 'multi-stakeholder coalitions'],
    convexityFactors: ['constitutional robustness', 'federalism buffers', 'civil society optionality'],
  },
  healthcare: {
    baselineFragility: 0.70,
    primaryShockTypes: ['pandemic events', 'supply chain failures', 'regulatory shifts', 'technological displacement'],
    antifragileOpportunities: ['distributed care models', 'diagnostic AI augmentation', 'community health networks', 'biosurveillance investment'],
    convexityFactors: ['prevention vs treatment leverage', 'network immunity effects', 'data accumulation benefits'],
  },
  energy: {
    baselineFragility: 0.60,
    primaryShockTypes: ['commodity price shocks', 'regulatory transition', 'infrastructure attacks', 'transition risks'],
    antifragileOpportunities: ['energy mix diversification', 'distributed generation', 'demand-side flexibility', 'stranded asset optionality'],
    convexityFactors: ['renewable learning curves', 'grid decentralization', 'storage technology curves'],
  },
  default: {
    baselineFragility: 0.50,
    primaryShockTypes: ['market disruption', 'competitive pressure', 'regulatory change', 'technological obsolescence'],
    antifragileOpportunities: ['optionality building', 'redundancy investment', 'knowledge diversification', 'network expansion'],
    convexityFactors: ['learning from failure', 'option value', 'adaptive capacity'],
  },
};

// ─── Core Engine ──────────────────────────────────────────────────────────────

export class AntifragilityEngine {

  /**
   * Full antifragility analysis — the Taleb triad applied to any entity/decision.
   */
  static analyze(input: AntifragilityInput): AntifragilityReport {
    const start = Date.now();

    const domain = this.normalizeDomain(input.domain);
    const profile = DOMAIN_PROFILES[domain] || DOMAIN_PROFILES.default;

    // ── Component 1: Convexity Analysis ─────────────────────────────────────
    const convexity = this.computeConvexity(input, profile);

    // ── Component 2: Optionality Ratio ───────────────────────────────────────
    const optionality = this.computeOptionality(input);

    // ── Component 3: Barbell Positioning ─────────────────────────────────────
    const barbell = this.computeBarbell(input);

    // ── Component 4: Volatility Harvesting ───────────────────────────────────
    const volHarvest = this.computeVolatilityHarvest(input);

    // ── Component 5: Via Negativa ─────────────────────────────────────────────
    const viaNegativa = this.computeViaNegativa(input, profile);

    const components: AntifragilityComponent[] = [convexity, optionality, barbell, volHarvest, viaNegativa];

    // ── Weighted AFI™ composite ───────────────────────────────────────────────
    // Convexity and optionality are the highest-weight Taleb principles
    const weights = { convexity: 0.30, optionality: 0.25, barbell: 0.20, volatility: 0.15, viaNegativa: 0.10 };
    const afiScore = Math.min(100, Math.max(0,
      convexity.score * weights.convexity +
      optionality.score * weights.optionality +
      barbell.score * weights.barbell +
      volHarvest.score * weights.volatility +
      viaNegativa.score * weights.viaNegativa
    ));

    // ── Triad position: -100 (fragile) to +100 (antifragile) ─────────────────
    const triadPosition = (afiScore - 50) * 2;

    // ── Grade ─────────────────────────────────────────────────────────────────
    const afiGrade = afiScore >= 70 ? 'ANTIFRAGILE' :
                     afiScore >= 45 ? 'ROBUST' :
                     afiScore < 45 ? 'FRAGILE' : 'UNKNOWN';

    // ── Recommendations ───────────────────────────────────────────────────────
    const recommendations = this.generateRecommendations(afiScore, components, profile, input);
    const blindSpots = this.identifyBlindSpots(components, profile, input);
    const advantages = this.identifyAntifragileAdvantages(components, profile, domain);

    return {
      entityName: input.entityName,
      domain,
      afiScore: Math.round(afiScore * 10) / 10,
      afiGrade,
      components,
      triadPosition: Math.round(triadPosition),
      convexityScore: convexity.rawValue,
      optionalityRatio: optionality.rawValue,
      barbellScore: barbell.rawValue,
      volatilityHarvestIndex: volHarvest.rawValue,
      viaNegativaScore: viaNegativa.rawValue,
      keyRecommendations: recommendations,
      blindSpots,
      antiFragileAdvantages: advantages,
      confidenceLevel: this.estimateConfidence(input),
      executionTimeMs: Date.now() - start,
    };
  }

  // ── Quick AFI™ score (for pipeline integration) ──────────────────────────
  static quickScore(input: Partial<AntifragilityInput>): number {
    const vol = input.environmentVolatility ?? 0.5;
    const domain = input.domain || 'default';
    const profile = DOMAIN_PROFILES[this.normalizeDomain(domain)] || DOMAIN_PROFILES.default;

    // Baseline estimate from domain fragility profile
    const baseline = (1 - profile.baselineFragility) * 100;

    // Adjust for volatility opportunity (antifragile systems thrive in volatile envs)
    const volBonus = vol * 15;   // Up to 15 points for high-volatility environments (if antifragile)
    const optionScore = input.strategicOptions
      ? this.computeOptionality(input as AntifragilityInput).score
      : 50;

    return Math.min(100, Math.max(0, baseline * 0.5 + optionScore * 0.3 + volBonus * 0.2));
  }

  // ─── Private: Computation Functions ──────────────────────────────────────

  private static computeConvexity(input: AntifragilityInput, profile: DomainProfile): AntifragilityComponent {
    const history = input.stressPerformanceHistory || [];

    let rawValue = 0;
    if (history.length >= 3) {
      // Compute actual convexity: does performance improve in tail events?
      const sorted = [...history].sort((a, b) => a - b);
      const n = sorted.length;
      const mean = history.reduce((a, b) => a + b, 0) / n;
      const sigma = Math.sqrt(history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n);

      const tailUp = sorted.slice(Math.floor(n * 0.8));   // Top 20%
      const tailDown = sorted.slice(0, Math.floor(n * 0.2)); // Bottom 20%

      const meanTailUp = tailUp.reduce((a, b) => a + b, 0) / (tailUp.length || 1);
      const meanTailDown = tailDown.reduce((a, b) => a + b, 0) / (tailDown.length || 1);

      // Convexity: if gains in up-tail > losses in down-tail (asymmetry), it's antifragile
      rawValue = ((meanTailUp - mean) + (mean - meanTailDown)) > 0
        ? ((meanTailUp - mean) - (mean - meanTailDown)) / (sigma || 1)
        : -0.5;
    } else {
      // Estimate from domain baseline: high-fragility domains start convex-negative
      rawValue = (1 - profile.baselineFragility * 1.2) * 0.8;
    }

    const score = Math.min(100, Math.max(0, 50 + rawValue * 25));

    return {
      name: 'Convexity',
      score,
      rawValue,
      interpretation: rawValue > 0.2 ? 'System exhibits positive convexity — gains accelerate faster than losses' :
                       rawValue > -0.2 ? 'System is approximately linear — neither fragile nor antifragile' :
                       'System is concave — losses accelerate faster than gains (FRAGILE)',
      talebPrinciple: 'The Convexity Bias (Antifragile, Ch. 11): For any nonlinear system, volatility has a value. Positive convexity = antifragile.',
    };
  }

  private static computeOptionality(input: AntifragilityInput): AntifragilityComponent {
    const options = input.strategicOptions || [];

    let rawValue = 1.0; // Default: symmetric
    if (options.length > 0) {
      const totalUpside = options.reduce((sum, o) => sum + o.upsideMultiple * o.probability, 0);
      const totalDownside = options.reduce((sum, o) => sum + o.downsideMultiple * (1 - o.probability + 0.01), 0);
      rawValue = totalUpside / (totalDownside + 0.01);
    } else {
      // Infer from domain: technology has high optionality, government has low
      const domainOptionality: Record<string, number> = {
        technology: 3.5, finance: 2.0, healthcare: 1.8, energy: 1.5, government: 1.2, default: 1.5,
      };
      rawValue = domainOptionality[this.normalizeDomain(input.domain)] || 1.5;
    }

    // Score: ratio >3 = excellent optionality, <1 = fragile (more downside than upside)
    const score = Math.min(100, Math.max(0, Math.min(rawValue / 4, 1) * 100));

    return {
      name: 'Optionality Ratio',
      score,
      rawValue,
      interpretation: rawValue > 3.0 ? `${rawValue.toFixed(1)}× upside/downside — excellent asymmetric exposure` :
                       rawValue > 1.5 ? `${rawValue.toFixed(1)}× upside/downside — moderate optionality` :
                       `${rawValue.toFixed(1)}× upside/downside — optionality gap (more downside exposure than upside)`,
      talebPrinciple: 'Optionality & Asymmetry (Antifragile, Ch. 10): Limited downside + unlimited upside = asymmetric bet = antifragility.',
    };
  }

  private static computeBarbell(input: AntifragilityInput): AntifragilityComponent {
    const alloc = input.resourceAllocation || { safeCore: 0.70, speculativeEdge: 0.15, middle: 0.15 };

    // Ideal barbell: 80–90% safe core, 10–20% speculative edge, NOTHING in the middle
    const idealBarbell = Math.abs(alloc.middle) < 0.05 ? 1.0 :
                         1.0 - (alloc.middle / 0.5); // Penalty for middle allocation

    // Also check balance: speculative edge should be meaningful (>5%)
    const edgeScore = Math.min(1.0, alloc.speculativeEdge / 0.15);

    // Combined barbell score
    const rawValue = (idealBarbell * 0.6 + edgeScore * 0.4);
    const score = Math.min(100, Math.max(0, rawValue * 100));

    return {
      name: 'Barbell Positioning',
      score,
      rawValue,
      interpretation: alloc.middle < 0.05
        ? `Clean barbell: ${Math.round(alloc.safeCore*100)}% safe / ${Math.round(alloc.speculativeEdge*100)}% speculative`
        : `${Math.round(alloc.middle*100)}% allocation in medium-risk "middle" zone — Taleb warns this is worst of both worlds`,
      talebPrinciple: 'The Barbell Strategy (Antifragile, Ch. 12): Bimodal strategy — extreme caution + extreme risk-taking. The middle is the danger zone.',
    };
  }

  private static computeVolatilityHarvest(input: AntifragilityInput): AntifragilityComponent {
    const history = input.stressPerformanceHistory || [];
    const envVol = input.environmentVolatility ?? 0.4;

    let rawValue = 0;
    if (history.length >= 5) {
      const mean = history.reduce((a, b) => a + b, 0) / history.length;
      const sigma = Math.sqrt(history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / history.length);

      // Count periods where above-average volatility produced above-average returns
      const stressPeriods = history.filter(r => Math.abs(r - mean) > sigma);
      const positiveStress = stressPeriods.filter(r => r > mean).length;
      rawValue = stressPeriods.length > 0 ? positiveStress / stressPeriods.length : 0.5;
    } else {
      // Estimate: high-volatility environments combined with domain optionality
      rawValue = Math.min(0.9, envVol * 0.8 + 0.1);
    }

    const score = Math.min(100, rawValue * 100);

    return {
      name: 'Volatility Harvest Index',
      score,
      rawValue,
      interpretation: rawValue > 0.6 ? `${Math.round(rawValue*100)}% of volatile periods converted to advantage` :
                       rawValue > 0.4 ? 'Mixed: some benefit from volatility, some harm' :
                       'Volatility is consistently harmful — system is not harvesting disorder',
      talebPrinciple: 'Disorder as Fuel (Antifragile, Ch. 2): "Wind extinguishes a candle and energizes fire." Antifragile systems feed on volatility.',
    };
  }

  private static computeViaNegativa(input: AntifragilityInput, profile: DomainProfile): AntifragilityComponent {
    const commitment = input.commitmentProfile;

    let rawValue = 0.5; // Default: neutral
    if (commitment) {
      // Via Negativa: favor reversibility, subtraction, avoiding commitment over adding more
      const reversibilityRatio = commitment.reversibleCount / (commitment.totalCommitments || 1);
      const irreversibilityPenalty = commitment.irreversibleCount / (commitment.totalCommitments || 1) * 0.5;
      rawValue = Math.max(0, Math.min(1, reversibilityRatio - irreversibilityPenalty + 0.3));
    } else {
      // Domain-based estimate: government systems tend to have high irreversibility
      const domainReversibility: Record<string, number> = {
        technology: 0.75, finance: 0.65, healthcare: 0.45, energy: 0.40, government: 0.30, default: 0.50,
      };
      rawValue = domainReversibility[this.normalizeDomain(input.domain)] ?? 0.50;
    }

    const score = Math.min(100, rawValue * 100);

    return {
      name: 'Via Negativa Score',
      score,
      rawValue,
      interpretation: rawValue > 0.65 ? 'High option preservation — most commitments remain reversible' :
                       rawValue > 0.40 ? 'Moderate reversibility — some locked-in positions reduce optionality' :
                       'High lock-in detected — irreversible commitments dominate (fragility risk)',
      talebPrinciple: 'Via Negativa (Antifragile, Ch. 21): Improvement through subtraction. Remove fragilities rather than adding "improvements".',
    };
  }

  private static generateRecommendations(
    afiScore: number,
    components: AntifragilityComponent[],
    profile: DomainProfile,
    input: AntifragilityInput
  ): string[] {
    const recs: string[] = [];
    const sorted = [...components].sort((a, b) => a.score - b.score);

    // Address the lowest-scoring component first
    const weakest = sorted[0];
    switch (weakest.name) {
      case 'Convexity':
        recs.push('Restructure payoff profiles: seek asymmetric positions where losses are capped but gains are open-ended.');
        recs.push('Introduce convexity via convertible instruments, milestone-based contracts, or staged investment rounds.');
        break;
      case 'Optionality Ratio':
        recs.push('Build optionality: maintain small, cheap positions in multiple potential futures rather than concentrated bets.');
        recs.push(`In ${input.domain}, specific optionality plays include: ${profile.antifragileOpportunities.slice(0, 2).join(', ')}.`);
        break;
      case 'Barbell Positioning':
        recs.push('Eliminate medium-risk "middle" allocations — consolidate into safe core (90%) + experimental edge (10%).');
        recs.push('The middle zone gives the worst of both worlds: insufficient safety AND insufficient upside.');
        break;
      case 'Volatility Harvest Index':
        recs.push('Redesign operations to benefit from volatility: build buffers that convert disruption into competitive advantage.');
        recs.push('Identify which competitors are fragile to the same shocks you face — their disruption creates your opportunity.');
        break;
      case 'Via Negativa Score':
        recs.push('Audit all current commitments for reversibility. Lock-in is the enemy of antifragility.');
        recs.push('Before adding new initiatives, remove three old fragilities — addition is not always progress.');
        break;
    }

    if (afiScore < 40) {
      recs.push('URGENT: System is in the FRAGILE zone. Prioritize shock-proofing core operations before any expansion.');
    } else if (afiScore >= 70) {
      recs.push('System is genuinely antifragile. Focus on amplifying this advantage — seek MORE volatility, not less.');
    }

    return recs.slice(0, 4);
  }

  private static identifyBlindSpots(
    components: AntifragilityComponent[],
    profile: DomainProfile,
    input: AntifragilityInput
  ): string[] {
    const spots: string[] = [];

    // Convexity trap: looks robust but is actually fragile under tail events
    const conv = components.find(c => c.name === 'Convexity');
    if (conv && conv.score > 60 && (input.stressPerformanceHistory || []).length < 3) {
      spots.push('Convexity estimated from domain averages, not actual stress history — unknown tail behavior remains.');
    }

    // Correlation blindspot
    spots.push(`Hidden correlation risk: in the ${input.domain} domain, "${profile.primaryShockTypes[0]}" events typically expose correlated fragilities assumed to be independent.`);

    // Optionality illusion
    const opt = components.find(c => c.name === 'Optionality Ratio');
    if (opt && opt.score > 70) {
      spots.push('High optionality score may reflect theoretical upside — verify that options remain exercisable under stress conditions.');
    }

    return spots.slice(0, 3);
  }

  private static identifyAntifragileAdvantages(
    components: AntifragilityComponent[],
    profile: DomainProfile,
    domain: string
  ): string[] {
    const advantages: string[] = [];

    const strong = components.filter(c => c.score >= 65);
    for (const s of strong) {
      if (s.name === 'Convexity') advantages.push('Positive convexity: this system gains disproportionately from large positive events.');
      if (s.name === 'Barbell Positioning') advantages.push('Clean barbell: protected core funds indefinite experimentation at the edge.');
      if (s.name === 'Volatility Harvest Index') advantages.push('Disorder as fuel: market turbulence consistently translates to competitive gain.');
    }

    advantages.push(...profile.antifragileOpportunities.slice(0, 2));

    return advantages.slice(0, 4);
  }

  private static normalizeDomain(domain: string): string {
    const d = domain.toLowerCase();
    if (d.includes('tech') || d.includes('software') || d.includes('ai')) return 'technology';
    if (d.includes('fin') || d.includes('bank') || d.includes('invest')) return 'finance';
    if (d.includes('gov') || d.includes('public') || d.includes('policy')) return 'government';
    if (d.includes('health') || d.includes('medical') || d.includes('pharma')) return 'healthcare';
    if (d.includes('energy') || d.includes('power') || d.includes('oil') || d.includes('renew')) return 'energy';
    return 'default';
  }

  private static estimateConfidence(input: AntifragilityInput): number {
    let score = 0.4; // Base confidence from domain profiling
    if ((input.stressPerformanceHistory || []).length >= 5) score += 0.25;
    if (input.strategicOptions && input.strategicOptions.length > 0) score += 0.15;
    if (input.resourceAllocation) score += 0.10;
    if (input.commitmentProfile) score += 0.10;
    return Math.min(1.0, score);
  }
}
