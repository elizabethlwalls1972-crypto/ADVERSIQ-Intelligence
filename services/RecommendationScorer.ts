import type { CaseGraph } from './CaseGraphBuilder';

export interface RecommendationCandidate {
  id: string;
  title: string;
  category: 'report' | 'letter';
  relevance: number;
  rationale?: string;
  supportingDocuments?: string[];
}

export interface RecommendationScore {
  id: string;
  total: number;
  fitScore: number;
  evidenceScore: number;
  urgencyScore: number;
  complianceScore: number;
  rationale: string;
}

export interface RecommendationScoreInput {
  candidates: RecommendationCandidate[];
  graph: CaseGraph;
  context: {
    targetAudience?: string;
    jurisdiction?: string;
    decisionDeadline?: string;
    situationType?: string;
    constraints?: string;
  };
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const scoreUrgency = (deadline?: string) => {
  if (!deadline) return 45;
  const normalized = deadline.toLowerCase();
  if (normalized.includes('urgent') || normalized.includes('immediate') || normalized.includes('week')) return 90;
  if (normalized.includes('month') || normalized.includes('30')) return 70;
  return 55;
};

const scoreCompliance = (title: string, context: RecommendationScoreInput['context']) => {
  const signal = `${title} ${context.jurisdiction || ''} ${context.targetAudience || ''}`.toLowerCase();
  if (/compliance|regulatory|submission|legal|court|government/.test(signal)) return 88;
  if (/due diligence|risk|assessment/.test(signal)) return 78;
  return 62;
};

const scoreFit = (candidate: RecommendationCandidate, context: RecommendationScoreInput['context']) => {
  const text = `${candidate.title} ${candidate.rationale || ''}`.toLowerCase();
  const audience = (context.targetAudience || '').toLowerCase();
  const situation = (context.situationType || '').toLowerCase();

  let boost = 0;
  if (audience && text.includes(audience.split(' ')[0])) boost += 8;
  if (/invest/.test(situation) && /investment|due diligence|memo/.test(text)) boost += 12;
  if (/compliance|regul|legal/.test(situation) && /compliance|submission|legal|court/.test(text)) boost += 12;
  if (/partner|joint/.test(situation) && /partnership|stakeholder|proposal/.test(text)) boost += 10;

  return clamp(candidate.relevance + boost, 0, 100);
};

const scoreEvidence = (candidate: RecommendationCandidate, graph: CaseGraph) => {
  const base = graph.summary.evidenceStrength;
  const hasSupportDocs = (candidate.supportingDocuments || []).length > 0 ? 8 : 0;
  const stakeholderNeed = candidate.category === 'letter' ? graph.summary.stakeholderCoverage * 0.3 : 0;
  return clamp(base * 0.7 + hasSupportDocs + stakeholderNeed);
};

export class RecommendationScorer {
  static rank(input: RecommendationScoreInput): RecommendationScore[] {
    return input.candidates.map((candidate) => {
      const fitScore = scoreFit(candidate, input.context);
      const evidenceScore = scoreEvidence(candidate, input.graph);
      const urgencyScore = scoreUrgency(input.context.decisionDeadline);
      const complianceScore = scoreCompliance(candidate.title, input.context);

      const total = clamp(
        fitScore * 0.4 +
          evidenceScore * 0.25 +
          urgencyScore * 0.15 +
          complianceScore * 0.2
      );

      return {
        id: candidate.id,
        total,
        fitScore,
        evidenceScore,
        urgencyScore,
        complianceScore,
        rationale: `Scored by fit (${Math.round(fitScore)}), evidence (${Math.round(evidenceScore)}), urgency (${Math.round(urgencyScore)}), compliance (${Math.round(complianceScore)}).`
      };
    }).sort((a, b) => b.total - a.total);
  }
}

export default RecommendationScorer;
