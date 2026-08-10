/**
 * OutcomeLearningService — Session outcome recorder for the ML feedback loop.
 * Every time a user marks a recommendation as helpful/unhelpful or completes
 * a case, that outcome is recorded here and can be fed into the ML pipeline.
 */

export interface OutcomeRecord {
  id: string;
  sessionId: string;
  timestamp: string;
  query: string;
  recommendation: string;
  userRating: 'positive' | 'negative' | 'neutral' | null;
  wasActedOn: boolean;
  domain: string;
  confidence: number;
}

export interface OutcomeLearningState {
  records: OutcomeRecord[];
  positiveCount: number;
  negativeCount: number;
  averageConfidence: number;
  lastUpdated: string;
}

const _state: OutcomeLearningState = {
  records: [],
  positiveCount: 0,
  negativeCount: 0,
  averageConfidence: 0,
  lastUpdated: new Date().toISOString(),
};

function recalcStats() {
  _state.positiveCount = _state.records.filter(r => r.userRating === 'positive').length;
  _state.negativeCount = _state.records.filter(r => r.userRating === 'negative').length;
  const sum = _state.records.reduce((a, r) => a + r.confidence, 0);
  _state.averageConfidence = _state.records.length > 0 ? sum / _state.records.length : 0;
  _state.lastUpdated = new Date().toISOString();
}

export const OutcomeLearningService = {
  getState(): OutcomeLearningState {
    return { ..._state, records: [..._state.records] };
  },

  record(entry: Omit<OutcomeRecord, 'id' | 'timestamp'>): OutcomeRecord {
    const record: OutcomeRecord = {
      ...entry,
      id: `outcome-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    _state.records.push(record);
    // Keep last 500
    if (_state.records.length > 500) _state.records.splice(0, _state.records.length - 500);
    recalcStats();

    // Fire-and-forget: send to ML pipeline via API
    fetch('/api/engines/ml/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: record.id,
        accurate: record.userRating === 'positive',
        outcome: { confidence: record.confidence },
        comment: record.query.slice(0, 100),
      }),
    }).catch(() => {/* non-critical */});

    return record;
  },

  rateLastRecommendation(sessionId: string, rating: 'positive' | 'negative'): void {
    const last = [..._state.records].reverse().find(r => r.sessionId === sessionId);
    if (last) {
      last.userRating = rating;
      recalcStats();
    }
  },

  clearSession(sessionId: string): void {
    _state.records = _state.records.filter(r => r.sessionId !== sessionId);
    recalcStats();
  },
};
