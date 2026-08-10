import type { ActionTask, GovernanceDecision, OutcomeRecord, VerificationSummary } from '../../types/autonomy';
import type { MissionCaseInput } from './MissionGraphService';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export class OutcomeVerificationEngine {
  static verify(
    outcomes: OutcomeRecord[],
    decisions: GovernanceDecision[],
    input: MissionCaseInput
  ): VerificationSummary {
    if (outcomes.length === 0) {
      return {
        adaptationScore: clamp(input.readinessScore, 0, 100),
        requiresReplan: input.criticalGapCount > 0,
        replanSignals: input.criticalGapCount > 0 ? ['No executed outcomes yet; critical gaps still block progress'] : [],
        strategyAdjustments: input.criticalGapCount > 0 ? ['Prioritize case-gap-resolution tasks first'] : []
      };
    }

    const missedCount = outcomes.filter((outcome) => outcome.verdict === 'missed').length;
    const avgVariance = outcomes.reduce((sum, outcome) => sum + Math.abs(outcome.variance), 0) / outcomes.length;
    const rejectedCount = decisions.filter((decision) => decision.decision === 'rejected').length;
    const reviewCount = decisions.filter((decision) => decision.decision === 'review-required').length;

    const adaptationScore = clamp(
      100 - (avgVariance * 6) - (missedCount * 14) - (rejectedCount * 10) - (reviewCount * 5) - (input.criticalGapCount * 4),
      5,
      98
    );

    const replanSignals: string[] = [];
    const strategyAdjustments: string[] = [];

    if (missedCount > 0) {
      replanSignals.push(`${missedCount} task(s) missed expected KPI deltas`);
      strategyAdjustments.push('Increase evidence-strengthening before execution');
    }

    if (avgVariance > 3) {
      replanSignals.push(`High KPI variance detected (${avgVariance.toFixed(1)})`);
      strategyAdjustments.push('Tighten simulation thresholds and lower auto-approval scope');
    }

    if (rejectedCount > 0) {
      replanSignals.push(`${rejectedCount} task(s) rejected by governance policy`);
      strategyAdjustments.push('Refactor tasks into smaller low-risk increments');
    }

    if (input.criticalGapCount > 0) {
      replanSignals.push(`Critical gaps remaining: ${input.criticalGapCount}`);
      strategyAdjustments.push('Route mission back to discovery-mode gap closure');
    }

    const requiresReplan = missedCount > 0 || avgVariance > 3 || rejectedCount > 0 || input.criticalGapCount > 0;

    if (!requiresReplan) {
      strategyAdjustments.push('Maintain current execution strategy and monitor drift');
    }

    return {
      adaptationScore,
      requiresReplan,
      replanSignals,
      strategyAdjustments
    };
  }

  static applyReplanAdjustments(
    tasks: ActionTask[],
    summary: VerificationSummary
  ): ActionTask[] {
    if (!summary.requiresReplan) return tasks;

    const adjusted: ActionTask[] = tasks.map((task) => {
      const status: ActionTask['status'] = task.status === 'ready' ? 'pending' : task.status;
      const approvalMode: ActionTask['approvalMode'] =
        task.riskScore >= 50 || (task.simulation?.baseCase ?? 0) < 65
          ? 'manual'
          : task.approvalMode;

      return {
        ...task,
        status,
        approvalMode
      };
    });

    const hasRecalibrationTask = adjusted.some((task) => task.type === 'strategy-recalibration');
    if (hasRecalibrationTask) return adjusted;

    const anchorGoal = adjusted[0]?.goalId;
    if (!anchorGoal) return adjusted;

    adjusted.push({
      taskId: `task-replan-${Date.now().toString(36)}`,
      goalId: anchorGoal,
      type: 'strategy-recalibration',
      input: {
        reason: summary.replanSignals,
        adaptationScore: summary.adaptationScore
      },
      expectedOutcome: 'Rebalanced plan with lower execution risk and higher confidence',
      preconditions: ['Verification summary available'],
      postconditions: ['Updated plan thresholds and governance posture'],
      rollbackPlan: 'Restore prior plan ordering and approval modes',
      riskScore: 25,
      approvalMode: 'manual',
      status: 'ready'
    });

    return adjusted;
  }
}

export default OutcomeVerificationEngine;
