export type ParallelMatchResult = {
  matches: Array<{
    id: string;
    title: string;
    score: number;
    summary: string;
    timestamp: string;
  }>;
  summary: string;
  timestamp: string;
};

export class HistoricalParallelMatcher {
  static match(_params: unknown): ParallelMatchResult {
    return {
      matches: [],
      summary: 'No historical parallels are available in the local development environment.',
      timestamp: new Date().toISOString(),
    };
  }

  static quickMatch(_params: unknown): ParallelMatchResult {
    return this.match(_params);
  }
}

export default HistoricalParallelMatcher;
