/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUDGE ORCHESTRATOR SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Manages the three-judge adversarial reasoning system.
 * Each judge specializes in a reasoning mode: Safety, Logic, Knowledge.
 * 
 * Judges run in parallel/serial/cascading modes with conflict resolution.
 */

import { callGemma, callGeminiThinking, GemmaMessage, GemmaOptions } from '../gemmaService';
import { monitoringService } from './MonitoringService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type JudgeRunMode = 'serial' | 'parallel' | 'cascading';
export type ConflictResolution = 'judge2_wins' | 'escalate_to_human' | 'return_all';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Judge1Output {
  riskLevel: RiskLevel;
  edgeCases: Array<{ scenario: string; consequence: string }>;
  assumptionsToVerify: string[];
  safetyViolations: string[];
  thinkingProcess: string;
  confidence: number; // 0-1
  escalate: boolean; // If true, stop pipeline
}

export interface Judge2Output {
  isLogicallySound: boolean;
  proofSteps: Array<{ step: number; logic: string; validated: boolean }>;
  fallaciesDetected: string[];
  logicalGaps: Array<{ gap: string; severity: 'minor' | 'major' | 'fatal' }>;
  confidence: number; // 0-1
  reproduced: boolean;
}

export interface Judge3Output {
  crossDomainPatterns: Array<{
    domain: string;
    pattern: string;
    applicability: 'direct' | 'requires_adaptation' | 'conceptual_only';
    source: string;
  }>;
  recommendedApproaches: Array<{ approach: string; evidence: string }>;
  missingPerspectives: string[];
  novelInsights: string[];
  confidence: number; // 0-1
}

export interface JudgeConsensus {
  judge1: Judge1Output;
  judge2: Judge2Output;
  judge3: Judge3Output;
  verdict: {
    safe: boolean;
    logicallySound: boolean;
    wellInformed: boolean;
    recommendation: 'proceed' | 'review' | 'escalate';
  };
  conflicts: string[];
  executionTime: number; // ms
}

// ─── Judge 1: Extended Thinking (Safety & Edge Cases) ─────────────────────────

async function runJudge1(input: {
  taskDescription: string;
  constraints: string[];
  contextBefore: string;
  previousJudgments?: Judge1Output[];
}): Promise<Judge1Output> {
  const startTime = performance.now();

  const systemPrompt = `You are Judge 1: Extended Thinking.
Your role: Identify risks, edge cases, and what could fail.
Think deeply about consequences and edge cases before responding.
Excels at identifying what could go wrong.

Task: ${input.taskDescription}

Constraints to respect:
${input.constraints.map(c => `- ${c}`).join('\n')}

Context:
${input.contextBefore}

Output JSON with these fields:
- riskLevel: 'low' | 'medium' | 'high' | 'critical'
- edgeCases: [{scenario, consequence}, ...]
- assumptionsToVerify: [...]
- safetyViolations: [...]
- confidence: 0-1
- escalate: boolean (true if risk is critical)`;

  const messages: GemmaMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Analyze this task for risks and edge cases.' },
  ];

  try {
    const thinkingBudget = 8192;
    const response = await callGeminiThinking(messages, { thinkingBudget });

    // Parse JSON response
    const cleaned = response.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    const result: Judge1Output = {
      riskLevel: parsed.riskLevel ?? 'medium',
      edgeCases: parsed.edgeCases ?? [],
      assumptionsToVerify: parsed.assumptionsToVerify ?? [],
      safetyViolations: parsed.safetyViolations ?? [],
      thinkingProcess: response.slice(0, 500), // First 500 chars of thinking
      confidence: parsed.confidence ?? 0.7,
      escalate: parsed.riskLevel === 'critical' || parsed.escalate === true,
    };

    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: 'gemini-2.5-pro',
      provider: 'judge1',
      latencyMs: Math.round(performance.now() - startTime),
      success: true,
    });

    return result;
  } catch (err) {
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: 'gemini-2.5-pro',
      provider: 'judge1',
      latencyMs: Math.round(performance.now() - startTime),
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    throw err;
  }
}

// ─── Judge 2: Logical Reasoning (Mathematical Proof) ───────────────────────────

async function runJudge2(input: {
  claim: string;
  premises: string[];
  contextData: Record<string, unknown>;
  previousLogicalTests?: Judge2Output[];
}): Promise<Judge2Output> {
  const startTime = performance.now();

  const systemPrompt = `You are Judge 2: Logical Reasoning.
Your role: Build rigorous step-by-step proofs. Test logical consistency.
Mathematical chain-of-thought. Breaks problems into steps, tests each one,
builds conclusions from proof. The most precise of the three.

Claim to verify: ${input.claim}

Premises:
${input.premises.map(p => `- ${p}`).join('\n')}

Context:
${JSON.stringify(input.contextData, null, 2)}

Output JSON with:
- isLogicallySound: boolean
- proofSteps: [{step, logic, validated}, ...]
- fallaciesDetected: [...]
- logicalGaps: [{gap, severity}, ...]
- confidence: 0-1
- reproduced: boolean`;

  const messages: GemmaMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Analyze the logical soundness of this claim.' },
  ];

  try {
    const response = await callGemma(messages, { temperature: 0.2 });
    const cleaned = response.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    const result: Judge2Output = {
      isLogicallySound: parsed.isLogicallySound ?? true,
      proofSteps: parsed.proofSteps ?? [],
      fallaciesDetected: parsed.fallaciesDetected ?? [],
      logicalGaps: parsed.logicalGaps ?? [],
      confidence: parsed.confidence ?? 0.7,
      reproduced: parsed.reproduced ?? false,
    };

    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: 'gemma-4-26b-a4b-it',
      provider: 'judge2',
      latencyMs: Math.round(performance.now() - startTime),
      success: true,
    });

    return result;
  } catch (err) {
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: 'gemma-4-26b-a4b-it',
      provider: 'judge2',
      latencyMs: Math.round(performance.now() - startTime),
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    throw err;
  }
}

// ─── Judge 3: Broad-Knowledge Reasoning (Cross-Domain Patterns) ────────────────

async function runJudge3(input: {
  problem: string;
  knownApproaches: string[];
  industry?: string;
  lookupDomains: string[];
  previousInsights?: Judge3Output[];
}): Promise<Judge3Output> {
  const startTime = performance.now();

  const systemPrompt = `You are Judge 3: Broad-Knowledge Reasoning.
Your role: Draw from widest knowledge base. Find cross-domain patterns.
Finds patterns across domains — what worked in similar industries, countries,
and conditions. Sees what the others miss.

Problem: ${input.problem}

Known approaches so far:
${input.knownApproaches.map(a => `- ${a}`).join('\n')}

Look across these domains: ${input.lookupDomains.join(', ')}

Output JSON with:
- crossDomainPatterns: [{domain, pattern, applicability, source}, ...]
- recommendedApproaches: [{approach, evidence}, ...]
- missingPerspectives: [...]
- novelInsights: [...]
- confidence: 0-1`;

  const messages: GemmaMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Find cross-domain patterns and insights for this problem.' },
  ];

  try {
    const response = await callGemma(messages, { temperature: 0.7 });
    const cleaned = response.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    const result: Judge3Output = {
      crossDomainPatterns: parsed.crossDomainPatterns ?? [],
      recommendedApproaches: parsed.recommendedApproaches ?? [],
      missingPerspectives: parsed.missingPerspectives ?? [],
      novelInsights: parsed.novelInsights ?? [],
      confidence: parsed.confidence ?? 0.7,
    };

    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: 'gemma-4-26b-a4b-it',
      provider: 'judge3',
      latencyMs: Math.round(performance.now() - startTime),
      success: true,
    });

    return result;
  } catch (err) {
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: 'gemma-4-26b-a4b-it',
      provider: 'judge3',
      latencyMs: Math.round(performance.now() - startTime),
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    throw err;
  }
}

// ─── Judge Orchestrator ────────────────────────────────────────────────────────

export class JudgeOrchestrator {
  async runAllJudges(
    task: string,
    constraints: string[],
    context: Record<string, unknown>,
    mode: JudgeRunMode = 'parallel'
  ): Promise<JudgeConsensus> {
    const startTime = performance.now();

    try {
      if (mode === 'parallel') {
        return await this.runInParallel(task, constraints, context);
      } else if (mode === 'serial') {
        return await this.runInSerial(task, constraints, context);
      } else {
        // cascading
        return await this.runInCascading(task, constraints, context);
      }
    } catch (err) {
      console.error('Judge orchestration failed:', err);
      throw err;
    }
  }

  private async runInParallel(
    task: string,
    constraints: string[],
    context: Record<string, unknown>
  ): Promise<JudgeConsensus> {
    const startTime = performance.now();

    const [judge1Result, judge2Result, judge3Result] = await Promise.all([
      runJudge1({
        taskDescription: task,
        constraints,
        contextBefore: JSON.stringify(context),
      }),
      runJudge2({
        claim: task,
        premises: constraints,
        contextData: context,
      }),
      runJudge3({
        problem: task,
        knownApproaches: constraints,
        industry: context.industry as string,
        lookupDomains: (context.lookupDomains as string[]) ?? [],
      }),
    ]);

    return this.buildConsensus(judge1Result, judge2Result, judge3Result, performance.now() - startTime);
  }

  private async runInSerial(
    task: string,
    constraints: string[],
    context: Record<string, unknown>
  ): Promise<JudgeConsensus> {
    const startTime = performance.now();

    const judge1Result = await runJudge1({
      taskDescription: task,
      constraints,
      contextBefore: JSON.stringify(context),
    });

    // Judge 2 builds on Judge 1
    const judge2Result = await runJudge2({
      claim: task,
      premises: [...constraints, ...judge1Result.assumptionsToVerify],
      contextData: context,
    });

    // Judge 3 builds on both
    const judge3Result = await runJudge3({
      problem: task,
      knownApproaches: [...constraints, ...judge2Result.fallaciesDetected],
      industry: context.industry as string,
      lookupDomains: (context.lookupDomains as string[]) ?? [],
    });

    return this.buildConsensus(judge1Result, judge2Result, judge3Result, performance.now() - startTime);
  }

  private async runInCascading(
    task: string,
    constraints: string[],
    context: Record<string, unknown>
  ): Promise<JudgeConsensus> {
    const startTime = performance.now();

    // Judge 1 blocks if critical risk
    const judge1Result = await runJudge1({
      taskDescription: task,
      constraints,
      contextBefore: JSON.stringify(context),
    });

    if (judge1Result.escalate) {
      return this.buildConsensus(judge1Result, { isLogicallySound: false } as Judge2Output, { confidence: 0 } as Judge3Output, performance.now() - startTime);
    }

    // Judge 2 validates
    const judge2Result = await runJudge2({
      claim: task,
      premises: constraints,
      contextData: context,
    });

    if (!judge2Result.isLogicallySound) {
      return this.buildConsensus(judge1Result, judge2Result, { confidence: 0 } as Judge3Output, performance.now() - startTime);
    }

    // Judge 3 enriches
    const judge3Result = await runJudge3({
      problem: task,
      knownApproaches: constraints,
      industry: context.industry as string,
      lookupDomains: (context.lookupDomains as string[]) ?? [],
    });

    return this.buildConsensus(judge1Result, judge2Result, judge3Result, performance.now() - startTime);
  }

  private buildConsensus(
    j1: Judge1Output,
    j2: Judge2Output,
    j3: Judge3Output,
    executionTime: number
  ): JudgeConsensus {
    const conflicts: string[] = [];

    if (j1.escalate && j2.isLogicallySound) {
      conflicts.push('Judge 1 flags critical risk but Judge 2 says logically sound');
    }
    if (j1.confidence < 0.5 && j3.confidence > 0.8) {
      conflicts.push('Judge 1 unsure but Judge 3 confident');
    }

    const verdict = {
      safe: !j1.escalate && j1.riskLevel !== 'critical',
      logicallySound: j2.isLogicallySound ?? true,
      wellInformed: j3.confidence > 0.6,
      recommendation:
        j1.escalate || j1.riskLevel === 'critical'
          ? 'escalate' as const
          : !j2.isLogicallySound
            ? 'review' as const
            : 'proceed' as const,
    };

    return {
      judge1: j1,
      judge2: j2,
      judge3: j3,
      verdict,
      conflicts,
      executionTime,
    };
  }
}

export default new JudgeOrchestrator();
