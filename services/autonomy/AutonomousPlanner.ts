import type { ActionTask, GoalNode } from '../../types/autonomy';
import type { MissionCaseInput } from './MissionGraphService';
import WorldModelEngine from './WorldModelEngine';

const createId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const buildBaseTasks = (topGoalId: string, input: MissionCaseInput): ActionTask[] => {
  const tasks: ActionTask[] = [
    {
      taskId: createId('task'),
      goalId: topGoalId,
      type: 'case-gap-resolution',
      input: {
        topCriticalGap: input.topCriticalGap,
        readinessScore: input.readinessScore,
        criticalGapCount: input.criticalGapCount
      },
      expectedOutcome: 'Critical gaps reduced and readiness improved',
      preconditions: ['Case context available'],
      postconditions: ['Gap tracker updated'],
      rollbackPlan: 'Reopen discovery prompts and revert latest autofill decisions',
      riskScore: input.criticalGapCount > 0 ? 70 : 35,
      approvalMode: input.criticalGapCount > 0 ? 'manual' : 'conditional',
      status: input.criticalGapCount > 0 ? 'ready' : 'pending'
    },
    {
      taskId: createId('task'),
      goalId: topGoalId,
      type: 'report-generation-preflight',
      input: {
        recommendedTitles: input.recommendedTitles.slice(0, 3),
        decisionDeadline: input.decisionDeadline,
        targetAudience: input.targetAudience
      },
      expectedOutcome: 'Validated report path with governance readiness',
      preconditions: ['Readiness >= 80', 'No critical gaps'],
      postconditions: ['Payload can be generated'],
      rollbackPlan: 'Return to discovery phase and request missing evidence',
      riskScore: input.readinessScore >= 80 ? 30 : 65,
      approvalMode: 'conditional',
      status: input.readinessScore >= 80 && input.criticalGapCount === 0 ? 'ready' : 'pending'
    }
  ];

  if (input.recommendedTitles.length > 0) {
    tasks.push({
      taskId: createId('task'),
      goalId: topGoalId,
      type: 'evidence-strengthening-pass',
      input: {
        recommendedTitles: input.recommendedTitles.slice(0, 2),
        topCriticalGap: input.topCriticalGap
      },
      expectedOutcome: 'Higher confidence recommendations backed by stronger evidence',
      preconditions: ['At least one recommendation available'],
      postconditions: ['Evidence quality notes attached'],
      rollbackPlan: 'Discard evidence pass and keep baseline recommendation stack',
      riskScore: 40,
      approvalMode: 'auto',
      status: 'ready'
    });
  }

  return tasks;
};

export class AutonomousPlanner {
  static generateActionPlan(goals: GoalNode[], input: MissionCaseInput): ActionTask[] {
    const topGoal = goals[0];
    if (!topGoal) return [];

    const tasks = buildBaseTasks(topGoal.goalId, input)
      .map((task) => {
        const simulation = WorldModelEngine.simulateTask(task.taskId, task.type, input);
        return {
          ...task,
          simulation,
          approvalMode: simulation.recommendedProceed ? task.approvalMode : 'manual',
          status: !simulation.recommendedProceed && task.status === 'ready' ? 'pending' : task.status
        };
      })
      .sort((a, b) => {
        const aScore = (a.simulation?.baseCase ?? 0) - a.riskScore;
        const bScore = (b.simulation?.baseCase ?? 0) - b.riskScore;
        return bScore - aScore;
      });

    return tasks;
  }
}

export default AutonomousPlanner;
