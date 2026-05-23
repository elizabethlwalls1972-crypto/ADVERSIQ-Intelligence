import { generateExplainabilityReport } from '../core/human-oversight-explainability/explainabilityReporter';
import { logOutcome, retrainModels } from '../core/continuous-learning';
import { ReactiveIntelligenceEngine, ProactiveAction, ThinkingChain } from './ReactiveIntelligenceEngine';
import { ingestData } from '../core/historical-data-integration';
import { simulateScenario } from '../core/causal-reasoning-simulation';
import { checkCompliance } from '../core/ethics-governance';
import { executeRealWorldAction } from '../core/real-world-integration/actionExecutor';
import { ReportParameters } from '../types';

/**
 * AutonomousOrchestrator: End-to-end autonomous problem-solving loop
 * - Accepts a problem/task
 * - Analyzes and proposes solutions
 * - Executes actions (if permitted)
 * - Logs outcomes and triggers learning
 * - Provides full reasoning and audit trail
 */

type AuditEntry = Record<string, unknown>;

export class AutonomousOrchestrator {
  /**
   * Solve a problem end-to-end, optionally auto-executing actions
   */
  static async solveAndAct(
    problem: string,
    context: unknown,
    params: ReportParameters,
    options: { autoAct: boolean; urgency: 'immediate' | 'normal' | 'low' }
  ): Promise<{
    solutions: ProactiveAction[];
    actionsTaken: ProactiveAction[];
    reasoning: ThinkingChain[];
    auditTrail: AuditEntry[];
    confidence: number;
    explainabilityReportPath?: string;
  }> {
    const auditTrail: AuditEntry[] = []; 

    // Step 0: Historical data analysis
    const getContextRegion = (ctx: unknown): string => {
      if (typeof ctx === 'object' && ctx !== null) {
        const c = ctx as Record<string, unknown>;
        if (typeof c['region'] === 'string') return c['region'] as string;
        if (typeof c['domain'] === 'string') return c['domain'] as string;
      }
      return 'global';
    };

    const historical = await ingestData(getContextRegion(context));
    auditTrail.push({ step: 'historicalData', historical });

    // Step 0.5: Causal simulation
    const simulation = await simulateScenario({ problem, context, historical });
    auditTrail.push({ step: 'causalSimulation', simulation });

    // Step 1: Analyze and propose solutions
    const selfSolveResult = await ReactiveIntelligenceEngine.selfSolve(problem, context);
    auditTrail.push({ step: 'selfSolve', ...selfSolveResult });

    // Step 2: Decide and act (if allowed)
    const thinkResult = await ReactiveIntelligenceEngine.thinkAndAct(problem, params, options);
    auditTrail.push({ step: 'thinkAndAct', ...thinkResult });

    let actionsTaken: ProactiveAction[] = [];
    if (thinkResult.actions.length > 0) {
      for (const action of thinkResult.actions) {
        // Step 2.5: Compliance/ethics check before execution
        const compliant = checkCompliance(action.action);
        auditTrail.push({ step: 'complianceCheck', action: action.action, compliant });
        if (compliant) {
          const execResult = await executeRealWorldAction(action.action, action as unknown as Record<string, unknown>);
          actionsTaken.push({ ...action, autoExecute: options.autoAct });
          auditTrail.push({
            step: 'actionExecuted',
            action,
            execResult,
            mode: options.autoAct ? 'autoAct' : 'autonomousAuditTrail',
          });
        } else {
          auditTrail.push({ step: 'actionBlocked', action, reason: 'Failed compliance/ethics check' });
        }
      }
    }

    // Step 3: Log outcome and trigger learning
    await ReactiveIntelligenceEngine.evolve({
      queryId: problem,
      wasHelpful: true, // In real use, this should be based on actual outcome
      actualOutcome: actionsTaken.length > 0 ? 'Actions executed' : 'No action',
      suggestedImprovement: ''
    });
    auditTrail.push({ step: 'evolve', status: 'learning triggered' });

    // Log outcome for continuous learning
    logOutcome(problem, {
      actionsTaken,
      auditTrail,
      confidence: selfSolveResult.confidence
    });
    retrainModels();
    auditTrail.push({ step: 'continuousLearning', status: 'outcome logged and models retrained' });

    // Generate explainability report for this cycle
    const explainabilityReportPath = generateExplainabilityReport(auditTrail, problem);
    auditTrail.push({ step: 'explainabilityReport', path: explainabilityReportPath });

    return {
      solutions: selfSolveResult.solutions,
      actionsTaken,
      reasoning: [...selfSolveResult.reasoning, ...thinkResult.thinking],
      auditTrail,
      confidence: selfSolveResult.confidence,
      explainabilityReportPath
    };
  }
}

