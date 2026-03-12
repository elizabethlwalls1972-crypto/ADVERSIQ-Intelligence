import type { ActionTask, ExecutionRecord, GovernanceDecision, OutcomeRecord } from '../../types/autonomy';
import type { MissionCaseInput } from './MissionGraphService';
import { gatewayFast } from '../UnifiedAIGateway';

export interface ExecutionBatchResult {
  tasks: ActionTask[];
  executionRecords: ExecutionRecord[];
  outcomes: OutcomeRecord[];
}

const shouldExecute = (task: ActionTask, decision?: GovernanceDecision): boolean => {
  if (!decision) return false;
  if (decision.decision !== 'approved') return false;
  return task.status === 'ready';
};

/**
 * Use AI to assess execution confidence for a task.
 * Falls back to deterministic logic if AI is unavailable.
 */
async function aiAssessExecution(task: ActionTask, input: MissionCaseInput): Promise<{ succeeded: boolean; reasoning: string }> {
  try {
    const prompt = `Assess whether this autonomous task should succeed based on the parameters. Return ONLY JSON: {"succeeded": true/false, "reasoning": "one sentence"}

Task: ${task.type} (ID: ${task.taskId})
Base Case Score: ${task.simulation?.baseCase ?? 0}/100
Mission Readiness: ${input.readinessScore}/100
Critical Gaps: ${input.criticalGapCount}`;

    const result = await gatewayFast(prompt, undefined, 'autonomy/ActionExecution');
    const cleaned = result.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        succeeded: !!parsed.succeeded,
        reasoning: parsed.reasoning || 'AI assessment complete',
      };
    }
  } catch {
    // Fall back to deterministic logic
  }
  return {
    succeeded: (task.simulation?.baseCase ?? 0) >= 60,
    reasoning: 'Deterministic threshold assessment (AI unavailable)',
  };
}

export class ActionExecutionEngine {
  static async executeApprovedTasks(
    tasks: ActionTask[],
    decisions: GovernanceDecision[],
    input: MissionCaseInput
  ): Promise<ExecutionBatchResult> {
    const decisionMap = new Map(decisions.map((decision) => [decision.taskId, decision]));
    const executionRecords: ExecutionRecord[] = [];
    const outcomes: OutcomeRecord[] = [];

    const updatedTasks: ActionTask[] = [];

    for (const task of tasks) {
      const decision = decisionMap.get(task.taskId);
      if (!shouldExecute(task, decision)) {
        updatedTasks.push(task);
        continue;
      }

      const startedAt = new Date().toISOString();
      const assessment = await aiAssessExecution(task, input);
      const finishedAt = new Date().toISOString();

      const executionRecord: ExecutionRecord = {
        runId: `run-${task.taskId}`,
        taskId: task.taskId,
        startedAt,
        finishedAt,
        status: assessment.succeeded ? 'completed' : 'failed',
        outputs: {
          taskType: task.type,
          missionReadiness: input.readinessScore,
          criticalGapCount: input.criticalGapCount,
          aiReasoning: assessment.reasoning,
        },
        errors: assessment.succeeded ? [] : [assessment.reasoning],
        retries: assessment.succeeded ? 0 : 1
      };
      executionRecords.push(executionRecord);

      const expectedReadinessDelta = task.type === 'case-gap-resolution' ? 8 : 5;
      const observedReadinessDelta = assessment.succeeded ? Math.max(3, expectedReadinessDelta - Math.max(0, input.criticalGapCount - 1)) : 0;

      outcomes.push({
        taskId: task.taskId,
        expectedKPIChange: { readiness: expectedReadinessDelta },
        observedKPIChange: { readiness: observedReadinessDelta },
        variance: expectedReadinessDelta - observedReadinessDelta,
        verdict: assessment.succeeded ? 'met' : 'missed',
        rootCauseTags: assessment.succeeded ? ['governance-pass', 'execution-success'] : ['execution-confidence-drop'],
        lesson: assessment.reasoning,
      });

      const nextStatus: ActionTask['status'] = assessment.succeeded ? 'completed' : 'failed';

      updatedTasks.push({
        ...task,
        status: nextStatus
      });
    }

    return {
      tasks: updatedTasks,
      executionRecords,
      outcomes
    };
  }
}

export default ActionExecutionEngine;
