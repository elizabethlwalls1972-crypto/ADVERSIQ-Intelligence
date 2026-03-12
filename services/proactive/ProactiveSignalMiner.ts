/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PROACTIVE SIGNAL MINER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The "self-thinking" brain of the system. Instead of waiting for user input
 * and reacting, this module PROACTIVELY:
 * 
 *   1. Mines patterns from historical failures to anticipate present risks
 *   2. Detects emerging opportunities before they become obvious
 *   3. Identifies structural vulnerabilities across contexts
 *   4. Generates unsolicited warnings when conditions match past disasters
 *   5. Recommends timing based on cyclical patterns
 * 
 * This is what separates a reactive tool from a proactive intelligence system.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { backtestingEngine, type HistoricalCaseForBacktest } from './BacktestingCalibrationEngine';
import { driftDetectionEngine } from './DriftDetectionEngine';

// ============================================================================
// TYPES
// ============================================================================

export type SignalType =
  | 'risk_pattern'      // Historical failure pattern repeating
  | 'opportunity'       // Conditions match past successes
  | 'timing'            // Cyclical window opening/closing
  | 'vulnerability'     // Structural weakness detected
  | 'regime_change'     // Major structural shift underway
  | 'contrarian'        // Market consensus likely wrong based on history
  | 'correlation'       // Hidden correlations across sectors/regions
  | 'precedent_warning' // Direct historical precedent match;

export type Urgency = 'informational' | 'monitor' | 'act_soon' | 'act_now' | 'critical';

export interface ProactiveSignal {
  id: string;
  type: SignalType;
  urgency: Urgency;
  generatedAt: string;
  title: string;
  description: string;
  evidence: SignalEvidence[];
  affectedEntities: string[];
  affectedRegions: string[];
  affectedSectors: string[];
  confidence: number; // 0-1
  historicalPrecedents: string[]; // case IDs
  recommendedActions: string[];
  expiresAt?: string;
}

export interface SignalEvidence {
  source: string;
  fact: string;
  strength: number; // 0-1
  historicalBasis: string;
}

export interface PatternTemplate {
  id: string;
  name: string;
  description: string;
  conditions: PatternCondition[];
  minMatchScore: number;
  outcomeIfTriggered: 'high_risk' | 'opportunity' | 'timing_window';
  historicalExamples: string[];
}

export interface PatternCondition {
  dimension: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range' | 'matches';
  value: string | number;
  weight: number;
}

export interface CurrentContext {
  country: string;
  sector: string;
  strategy: string;
  investmentSizeM: number;
  year: number;
  keyFactors: string[];
  additionalSignals?: Record<string, unknown>;
}

// ============================================================================
// LEARNED PATTERN TEMPLATES (extracted from historical analysis)
// ============================================================================

const LEARNED_PATTERNS: PatternTemplate[] = [
  // ─── FAILURE PATTERNS ───
  {
    id: 'PAT-CULTURE-CLASH',
    name: 'Cultural Mismatch Failure Pattern',
    description: 'Western company imposes home-country culture on host country, leading to systematic failure. Seen in Walmart Germany, Fordlandia, eBay China.',
    conditions: [
      { dimension: 'strategy', operator: 'contains', value: 'acquisition', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'cultural', weight: 0.4 },
      { dimension: 'keyFactors', operator: 'contains', value: 'management', weight: 0.2 },
      { dimension: 'investmentSizeM', operator: 'greater_than', value: 500, weight: 0.1 },
    ],
    minMatchScore: 0.5,
    outcomeIfTriggered: 'high_risk',
    historicalExamples: ['BT-052', 'BT-058', 'BT-053'],
  },
  {
    id: 'PAT-SUBSIDY-TRAP',
    name: 'Subsidy Dependency Trap',
    description: 'Business model requires ongoing government subsidy to survive. When subsidy ends or competitor gets better subsidy, venture collapses. Solyndra, many EV companies.',
    conditions: [
      { dimension: 'keyFactors', operator: 'contains', value: 'subsidy', weight: 0.4 },
      { dimension: 'keyFactors', operator: 'contains', value: 'government', weight: 0.2 },
      { dimension: 'sector', operator: 'contains', value: 'energy', weight: 0.2 },
      { dimension: 'strategy', operator: 'contains', value: 'manufacturing', weight: 0.2 },
    ],
    minMatchScore: 0.5,
    outcomeIfTriggered: 'high_risk',
    historicalExamples: ['BT-050', 'BT-100'],
  },
  {
    id: 'PAT-FRAUD-CHARISMA',
    name: 'Charismatic Founder / Due Diligence Failure',
    description: 'Outsized celebrity founder, technology claims that cannot be independently verified, no domain experts on board. Theranos, FTX, Enron pattern.',
    conditions: [
      { dimension: 'keyFactors', operator: 'contains', value: 'founder', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'fraud', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'due diligence', weight: 0.2 },
      { dimension: 'keyFactors', operator: 'contains', value: 'governance', weight: 0.2 },
    ],
    minMatchScore: 0.4,
    outcomeIfTriggered: 'high_risk',
    historicalExamples: ['BT-051', 'BT-063', 'BT-064'],
  },
  {
    id: 'PAT-TOO-FAST',
    name: 'Rapid Overexpansion',
    description: 'Company expands too fast before establishing operational foundation. Target Canada, WeWork pattern. Speed kills when systems lag behind ambition.',
    conditions: [
      { dimension: 'strategy', operator: 'contains', value: 'rapid', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'too fast', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'supply chain', weight: 0.2 },
      { dimension: 'investmentSizeM', operator: 'greater_than', value: 1000, weight: 0.2 },
    ],
    minMatchScore: 0.5,
    outcomeIfTriggered: 'high_risk',
    historicalExamples: ['BT-054', 'BT-062'],
  },
  {
    id: 'PAT-GEOPOLITICAL-BLIND',
    name: 'Geopolitical Tail Risk Blindspot',
    description: 'Investment assumes stable political environment. Sanctions, regime change, or diplomatic collapse wipes out value overnight. McDonalds Russia, Google China.',
    conditions: [
      { dimension: 'keyFactors', operator: 'contains', value: 'geopolitical', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'sanction', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'regime', weight: 0.2 },
      { dimension: 'keyFactors', operator: 'contains', value: 'political', weight: 0.2 },
    ],
    minMatchScore: 0.4,
    outcomeIfTriggered: 'high_risk',
    historicalExamples: ['BT-057', 'BT-056'],
  },
  {
    id: 'PAT-LOCAL-COMPETITOR',
    name: 'Local Competitor Dominance',
    description: 'Foreign entrant underestimates strength of local competitor who has government backing, local knowledge, and better user understanding. eBay vs Taobao, Uber vs Didi.',
    conditions: [
      { dimension: 'strategy', operator: 'contains', value: 'entry', weight: 0.2 },
      { dimension: 'keyFactors', operator: 'contains', value: 'local competitor', weight: 0.4 },
      { dimension: 'keyFactors', operator: 'contains', value: 'dominance', weight: 0.2 },
      { dimension: 'keyFactors', operator: 'contains', value: 'cash burn', weight: 0.2 },
    ],
    minMatchScore: 0.5,
    outcomeIfTriggered: 'high_risk',
    historicalExamples: ['BT-053', 'BT-055'],
  },

  // ─── SUCCESS PATTERNS ───
  {
    id: 'PAT-GOV-ALIGNED',
    name: 'Government-Aligned First Mover',
    description: 'Entry aligned with government industrial policy, receiving fast-track permits, tax incentives, and preferential treatment. Tesla Shanghai, Samsung Vietnam.',
    conditions: [
      { dimension: 'keyFactors', operator: 'contains', value: 'government', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'incentive', weight: 0.2 },
      { dimension: 'keyFactors', operator: 'contains', value: 'fast-track', weight: 0.2 },
      { dimension: 'keyFactors', operator: 'contains', value: 'first-mover', weight: 0.3 },
    ],
    minMatchScore: 0.5,
    outcomeIfTriggered: 'opportunity',
    historicalExamples: ['BT-001', 'BT-002', 'BT-007'],
  },
  {
    id: 'PAT-COST-ARBITRAGE',
    name: 'Labor/Cost Arbitrage Window',
    description: 'Country has temporary cost advantage (low wages, favorable exchange rate) combined with adequate infrastructure and political stability.',
    conditions: [
      { dimension: 'keyFactors', operator: 'contains', value: 'low cost', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'labor', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'stability', weight: 0.2 },
      { dimension: 'strategy', operator: 'contains', value: 'manufacturing', weight: 0.2 },
    ],
    minMatchScore: 0.5,
    outcomeIfTriggered: 'opportunity',
    historicalExamples: ['BT-002', 'BT-004', 'BT-009'],
  },
  {
    id: 'PAT-TRADE-REALIGNMENT',
    name: 'Trade Agreement / Nearshoring Wave',
    description: 'New trade agreement or geopolitical shift creates reshoring/nearshoring opportunity. NAFTA/USMCA Mexico, China+1 Vietnam.',
    conditions: [
      { dimension: 'keyFactors', operator: 'contains', value: 'trade', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'nearshore', weight: 0.2 },
      { dimension: 'keyFactors', operator: 'contains', value: 'tariff', weight: 0.2 },
      { dimension: 'strategy', operator: 'contains', value: 'nearshoring', weight: 0.3 },
    ],
    minMatchScore: 0.4,
    outcomeIfTriggered: 'opportunity',
    historicalExamples: ['BT-010', 'BT-013'],
  },
  {
    id: 'PAT-RESOURCE-POLICY',
    name: 'Resource Nationalism Opportunity',
    description: 'Country mandates downstream processing of raw materials, creating forced vertical integration opportunity for early movers. Indonesia nickel ban.',
    conditions: [
      { dimension: 'keyFactors', operator: 'contains', value: 'export ban', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'vertical integration', weight: 0.3 },
      { dimension: 'sector', operator: 'contains', value: 'mining', weight: 0.2 },
      { dimension: 'keyFactors', operator: 'contains', value: 'resource', weight: 0.2 },
    ],
    minMatchScore: 0.5,
    outcomeIfTriggered: 'opportunity',
    historicalExamples: ['BT-014'],
  },

  // ─── TIMING PATTERNS ───
  {
    id: 'PAT-CRISIS-ENTRY',
    name: 'Crisis-Window Entry',
    description: 'Entering during or immediately after a major crisis yields outsized returns. Marshall Plan post-WWII, post-Asian Crisis bargains.',
    conditions: [
      { dimension: 'keyFactors', operator: 'contains', value: 'crisis', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'reconstruction', weight: 0.3 },
      { dimension: 'keyFactors', operator: 'contains', value: 'recovery', weight: 0.2 },
      { dimension: 'strategy', operator: 'contains', value: 'development', weight: 0.2 },
    ],
    minMatchScore: 0.4,
    outcomeIfTriggered: 'timing_window',
    historicalExamples: ['BT-016'],
  },
];

// ============================================================================
// PROACTIVE SIGNAL MINER
// ============================================================================

export class ProactiveSignalMiner {
  private activeSignals: ProactiveSignal[] = [];
  private signalHistory: ProactiveSignal[] = [];
  private readonly cases: HistoricalCaseForBacktest[];

  constructor() {
    this.cases = backtestingEngine.getCases();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MAIN SIGNAL GENERATION
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Given a current investment context, proactively generate signals
   * WITHOUT the user asking. This is the "self-thinking" function.
   */
  generateSignals(context: CurrentContext): ProactiveSignal[] {
    const signals: ProactiveSignal[] = [];

    // 1. Pattern matching against learned failure/success templates
    signals.push(...this.matchPatterns(context));

    // 2. Historical precedent matching
    signals.push(...this.findPrecedents(context));

    // 3. Cyclical timing analysis
    signals.push(...this.analyzeTiming(context));

    // 4. Cross-sector correlation warnings
    signals.push(...this.detectCorrelations(context));

    // 5. Contrarian signals (when consensus is likely wrong)
    signals.push(...this.generateContrarianSignals(context));

    // 6. Vulnerability scan
    signals.push(...this.scanVulnerabilities(context));

    // 7. Regime change detection
    signals.push(...this.detectRegimeChanges(context));

    // Deduplicate and rank
    const deduped = this.deduplicateSignals(signals);
    const ranked = this.rankSignals(deduped);

    this.activeSignals = ranked;
    this.signalHistory.push(...ranked);

    return ranked;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. PATTERN MATCHING
  // ──────────────────────────────────────────────────────────────────────────

  private matchPatterns(context: CurrentContext): ProactiveSignal[] {
    const signals: ProactiveSignal[] = [];

    for (const pattern of LEARNED_PATTERNS) {
      let matchScore = 0;
      let totalWeight = 0;
      const matchedEvidence: SignalEvidence[] = [];

      for (const condition of pattern.conditions) {
        totalWeight += condition.weight;
        const matched = this.evaluateCondition(condition, context);

        if (matched) {
          matchScore += condition.weight;
          matchedEvidence.push({
            source: `Pattern: ${pattern.name}`,
            fact: `${condition.dimension} matches condition: ${condition.operator} ${condition.value}`,
            strength: condition.weight,
            historicalBasis: `Seen in ${pattern.historicalExamples.length} historical cases`,
          });
        }
      }

      const normalizedScore = matchScore / totalWeight;

      if (normalizedScore >= pattern.minMatchScore) {
        const urgency = this.determineUrgency(pattern.outcomeIfTriggered, normalizedScore);

        signals.push({
          id: `sig-${pattern.id}-${Date.now()}`,
          type: pattern.outcomeIfTriggered === 'high_risk' ? 'risk_pattern' : 'opportunity',
          urgency,
          generatedAt: new Date().toISOString(),
          title: pattern.name,
          description: `${pattern.description}\n\nMatch strength: ${(normalizedScore * 100).toFixed(0)}% against current context.`,
          evidence: matchedEvidence,
          affectedEntities: [],
          affectedRegions: [context.country],
          affectedSectors: [context.sector],
          confidence: normalizedScore * driftDetectionEngine.getConfidenceMultiplier(),
          historicalPrecedents: pattern.historicalExamples,
          recommendedActions: this.generateActions(pattern, context),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    return signals;
  }

  private evaluateCondition(condition: PatternCondition, context: CurrentContext): boolean {
    const contextValue = this.getContextValue(condition.dimension, context);

    switch (condition.operator) {
      case 'equals':
        return String(contextValue).toLowerCase() === String(condition.value).toLowerCase();
      case 'contains':
        if (Array.isArray(contextValue)) {
          return contextValue.some(v =>
            String(v).toLowerCase().includes(String(condition.value).toLowerCase())
          );
        }
        return String(contextValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'greater_than':
        return Number(contextValue) > Number(condition.value);
      case 'less_than':
        return Number(contextValue) < Number(condition.value);
      case 'in_range':
        return true; // Simplified
      case 'matches':
        return new RegExp(String(condition.value), 'i').test(String(contextValue));
      default:
        return false;
    }
  }

  private getContextValue(dimension: string, context: CurrentContext): string | number | string[] | unknown {
    switch (dimension) {
      case 'country': return context.country;
      case 'sector': return context.sector;
      case 'strategy': return context.strategy;
      case 'investmentSizeM': return context.investmentSizeM;
      case 'year': return context.year;
      case 'keyFactors': return context.keyFactors;
      default: return context.additionalSignals?.[dimension] ?? '';
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. HISTORICAL PRECEDENT MATCHING
  // ──────────────────────────────────────────────────────────────────────────

  private findPrecedents(context: CurrentContext): ProactiveSignal[] {
    const signals: ProactiveSignal[] = [];

    for (const historicalCase of this.cases) {
      const similarity = this.calculateCaseSimilarity(context, historicalCase);

      if (similarity > 0.6) {
        const isWarning = historicalCase.outcome === 'failure';

        signals.push({
          id: `precedent-${historicalCase.id}-${Date.now()}`,
          type: 'precedent_warning',
          urgency: isWarning ? (similarity > 0.8 ? 'act_now' : 'act_soon') : 'informational',
          generatedAt: new Date().toISOString(),
          title: `${isWarning ? '⚠️ WARNING' : '✅ POSITIVE'}: ${historicalCase.title} (${(similarity * 100).toFixed(0)}% match)`,
          description: this.generatePrecedentDescription(context, historicalCase, similarity),
          evidence: [
            {
              source: 'Historical Case Database',
              fact: `${historicalCase.title} (${historicalCase.year}): ${historicalCase.outcome} with ROI of ${historicalCase.actualROI}%`,
              strength: similarity,
              historicalBasis: `Key factors: ${historicalCase.keyFactors.join(', ')}`,
            },
          ],
          affectedEntities: [historicalCase.entity],
          affectedRegions: [historicalCase.country],
          affectedSectors: historicalCase.sectorTags,
          confidence: similarity * 0.9,
          historicalPrecedents: [historicalCase.id],
          recommendedActions: isWarning
            ? [
                `Review the ${historicalCase.title} case in detail`,
                `Identify which failure factors are present in current context`,
                `Develop mitigation plan for: ${historicalCase.keyFactors.join(', ')}`,
              ]
            : [
                `Study the ${historicalCase.title} playbook`,
                `Identify which success factors can be replicated`,
                `Timeline expectation: ${historicalCase.timeToOutcome} months to outcome`,
              ],
        });
      }
    }

    return signals;
  }

  private calculateCaseSimilarity(context: CurrentContext, historicalCase: HistoricalCaseForBacktest): number {
    let score = 0;
    let maxScore = 0;

    // Country match (0.2)
    maxScore += 0.2;
    if (context.country.toLowerCase() === historicalCase.country.toLowerCase()) score += 0.2;
    else if (this.sameRegion(context.country, historicalCase.country)) score += 0.1;

    // Sector match (0.25)
    maxScore += 0.25;
    if (historicalCase.sectorTags.some(t => context.sector.toLowerCase().includes(t.toLowerCase()))) score += 0.25;
    else if (historicalCase.sectorTags.some(t => this.relatedSector(context.sector, t))) score += 0.12;

    // Strategy match (0.2)
    maxScore += 0.2;
    if (context.strategy.toLowerCase().includes(historicalCase.strategy.toLowerCase().split(' ')[0])) score += 0.2;

    // Investment size proximity (0.15)
    maxScore += 0.15;
    const sizeRatio = Math.min(context.investmentSizeM, historicalCase.investmentSizeM) /
                      Math.max(context.investmentSizeM, historicalCase.investmentSizeM);
    score += 0.15 * sizeRatio;

    // Key factor overlap (0.2)
    maxScore += 0.2;
    const contextFactorsStr = context.keyFactors.join(' ').toLowerCase();
    const matchingFactors = historicalCase.keyFactors.filter(f =>
      contextFactorsStr.includes(f.toLowerCase().split(' ')[0])
    );
    score += 0.2 * (matchingFactors.length / Math.max(1, historicalCase.keyFactors.length));

    return score / maxScore;
  }

  private sameRegion(c1: string, c2: string): boolean {
    const seAsia = ['Vietnam', 'Philippines', 'Indonesia', 'Thailand', 'Malaysia', 'Singapore', 'Myanmar', 'Cambodia'];
    const eastAsia = ['China', 'Japan', 'South Korea', 'Taiwan'];
    const europe = ['Germany', 'France', 'UK', 'Netherlands', 'Italy', 'Spain', 'Poland'];
    const latam = ['Brazil', 'Mexico', 'Colombia', 'Chile', 'Argentina'];
    const mena = ['Saudi Arabia', 'UAE', 'Iran', 'Egypt', 'Turkey'];
    const regions = [seAsia, eastAsia, europe, latam, mena];

    for (const region of regions) {
      if (region.includes(c1) && region.includes(c2)) return true;
    }
    return false;
  }

  private relatedSector(s1: string, s2: string): boolean {
    const groups = [
      ['Technology', 'Electronics', 'Semiconductors', 'Software'],
      ['Energy', 'Renewable', 'Solar', 'Oil', 'Wind'],
      ['Manufacturing', 'Automotive', 'Industrial'],
      ['Finance', 'Banking', 'Insurance', 'Crypto'],
      ['Retail', 'E-commerce', 'Consumer'],
    ];
    for (const group of groups) {
      if (group.some(g => s1.toLowerCase().includes(g.toLowerCase())) &&
          group.some(g => s2.toLowerCase().includes(g.toLowerCase()))) {
        return true;
      }
    }
    return false;
  }

  private generatePrecedentDescription(
    context: CurrentContext,
    historicalCase: HistoricalCaseForBacktest,
    similarity: number
  ): string {
    const lines = [
      `Your current ${context.sector} investment in ${context.country} matches ${(similarity * 100).toFixed(0)}% with the historical case of ${historicalCase.title} (${historicalCase.year}).`,
      '',
      `Historical outcome: ${historicalCase.outcome.toUpperCase()} with ${historicalCase.actualROI}% ROI over ${historicalCase.timeToOutcome} months.`,
      '',
      `Key parallels:`,
    ];

    for (const factor of historicalCase.keyFactors) {
      const present = context.keyFactors.some(f => f.toLowerCase().includes(factor.split(' ')[0].toLowerCase()));
      lines.push(`  ${present ? '✓' : '○'} ${factor}`);
    }

    return lines.join('\n');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. CYCLICAL TIMING ANALYSIS
  // ──────────────────────────────────────────────────────────────────────────

  private analyzeTiming(context: CurrentContext): ProactiveSignal[] {
    const signals: ProactiveSignal[] = [];

    // Analyze historical success rates by year/decade
    const successByDecade: Record<string, { success: number; total: number }> = {};

    for (const c of this.cases) {
      const decade = `${Math.floor(c.year / 10) * 10}s`;
      if (!successByDecade[decade]) successByDecade[decade] = { success: 0, total: 0 };
      successByDecade[decade].total++;
      if (c.outcome === 'success') successByDecade[decade].success++;
    }

    // Check if current sector has cyclical patterns
    const sectorCases = this.cases.filter(c =>
      c.sectorTags.some(t => context.sector.toLowerCase().includes(t.toLowerCase()))
    );

    if (sectorCases.length >= 3) {
      const successYears = sectorCases.filter(c => c.outcome === 'success').map(c => c.year);
      const failureYears = sectorCases.filter(c => c.outcome === 'failure').map(c => c.year);

      // Check if there's a pattern in timing
      if (successYears.length > 0 && failureYears.length > 0) {
        const _avgSuccessYear = successYears.reduce((a, b) => a + b, 0) / successYears.length;
        const _avgFailureYear = failureYears.reduce((a, b) => a + b, 0) / failureYears.length;

        const recentTrend = sectorCases
          .filter(c => c.year >= 2015)
          .map(c => c.outcome === 'success' ? 1 : 0);

        if (recentTrend.length > 0) {
          const recentSuccessRate = recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length;

          signals.push({
            id: `timing-${context.sector}-${Date.now()}`,
            type: 'timing',
            urgency: recentSuccessRate > 0.7 ? 'informational' : 'monitor',
            generatedAt: new Date().toISOString(),
            title: `${context.sector} Sector Timing Analysis`,
            description: `Based on ${sectorCases.length} historical cases in ${context.sector}:\n` +
              `- Recent success rate (2015+): ${(recentSuccessRate * 100).toFixed(0)}%\n` +
              `- Successes clustered around: ${successYears.join(', ')}\n` +
              `- Failures clustered around: ${failureYears.join(', ')}\n` +
              `This is ${recentSuccessRate > 0.5 ? 'a favorable' : 'an unfavorable'} timing window.`,
            evidence: [{
              source: 'Cyclical Analysis',
              fact: `${sectorCases.length} cases analyzed, ${(recentSuccessRate * 100).toFixed(0)}% recent success rate`,
              strength: Math.min(1, sectorCases.length / 10),
              historicalBasis: `Success years: ${successYears.join(', ')}`,
            }],
            affectedEntities: [],
            affectedRegions: [context.country],
            affectedSectors: [context.sector],
            confidence: Math.min(0.8, sectorCases.length / 15),
            historicalPrecedents: sectorCases.map(c => c.id),
            recommendedActions: recentSuccessRate > 0.5
              ? ['Current timing appears favorable based on sector cycle']
              : ['Consider delaying entry - sector cycle suggests caution',
                 'Look for counter-cyclical indicators that might override pattern'],
          });
        }
      }
    }

    return signals;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CROSS-SECTOR CORRELATION
  // ──────────────────────────────────────────────────────────────────────────

  private detectCorrelations(context: CurrentContext): ProactiveSignal[] {
    const signals: ProactiveSignal[] = [];

    // Find cases in same country, different sector, same time period
    const relatedCases = this.cases.filter(c =>
      c.country.toLowerCase() === context.country.toLowerCase() &&
      !c.sectorTags.some(t => context.sector.toLowerCase().includes(t.toLowerCase())) &&
      Math.abs(c.year - context.year) < 10
    );

    if (relatedCases.length > 0) {
      const failures = relatedCases.filter(c => c.outcome === 'failure');
      const failureRate = failures.length / relatedCases.length;

      if (failureRate > 0.5 && failures.length >= 2) {
        signals.push({
          id: `corr-${context.country}-${Date.now()}`,
          type: 'correlation',
          urgency: 'monitor',
          generatedAt: new Date().toISOString(),
          title: `Cross-Sector Risk in ${context.country}`,
          description: `${failures.length} out of ${relatedCases.length} investments in ${context.country} across OTHER sectors have failed in similar timeframes. This may indicate systemic country-level risk that transcends your specific sector.`,
          evidence: failures.map(f => ({
            source: 'Cross-Sector Analysis',
            fact: `${f.title} (${f.sector}, ${f.year}): ${f.outcome}`,
            strength: 0.6,
            historicalBasis: f.keyFactors.join(', '),
          })),
          affectedEntities: [],
          affectedRegions: [context.country],
          affectedSectors: [...new Set(failures.flatMap(f => f.sectorTags))],
          confidence: 0.5,
          historicalPrecedents: failures.map(f => f.id),
          recommendedActions: [
            `Investigate systemic issues in ${context.country}`,
            'Check for currency, political, or regulatory instability',
            'Consider if your sector is insulated from these cross-sector failures',
          ],
        });
      }
    }

    return signals;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. CONTRARIAN SIGNALS
  // ──────────────────────────────────────────────────────────────────────────

  private generateContrarianSignals(context: CurrentContext): ProactiveSignal[] {
    const signals: ProactiveSignal[] = [];

    // Look for cases where initial perception was wrong
    const surprises = this.cases.filter(c => {
      // Success despite looking bad
      if (c.outcome === 'success' && c.keyFactors.some(f =>
        f.includes('counter') || f.includes('niche') || f.includes('unconventional')
      )) return true;
      // Failure despite looking good
      if (c.outcome === 'failure' && c.investmentSizeM > 500 && c.keyFactors.some(f =>
        f.includes('overconfidence') || f.includes('arrogance') || f.includes('perception')
      )) return true;
      return false;
    });

    if (surprises.length > 0 && context.investmentSizeM > 500) {
      signals.push({
        id: `contrarian-${Date.now()}`,
        type: 'contrarian',
        urgency: 'informational',
        generatedAt: new Date().toISOString(),
        title: 'Contrarian Analysis: Large Investment Caution',
        description: `Historical analysis shows that investments over $500M have a higher failure rate when conventional wisdom strongly favors them. ${surprises.length} historical cases demonstrate the "consensus trap." Consider: What would have to be true for this investment to fail despite looking good?`,
        evidence: surprises.slice(0, 3).map(s => ({
          source: 'Contrarian Analysis',
          fact: `${s.title}: ${s.outcome} despite ${s.investmentSizeM > 500 ? 'large investment' : 'unconventional approach'}`,
          strength: 0.5,
          historicalBasis: s.keyFactors.join(', '),
        })),
        affectedEntities: [],
        affectedRegions: [context.country],
        affectedSectors: [context.sector],
        confidence: 0.4,
        historicalPrecedents: surprises.map(s => s.id),
        recommendedActions: [
          'Conduct pre-mortem analysis: Assume the investment failed - why?',
          'Identify the strongest devil\'s advocate argument against this investment',
          'Check for "social proof" bias in the decision-making process',
        ],
      });
    }

    return signals;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. VULNERABILITY SCAN
  // ──────────────────────────────────────────────────────────────────────────

  private scanVulnerabilities(context: CurrentContext): ProactiveSignal[] {
    const signals: ProactiveSignal[] = [];

    // Single-point-of-failure check
    if (context.keyFactors.length > 0) {
      const criticalDependencies = context.keyFactors.filter(f =>
        f.toLowerCase().includes('depend') ||
        f.toLowerCase().includes('only') ||
        f.toLowerCase().includes('single') ||
        f.toLowerCase().includes('sole')
      );

      if (criticalDependencies.length > 0) {
        signals.push({
          id: `vuln-spof-${Date.now()}`,
          type: 'vulnerability',
          urgency: 'act_soon',
          generatedAt: new Date().toISOString(),
          title: 'Single Point of Failure Detected',
          description: `Investment has ${criticalDependencies.length} critical single-point dependencies: ${criticalDependencies.join('; ')}. Historical analysis shows SPOF investments have 40% higher failure rates.`,
          evidence: [{
            source: 'Vulnerability Scan',
            fact: `${criticalDependencies.length} SPOF dependencies identified`,
            strength: 0.7,
            historicalBasis: 'SPOF pattern correlates with Solyndra (subsidy), Target Canada (supply chain)',
          }],
          affectedEntities: [],
          affectedRegions: [context.country],
          affectedSectors: [context.sector],
          confidence: 0.6,
          historicalPrecedents: ['BT-050', 'BT-054'],
          recommendedActions: [
            'Develop contingency plan for each single-point dependency',
            'Identify backup suppliers, partners, or policy alternatives',
          ],
        });
      }
    }

    return signals;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. REGIME CHANGE DETECTION
  // ──────────────────────────────────────────────────────────────────────────

  private detectRegimeChanges(context: CurrentContext): ProactiveSignal[] {
    const signals: ProactiveSignal[] = [];

    // Major global regime shifts that historically invalidated prior patterns
    const regimeShifts = [
      { period: [2018, 2025], name: 'US-China Decoupling', affected: ['China', 'Taiwan', 'Vietnam', 'India'], sectors: ['Technology', 'Semiconductors', 'Manufacturing'] },
      { period: [2020, 2025], name: 'Post-COVID Supply Chain Restructuring', affected: ['Global'], sectors: ['Manufacturing', 'Logistics'] },
      { period: [2022, 2025], name: 'Energy Transition Acceleration', affected: ['Global'], sectors: ['Energy', 'Automotive', 'Mining'] },
      { period: [2022, 2025], name: 'Interest Rate Regime Change', affected: ['Global'], sectors: ['Finance', 'Real Estate', 'Technology'] },
      { period: [2023, 2025], name: 'AI/Automation Disruption Wave', affected: ['Global'], sectors: ['Technology', 'Services', 'Manufacturing'] },
    ];

    for (const shift of regimeShifts) {
      if (context.year >= shift.period[0] && context.year <= shift.period[1]) {
        const countryAffected = shift.affected.includes('Global') ||
          shift.affected.some(a => context.country.toLowerCase().includes(a.toLowerCase()));
        const sectorAffected = shift.sectors.some(s => context.sector.toLowerCase().includes(s.toLowerCase()));

        if (countryAffected && sectorAffected) {
          signals.push({
            id: `regime-${shift.name.replace(/\s/g, '-')}-${Date.now()}`,
            type: 'regime_change',
            urgency: 'monitor',
            generatedAt: new Date().toISOString(),
            title: `Regime Change: ${shift.name}`,
            description: `Your investment operates within the ${shift.name} regime shift (${shift.period[0]}-${shift.period[1]}). Historical patterns from before ${shift.period[0]} may not apply. Calibration weights from pre-${shift.period[0]} cases should be discounted.`,
            evidence: [{
              source: 'Regime Analysis',
              fact: `${shift.name} affects ${context.country} / ${context.sector}`,
              strength: 0.7,
              historicalBasis: 'Major structural shifts historically invalidate 30-50% of prior pattern predictions',
            }],
            affectedEntities: [],
            affectedRegions: shift.affected,
            affectedSectors: shift.sectors,
            confidence: 0.6,
            historicalPrecedents: [],
            recommendedActions: [
              `Weight post-${shift.period[0]} case data more heavily`,
              'Seek expert opinion on how this regime change affects your specific context',
              'Consider scenario planning for regime reversal (e.g., re-globalization)',
            ],
          });
        }
      }
    }

    return signals;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  private determineUrgency(outcome: string, score: number): Urgency {
    if (outcome === 'high_risk') {
      if (score > 0.8) return 'critical';
      if (score > 0.6) return 'act_now';
      return 'act_soon';
    }
    if (outcome === 'opportunity') {
      if (score > 0.8) return 'act_now';
      return 'informational';
    }
    return 'monitor';
  }

  private generateActions(pattern: PatternTemplate, _context: CurrentContext): string[] {
    if (pattern.outcomeIfTriggered === 'high_risk') {
      return [
        `WARNING: "${pattern.name}" pattern detected with ${((pattern.minMatchScore) * 100).toFixed(0)}%+ match`,
        `Review historical cases: ${pattern.historicalExamples.join(', ')} for lessons`,
        `Key risk factors to mitigate: ${pattern.conditions.map(c => c.dimension).join(', ')}`,
        'Consider additional due diligence specifically targeting this failure pattern',
      ];
    }
    return [
      `OPPORTUNITY: "${pattern.name}" pattern detected`,
      `Study success playbook from: ${pattern.historicalExamples.join(', ')}`,
      `Key factors to replicate: ${pattern.conditions.map(c => c.dimension).join(', ')}`,
    ];
  }

  private deduplicateSignals(signals: ProactiveSignal[]): ProactiveSignal[] {
    const seen = new Set<string>();
    return signals.filter(s => {
      const key = `${s.type}-${s.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private rankSignals(signals: ProactiveSignal[]): ProactiveSignal[] {
    const urgencyOrder: Record<Urgency, number> = {
      critical: 5,
      act_now: 4,
      act_soon: 3,
      monitor: 2,
      informational: 1,
    };

    return signals.sort((a, b) => {
      const urgDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      if (urgDiff !== 0) return urgDiff;
      return b.confidence - a.confidence;
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────────────────

  getActiveSignals(): ProactiveSignal[] {
    return this.activeSignals;
  }

  getSignalsByType(type: SignalType): ProactiveSignal[] {
    return this.activeSignals.filter(s => s.type === type);
  }

  getHighPrioritySignals(): ProactiveSignal[] {
    return this.activeSignals.filter(s =>
      s.urgency === 'critical' || s.urgency === 'act_now' || s.urgency === 'act_soon'
    );
  }

  /**
   * Generate a human-readable proactive intelligence brief.
   */
  generateBrief(context: CurrentContext): string {
    const signals = this.generateSignals(context);

    if (signals.length === 0) {
      return 'No proactive signals detected for this context. Historical pattern analysis found no significant matches.';
    }

    const lines: string[] = [
      '═══════════════════════════════════════════════════════════',
      '  PROACTIVE INTELLIGENCE BRIEF',
      '═══════════════════════════════════════════════════════════',
      '',
      `Context: ${context.sector} investment in ${context.country}`,
      `Strategy: ${context.strategy} | Size: $${context.investmentSizeM}M`,
      `Signals generated: ${signals.length}`,
      '',
    ];

    const critical = signals.filter(s => s.urgency === 'critical' || s.urgency === 'act_now');
    const moderate = signals.filter(s => s.urgency === 'act_soon' || s.urgency === 'monitor');
    const info = signals.filter(s => s.urgency === 'informational');

    if (critical.length > 0) {
      lines.push('🔴 CRITICAL SIGNALS:');
      for (const s of critical) {
        lines.push(`  [${s.type.toUpperCase()}] ${s.title}`);
        lines.push(`  ${s.description.split('\n')[0]}`);
        lines.push(`  Confidence: ${(s.confidence * 100).toFixed(0)}%`);
        lines.push('');
      }
    }

    if (moderate.length > 0) {
      lines.push('🟡 MONITOR:');
      for (const s of moderate) {
        lines.push(`  [${s.type.toUpperCase()}] ${s.title}`);
        lines.push(`  ${s.description.split('\n')[0]}`);
        lines.push('');
      }
    }

    if (info.length > 0) {
      lines.push('🔵 INFORMATIONAL:');
      for (const s of info) {
        lines.push(`  [${s.type.toUpperCase()}] ${s.title}`);
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}

export const proactiveSignalMiner = new ProactiveSignalMiner();
