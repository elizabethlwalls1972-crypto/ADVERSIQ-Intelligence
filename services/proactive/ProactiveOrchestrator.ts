/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PROACTIVE ORCHESTRATOR
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Master coordinator for all proactive intelligence systems.
 * Bridges reactive analysis with proactive anticipation.
 * 
 * Responsibilities:
 *   1. Ingest historical data and refresh learned patterns
 *   2. Run backtesting + recalibrate formula weights
 *   3. Detect drift and adjust confidence
 *   4. Generate proactive signals without user request
 *   5. Run meta-cognition check on system reasoning
 *   6. Produce a unified proactive intelligence briefing
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { historicalDataPipeline } from './HistoricalDataPipeline';
import { backtestingEngine } from './BacktestingCalibrationEngine';
import { driftDetectionEngine } from './DriftDetectionEngine';
import { proactiveSignalMiner, type CurrentContext, type ProactiveSignal } from './ProactiveSignalMiner';
import { metaCognitionEngine, type DecisionSnapshot, type CognitiveAlert } from './MetaCognitionEngine';
import { continuousLearningLoop } from './ContinuousLearningLoop';
import { outcomeValidator } from '../OutcomeValidationEngine';

// ============================================================================
// TYPES
// ============================================================================

export interface ProactiveBriefing {
  generatedAt: string;
  context: CurrentContext;
  backtestAccuracy: number;
  calibrationSummary: string;
  driftSummary: string;
  cognitiveSummary: string;
  proactiveSignals: ProactiveSignal[];
  actionPriorities: string[];
  confidence: number; // 0-1
}

export interface OrchestratorState {
  lastRun: string;
  lastBacktestAccuracy: number;
  activeSignals: number;
  activeDriftAlerts: number;
  activeCognitiveAlerts: number;
  learningLoopState: ReturnType<typeof continuousLearningLoop.getState>;
}

// ============================================================================
// ORCHESTRATOR
// ============================================================================

export class ProactiveOrchestrator {
  private state: OrchestratorState;

  constructor() {
    this.state = {
      lastRun: new Date().toISOString(),
      lastBacktestAccuracy: 0,
      activeSignals: 0,
      activeDriftAlerts: 0,
      activeCognitiveAlerts: 0,
      learningLoopState: continuousLearningLoop.getState(),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MAIN PROACTIVE RUN
  // ──────────────────────────────────────────────────────────────────────────

  async runProactiveCycle(context: CurrentContext): Promise<ProactiveBriefing> {
    // 1. Ensure historical data is fresh
    await historicalDataPipeline.ingestAllPublicSources();

    // 2. Run backtest + calibration
    const backtest = backtestingEngine.runFullBacktest();
    const calibration = backtestingEngine.calibrate();
    const weights = backtestingEngine.exportCalibratedWeights();

    outcomeValidator.updateFormulaWeights(weights.weights);

    // 3. Run drift detection
    const driftAlerts = driftDetectionEngine.checkForDrift();

    // 4. Generate proactive signals
    const signals = proactiveSignalMiner.generateSignals(context);

    // 5. Record decision snapshot for meta-cognition
    const decisionSnapshot: DecisionSnapshot = {
      id: `decision-${Date.now()}`,
      timestamp: new Date().toISOString(),
      context: {
        country: context.country,
        sector: context.sector,
        strategy: context.strategy,
        investmentSizeM: context.investmentSizeM,
      },
      recommendation: this.deriveRecommendationFromSignals(signals),
      confidenceScore: Math.round(this.estimateConfidence(signals) * 100),
      reasoningChains: signals.map(s => s.title),
      counterfactuals: this.generateCounterfactuals(signals),
      dataQualityScore: this.estimateDataQuality(context),
      formulaContributions: weights.weights,
      finalScore: backtest.overallAccuracy * 100,
    };

    metaCognitionEngine.recordDecision(decisionSnapshot);
    const cognitiveAlerts = metaCognitionEngine.evaluateCognition();

    // 6. Learning loop update
    const _learningReport = await continuousLearningLoop.runFullCycle();

    // 7. Update state
    this.state = {
      lastRun: new Date().toISOString(),
      lastBacktestAccuracy: backtest.overallAccuracy,
      activeSignals: signals.length,
      activeDriftAlerts: driftAlerts.length,
      activeCognitiveAlerts: cognitiveAlerts.length,
      learningLoopState: continuousLearningLoop.getState(),
    };

    return {
      generatedAt: new Date().toISOString(),
      context,
      backtestAccuracy: backtest.overallAccuracy,
      calibrationSummary: `Calibrated ${calibration.length} formulas. Overall accuracy ${(backtest.overallAccuracy * 100).toFixed(1)}%`,
      driftSummary: driftDetectionEngine.generateDriftSummary(),
      cognitiveSummary: metaCognitionEngine.generateCognitiveBrief(),
      proactiveSignals: signals,
      actionPriorities: this.prioritizeActions(signals, cognitiveAlerts),
      confidence: this.estimateConfidence(signals) * driftDetectionEngine.getConfidenceMultiplier(),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  private deriveRecommendationFromSignals(signals: ProactiveSignal[]): 'invest' | 'caution' | 'reject' {
    const criticalRisk = signals.find(s =>
      s.type === 'risk_pattern' || s.type === 'precedent_warning' || s.type === 'vulnerability'
    );

    if (criticalRisk && (criticalRisk.urgency === 'critical' || criticalRisk.urgency === 'act_now')) {
      return 'reject';
    }

    const opportunitySignals = signals.filter(s => s.type === 'opportunity');
    if (opportunitySignals.length > 0) return 'invest';

    return 'caution';
  }

  private estimateConfidence(signals: ProactiveSignal[]): number {
    if (signals.length === 0) return 0.6;
    const avg = signals.reduce((a, b) => a + b.confidence, 0) / signals.length;
    return Math.min(0.95, Math.max(0.3, avg));
  }

  private estimateDataQuality(context: CurrentContext): number {
    // Weighted heuristic based on key-factor coverage and context richness.
    const factors = context.keyFactors.length;
    return Math.min(100, 40 + factors * 5);
  }

  private generateCounterfactuals(signals: ProactiveSignal[]): string[] {
    const counterfactuals: string[] = [];

    for (const s of signals) {
      if (s.type === 'risk_pattern') {
        counterfactuals.push(`If the risk pattern "${s.title}" were mitigated, confidence would rise.`);
      }
      if (s.type === 'opportunity') {
        counterfactuals.push(`If opportunity conditions weaken (e.g. incentives removed), recommendation would drop.`);
      }
    }

    return counterfactuals.length > 0 ? counterfactuals : ['No strong counterfactuals detected'];
  }

  private prioritizeActions(signals: ProactiveSignal[], cognitiveAlerts: CognitiveAlert[]): string[] {
    const actions = new Set<string>();

    for (const s of signals) {
      if (s.recommendedActions) {
        for (const action of s.recommendedActions) actions.add(action);
      }
    }

    for (const c of cognitiveAlerts) {
      for (const rec of c.recommendedCorrections ?? []) actions.add(rec);
    }

    return Array.from(actions).slice(0, 10);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────────────────

  getState(): OrchestratorState {
    return { ...this.state };
  }

  getLatestSignals(): ProactiveSignal[] {
    return proactiveSignalMiner.getActiveSignals();
  }

  getLearningReport(): ReturnType<typeof continuousLearningLoop.getState> {
    return continuousLearningLoop.getState();
  }
}

export const proactiveOrchestrator = new ProactiveOrchestrator();
