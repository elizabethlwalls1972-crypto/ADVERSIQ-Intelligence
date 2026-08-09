import type { PerceptionDeltaIndex } from './PerceptionDeltaIndex.js';

export type TribunalVerdict = 'proceed' | 'proceed_with_controls' | 'hold';

export interface TribunalEngineResult {
  engine: 'skeptic' | 'advocate' | 'accountant' | 'regulator' | 'operator';
  score: number;
  finding: string;
  action: string;
}

export interface FiveEngineTribunalInput {
  message: string;
  taskType: string;
  intent: string;
  controlMode: string;
  strategicReadiness: number;
  evidenceCredibility: number;
  unresolvedGapCount: number;
  perceptionDelta: PerceptionDeltaIndex;
}

export interface FiveEngineTribunalResult {
  model: 'nsil_five_engine_tribunal_v1';
  verdict: TribunalVerdict;
  releaseGate: 'green' | 'amber' | 'red';
  confidence: number;
  engines: TribunalEngineResult[];
  contradictions: string[];
  rationale: string[];
  topControls: string[];
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const buildTopControls = (
  unresolvedGapCount: number,
  perceptionDeltaIndex: number,
  regulatorScore: number,
  accountantScore: number
): string[] => {
  const controls: string[] = [];

  if (unresolvedGapCount > 2) {
    controls.push('Require critical gap-closure checklist before external decision delivery.');
  }
  if (Math.abs(perceptionDeltaIndex) >= 16) {
    controls.push('Trigger counterfactual review with at least one disconfirming evidence sweep.');
  }
  if (regulatorScore < 65) {
    controls.push('Add compliance and policy sign-off gate prior to implementation approval.');
  }
  if (accountantScore < 62) {
    controls.push('Apply phased capital exposure and downside stop-loss thresholds.');
  }
  if (controls.length === 0) {
    controls.push('Standard governance controls are sufficient for release.');
  }

  return controls;
};

export const runFiveEngineTribunal = (input: FiveEngineTribunalInput): FiveEngineTribunalResult => {
  const absoluteDelta = Math.abs(input.perceptionDelta.deltaIndex);
  const uncertaintyPressure = clamp(
    (100 - input.evidenceCredibility) * 0.5 + input.unresolvedGapCount * 8 + absoluteDelta * 0.35,
    0,
    100
  );

  const skepticScore = clamp(Math.round(100 - uncertaintyPressure), 1, 100);
  const advocateScore = clamp(Math.round(input.strategicReadiness + Math.max(0, input.perceptionDelta.deltaIndex) * 0.35), 1, 100);
  const accountantScore = clamp(Math.round((input.strategicReadiness * 0.5) + (input.evidenceCredibility * 0.5) - absoluteDelta * 0.25), 1, 100);
  const regulatorScore = clamp(Math.round(input.evidenceCredibility - input.unresolvedGapCount * 7 - absoluteDelta * 0.2), 1, 100);
  const operatorModeBonus = input.controlMode === 'deliberative' ? 6 : input.controlMode === 'agentic_full' ? 3 : 0;
  const operatorScore = clamp(Math.round(input.strategicReadiness - absoluteDelta * 0.22 + operatorModeBonus), 1, 100);

  const engines: TribunalEngineResult[] = [
    {
      engine: 'skeptic',
      score: skepticScore,
      finding: skepticScore >= 65
        ? 'Core assumptions remain defensible under stress.'
        : 'Assumption fragility is high under adversarial scrutiny.',
      action: skepticScore >= 65
        ? 'Preserve stress-testing cadence with weekly refresh.'
        : 'Run adversarial challenge review before external commitment.'
    },
    {
      engine: 'advocate',
      score: advocateScore,
      finding: advocateScore >= 68
        ? 'Upside case is coherent and actionable.'
        : 'Upside thesis is not yet strong enough for fast scaling.',
      action: advocateScore >= 68
        ? 'Advance phased opportunity capture with milestone triggers.'
        : 'Strengthen value narrative with quantified opportunity deltas.'
    },
    {
      engine: 'accountant',
      score: accountantScore,
      finding: accountantScore >= 62
        ? 'Risk-adjusted value profile is acceptable.'
        : 'Risk-adjusted economics are currently weak.',
      action: accountantScore >= 62
        ? 'Proceed with controlled exposure and KPI checkpoints.'
        : 'Reduce exposure and increase evidence quality before investment.'
    },
    {
      engine: 'regulator',
      score: regulatorScore,
      finding: regulatorScore >= 64
        ? 'Compliance posture appears manageable.'
        : 'Regulatory uncertainty requires stronger controls.',
      action: regulatorScore >= 64
        ? 'Keep policy watchlist active and validate legal assumptions.'
        : 'Introduce explicit compliance gate and jurisdictional counsel review.'
    },
    {
      engine: 'operator',
      score: operatorScore,
      finding: operatorScore >= 64
        ? 'Execution pathway is feasible with current operating cadence.'
        : 'Execution risk is elevated relative to readiness.',
      action: operatorScore >= 64
        ? 'Maintain staged rollout with operational metrics telemetry.'
        : 'Consolidate operating plan before launch commitments.'
    }
  ];

  const contradictions: string[] = [];
  if (advocateScore - skepticScore >= 22) {
    contradictions.push('Advocate optimism materially exceeds skeptic confidence.');
  }
  if (operatorScore - regulatorScore >= 18) {
    contradictions.push('Operational speed outpaces current regulatory confidence.');
  }
  if (accountantScore - advocateScore >= 18) {
    contradictions.push('Financial caution conflicts with growth advocacy profile.');
  }

  const averageScore = engines.reduce((sum, engine) => sum + engine.score, 0) / engines.length;
  const spread = Math.max(...engines.map((engine) => engine.score)) - Math.min(...engines.map((engine) => engine.score));

  let verdict: TribunalVerdict = 'proceed';
  let releaseGate: FiveEngineTribunalResult['releaseGate'] = 'green';

  if (regulatorScore < 45 || accountantScore < 42 || skepticScore < 40) {
    verdict = 'hold';
    releaseGate = 'red';
  } else if (contradictions.length > 0 || Math.min(...engines.map((engine) => engine.score)) < 60 || absoluteDelta >= 20) {
    verdict = 'proceed_with_controls';
    releaseGate = 'amber';
  }

  const topControls = buildTopControls(input.unresolvedGapCount, input.perceptionDelta.deltaIndex, regulatorScore, accountantScore);

  const confidence = clamp(
    Math.round((averageScore * 0.55) + ((100 - spread) * 0.25) + ((100 - contradictions.length * 20) * 0.2)),
    1,
    100
  );

  const rationale = [
    `Skeptic ${skepticScore}, Advocate ${advocateScore}, Accountant ${accountantScore}, Regulator ${regulatorScore}, Operator ${operatorScore}.`,
    `Perception delta ${input.perceptionDelta.deltaIndex} (${input.perceptionDelta.driftDirection}) with readiness ${input.strategicReadiness}.`,
    `Evidence credibility ${input.evidenceCredibility} and unresolved gap count ${input.unresolvedGapCount} shaped control posture.`
  ];

  return {
    model: 'nsil_five_engine_tribunal_v1',
    verdict,
    releaseGate,
    confidence,
    engines,
    contradictions,
    rationale,
    topControls
  };
};
