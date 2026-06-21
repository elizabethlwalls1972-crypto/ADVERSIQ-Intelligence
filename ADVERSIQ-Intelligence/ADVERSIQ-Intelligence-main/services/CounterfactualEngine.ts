/**
 * COUNTERFACTUAL ENGINE - Alternative Scenario Analysis
 * 
 * Generates "What if?" scenarios to test decision robustness:
 * - What if we didn't proceed? (Regret analysis)
 * - What if key assumptions are wrong?
 * - What if external conditions change?
 * - What are the alternative paths?
 * 
 * Uses Monte Carlo simulation for probabilistic outcomes.
 */

import { ReportParameters } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface Scenario {
  id: string;
  name: string;
  description: string;
  probability: number; // 0-100
  assumptions: string[];
  outcomes: {
    financial: { min: number; expected: number; max: number };
    timeline: { min: string; expected: string; max: string };
    risk: number; // 0-100
  };
  keyDifferences: string[];
}

export interface CounterfactualResult {
  scenarioId: string;
  outcomeValue: number;
  regretScore: number; // Negative if chosen path was better
  keyFactors: string[];
}

export interface MonteCarloResult {
  iterations: number;
  distribution: {
    p5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    mean: number;
    stdDev: number;
  };
  probabilityOfLoss: number;
  probabilityOfTargetReturn: number;
  valueAtRisk95: number;
  expectedShortfall: number;
  histogram: Array<{ range: string; count: number; percentage: number }>;
}

export interface CounterfactualAnalysis {
  timestamp: Date;
  baseCase: Scenario;
  alternativeScenarios: Scenario[];
  regretAnalysis: {
    doNothingCost: number;
    doNothingRisk: string;
    opportunityCost: string;
    reversibilityWindow: string;
  };
  monteCarlo: MonteCarloResult;
  robustness: {
    score: number; // 0-100
    vulnerabilities: string[];
    resilientFactors: string[];
  };
  recommendation: string;
}

// ============================================================================
// MONTE CARLO SIMULATION
// ============================================================================

class MonteCarloSimulator {
  /**
   * Run Monte Carlo simulation with specified parameters
   */
  static simulate(params: {
    baseValue: number;
    volatility: number;
    upside: number;
    downside: number;
    successProbability: number;
    iterations?: number;
  }): MonteCarloResult {
    const iterations = params.iterations || 10000;
    const results: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const outcome = this.simulateSingleOutcome(params);
      results.push(outcome);
    }
    
    // Sort for percentile calculations
    results.sort((a, b) => a - b);
    
    // Calculate statistics
    const mean = results.reduce((a, b) => a + b, 0) / iterations;
    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / iterations;
    const stdDev = Math.sqrt(variance);
    
    // Percentiles
    const percentile = (p: number) => results[Math.floor(iterations * p / 100)];
    
    // Count losses
    const losses = results.filter(r => r < 0).length;
    const probabilityOfLoss = (losses / iterations) * 100;
    
    // Target return (assume 15% is target)
    const targetReturn = params.baseValue * 0.15;
    const aboveTarget = results.filter(r => r >= targetReturn).length;
    const probabilityOfTargetReturn = (aboveTarget / iterations) * 100;
    
    // VaR and Expected Shortfall
    const var95 = percentile(5);
    const tail5Percent = results.slice(0, Math.floor(iterations * 0.05));
    const expectedShortfall = tail5Percent.reduce((a, b) => a + b, 0) / tail5Percent.length;
    
    // Build histogram
    const histogram = this.buildHistogram(results, 10);
    
    return {
      iterations,
      distribution: {
        p5: percentile(5),
        p10: percentile(10),
        p25: percentile(25),
        p50: percentile(50),
        p75: percentile(75),
        p90: percentile(90),
        p95: percentile(95),
        mean,
        stdDev
      },
      probabilityOfLoss,
      probabilityOfTargetReturn,
      valueAtRisk95: var95,
      expectedShortfall,
      histogram
    };
  }
  
  private static simulateSingleOutcome(params: {
    baseValue: number;
    volatility: number;
    upside: number;
    downside: number;
    successProbability: number;
  }): number {
    // Use Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    // Determine if success or failure scenario
    const isSuccess = Math.random() < params.successProbability / 100;
    
    if (isSuccess) {
      // Success scenario: base value + upside with volatility
      const adjustment = 1 + (z * params.volatility / 100);
      const upsideMultiplier = 1 + (params.upside / 100) * Math.abs(adjustment);
      return params.baseValue * upsideMultiplier;
    } else {
      // Failure scenario: base value - downside with volatility
      const adjustment = 1 + (z * params.volatility / 100);
      const downsideMultiplier = 1 - (params.downside / 100) * Math.abs(adjustment);
      return params.baseValue * Math.max(0, downsideMultiplier);
    }
  }
  
  private static buildHistogram(results: number[], buckets: number): Array<{ range: string; count: number; percentage: number }> {
    const min = Math.min(...results);
    const max = Math.max(...results);
    const bucketSize = (max - min) / buckets;
    
    const histogram: Array<{ range: string; count: number; percentage: number }> = [];
    
    for (let i = 0; i < buckets; i++) {
      const rangeMin = min + i * bucketSize;
      const rangeMax = min + (i + 1) * bucketSize;
      const count = results.filter(r => r >= rangeMin && r < rangeMax).length;
      
      histogram.push({
        range: `${this.formatCurrency(rangeMin)} - ${this.formatCurrency(rangeMax)}`,
        count,
        percentage: (count / results.length) * 100
      });
    }
    
    return histogram;
  }
  
  private static formatCurrency(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  }
}

// ============================================================================
// COUNTERFACTUAL ENGINE
// ============================================================================

export class CounterfactualEngine {
  
  /**
   * Generate full counterfactual analysis
   */
  static analyze(params: Partial<ReportParameters>): CounterfactualAnalysis {
    const baseCase = this.generateBaseCase(params);
    const alternativeScenarios = this.generateAlternatives(params);
    const regretAnalysis = this.analyzeRegret(params, baseCase, alternativeScenarios);
    
    // Run Monte Carlo on base case
    const budgetStr = params.calibration?.constraints?.budgetCap;
    const budget = budgetStr ? parseFloat(budgetStr.replace(/[^0-9.]/g, '')) : 1000000;
    const riskToleranceStr = params.riskTolerance;
    const riskTolerance = riskToleranceStr === 'High' ? 80 : riskToleranceStr === 'Medium' ? 50 : 30;
    const roiExpectation = riskToleranceStr === 'High' ? 25 : riskToleranceStr === 'Medium' ? 15 : 10;
    
    const monteCarlo = MonteCarloSimulator.simulate({
      baseValue: budget,
      volatility: 100 - riskTolerance, // Higher risk tolerance = lower volatility concern
      upside: roiExpectation * 2, // Upside potential
      downside: 50, // Maximum downside
      successProbability: 50 + (riskTolerance / 5) // Base success rate modified by risk tolerance
    });
    
    const robustness = this.assessRobustness(params, monteCarlo, alternativeScenarios);
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(regretAnalysis, monteCarlo, robustness);
    
    return {
      timestamp: new Date(),
      baseCase,
      alternativeScenarios,
      regretAnalysis,
      monteCarlo,
      robustness,
      recommendation
    };
  }
  
  /**
   * Generate the base case scenario from current parameters
   */
  private static generateBaseCase(params: Partial<ReportParameters>): Scenario {
    const budgetStr = params.calibration?.constraints?.budgetCap;
    const budget = budgetStr ? parseFloat(budgetStr.replace(/[^0-9.]/g, '')) : 1000000;
    const riskToleranceStr = params.riskTolerance;
    const roiExpectation = riskToleranceStr === 'High' ? 25 : riskToleranceStr === 'Medium' ? 15 : 10;
    
    return {
      id: 'base-case',
      name: 'Proceed as Planned',
      description: `Execute the ${params.strategicIntent?.[0] || 'strategic initiative'} in ${params.country || 'target market'} as currently defined.`,
      probability: 60,
      assumptions: [
        `Budget of $${budget.toLocaleString()} is sufficient`,
        `Timeline of ${params.expansionTimeline || '12 months'} is achievable`,
        `Target market conditions remain stable`,
        `Key partnerships can be secured`,
        `Regulatory approvals will be obtained`
      ],
      outcomes: {
        financial: {
          min: budget * -0.3,
          expected: budget * (roiExpectation / 100),
          max: budget * (roiExpectation / 100) * 2
        },
        timeline: {
          min: '6 months',
          expected: params.expansionTimeline || '12 months',
          max: '24 months'
        },
        risk: 50
      },
      keyDifferences: []
    };
  }
  
  /**
   * Generate alternative scenarios
   */
  private static generateAlternatives(params: Partial<ReportParameters>): Scenario[] {
    const budgetStr = params.calibration?.constraints?.budgetCap;
    const budget = budgetStr ? parseFloat(budgetStr.replace(/[^0-9.]/g, '')) : 1000000;
    const alternatives: Scenario[] = [];
    
    // Scenario 1: Do Nothing
    alternatives.push({
      id: 'do-nothing',
      name: 'Do Nothing / Status Quo',
      description: 'Maintain current operations without pursuing this initiative.',
      probability: 100, // Certainty of current state
      assumptions: [
        'Current operations continue unchanged',
        'No additional capital deployed',
        'No expansion into new market'
      ],
      outcomes: {
        financial: { min: 0, expected: 0, max: 0 },
        timeline: { min: 'N/A', expected: 'N/A', max: 'N/A' },
        risk: 10
      },
      keyDifferences: [
        'No market entry achieved',
        'Potential opportunity cost if market grows',
        'Competitors may capture opportunity',
        'Capital available for other uses'
      ]
    });
    
    // Scenario 2: Reduced Scope
    alternatives.push({
      id: 'reduced-scope',
      name: 'Reduced Scope / Pilot',
      description: 'Execute a smaller pilot program before full commitment.',
      probability: 75,
      assumptions: [
        `Budget reduced to $${(budget * 0.3).toLocaleString()}`,
        'Limited market entry - single city or segment',
        'Partnership optional rather than required',
        '6-month pilot before full commitment'
      ],
      outcomes: {
        financial: {
          min: budget * -0.1,
          expected: budget * 0.05,
          max: budget * 0.15
        },
        timeline: {
          min: '3 months',
          expected: '6 months',
          max: '12 months'
        },
        risk: 30
      },
      keyDifferences: [
        '70% less capital at risk',
        'Slower market capture',
        'Option to exit with limited loss',
        'Learn before full commitment'
      ]
    });
    
    // Scenario 3: Aggressive Expansion
    alternatives.push({
      id: 'aggressive',
      name: 'Aggressive Expansion',
      description: 'Double down with more resources for faster market capture.',
      probability: 40,
      assumptions: [
        `Budget increased to $${(budget * 2).toLocaleString()}`,
        'Accelerated timeline with more resources',
        'Multiple market entries simultaneously',
        'Acquire rather than build capabilities'
      ],
      outcomes: {
        financial: {
          min: budget * -1.5,
          expected: budget * 0.5,
          max: budget * 1.5
        },
        timeline: {
          min: '6 months',
          expected: '9 months',
          max: '18 months'
        },
        risk: 75
      },
      keyDifferences: [
        'Higher capital at risk',
        'Potential for market leadership',
        'More resources for challenges',
        'Higher burn rate'
      ]
    });
    
    // Scenario 4: Partner-Led
    if (params.targetPartner || params.strategicIntent?.some(i => i.includes('Partnership'))) {
      alternatives.push({
        id: 'partner-led',
        name: 'Partner-Led Entry',
        description: 'Have local partner lead market entry with our support.',
        probability: 65,
        assumptions: [
          'Strong local partner available',
          'We provide technology/expertise, partner provides market access',
          'Shared economics (50/50 or similar)',
          'Partner takes operational lead'
        ],
        outcomes: {
          financial: {
            min: budget * -0.2,
            expected: budget * 0.1,
            max: budget * 0.25
          },
          timeline: {
            min: '9 months',
            expected: '15 months',
            max: '24 months'
          },
          risk: 40
        },
        keyDifferences: [
          'Lower control over operations',
          'Lower capital requirement',
          'Leverage partner market knowledge',
          'Shared upside and downside'
        ]
      });
    }
    
    // Scenario 5: Different Market
    alternatives.push({
      id: 'alternative-market',
      name: 'Alternative Market Selection',
      description: `Consider a different target market instead of ${params.country || 'selected country'}.`,
      probability: 55,
      assumptions: [
        'Alternative market offers similar opportunity',
        'Lower entry barriers or better conditions',
        'Existing capabilities more transferable',
        'Different competitive dynamics'
      ],
      outcomes: {
        financial: {
          min: budget * -0.25,
          expected: budget * 0.12,
          max: budget * 0.35
        },
        timeline: {
          min: '9 months',
          expected: '15 months',
          max: '24 months'
        },
        risk: 45
      },
      keyDifferences: [
        'Requires new market research',
        'May have better risk/return profile',
        'Different regulatory requirements',
        'Fresh competitive positioning opportunity'
      ]
    });
    
    return alternatives;
  }
  
  /**
   * Analyze regret for not proceeding
   */
  private static analyzeRegret(
    params: Partial<ReportParameters>, 
    baseCase: Scenario,
    alternatives: Scenario[]
  ): CounterfactualAnalysis['regretAnalysis'] {
    // Alternatives available for future multi-scenario regret analysis
    void alternatives;
    // Calculate opportunity cost of doing nothing
    const doNothingCost = baseCase.outcomes.financial.expected; // Expected value foregone
    
    // Assess market risk of waiting
    const highGrowthMarkets = ['Vietnam', 'India', 'Indonesia', 'Philippines'];
    const isHighGrowth = params.country && highGrowthMarkets.includes(params.country);
    
    let doNothingRisk = 'Low - Market is stable, opportunity will persist';
    if (isHighGrowth) {
      doNothingRisk = 'High - Fast-growing market, competitors may capture window';
    }
    
    // Opportunity cost description
    let opportunityCost = `Potential ${baseCase.outcomes.financial.expected > 0 ? 'gain' : 'loss'} of ${
      Math.abs(baseCase.outcomes.financial.expected) >= 1000000 
        ? `$${(baseCase.outcomes.financial.expected / 1000000).toFixed(1)}M`
        : `$${(baseCase.outcomes.financial.expected / 1000).toFixed(0)}K`
    } foregone`;
    
    if (isHighGrowth) {
      opportunityCost += '. Additionally, early-mover advantage may be lost to competitors.';
    }
    
    // Reversibility
    let reversibilityWindow = '6-12 months';
    const hasAcquisition = params.strategicIntent?.some(i => i.includes('Acquisition') || i.includes('merger'));
    if (hasAcquisition) {
      reversibilityWindow = 'Limited - Acquisition decisions are largely irreversible';
    }
    
    return {
      doNothingCost,
      doNothingRisk,
      opportunityCost,
      reversibilityWindow
    };
  }
  
  /**
   * Assess robustness of the plan
   */
  private static assessRobustness(
    params: Partial<ReportParameters>,
    monteCarlo: MonteCarloResult,
    alternatives: Scenario[]
  ): CounterfactualAnalysis['robustness'] {
    const vulnerabilities: string[] = [];
    const resilientFactors: string[] = [];
    
    // Check Monte Carlo results
    if (monteCarlo.probabilityOfLoss > 40) {
      vulnerabilities.push(`High probability of loss (${monteCarlo.probabilityOfLoss.toFixed(1)}%)`);
    }
    
    if (monteCarlo.distribution.stdDev > monteCarlo.distribution.mean * 0.5) {
      vulnerabilities.push('High outcome volatility - results are unpredictable');
    }
    
    if (monteCarlo.probabilityOfTargetReturn > 60) {
      resilientFactors.push(`Good probability of achieving target return (${monteCarlo.probabilityOfTargetReturn.toFixed(1)}%)`);
    }
    
    // Check alternatives
    const reducedScopeOption = alternatives.find(a => a.id === 'reduced-scope');
    if (reducedScopeOption && reducedScopeOption.probability > 70) {
      resilientFactors.push('Pilot option available as fallback');
    }
    
    // Check parameters
    if (params.targetPartner) {
      resilientFactors.push('Identified partner reduces execution risk');
    } else {
      vulnerabilities.push('No partner identified - may slow execution');
    }
    
    const budgetCapStr = params.calibration?.constraints?.budgetCap;
    const budgetCapNum = budgetCapStr ? parseFloat(budgetCapStr.replace(/[^0-9.]/g, '')) : 0;
    if (budgetCapNum > 1000000) {
      resilientFactors.push('Adequate capital buffer for contingencies');
    } else {
      vulnerabilities.push('Limited capital buffer');
    }
    
    // Calculate score
    let score = 50;
    score += resilientFactors.length * 10;
    score -= vulnerabilities.length * 15;
    score += (monteCarlo.probabilityOfTargetReturn - 50) * 0.3;
    score -= (monteCarlo.probabilityOfLoss - 30) * 0.3;
    score = Math.max(0, Math.min(100, score));
    
    return {
      score,
      vulnerabilities,
      resilientFactors
    };
  }
  
  /**
   * Generate final recommendation
   */
  private static generateRecommendation(
    regretAnalysis: CounterfactualAnalysis['regretAnalysis'],
    monteCarlo: MonteCarloResult,
    robustness: CounterfactualAnalysis['robustness']
  ): string {
    if (robustness.score >= 70 && monteCarlo.probabilityOfLoss < 30) {
      return `PROCEED: The plan is robust (score: ${robustness.score}/100) with acceptable downside risk. ` +
        `Monte Carlo simulation shows ${monteCarlo.probabilityOfTargetReturn.toFixed(0)}% probability of achieving target returns. ` +
        `Do-nothing cost is significant: ${regretAnalysis.opportunityCost}`;
    }
    
    if (robustness.score >= 50 && monteCarlo.probabilityOfLoss < 40) {
      return `PROCEED WITH CAUTION: Plan has moderate robustness (score: ${robustness.score}/100). ` +
        `${monteCarlo.probabilityOfLoss.toFixed(0)}% probability of loss in simulations. ` +
        `Consider the reduced-scope pilot option to de-risk. Key vulnerabilities: ${robustness.vulnerabilities.join('; ')}`;
    }
    
    if (robustness.score < 50 && monteCarlo.probabilityOfLoss > 40) {
      return `SIGNIFICANT CONCERNS: Plan shows weak robustness (score: ${robustness.score}/100) with ${monteCarlo.probabilityOfLoss.toFixed(0)}% probability of loss. ` +
        `Strongly recommend pilot approach or plan revision before full commitment. ` +
        `Critical vulnerabilities: ${robustness.vulnerabilities.join('; ')}`;
    }
    
    return `MIXED SIGNALS: Robustness score is ${robustness.score}/100 with ${monteCarlo.probabilityOfLoss.toFixed(0)}% loss probability. ` +
      `Weigh opportunity cost (${regretAnalysis.opportunityCost}) against risk factors (${robustness.vulnerabilities.join('; ')}). ` +
      `Consider pilot option before full commitment.`;
  }
  
  /**
   * Quick counterfactual summary for UI display
   */
  static getQuickSummary(params: Partial<ReportParameters>): {
    shouldProceed: boolean;
    confidence: number;
    keyRisks: string[];
    alternatives: string[];
  } {
    const analysis = this.analyze(params);
    
    return {
      shouldProceed: analysis.robustness.score >= 50,
      confidence: analysis.robustness.score,
      keyRisks: analysis.robustness.vulnerabilities.slice(0, 3),
      alternatives: analysis.alternativeScenarios.slice(1, 3).map(a => a.name)
    };
  }
}

export default CounterfactualEngine;

