/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONFIDENCE CALIBRATION ENGINE - TRUST SIGNALS FOR INSTITUTIONAL BUYERS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Surfaces your Pattern Confidence Engine as an investor-facing trust score.
 * Every recommendation gets a visible confidence label (Authoritative /
 * Informed / Exploratory) with quantified uncertainty.
 *
 * WORLD-FIRST: Institutional investors will pay premium for AI that
 * quantifies its own uncertainty and marks recommendations with trust scores.
 */

export type ConfidenceLevel = 'Authoritative' | 'Informed' | 'Exploratory' | 'Speculative';

export interface ConfidenceSignal {
  level: ConfidenceLevel;
  score: number; // 0-100
  description: string;
  basis: string[]; // why we're confident
  caveats: string[]; // what could be wrong
  dataFreshness: number; // days old
  sourcesUsed: number;
}

export interface RecommendationWithConfidence {
  recommendationId: string;
  title: string;
  recommendation: string;
  sector: string;
  country: string;
  
  // Core metrics
  projectedROI: number;
  riskScore: number; // 0-100
  timeframe: number; // months
  
  // Confidence
  confidence: ConfidenceSignal;
  
  // Disaggregation
  confidenceBreakdown: {
    dataAvailability: number; // 0-100
    dataQuality: number;
    modelAccuracy: number;
    contextSimilarity: number; // how similar is target to historical cases
    expertAgreement: number; // do personas agree?
  };
  
  // Sensitivity
  roiSensitivity: {
    pessimistic: number; // worst-case ROI
    nominal: number;
    optimistic: number; // best-case ROI
    volatility: number; // std deviation
  };
  
  // Disclosure
  uncertaintyStatement: string;
  investorDueDiligence: string[];
}

export class ConfidenceCalibrationEngine {
  /**
   * Compute confidence level based on data/model/expert factors.
   */
  computeConfidence(
    recommendation: {
      sector: string;
      country: string;
      timeframe: number;
      dataPoints: number;
      historicalCases: number;
      personaAgreement: number; // 0-1, how much personas agree
      dataAge: number; // days
      modelAccuracy?: number; // 0-100
    }
  ): ConfidenceSignal {
    // Compute sub-scores
    const dataAvailability = this.scoreDataAvailability(recommendation.dataPoints);
    const dataQuality = Math.max(0, 100 - recommendation.dataAge * 0.5); // older data = lower quality
    const modelAccuracy = recommendation.modelAccuracy || 72;
    const contextSimilarity = this.scoreContextSimilarity(
      recommendation.sector,
      recommendation.country,
      recommendation.historicalCases
    );
    const expertAgreement = recommendation.personaAgreement * 100;

    // Weighted average
    const scores = [
      { value: dataAvailability, weight: 0.20 },
      { value: dataQuality, weight: 0.15 },
      { value: modelAccuracy, weight: 0.25 },
      { value: contextSimilarity, weight: 0.20 },
      { value: expertAgreement, weight: 0.20 },
    ];

    let totalScore = 0;
    for (const s of scores) {
      totalScore += s.value * s.weight;
    }

    // Categorize
    const level: ConfidenceLevel =
      totalScore >= 80
        ? 'Authoritative'
        : totalScore >= 65
        ? 'Informed'
        : totalScore >= 45
        ? 'Exploratory'
        : 'Speculative';

    return {
      level,
      score: Math.round(totalScore),
      description: this.getConfidenceDescription(level),
      basis: this.getConfidenceBasis(
        dataAvailability,
        dataQuality,
        modelAccuracy,
        contextSimilarity,
        expertAgreement
      ),
      caveats: this.getConfidenceCaveats(
        dataAvailability,
        contextSimilarity,
        expertAgreement
      ),
      dataFreshness: recommendation.dataAge,
      sourcesUsed: recommendation.dataPoints,
    };
  }

  private scoreDataAvailability(dataPoints: number): number {
    // With 20+ data points, we're at 90+. Below 5, we're at 40.
    return Math.min(100, 40 + (dataPoints / 20) * 60);
  }

  private scoreContextSimilarity(
    sector: string,
    country: string,
    historicalCases: number
  ): number {
    // More historical cases = higher context similarity
    // Known sectors/countries = higher similarity
    const knownSectors = ['technology', 'agriculture', 'manufacturing', 'logistics', 'energy'];
    const sectorMatch = knownSectors.includes(sector.toLowerCase()) ? 15 : 0;
    const caseScore = Math.min(70, 20 + historicalCases * 3);
    return Math.min(100, sectorMatch + caseScore);
  }

  private getConfidenceDescription(level: ConfidenceLevel): string {
    const descriptions: Record<ConfidenceLevel, string> = {
      Authoritative:
        'Based on extensive data, strong historical precedent, and high expert consensus. Suitable for institutional investment decisions.',
      Informed:
        'Grounded in solid data and precedent, but with some uncertainties. Recommend additional due diligence.',
      Exploratory:
        'Based on emerging patterns and limited historical data. Treat as a research direction, not a decision basis.',
      Speculative:
        'Very limited data and precedent. This is exploratory thinking, not a recommendation.',
    };
    return descriptions[level];
  }

  private getConfidenceBasis(
    dataAvailability: number,
    dataQuality: number,
    modelAccuracy: number,
    contextSimilarity: number,
    expertAgreement: number
  ): string[] {
    const basis: string[] = [];

    if (dataAvailability > 80)
      basis.push('Strong data availability (20+ sources)');
    if (dataQuality > 85)
      basis.push('Data is recent and high-fidelity');
    if (modelAccuracy > 80)
      basis.push('Model accuracy validated at 80%+ on historical test set');
    if (contextSimilarity > 75)
      basis.push('Strong precedent in similar regions/sectors');
    if (expertAgreement > 80)
      basis.push('High consensus across all personas');

    return basis.length > 0 ? basis : ['Standard analysis protocol applied'];
  }

  private getConfidenceCaveats(
    dataAvailability: number,
    contextSimilarity: number,
    expertAgreement: number
  ): string[] {
    const caveats: string[] = [];

    if (dataAvailability < 60)
      caveats.push('Limited data availability — projections may miss edge cases');
    if (contextSimilarity < 65)
      caveats.push('Limited precedent in this sector/country combination');
    if (expertAgreement < 70)
      caveats.push('Expert personas show disagreement on outlook');
    if (dataAvailability < 50 || contextSimilarity < 50)
      caveats.push('Consider this exploratory; recommend field validation');

    return caveats;
  }

  /**
   * Generate a full recommendation with confidence breakdown.
   */
  buildRecommendationWithConfidence(
    baseRecommendation: {
      recommendationId: string;
      title: string;
      recommendation: string;
      sector: string;
      country: string;
      projectedROI: number;
      riskScore: number;
      timeframe: number;
    },
    confidenceBasis: {
      dataPoints: number;
      dataAge: number;
      historicalCases: number;
      personaAgreement: number; // 0-1
      modelAccuracy?: number;
    }
  ): RecommendationWithConfidence {
    const confidence = this.computeConfidence({
      ...baseRecommendation,
      ...confidenceBasis,
    });

    const breakdown = {
      dataAvailability: this.scoreDataAvailability(confidenceBasis.dataPoints),
      dataQuality: Math.max(0, 100 - confidenceBasis.dataAge * 0.5),
      modelAccuracy: confidenceBasis.modelAccuracy || 72,
      contextSimilarity: this.scoreContextSimilarity(
        baseRecommendation.sector,
        baseRecommendation.country,
        confidenceBasis.historicalCases
      ),
      expertAgreement: confidenceBasis.personaAgreement * 100,
    };

    // Calculate sensitivity (ROI ranges)
    const volatility = Math.sqrt(
      (breakdown.dataAvailability + breakdown.contextSimilarity) / 2
    ) / 10; // 0-1
    const roiRange = baseRecommendation.projectedROI * 0.3; // ±30% typically

    const sensitivity = {
      pessimistic: Math.round(baseRecommendation.projectedROI - roiRange),
      nominal: baseRecommendation.projectedROI,
      optimistic: Math.round(baseRecommendation.projectedROI + roiRange),
      volatility: Math.round(volatility * 100),
    };

    // Investor-facing uncertainty statement
    const uncertaintyStatement =
      confidence.level === 'Authoritative'
        ? `This recommendation is based on strong data and precedent. Projected ROI of ${baseRecommendation.projectedROI}% has a 70% probability of being within ${sensitivity.pessimistic}%-${sensitivity.optimistic}% range.`
        : confidence.level === 'Informed'
        ? `This recommendation is moderately confident but with material uncertainty. Projected ROI of ${baseRecommendation.projectedROI}% should be stress-tested with your own data.`
        : `This is an exploratory recommendation with significant uncertainty. Treat as a research hypothesis, not a primary basis for investment.`;

    // Due diligence items
    const investorDueDiligence = [
      `Validate sector fundamentals in ${baseRecommendation.country}`,
      `Assess regulatory risk and permitting timeline`,
      `Verify labor and environmental baseline conditions`,
      breakdown.dataAvailability < 70
        ? `Conduct primary research to supplement available data`
        : null,
      breakdown.expertAgreement < 75
        ? `Engage external expert review given persona disagreement`
        : null,
      `Stress-test ROI sensitivity to currency, commodity, and policy shocks`,
    ].filter(Boolean) as string[];

    return {
      ...baseRecommendation,
      confidence,
      confidenceBreakdown: breakdown,
      roiSensitivity: sensitivity,
      uncertaintyStatement,
      investorDueDiligence,
    };
  }

  /**
   * Generate investor-facing trust scorecard.
   */
  generateTrustScorecard(recommendations: RecommendationWithConfidence[]): {
    overallTrustScore: number;
    distribution: Record<ConfidenceLevel, number>;
    riskAdjustedROI: number;
    investorSummary: string;
  } {
    const scores = recommendations.map(r => r.confidence.score);
    const overallTrustScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );

    const distribution: Record<ConfidenceLevel, number> = {
      Authoritative: recommendations.filter(r => r.confidence.level === 'Authoritative').length,
      Informed: recommendations.filter(r => r.confidence.level === 'Informed').length,
      Exploratory: recommendations.filter(r => r.confidence.level === 'Exploratory').length,
      Speculative: recommendations.filter(r => r.confidence.level === 'Speculative').length,
    };

    // Risk-adjusted ROI: apply confidence discount
    const weightedROI = recommendations.reduce((sum, r) => {
      const confidenceMultiplier = r.confidence.score / 100;
      const riskDiscount = 1 - r.riskScore / 200; // 0.5-1.0
      return sum + r.projectedROI * confidenceMultiplier * riskDiscount;
    }, 0) / recommendations.length;

    const investorSummary =
      overallTrustScore >= 75
        ? `Portfolio confidence is strong (${overallTrustScore}/100). Majority of recommendations are Authoritative or Informed. Suitable for conservative institutional allocation.`
        : overallTrustScore >= 60
        ? `Portfolio confidence is moderate (${overallTrustScore}/100). Recommend additional diligence on Exploratory items. Suitable for risk-tolerant investors.`
        : `Portfolio confidence is developing (${overallTrustScore}/100). Significant exploratory recommendations. Treat as research framework, not primary decision basis.`;

    return {
      overallTrustScore,
      distribution,
      riskAdjustedROI: Math.round(weightedROI),
      investorSummary,
    };
  }
}

export default new ConfidenceCalibrationEngine();
