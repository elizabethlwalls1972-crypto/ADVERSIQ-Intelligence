import type {
  ExecutionRecord,
  GoalNode,
  GovernanceDecision,
  MissionRecord,
  MissionSnapshot,
  OutcomeRecord,
  VerificationSummary
} from '../../types/autonomy';
import AutonomousPlanner from './AutonomousPlanner';
import AutonomyGovernanceGate from './AutonomyGovernanceGate';
import ActionExecutionEngine from './ActionExecutionEngine';
import AutonomousLoopOrchestrator from './AutonomousLoopOrchestrator';

const STORAGE_KEY = 'bw-autonomy-mission-snapshot-v1';

export interface MissionCaseInput {
  organizationName: string;
  currentMatter: string;
  objectives: string;
  constraints: string;
  targetAudience: string;
  decisionDeadline: string;
  readinessScore: number;
  criticalGapCount: number;
  topCriticalGap?: string;
  recommendedTitles: string[];
}

interface MissionUpsertOptions {
  forceRun?: boolean;
}

const createId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const hasWindow = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const deriveGovernanceStatus = (
  input: MissionCaseInput,
  decisions: GovernanceDecision[] = []
): MissionSnapshot['governanceStatus'] => {
  if (input.criticalGapCount > 0 || input.readinessScore < 70) return 'red';
  if (decisions.some((decision) => decision.decision === 'rejected')) return 'red';
  if (decisions.some((decision) => decision.decision === 'review-required')) return 'amber';
  if (input.readinessScore < 85) return 'amber';
  return 'green';
};

const deriveMissionStatus = (input: MissionCaseInput): MissionRecord['status'] => {
  if (input.criticalGapCount > 0) return 'blocked';
  if (input.readinessScore < 80) return 'draft';
  return 'active';
};

const buildGoals = (missionId: string, input: MissionCaseInput): GoalNode[] => {
  const goals: GoalNode[] = [
    {
      goalId: createId('goal'),
      missionId,
      description: `Reach decision-ready state for ${input.organizationName || 'organization'}`,
      priority: 100,
      dependencies: [],
      confidence: input.readinessScore,
      status: input.readinessScore >= 80 ? 'in-progress' : 'pending',
      ownerAgent: 'AutonomousPlanner'
    },
    {
      goalId: createId('goal'),
      missionId,
      description: `Prepare target outputs for ${input.targetAudience || 'stakeholders'}`,
      priority: 85,
      dependencies: [],
      confidence: Math.max(40, Math.min(95, input.readinessScore - 5)),
      status: input.recommendedTitles.length > 0 ? 'in-progress' : 'pending',
      ownerAgent: 'DocumentStrategyAgent'
    }
  ];

  if (input.topCriticalGap) {
    goals.push({
      goalId: createId('goal'),
      missionId,
      description: `Resolve critical gap: ${input.topCriticalGap}`,
      priority: 95,
      dependencies: [],
      confidence: 60,
      status: 'pending',
      ownerAgent: 'CaseIntakeAgent'
    });
  }

  return goals.sort((a, b) => b.priority - a.priority);
};

export class MissionGraphService {
  static getSnapshot(): MissionSnapshot | null {
    if (!hasWindow()) return null;
    return safeParse<MissionSnapshot>(window.localStorage.getItem(STORAGE_KEY));
  }

  static saveSnapshot(snapshot: MissionSnapshot): MissionSnapshot {
    if (hasWindow()) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }
    return snapshot;
  }

  static clearSnapshot(): void {
    if (!hasWindow()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  }

  static async upsertFromCaseInput(input: MissionCaseInput, options: MissionUpsertOptions = {}): Promise<MissionSnapshot> {
    const existing = this.getSnapshot();
    const nowIso = new Date().toISOString();
    const autonomyPaused = existing?.autonomyPaused ?? false;
    const shouldExecuteCycle = options.forceRun === true || !autonomyPaused;

    const missionId = existing?.mission?.missionId ?? createId('mission');
    const mission: MissionRecord = {
      missionId,
      objective: input.objectives.trim() || input.currentMatter.trim() || 'Build decision-ready strategic case',
      constraints: input.constraints
        .split(/[;,\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 6),
      targetKPIs: [
        'Readiness >= 80',
        'Critical gaps = 0',
        'Recommendation confidence >= 75'
      ],
      horizon: input.decisionDeadline || 'Current planning cycle',
      status: deriveMissionStatus(input),
      createdAt: existing?.mission?.createdAt ?? nowIso,
      updatedAt: nowIso
    };

    const goals = buildGoals(missionId, input);
    const plannedTasks = AutonomousPlanner.generateActionPlan(goals, input);
    const governanceDecisions = AutonomyGovernanceGate.evaluatePlan(plannedTasks, input);
    const executionBatch = shouldExecuteCycle
      ? await ActionExecutionEngine.executeApprovedTasks(plannedTasks, governanceDecisions, input)
      : {
          tasks: plannedTasks,
          executionRecords: [] as ExecutionRecord[],
          outcomes: [] as OutcomeRecord[]
        };
    const cycle = shouldExecuteCycle
      ? AutonomousLoopOrchestrator.runCycle({
          input,
          tasks: executionBatch.tasks,
          governanceDecisions,
          executionRecords: executionBatch.executionRecords,
          outcomes: executionBatch.outcomes
        })
      : {
          tasks: executionBatch.tasks,
          inFlightTasks: executionBatch.tasks.filter((task) => task.status === 'running' || task.status === 'ready'),
          latestOutcomes: [] as OutcomeRecord[],
          executionRecords: [] as ExecutionRecord[],
          verificationSummary: {
            adaptationScore: Math.max(10, Math.min(95, input.readinessScore)),
            requiresReplan: false,
            replanSignals: ['Autonomy loop is paused'],
            strategyAdjustments: ['Use Run Cycle for one-time execution or Resume to enable continuous loop']
          } as VerificationSummary
        };

    const activePlan = cycle.tasks;
    const inFlightTasks = cycle.inFlightTasks;
    const latestOutcomes: OutcomeRecord[] = [
      ...cycle.latestOutcomes,
      ...(existing?.latestOutcomes ?? [])
    ].slice(0, 20);
    const executionRecords: ExecutionRecord[] = [
      ...cycle.executionRecords,
      ...(existing?.executionRecords ?? [])
    ].slice(0, 20);

    const snapshot: MissionSnapshot = {
      mission,
      goals,
      activePlan,
      inFlightTasks,
      latestOutcomes,
      governanceDecisions,
      executionRecords,
      verificationSummary: cycle.verificationSummary,
      autonomyPaused,
      nextReviewAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
      governanceStatus: deriveGovernanceStatus(input, governanceDecisions)
    };

    return this.saveSnapshot(snapshot);
  }

  static runCycleFromCaseInput(input: MissionCaseInput): MissionSnapshot {
    return this.upsertFromCaseInput(input, { forceRun: true });
  }

  static setAutonomyPaused(paused: boolean): MissionSnapshot | null {
    const snapshot = this.getSnapshot();
    if (!snapshot) return null;

    const next: MissionSnapshot = {
      ...snapshot,
      autonomyPaused: paused,
      verificationSummary: paused
        ? {
            adaptationScore: snapshot.verificationSummary?.adaptationScore ?? 60,
            requiresReplan: snapshot.verificationSummary?.requiresReplan ?? false,
            replanSignals: ['Autonomy paused by operator'],
            strategyAdjustments: ['Resume autonomy or run a manual cycle']
          }
        : snapshot.verificationSummary
    };

    return this.saveSnapshot(next);
  }

  static approveManualTasks(): MissionSnapshot | null {
    const snapshot = this.getSnapshot();
    if (!snapshot) return null;

    const nowIso = new Date().toISOString();
    const approvedTaskIds = new Set<string>();
    const governanceDecisions = snapshot.governanceDecisions.map((decision) => {
      if (decision.decision !== 'review-required') return decision;
      approvedTaskIds.add(decision.taskId);
      return {
        ...decision,
        decision: 'approved' as const,
        reviewer: 'Operator:manual-approval',
        reasons: [...decision.reasons, 'Manual approval granted by operator'],
        timestamp: nowIso
      };
    });

    const activePlan = snapshot.activePlan.map((task) => {
      if (!approvedTaskIds.has(task.taskId)) return task;
      if (task.status !== 'pending') return task;
      return {
        ...task,
        status: 'ready' as const
      };
    });

    const next: MissionSnapshot = {
      ...snapshot,
      governanceDecisions,
      activePlan,
      inFlightTasks: activePlan.filter((task) => task.status === 'running' || task.status === 'ready')
    };

    return this.saveSnapshot(next);
  }
}

export default MissionGraphService;
