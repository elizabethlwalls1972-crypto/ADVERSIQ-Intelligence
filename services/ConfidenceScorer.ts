/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONFIDENCE SCORER SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Aggregates Judge verdicts and Pipeline Layer outputs into a unified confidence score.
 * Determines whether output is ready to use, needs review, or should be rejected.
 */

import { PipelineState, Layer08Output } from './PipelineOrchestrator';
import { Judge1Output, Judge2Output, Judge3Output, JudgeConsensus } from './JudgeOrchestrator';

// ─── Scoring Types ────────────────────────────────────────────────────────────

export type ScoringDimension = 
  | 'logical'
  | 'safety'
  | 'knowledge'
  | 'robustness'
  | 'coherence'
  | 'entityVerification'
  | 'reflexive'
  | 'consensus';

export interface DimensionScore {
  dimension: ScoringDimension;
  score: number; // 0-1
  weight: number; // 0-1
  justification: string;
}

export interface HypothesisScore {
  hypothesis: string;
  dimensions: DimensionScore[];
  weightedConfidence: number; // 0-1
  recommendedAction: 'use' | 'review' | 'reject' | 'merge';
  reasoning: string;
}

export interface ScoringResult {
  hypotheses: HypothesisScore[];
  topCandidate: string;
  overallConfidence: number; // 0-1
  confidenceCurve: {
    veryLow: string[];   // < 0.4
    low: string[];       // 0.4-0.6
    medium: string[];    // 0.6-0.75
    high: string[];      // 0.75-0.9
    veryHigh: string[];  // >= 0.9
  };
  escalationReasons: string[];
  recommendation: 'proceed' | 'review' | 'reject' | 'escalate';
}

// ─── Dimension Scorers ─────────────────────────────────────────────────────────

class DimensionScorer {
  // 1. Logical Soundness (from Judge 2)
  scoreLogical(judge2: Judge2Output, weight: number = 0.2): DimensionScore {
    let score = judge2.confidence ?? 0.5;

    // Penalties
    if (judge2.fallaciesDetected && judge2.fallaciesDetected.length > 0) {
      score -= 0.2;
    }
    if (judge2.logicalGaps && judge2.logicalGaps.some(g => g.severity === 'fatal')) {
      score -= 0.3;
    }
    if (!judge2.isLogicallySound) {
      score -= 0.15;
    }
    if (!judge2.reproduced) {
      score -= 0.1;
    }

    score = Math.max(0, Math.min(1, score)); // Clamp 0-1

    return {
      dimension: 'logical',
      score,
      weight,
      justification: `Logical: sound=${judge2.isLogicallySound}, fallacies=${judge2.fallaciesDetected?.length ?? 0}, gaps=${judge2.logicalGaps?.length ?? 0}, reproduced=${judge2.reproduced}`,
    };
  }

  // 2. Safety (from Judge 1)
  scoreSafety(judge1: Judge1Output, weight: number = 0.25): DimensionScore {
    let score = 1.0;

    // Risk level penalties
    switch (judge1.riskLevel) {
      case 'critical':
        score = 0.0;
        break;
      case 'high':
        score = 0.3;
        break;
      case 'medium':
        score = 0.7;
        break;
      case 'low':
        score = 0.95;
        break;
    }

    // Safety violations penalty
    if (judge1.safetyViolations && judge1.safetyViolations.length > 0) {
      score -= 0.3;
    }

    // Edge cases penalty
    if (judge1.edgeCases && judge1.edgeCases.length > 5) {
      score -= 0.1;
    }

    // Escalate flag
    if (judge1.escalate) {
      score = 0.0;
    }

    score = Math.max(0, Math.min(1, score));

    return {
      dimension: 'safety',
      score,
      weight,
      justification: `Safety: risk=${judge1.riskLevel}, violations=${judge1.safetyViolations?.length ?? 0}, edgeCases=${judge1.edgeCases?.length ?? 0}, escalate=${judge1.escalate}`,
    };
  }

  // 3. Knowledge Coverage (from Judge 3)
  scoreKnowledge(judge3: Judge3Output, weight: number = 0.15): DimensionScore {
    let score = judge3.confidence ?? 0.5;

    // Boost for cross-domain patterns
    if (judge3.crossDomainPatterns && judge3.crossDomainPatterns.length > 0) {
      score += 0.1;
    }

    // Boost for recommended approaches
    if (judge3.recommendedApproaches && judge3.recommendedApproaches.length > 0) {
      score += 0.05;
    }

    // Penalty for missing perspectives
    if (judge3.missingPerspectives && judge3.missingPerspectives.length > 3) {
      score -= 0.15;
    }

    score = Math.max(0, Math.min(1, score));

    return {
      dimension: 'knowledge',
      score,
      weight,
      justification: `Knowledge: crossDomain=${judge3.crossDomainPatterns?.length ?? 0}, approaches=${judge3.recommendedApproaches?.length ?? 0}, missing=${judge3.missingPerspectives?.length ?? 0}`,
    };
  }

  // 4. Robustness (from Layer 03: Stress Testing)
  scoreRobustness(robustnessScores: number[], weight: number = 0.15): DimensionScore {
    const avgRobustness =
      robustnessScores.length > 0
        ? robustnessScores.reduce((a, b) => a + b, 0) / robustnessScores.length
        : 0.5;

    return {
      dimension: 'robustness',
      score: avgRobustness,
      weight,
      justification: `Robustness: avg=${avgRobustness.toFixed(2)}, samples=${robustnessScores.length}`,
    };
  }

  // 5. Coherence (from Layer 04: Cognitive Modelling)
  scoreCoherence(coherenceScores: number[], weight: number = 0.1): DimensionScore {
    const avgCoherence =
      coherenceScores.length > 0
        ? coherenceScores.reduce((a, b) => a + b, 0) / coherenceScores.length
        : 0.5;

    return {
      dimension: 'coherence',
      score: avgCoherence,
      weight,
      justification: `Coherence: avg=${avgCoherence.toFixed(2)}, models=${coherenceScores.length}`,
    };
  }

  // 6. Entity Verification (from Layer 07)
  scoreEntityVerification(
    verifiedCount: number,
    unverifiableCount: number,
    contradictionCount: number,
    weight: number = 0.1
  ): DimensionScore {
    const total = verifiedCount + unverifiableCount + contradictionCount;
    let score = total > 0 ? verifiedCount / total : 0.5;

    // Heavy penalty for contradictions
    if (contradictionCount > 0) {
      score -= 0.3 * (contradictionCount / (total || 1));
    }

    score = Math.max(0, Math.min(1, score));

    return {
      dimension: 'entityVerification',
      score,
      weight,
      justification: `Entity: verified=${verifiedCount}, unverifiable=${unverifiableCount}, contradicts=${contradictionCount}`,
    };
  }

  // 7. Reflexive Soundness (from Layer 06)
  scoreReflexive(
    overallSoundness: 'sound' | 'questionable' | 'unsound',
    groupThinkRisks: number,
    constraintViolations: number,
    weight: number = 0.1
  ): DimensionScore {
    let score = 0;
    switch (overallSoundness) {
      case 'sound':
        score = 0.9;
        break;
      case 'questionable':
        score = 0.6;
        break;
      case 'unsound':
        score = 0.2;
        break;
    }

    // Penalties
    score -= groupThinkRisks * 0.1;
    score -= constraintViolations * 0.15;
    score = Math.max(0, Math.min(1, score));

    return {
      dimension: 'reflexive',
      score,
      weight,
      justification: `Reflexive: soundness=${overallSoundness}, groupThinkRisks=${groupThinkRisks}, violations=${constraintViolations}`,
    };
  }

  // 8. Consensus (all judges agree)
  scoreConsensus(judges: JudgeConsensus | undefined, weight: number = 0.05): DimensionScore {
    if (!judges) {
      return { dimension: 'consensus', score: 0.5, weight, justification: 'No judge consensus' };
    }

    const { verdict, conflicts } = judges;
    let score = 0.8; // Base score

    // Boost if all agree
    if (verdict.safe && verdict.logicallySound && verdict.wellInformed) {
      score = 0.95;
    }

    // Penalty for conflicts
    if (conflicts && conflicts.length > 0) {
      score -= 0.1 * conflicts.length;
    }

    score = Math.max(0, Math.min(1, score));

    return {
      dimension: 'consensus',
      score,
      weight,
      justification: `Consensus: recommendation=${verdict.recommendation}, conflicts=${conflicts?.length ?? 0}`,
    };
  }
}

// ─── Confidence Scorer ─────────────────────────────────────────────────────────

export class ConfidenceScorer {
  private dimensionScorer: DimensionScorer;

  constructor() {
    this.dimensionScorer = new DimensionScorer();
  }

  async scoreHypothesis(hypothesis: string, state: PipelineState): Promise<HypothesisScore> {
    const dimensions: DimensionScore[] = [];

    // Collect scores from each dimension
    if (state.judgeConsensus) {
      dimensions.push(
        this.dimensionScorer.scoreLogical(state.judgeConsensus.judge2, 0.2),
        this.dimensionScorer.scoreSafety(state.judgeConsensus.judge1, 0.25),
        this.dimensionScorer.scoreKnowledge(state.judgeConsensus.judge3, 0.15)
      );
    }

    if (state.layer03) {
      const robustnesses = state.layer03.stressTestResults
        .filter(r => r.hypothesis === hypothesis)
        .map(r => r.robustness);
      dimensions.push(this.dimensionScorer.scoreRobustness(robustnesses, 0.15));
    }

    if (state.layer04) {
      const coherences = state.layer04.mentalModels
        .filter(m => m.hypothesis === hypothesis)
        .map(m => m.coherence);
      dimensions.push(this.dimensionScorer.scoreCoherence(coherences, 0.1));
    }

    if (state.layer07) {
      const verified = state.layer07.entities.filter(e => e.verificationStatus === 'verified').length;
      const unverifiable = state.layer07.entities.filter(e => e.verificationStatus === 'unverifiable').length;
      const contradicts = state.layer07.entities.filter(e => e.verificationStatus === 'contradicts_known').length;
      dimensions.push(
        this.dimensionScorer.scoreEntityVerification(verified, unverifiable, contradicts, 0.1)
      );
    }

    if (state.layer06) {
      dimensions.push(
        this.dimensionScorer.scoreReflexive(
          state.layer06.overallSoundness,
          state.layer06.groupThinkRisks.length,
          state.layer06.constraintViolations.length,
          0.1
        )
      );
    }

    if (state.judgeConsensus) {
      dimensions.push(this.dimensionScorer.scoreConsensus(state.judgeConsensus, 0.05));
    }

    // Compute weighted confidence
    const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
    const weightedConfidence =
      totalWeight > 0
        ? dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / totalWeight
        : 0.5;

    // Determine recommended action
    const recommendedAction = this.determineAction(weightedConfidence);

    const reasoning = `${hypothesis} (confidence: ${weightedConfidence.toFixed(2)}). Scores: ${dimensions.map(d => `${d.dimension}=${d.score.toFixed(2)}`).join(', ')}`;

    return {
      hypothesis,
      dimensions,
      weightedConfidence,
      recommendedAction,
      reasoning,
    };
  }

  async computeResult(state: PipelineState): Promise<ScoringResult> {
    const hypotheses = state.layer08?.hypothesisScores ?? [];

    const scoredHypotheses: HypothesisScore[] = [];
    for (const hyp of hypotheses) {
      const score = await this.scoreHypothesis(hyp.hypothesis, state);
      scoredHypotheses.push(score);
    }

    // Sort by confidence descending
    scoredHypotheses.sort((a, b) => b.weightedConfidence - a.weightedConfidence);

    const topCandidate = scoredHypotheses[0]?.hypothesis ?? '';
    const overallConfidence = scoredHypotheses[0]?.weightedConfidence ?? 0;

    // Categorize by confidence level
    const confidenceCurve = {
      veryLow: scoredHypotheses
        .filter(h => h.weightedConfidence < 0.4)
        .map(h => h.hypothesis),
      low: scoredHypotheses
        .filter(h => h.weightedConfidence >= 0.4 && h.weightedConfidence < 0.6)
        .map(h => h.hypothesis),
      medium: scoredHypotheses
        .filter(h => h.weightedConfidence >= 0.6 && h.weightedConfidence < 0.75)
        .map(h => h.hypothesis),
      high: scoredHypotheses
        .filter(h => h.weightedConfidence >= 0.75 && h.weightedConfidence < 0.9)
        .map(h => h.hypothesis),
      veryHigh: scoredHypotheses
        .filter(h => h.weightedConfidence >= 0.9)
        .map(h => h.hypothesis),
    };

    const escalationReasons: string[] = [];
    if (overallConfidence < 0.5) {
      escalationReasons.push('Overall confidence below 50%');
    }
    if (state.judgeConsensus?.verdict.recommendation === 'escalate') {
      escalationReasons.push('Judge verdict: escalate');
    }
    if (state.layer08?.escalationFlags && state.layer08.escalationFlags.length > 0) {
      escalationReasons.push(...state.layer08.escalationFlags);
    }

    const recommendation = this.determineRecommendation(overallConfidence, escalationReasons.length > 0);

    return {
      hypotheses: scoredHypotheses,
      topCandidate,
      overallConfidence,
      confidenceCurve,
      escalationReasons,
      recommendation,
    };
  }

  private determineAction(confidence: number): 'use' | 'review' | 'reject' | 'merge' {
    if (confidence >= 0.85) return 'use';
    if (confidence >= 0.65) return 'review';
    if (confidence >= 0.4) return 'merge'; // Consider multiple
    return 'reject';
  }

  private determineRecommendation(
    confidence: number,
    hasEscalationReasons: boolean
  ): 'proceed' | 'review' | 'reject' | 'escalate' {
    if (hasEscalationReasons) return 'escalate';
    if (confidence >= 0.85) return 'proceed';
    if (confidence >= 0.6) return 'review';
    return 'reject';
  }
}

export default new ConfidenceScorer();
