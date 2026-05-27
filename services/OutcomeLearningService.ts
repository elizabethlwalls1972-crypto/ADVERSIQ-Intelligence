export interface OutcomeLearningRecord {
  caseId: string;
  timestamp: string;
  recommendedInterventions: string[];
  successfulInterventions: string[];
  governanceThreshold: number;
  rankingDelta: number;
}

export interface OutcomeLearningState {
  records: OutcomeLearningRecord[];
  suggestedGovernanceThreshold: number;
  suggestedRankingBias: number;
}

export class OutcomeLearningService {
  private static state: OutcomeLearningState = {
    records: [],
    suggestedGovernanceThreshold: 80,
    suggestedRankingBias: 0
  };

  static recordOutcome(record: OutcomeLearningRecord): OutcomeLearningState {
    this.state.records.push(record);
    if (this.state.records.length > 250) {
      this.state.records = this.state.records.slice(-250);
    }

    const matchRatio = record.recommendedInterventions.length === 0
      ? 0
      : record.successfulInterventions.length / record.recommendedInterventions.length;

    const thresholdAdjustment = matchRatio >= 0.7 ? -1 : matchRatio <= 0.35 ? 1 : 0;
    this.state.suggestedGovernanceThreshold = Math.max(70, Math.min(92, this.state.suggestedGovernanceThreshold + thresholdAdjustment));

    const rankingAdjustment = matchRatio >= 0.7 ? 0.5 : matchRatio <= 0.35 ? -0.5 : 0;
    this.state.suggestedRankingBias = Math.max(-12, Math.min(12, this.state.suggestedRankingBias + rankingAdjustment));

    return this.getState();
  }

  static getState(): OutcomeLearningState {
    return {
      records: [...this.state.records],
      suggestedGovernanceThreshold: this.state.suggestedGovernanceThreshold,
      suggestedRankingBias: this.state.suggestedRankingBias
    };
  }
}
