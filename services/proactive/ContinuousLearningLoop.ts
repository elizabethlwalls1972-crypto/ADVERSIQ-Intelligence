/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONTINUOUS LEARNING LOOP
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Connects historical data ingestion → backtesting → calibration →
 * outcome validation → drift detection → proactive signal updates.
 * 
 * This creates a continuous feedback loop where the system
 * learns from every new outcome and gets smarter over time.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { historicalDataPipeline } from './HistoricalDataPipeline';
import { backtestingEngine } from './BacktestingCalibrationEngine';
import { driftDetectionEngine } from './DriftDetectionEngine';
import { proactiveSignalMiner } from './ProactiveSignalMiner';
import { metaCognitionEngine } from './MetaCognitionEngine';
import { outcomeValidator } from '../OutcomeValidationEngine';
import { OutcomeTracker } from '../OutcomeTracker';

// ============================================================================
// TYPES
// ============================================================================

export interface LearningLoopState {
  lastRun: string;
  totalHistoricalCases: number;
  lastCalibrationAccuracy: number;
  totalOutcomesTracked: number;
  driftAlertsActive: number;
  cognitiveAlertsActive: number;
  improvementActions: string[];
}

export interface LearningLoopReport {
  timestamp: string;
  ingestionSummary: string;
  backtestAccuracy: number;
  calibrationSummary: string;
  driftSummary: string;
  cognitiveSummary: string;
  proactiveSignalCount: number;
  improvementActions: string[];
}

// ============================================================================
// CONTINUOUS LEARNING LOOP ENGINE
// ============================================================================

export class ContinuousLearningLoop {
  private state: LearningLoopState;

  constructor() {
    this.state = {
      lastRun: new Date().toISOString(),
      totalHistoricalCases: 0,
      lastCalibrationAccuracy: 0,
      totalOutcomesTracked: 0,
      driftAlertsActive: 0,
      cognitiveAlertsActive: 0,
      improvementActions: [],
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RUN FULL LEARNING CYCLE
  // ──────────────────────────────────────────────────────────────────────────

  async runFullCycle(): Promise<LearningLoopReport> {
    const ingestionSummary = await this.ingestHistoricalData();

    // Run backtest and calibration
    const backtestResults = backtestingEngine.runFullBacktest();
    const calibrationResults = backtestingEngine.calibrate();
    const calibratedWeights = backtestingEngine.exportCalibratedWeights();

    // Update outcome validation weights (if available)
    outcomeValidator.updateFormulaWeights(calibratedWeights.weights);

    // Drift detection pass
    const driftAlerts = driftDetectionEngine.checkForDrift();

    // Meta-cognition evaluation
    const cognitiveAlerts = metaCognitionEngine.evaluateCognition();

    // Generate proactive signals (system can run this on known contexts)
    const proactiveSignals = proactiveSignalMiner.getActiveSignals();

    this.state = {
      lastRun: new Date().toISOString(),
      totalHistoricalCases: backtestingEngine.getCases().length,
      lastCalibrationAccuracy: backtestResults.overallAccuracy,
      totalOutcomesTracked: OutcomeTracker.getDecisions().length,
      driftAlertsActive: driftAlerts.length,
      cognitiveAlertsActive: cognitiveAlerts.length,
      improvementActions: this.collectImprovementActions(driftAlerts, cognitiveAlerts),
    };

    return {
      timestamp: this.state.lastRun,
      ingestionSummary,
      backtestAccuracy: backtestResults.overallAccuracy,
      calibrationSummary: `Calibrated ${calibrationResults.length} formulas. Overall accuracy: ${(backtestResults.overallAccuracy * 100).toFixed(1)}%`,
      driftSummary: driftDetectionEngine.generateDriftSummary(),
      cognitiveSummary: metaCognitionEngine.generateCognitiveBrief(),
      proactiveSignalCount: proactiveSignals.length,
      improvementActions: this.state.improvementActions,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // INGEST HISTORICAL DATA
  // ──────────────────────────────────────────────────────────────────────────

  private async ingestHistoricalData(): Promise<string> {
    try {
      const cases = await historicalDataPipeline.ingestAllPublicSources();
      return `Historical ingestion complete: ${cases.length} records processed.`;
    } catch (err) {
      return `Historical ingestion failed: ${(err as Error).message}`;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // IMPROVEMENT ACTIONS
  // ──────────────────────────────────────────────────────────────────────────

  private collectImprovementActions(driftAlerts: { recommendedActions?: string[] }[], cognitiveAlerts: { recommendedCorrections?: string[] }[]): string[] {
    const actions = new Set<string>();

    for (const d of driftAlerts) {
      for (const rec of d.recommendedActions ?? []) actions.add(rec);
    }

    for (const c of cognitiveAlerts) {
      for (const rec of c.recommendedCorrections ?? []) actions.add(rec);
    }

    return Array.from(actions);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────────────────

  getState(): LearningLoopState {
    return { ...this.state };
  }
}

export const continuousLearningLoop = new ContinuousLearningLoop();
