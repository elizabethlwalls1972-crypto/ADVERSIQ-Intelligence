/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE ORCHESTRATOR SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The 10-layer pipeline: each layer handles one specific job.
 * Layers challenge, catch, and build on each other's strengths.
 * 
 * Flow: Adversarial → Contradiction → Stress → Cognitive → Self-Improving
 *       → Reflexive → Entity Verification → Confidence → Orchestration → Generation
 */

import { callGemma, callGemmaJSON, callGemmaFast, GemmaMessage } from './gemmaService';
import { monitoringService } from './services/MonitoringService';
import { JudgeOrchestrator, JudgeConsensus } from './JudgeOrchestrator';

// ─── Pipeline Layer Outputs ────────────────────────────────────────────────────

export interface Layer01Output {
  initialHypotheses: string[];
  counterarguments: string[];
  flaggedAssumptions: Array<{ assumption: string; strength: 'weak' | 'medium' | 'strong' }>;
  edgeCases: string[];
  judge1Verdict: any; // Judge1Output
}

export interface Layer02Output {
  contradictions: Array<{
    claim1: string;
    claim2: string;
    type: 'direct' | 'implicit' | 'contextual';
    severity: 'low' | 'medium' | 'high';
    resolution: string;
  }>;
  consistentSubsets: string[][];
  flagsForReview: string[];
}

export interface Layer03Output {
  stressTestResults: Array<{
    hypothesis: string;
    tests: Array<{
      scenario: string;
      result: 'pass' | 'fail' | 'degrade';
      failureReason?: string;
      recoveryPath?: string;
    }>;
    robustness: number; // 0-1
  }>;
  failingHypotheses: string[];
  survivingHypotheses: string[];
}

export interface Layer04Output {
  mentalModels: Array<{
    hypothesis: string;
    implications: string[];
    hiddenAssumptions: string[];
    dependencies: Array<{ on: string; strength: 'weak' | 'medium' | 'critical' }>;
    coherence: number; // 0-1
    vulnerabilities: string[];
  }>;
  mostCoherentModel: string;
}

export interface Layer05Output {
  improvements: Array<{
    weakness: string;
    improvement: string;
    rationale: string;
    appliedToLayer: number;
    successMetric: string;
  }>;
  iterationCount: number;
  cumulativeImprovement: number; // 0-1
  readyForReview: boolean;
}

export interface Layer06Output {
  overallSoundness: 'sound' | 'questionable' | 'unsound';
  groupThinkRisks: string[];
  metaReasoningIssues: string[];
  safetyRecheck: any;
  constraintViolations: string[];
  recommendation: 'proceed' | 'revise_and_continue' | 'restart' | 'escalate';
}

export interface Layer07Output {
  entities: Array<{
    entity: string;
    type: 'person' | 'org' | 'concept' | 'fact';
    verificationStatus: 'verified' | 'unverifiable' | 'contradicts_known';
    sources: string[];
    confidence: number; // 0-1
  }>;
  unresolvedEntities: Array<{ entity: string; issue: string }>;
  entityGraphConsistency: number; // 0-1
}

export interface Layer08Output {
  hypothesisScores: Array<{
    hypothesis: string;
    scores: {
      logical: number;
      safety: number;
      knowledge: number;
      robustness: number;
      coherence: number;
      entityVerification: number;
      reflexive: number;
      consensus: number;
    };
    weightedConfidence: number; // 0-1
    recommendedAction: 'use' | 'review' | 'reject' | 'merge';
  }>;
  topCandidate: string;
  confidence: number; // 0-1
  escalationFlags: string[];
}

export interface Layer09Output {
  orchestrationMode: 'single' | 'parallel' | 'ensemble';
  activeHypotheses: Array<{
    hypothesis: string;
    confidence: number;
    generator: { model: string; status: string; tokensUsed: number };
  }>;
  readyForGeneration: boolean;
  mergeStrategy: 'best' | 'all' | 'consensus';
}

export interface Layer10Output {
  content: string;
  format: 'markdown' | 'json' | 'html' | 'plaintext';
  metadata: {
    generatedAt: string;
    topHypothesis: string;
    confidence: number;
    escalationFlags: string[];
  };
  streaming: boolean;
  tokensGenerated: number;
}

export interface PipelineState {
  input: { query: string; constraints: string[]; context: Record<string, unknown> };
  layer01?: Layer01Output;
  layer02?: Layer02Output;
  layer03?: Layer03Output;
  layer04?: Layer04Output;
  layer05?: Layer05Output;
  layer06?: Layer06Output;
  layer07?: Layer07Output;
  layer08?: Layer08Output;
  layer09?: Layer09Output;
  layer10?: Layer10Output;
  judgeConsensus?: JudgeConsensus;
  restartCount: number;
  executionTrace: Array<{ layer: number; status: 'pending' | 'running' | 'complete' | 'failed'; time: number }>;
}

// ─── Layer Implementations ────────────────────────────────────────────────────

async function layer01AdversarialReasoning(state: PipelineState): Promise<Layer01Output> {
  const prompt = `Adversarial Reasoning: Generate 3-5 counterarguments to the obvious answer.

Query: ${state.input.query}
Constraints: ${state.input.constraints.join(', ')}

Test assumptions: which are strong? Which are weak?
Explore edge cases: what breaks this answer?

Respond with JSON: { initialHypotheses, counterarguments, flaggedAssumptions, edgeCases }`;

  const result = await callGemmaJSON<Layer01Output>(prompt);
  return result;
}

async function layer02ContradictionDetection(state: PipelineState): Promise<Layer02Output> {
  if (!state.layer01) throw new Error('Layer 01 not complete');

  const hypotheses = state.layer01.initialHypotheses;
  const prompt = `Contradiction Detection: Compare these hypotheses pairwise.

Hypotheses:
${hypotheses.map((h, i) => `${i + 1}. ${h}`).join('\n')}

For each pair: do they contradict? How can both be true? Identify contradiction type.

Respond with JSON: { contradictions: [{claim1, claim2, type, severity, resolution}], consistentSubsets }`;

  const result = await callGemmaJSON<Layer02Output>(prompt);
  return result;
}

async function layer03StressTesting(state: PipelineState): Promise<Layer03Output> {
  if (!state.layer02) throw new Error('Layer 02 not complete');

  const hypotheses = state.layer02.consistentSubsets.flat().slice(0, 5); // Top 5
  const prompt = `Stress Testing: Test these hypotheses under extreme conditions.

Hypotheses:
${hypotheses.map((h, i) => `${i + 1}. ${h}`).join('\n')}

For each: test min/max inputs, null values, conflicting constraints, injection attacks, load.

Respond with JSON: { stressTestResults: [{hypothesis, tests, robustness}], survivingHypotheses }`;

  const result = await callGemmaJSON<Layer03Output>(prompt);
  return result;
}

async function layer04CognitiveModelling(state: PipelineState): Promise<Layer04Output> {
  if (!state.layer03) throw new Error('Layer 03 not complete');

  const hypotheses = state.layer03.survivingHypotheses;
  const prompt = `Cognitive Modelling: For each surviving hypothesis, build a mental model.

Hypotheses:
${hypotheses.map((h, i) => `${i + 1}. ${h}`).join('\n')}

For each: implications, hidden assumptions, dependencies, coherence.

Respond with JSON: { mentalModels: [{hypothesis, implications, hiddenAssumptions, dependencies, coherence}], mostCoherentModel }`;

  const result = await callGemmaJSON<Layer04Output>(prompt);
  return result;
}

async function layer05SelfImproving(state: PipelineState): Promise<Layer05Output> {
  if (!state.layer04) throw new Error('Layer 04 not complete');

  const models = state.layer04.mentalModels;
  const prompt = `Self-Improving Pipeline: Identify weaknesses and propose improvements.

Current Models:
${models.map((m, i) => `${i + 1}. ${m.hypothesis} (coherence: ${m.coherence})`).join('\n')}

Weaknesses: What did we miss? How can we model this better?
Improvements: List as [{weakness, improvement, rationale, appliedToLayer, successMetric}]

Respond with JSON: { improvements, iterationCount, cumulativeImprovement, readyForReview }`;

  const result = await callGemmaJSON<Layer05Output>(prompt);
  return result;
}

async function layer06ReflexiveOversight(state: PipelineState): Promise<Layer06Output> {
  const allLayers = [state.layer01, state.layer02, state.layer03, state.layer04, state.layer05];
  const prompt = `Reflexive Oversight: Step back. Is the entire pipeline reasoning sound?

Check for:
1. Group-think: Are we all nodding to each other?
2. Meta-reasoning: Are we thinking about thinking correctly?
3. Safety: Any risks we've normalized away?
4. Constraints: Did we drift from input constraints?

Input constraints: ${state.input.constraints.join(', ')}

Respond with JSON: { overallSoundness, groupThinkRisks, metaReasoningIssues, constraintViolations, recommendation: 'proceed'|'revise_and_continue'|'restart'|'escalate' }`;

  const result = await callGemmaJSON<Layer06Output>(prompt);
  return result;
}

async function layer07EntityVerification(state: PipelineState): Promise<Layer07Output> {
  if (!state.layer03) throw new Error('Layer 03 not complete');

  const hypotheses = state.layer03.survivingHypotheses;
  const prompt = `Entity Verification: Extract and verify all entities (people, orgs, concepts, facts).

From these hypotheses:
${hypotheses.map((h, i) => `${i + 1}. ${h}`).join('\n')}

For each entity: verify existence, check consistency, flag unverifiable claims.

Respond with JSON: { entities: [{entity, type, verificationStatus, sources, confidence}], unresolvedEntities, entityGraphConsistency }`;

  const result = await callGemmaJSON<Layer07Output>(prompt);
  return result;
}

async function layer08ConfidenceScoring(state: PipelineState): Promise<Layer08Output> {
  const hypotheses = state.layer03?.survivingHypotheses ?? [];
  
  const prompt = `Confidence Scoring: Score each hypothesis on 8 dimensions.

Hypotheses:
${hypotheses.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Dimensions:
1. Logical soundness (0-1)
2. Safety risk (0-1)
3. Knowledge coverage (0-1)
4. Stress test robustness (0-1)
5. Cognitive model coherence (0-1)
6. Entity verification (0-1)
7. Reflexive soundness (0-1)
8. Cross-hypothesis consensus (0-1)

Compute weighted confidence = average of all 8.

Respond with JSON: { hypothesisScores: [{hypothesis, scores, weightedConfidence, recommendedAction}], topCandidate, confidence, escalationFlags }`;

  const result = await callGemmaJSON<Layer08Output>(prompt);
  return result;
}

async function layer09ParallelOrchestration(state: PipelineState): Promise<Layer09Output> {
  if (!state.layer08) throw new Error('Layer 08 not complete');

  const topCandidate = state.layer08.topCandidate;
  const confidence = state.layer08.confidence;

  return {
    orchestrationMode: confidence > 0.85 ? 'single' : 'parallel',
    activeHypotheses: [
      {
        hypothesis: topCandidate,
        confidence,
        generator: { model: 'gemma-4-26b-a4b-it', status: 'ready', tokensUsed: 0 },
      },
    ],
    readyForGeneration: true,
    mergeStrategy: 'best',
  };
}

async function layer10DocumentGeneration(state: PipelineState): Promise<Layer10Output> {
  if (!state.layer09) throw new Error('Layer 09 not complete');

  const topHypothesis = state.layer09.activeHypotheses[0].hypothesis;
  const prompt = `Generate final response based on this hypothesis:

${topHypothesis}

Output in markdown format with clear structure, evidence, and reasoning.`;

  const content = await callGemma([{ role: 'user', content: prompt }]);

  return {
    content,
    format: 'markdown',
    metadata: {
      generatedAt: new Date().toISOString(),
      topHypothesis,
      confidence: state.layer09.activeHypotheses[0].confidence,
      escalationFlags: state.layer08?.escalationFlags ?? [],
    },
    streaming: false,
    tokensGenerated: Math.ceil(content.length / 4), // rough estimate
  };
}

// ─── Pipeline Orchestrator ────────────────────────────────────────────────────

export class PipelineOrchestrator {
  private judgeOrchestrator: JudgeOrchestrator;

  constructor(judgeOrchestrator?: JudgeOrchestrator) {
    this.judgeOrchestrator = judgeOrchestrator ?? new JudgeOrchestrator();
  }

  async executeFullPipeline(input: {
    query: string;
    constraints: string[];
    context: Record<string, unknown>;
  }): Promise<Layer10Output> {
    const state: PipelineState = {
      input,
      restartCount: 0,
      executionTrace: [],
    };

    // Run judges first
    console.log('[Judges] Running all judges...');
    state.judgeConsensus = await this.judgeOrchestrator.runAllJudges(
      input.query,
      input.constraints,
      input.context,
      'parallel'
    );

    if (state.judgeConsensus.verdict.recommendation === 'escalate') {
      throw new Error('ESCALATION: Critical safety risk identified by judges');
    }

    // Execute pipeline layers
    try {
      console.log('[Layer 01] Adversarial Reasoning...');
      state.layer01 = await layer01AdversarialReasoning(state);

      console.log('[Layer 02] Contradiction Detection...');
      state.layer02 = await layer02ContradictionDetection(state);

      console.log('[Layer 03] Stress Testing...');
      state.layer03 = await layer03StressTesting(state);

      console.log('[Layer 04] Cognitive Modelling...');
      state.layer04 = await layer04CognitiveModelling(state);

      console.log('[Layer 05] Self-Improving...');
      state.layer05 = await layer05SelfImproving(state);

      console.log('[Layer 06] Reflexive Oversight...');
      state.layer06 = await layer06ReflexiveOversight(state);

      if (state.layer06.recommendation === 'restart' && state.restartCount < 3) {
        console.log('[Layer 06] Restarting pipeline...');
        state.restartCount++;
        return this.executeFullPipeline(input);
      } else if (state.layer06.recommendation === 'escalate') {
        throw new Error('ESCALATION: Reflexive oversight failed');
      }

      console.log('[Layer 07] Entity Verification...');
      state.layer07 = await layer07EntityVerification(state);

      console.log('[Layer 08] Confidence Scoring...');
      state.layer08 = await layer08ConfidenceScoring(state);

      if (state.layer08.confidence < 0.60) {
        throw new Error('LOW CONFIDENCE: Output confidence below threshold');
      }

      console.log('[Layer 09] Parallel Orchestration...');
      state.layer09 = await layer09ParallelOrchestration(state);

      console.log('[Layer 10] Document Generation...');
      state.layer10 = await layer10DocumentGeneration(state);

      return state.layer10;
    } catch (err) {
      console.error('Pipeline execution failed:', err);
      throw err;
    }
  }

  async executeLayer(layerNum: number, input: any): Promise<any> {
    const state: PipelineState = {
      input: { query: '', constraints: [], context: {} },
      restartCount: 0,
      executionTrace: [],
    };

    switch (layerNum) {
      case 1:
        return layer01AdversarialReasoning(state);
      case 2:
        state.layer01 = input;
        return layer02ContradictionDetection(state);
      case 3:
        state.layer02 = input;
        return layer03StressTesting(state);
      // ... etc
      default:
        throw new Error(`Unknown layer: ${layerNum}`);
    }
  }

  getExecutionTrace(state: PipelineState): Array<{ layer: number; status: string; time: number }> {
    return state.executionTrace;
  }
}

export default PipelineOrchestrator;
