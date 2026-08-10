export interface PredictionAccuracy {
  overall: number;
  sampleSize: number;
  confidence: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface LearningInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  applicableDomains: string[];
  source: string;
}

class OutcomeTrackerService {
  static getApplicableInsights(_params: unknown): LearningInsight[] {
    return [];
  }

  static getPredictionAccuracy(): PredictionAccuracy {
    return { overall: 0, sampleSize: 0, confidence: 0, trend: 'stable' };
  }

  static trackDecision(
    _params: unknown,
    _predictions: unknown,
    _decision: string,
    _rationale?: string
  ): string {
    return `decision-${Date.now()}`;
  }

  static recordOutcome(_decisionId: string, _outcome: unknown): void {
    // no-op stub
  }

  static getInsights(): LearningInsight[] {
    return [];
  }
}

export const OutcomeTracker = OutcomeTrackerService;
export default OutcomeTrackerService;
