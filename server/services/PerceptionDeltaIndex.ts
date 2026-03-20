import type { OverlookedIntelligenceSnapshot } from '../routes/overlookedFirstEngine.js';
import type { StrategicPipelineOutput } from '../routes/strategicIntelligencePipeline.js';

export interface PerceptionDeltaSignal {
  dimension: 'market_bias' | 'evidence_strength' | 'execution_readiness' | 'assumption_stability';
  perceived: number;
  observed: number;
  delta: number;
  weight: number;
  note: string;
}

export interface PerceptionDeltaIndex {
  model: 'nsil_perception_delta_v1';
  deltaIndex: number;
  driftDirection: 'underestimation' | 'overestimation' | 'aligned';
  confidence: number;
  correctionFactors: string[];
  keySignals: PerceptionDeltaSignal[];
  summary: string;
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const estimateContextRichness = (context: unknown): number => {
  if (!context || typeof context !== 'object') return 20;

  const root = context as Record<string, unknown>;
  const keys = Object.keys(root).length;
  const caseStudy = root.caseStudy && typeof root.caseStudy === 'object'
    ? (root.caseStudy as Record<string, unknown>)
    : null;
  const caseSignals = caseStudy ? Object.values(caseStudy).filter((value) => {
    if (typeof value === 'string') return value.trim().length >= 4;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  }).length : 0;

  const serialized = JSON.stringify(context);
  const sizeScore = clamp(Math.round(serialized.length / 180), 0, 55);
  return clamp(20 + Math.min(keys * 4, 25) + Math.min(caseSignals * 3, 25) + sizeScore, 0, 100);
};

const buildCorrectionFactors = (
  overlooked: OverlookedIntelligenceSnapshot,
  strategic: StrategicPipelineOutput,
  gapCount: number,
  absoluteDelta: number
): string[] => {
  const factors: string[] = [];

  if (overlooked.evidenceCredibility < 60) {
    factors.push('Increase verifiable evidence density before escalating recommendation confidence.');
  }
  if (strategic.readinessScore < 65) {
    factors.push('Introduce a staged readiness plan with explicit milestone gates and owners.');
  }
  if (gapCount > 2) {
    factors.push('Close the highest-impact missing case signals before final strategic commitment.');
  }
  if (absoluteDelta >= 18) {
    factors.push('Run a counter-assumption review to reduce perception-vs-reality distortion.');
  }
  if (factors.length === 0) {
    factors.push('Maintain current trajectory and monitor variance with weekly evidence refresh.');
  }

  return factors;
};

export const buildPerceptionDeltaIndex = (
  message: string,
  context: unknown,
  overlooked: OverlookedIntelligenceSnapshot,
  strategic: StrategicPipelineOutput,
  unresolvedGapCount: number
): PerceptionDeltaIndex => {
  const contextRichness = estimateContextRichness(context);
  const messageComplexity = clamp(Math.round(message.length / 140), 1, 24);

  const marketBiasSignal: PerceptionDeltaSignal = {
    dimension: 'market_bias',
    perceived: clamp(55 + overlooked.perceptionRealityGap, 0, 100),
    observed: clamp(55, 0, 100),
    delta: clamp(overlooked.perceptionRealityGap, -100, 100),
    weight: 0.35,
    note: 'Measures narrative market risk perception versus modeled baseline conditions.'
  };

  const evidenceSignal: PerceptionDeltaSignal = {
    dimension: 'evidence_strength',
    perceived: clamp(100 - overlooked.evidenceCredibility + 12, 0, 100),
    observed: clamp(100 - overlooked.evidenceCredibility, 0, 100),
    delta: clamp(12 - Math.round(overlooked.evidenceCredibility * 0.12), -100, 100),
    weight: 0.25,
    note: 'Captures confidence drift caused by thin or low-credibility evidence.'
  };

  const readinessSignal: PerceptionDeltaSignal = {
    dimension: 'execution_readiness',
    perceived: clamp(strategic.readinessScore - Math.max(0, unresolvedGapCount * 3), 0, 100),
    observed: clamp(strategic.readinessScore, 0, 100),
    delta: clamp(-Math.max(0, unresolvedGapCount * 3), -100, 100),
    weight: 0.2,
    note: 'Highlights execution optimism/pessimism after accounting for unresolved gaps.'
  };

  const assumptionDrift = clamp(Math.round((messageComplexity * 0.6) - (contextRichness * 0.25)), -45, 45);
  const assumptionSignal: PerceptionDeltaSignal = {
    dimension: 'assumption_stability',
    perceived: clamp(50 + assumptionDrift, 0, 100),
    observed: clamp(50 - Math.round(unresolvedGapCount * 4), 0, 100),
    delta: clamp(assumptionDrift + Math.round(unresolvedGapCount * 4), -100, 100),
    weight: 0.2,
    note: 'Reflects hidden assumption load versus context-backed stability.'
  };

  const signals = [marketBiasSignal, evidenceSignal, readinessSignal, assumptionSignal];
  const weightedDelta = signals.reduce((sum, signal) => sum + signal.delta * signal.weight, 0);
  const deltaIndex = Math.round(clamp(weightedDelta, -100, 100));
  const absoluteDelta = Math.abs(deltaIndex);

  const driftDirection: PerceptionDeltaIndex['driftDirection'] = deltaIndex >= 6
    ? 'underestimation'
    : deltaIndex <= -6
      ? 'overestimation'
      : 'aligned';

  const confidence = clamp(
    Math.round((overlooked.evidenceCredibility * 0.45) + (strategic.readinessScore * 0.35) + (contextRichness * 0.2)),
    1,
    100
  );

  const correctionFactors = buildCorrectionFactors(overlooked, strategic, unresolvedGapCount, absoluteDelta);

  const summary = driftDirection === 'aligned'
    ? `Perception is broadly aligned with evidence (delta ${deltaIndex}). Maintain current controls and variance monitoring.`
    : driftDirection === 'underestimation'
      ? `Detected underestimation drift (delta ${deltaIndex}). Opportunity may be stronger than current narrative assumptions.`
      : `Detected overestimation drift (delta ${deltaIndex}). Narrative confidence exceeds current evidence and readiness profile.`;

  return {
    model: 'nsil_perception_delta_v1',
    deltaIndex,
    driftDirection,
    confidence,
    correctionFactors,
    keySignals: signals,
    summary
  };
};
