import type { ActionTask, GovernanceDecision } from '../../types/autonomy';
import type { MissionCaseInput } from './MissionGraphService';

export class AutonomyGovernanceGate {
  static evaluateTask(task: ActionTask, input: MissionCaseInput): GovernanceDecision {
    const policyChecks: string[] = [];
    const reasons: string[] = [];

    const simulationProceed = task.simulation?.recommendedProceed ?? false;
    policyChecks.push(`Simulation proceed: ${simulationProceed ? 'pass' : 'fail'}`);

    const riskPass = task.riskScore <= 75;
    policyChecks.push(`Risk threshold <= 75: ${riskPass ? 'pass' : 'fail'}`);

    const readinessPass = input.readinessScore >= 70;
    policyChecks.push(`Readiness >= 70: ${readinessPass ? 'pass' : 'fail'}`);

    const gapPass = !(task.type === 'report-generation-preflight' && input.criticalGapCount > 0);
    policyChecks.push(`No blocking critical gaps for preflight: ${gapPass ? 'pass' : 'fail'}`);

    if (!simulationProceed) reasons.push('World model recommends review before proceeding');
    if (!riskPass) reasons.push('Task risk score exceeds policy threshold');
    if (!readinessPass) reasons.push('Readiness is below autonomous execution threshold');
    if (!gapPass) reasons.push('Critical gaps block report preflight execution');

    let decision: GovernanceDecision['decision'] = 'approved';
    if (task.approvalMode === 'manual') {
      decision = 'review-required';
      reasons.push('Task marked manual approval by planner');
    }

    if (!riskPass || !readinessPass) {
      decision = 'rejected';
    } else if (!simulationProceed || !gapPass) {
      decision = 'review-required';
    }

    if (reasons.length === 0) {
      reasons.push('All governance checks passed');
    }

    return {
      taskId: task.taskId,
      policyChecks,
      decision,
      reasons,
      reviewer: decision === 'approved' ? 'AutonomyGovernanceGate:auto' : 'AutonomyGovernanceGate:policy',
      timestamp: new Date().toISOString()
    };
  }

  static evaluatePlan(tasks: ActionTask[], input: MissionCaseInput): GovernanceDecision[] {
    return tasks.map((task) => this.evaluateTask(task, input));
  }
}

export default AutonomyGovernanceGate;
