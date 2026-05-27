export type MissionStatus = 'draft' | 'active' | 'blocked' | 'completed';
export type GoalStatus = 'pending' | 'in-progress' | 'blocked' | 'completed';
export type TaskStatus = 'pending' | 'ready' | 'running' | 'completed' | 'failed';
export type TaskApprovalMode = 'auto' | 'conditional' | 'manual';

export interface SimulationResult {
  taskId: string;
  baseCase: number;
  upsideCase: number;
  downsideCase: number;
  sensitivityDrivers: string[];
  recommendedProceed: boolean;
}

export interface MissionRecord {
  missionId: string;
  objective: string;
  constraints: string[];
  targetKPIs: string[];
  horizon: string;
  status: MissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GoalNode {
  goalId: string;
  missionId: string;
  description: string;
  parentGoalId?: string;
  priority: number;
  dependencies: string[];
  confidence: number;
  status: GoalStatus;
  ownerAgent: string;
}

export interface ActionTask {
  taskId: string;
  goalId: string;
  type: string;
  input: Record<string, unknown>;
  expectedOutcome: string;
  preconditions: string[];
  postconditions: string[];
  rollbackPlan: string;
  riskScore: number;
  approvalMode: TaskApprovalMode;
  status: TaskStatus;
  simulation?: SimulationResult;
}

export interface GovernanceDecision {
  taskId: string;
  policyChecks: string[];
  decision: 'approved' | 'rejected' | 'review-required';
  reasons: string[];
  reviewer: string;
  timestamp: string;
}

export interface ExecutionRecord {
  runId: string;
  taskId: string;
  startedAt: string;
  finishedAt: string;
  status: 'completed' | 'failed';
  outputs: Record<string, unknown>;
  errors: string[];
  retries: number;
}

export interface OutcomeRecord {
  taskId: string;
  expectedKPIChange: Record<string, number>;
  observedKPIChange: Record<string, number>;
  variance: number;
  verdict: 'met' | 'partially-met' | 'missed';
  rootCauseTags: string[];
  lesson: string;
}

export interface VerificationSummary {
  adaptationScore: number;
  requiresReplan: boolean;
  replanSignals: string[];
  strategyAdjustments: string[];
}

export interface MissionSnapshot {
  mission: MissionRecord;
  goals: GoalNode[];
  activePlan: ActionTask[];
  inFlightTasks: ActionTask[];
  latestOutcomes: OutcomeRecord[];
  governanceDecisions: GovernanceDecision[];
  executionRecords: ExecutionRecord[];
  verificationSummary?: VerificationSummary;
  autonomyPaused: boolean;
  nextReviewAt: string;
  governanceStatus: 'green' | 'amber' | 'red';
}
