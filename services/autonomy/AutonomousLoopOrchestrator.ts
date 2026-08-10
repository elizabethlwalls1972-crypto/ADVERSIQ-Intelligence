import type {
  ActionTask,
  ExecutionRecord,
  GovernanceDecision,
  OutcomeRecord,
  VerificationSummary
} from '../../types/autonomy';
import type { MissionCaseInput } from './MissionGraphService';
import OutcomeVerificationEngine from './OutcomeVerificationEngine';

export interface AutonomousCycleInput {
  input: MissionCaseInput;
  tasks: ActionTask[];
  governanceDecisions: GovernanceDecision[];
  executionRecords: ExecutionRecord[];
  outcomes: OutcomeRecord[];
}

export interface AutonomousCycleResult {
  tasks: ActionTask[];
  inFlightTasks: ActionTask[];
  latestOutcomes: OutcomeRecord[];
  executionRecords: ExecutionRecord[];
  verificationSummary: VerificationSummary;
}

export class AutonomousLoopOrchestrator {
  static runCycle(payload: AutonomousCycleInput): AutonomousCycleResult {
    const verificationSummary = OutcomeVerificationEngine.verify(
      payload.outcomes,
      payload.governanceDecisions,
      payload.input
    );

    const tasks = OutcomeVerificationEngine.applyReplanAdjustments(
      payload.tasks,
      verificationSummary
    );

    const inFlightTasks = tasks.filter((task) => task.status === 'running' || task.status === 'ready');

    return {
      tasks,
      inFlightTasks,
      latestOutcomes: payload.outcomes,
      executionRecords: payload.executionRecords,
      verificationSummary
    };
  }
}

export default AutonomousLoopOrchestrator;
