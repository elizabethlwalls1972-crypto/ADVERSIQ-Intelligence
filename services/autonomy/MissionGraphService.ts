/**
 * MissionGraphService — Autonomous Mission Lifecycle Manager
 * Converts case inputs into a structured MissionSnapshot for the
 * autonomous execution pipeline. Used by BWConsultantOS.
 */
import type { MissionSnapshot, MissionRecord, GoalNode, ActionTask } from '../../types/autonomy';

export interface MissionCaseInput {
  organizationName?: string;
  country?: string;
  strategicIntent?: string[];
  problemStatement?: string;
  industry?: string[];
  dealSize?: string;
  riskTolerance?: string;
  analysisTimeframe?: string;
  [key: string]: unknown;
}

function makeMissionRecord(input: MissionCaseInput): MissionRecord {
  return {
    missionId: `mission-${Date.now()}`,
    objective: input.problemStatement || `Strategic analysis for ${input.organizationName || 'organisation'} in ${input.country || 'target market'}`,
    constraints: [
      input.riskTolerance ? `Risk tolerance: ${input.riskTolerance}` : 'Standard risk parameters',
      input.dealSize ? `Deal size: ${input.dealSize}` : 'Deal size: TBD',
    ],
    targetKPIs: (input.strategicIntent || []).slice(0, 5),
    horizon: input.analysisTimeframe || '12 months',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function makeGoals(input: MissionCaseInput, missionId: string): GoalNode[] {
  const intents = input.strategicIntent || ['Strategic analysis'];
  return intents.slice(0, 3).map((intent, i) => ({
    goalId: `goal-${missionId}-${i}`,
    missionId,
    description: intent,
    priority: i + 1,
    dependencies: i > 0 ? [`goal-${missionId}-${i - 1}`] : [],
    confidence: 0.75,
    status: 'pending' as const,
    ownerAgent: 'NSILIntelligenceHub',
  }));
}

function makeActivePlan(goals: GoalNode[]): ActionTask[] {
  return goals.map((g, i) => ({
    taskId: `task-${g.goalId}`,
    goalId: g.goalId,
    type: 'analysis',
    input: { goal: g.description },
    expectedOutcome: `Validated intelligence for: ${g.description}`,
    preconditions: i > 0 ? [`task-${goals[i - 1].goalId}`] : [],
    postconditions: [`goal-${g.goalId}-complete`],
    rollbackPlan: 'Revert to previous analysis state',
    riskScore: 0.2,
    approvalMode: 'conditional' as const,
    status: 'pending' as const,
  }));
}

class MissionGraphServiceClass {
  private currentSnapshot: MissionSnapshot | null = null;

  async upsertFromCaseInput(input: MissionCaseInput): Promise<MissionSnapshot> {
    const mission = makeMissionRecord(input);
    const goals = makeGoals(input, mission.missionId);
    const activePlan = makeActivePlan(goals);

    const snapshot: MissionSnapshot = {
      mission,
      goals,
      activePlan,
      inFlightTasks: [],
      latestOutcomes: [],
      governanceDecisions: [],
      executionRecords: [],
      autonomyPaused: false,
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      governanceStatus: 'green',
      verificationSummary: {
        adaptationScore: 0.8,
        requiresReplan: false,
        replanSignals: [],
        strategyAdjustments: [],
      },
    };

    this.currentSnapshot = snapshot;
    return snapshot;
  }

  getSnapshot(): MissionSnapshot | null {
    return this.currentSnapshot;
  }

  clearMission(): void {
    this.currentSnapshot = null;
  }
}

const MissionGraphService = new MissionGraphServiceClass();
export default MissionGraphService;
