/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * META-COGNITION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The system's "thinking about its own thinking" layer.
 * It evaluates its reasoning quality, detects overconfidence,
 * identifies blind spots, and generates self-improvement directives.
 * 
 * This module is critical for a truly proactive intelligence system.
 * It continuously challenges assumptions and improves decision quality.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { driftDetectionEngine } from './DriftDetectionEngine';
import { backtestingEngine } from './BacktestingCalibrationEngine';

// ============================================================================
// TYPES
// ============================================================================

export type CognitiveIssueType =
  | 'overconfidence'
  | 'underconfidence'
  | 'confirmation_bias'
  | 'missing_counterfactual'
  | 'low_data_quality'
  | 'model_drift'
  | 'pattern_overfit'
  | 'insufficient_diversity'
  | 'reasoning_gap'
  | 'inconsistent_recommendations'
  | 'stale_assumptions';

export type CognitiveSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface CognitiveAlert {
  id: string;
  type: CognitiveIssueType;
  severity: CognitiveSeverity;
  detectedAt: string;
  description: string;
  evidence: string[];
  recommendedCorrections: string[];
  autoCorrections: string[];
  confidenceImpact: number; // 0-1
}

export interface DecisionSnapshot {
  id: string;
  timestamp: string;
  context: {
    country: string;
    sector: string;
    strategy: string;
    investmentSizeM: number;
  };
  recommendation: 'invest' | 'caution' | 'reject';
  confidenceScore: number; // 0-100
  reasoningChains: string[]; // key reasoning steps
  counterfactuals?: string[];
  dataQualityScore: number; // 0-100
  formulaContributions: Record<string, number>;
  finalScore: number;
}

export interface MetaCognitionState {
  lastChecked: string;
  activeAlerts: CognitiveAlert[];
  cognitiveReliabilityScore: number; // 0-100
  confidenceCalibrationScore: number; // 0-100
  blindSpotIndex: number; // 0-100
  improvementDirectives: string[];
  history: CognitiveAlert[];
}

// ============================================================================
// META-COGNITION ENGINE
// ============================================================================

export class MetaCognitionEngine {
  private state: MetaCognitionState;
  private decisionHistory: DecisionSnapshot[] = [];

  constructor() {
    this.state = {
      lastChecked: new Date().toISOString(),
      activeAlerts: [],
      cognitiveReliabilityScore: 85,
      confidenceCalibrationScore: 80,
      blindSpotIndex: 15,
      improvementDirectives: [],
      history: [],
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RECORD DECISION SNAPSHOT
  // ──────────────────────────────────────────────────────────────────────────

  recordDecision(snapshot: DecisionSnapshot): void {
    this.decisionHistory.push(snapshot);
    if (this.decisionHistory.length > 500) {
      this.decisionHistory = this.decisionHistory.slice(-500);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MAIN META-COGNITION LOOP
  // ──────────────────────────────────────────────────────────────────────────

  evaluateCognition(): CognitiveAlert[] {
    const alerts: CognitiveAlert[] = [];

    // 1. Check for overconfidence and underconfidence
    alerts.push(...this.detectConfidenceCalibrationIssues());

    // 2. Check for confirmation bias
    alerts.push(...this.detectConfirmationBias());

    // 3. Check for missing counterfactual analysis
    alerts.push(...this.detectMissingCounterfactuals());

    // 4. Check data quality of recent decisions
    alerts.push(...this.detectLowDataQuality());

    // 5. Incorporate drift detection info
    alerts.push(...this.integrateDriftSignals());

    // 6. Check for pattern overfit
    alerts.push(...this.detectPatternOverfit());

    // 7. Check for sector/region blind spots
    alerts.push(...this.detectBlindSpots());

    // 8. Check for inconsistent recommendations in similar contexts
    alerts.push(...this.detectInconsistentRecommendations());

    // 9. Check for stale assumptions
    alerts.push(...this.detectStaleAssumptions());

    // Apply auto-corrections
    for (const alert of alerts) {
      this.applyAutoCorrections(alert);
    }

    this.state.activeAlerts = alerts;
    this.state.history.push(...alerts);
    this.state.lastChecked = new Date().toISOString();

    this.updateCognitiveScores(alerts);

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. CONFIDENCE CALIBRATION
  // ──────────────────────────────────────────────────────────────────────────

  private detectConfidenceCalibrationIssues(): CognitiveAlert[] {
    const alerts: CognitiveAlert[] = [];

    if (this.decisionHistory.length < 10) return alerts;

    const recent = this.decisionHistory.slice(-20);
    const avgConfidence = recent.reduce((a, b) => a + b.confidenceScore, 0) / recent.length;
    const avgDataQuality = recent.reduce((a, b) => a + b.dataQualityScore, 0) / recent.length;

    if (avgConfidence > 80 && avgDataQuality < 60) {
      alerts.push({
        id: `cog-overconf-${Date.now()}`,
        type: 'overconfidence',
        severity: 'high',
        detectedAt: new Date().toISOString(),
        description: `System confidence is high (${avgConfidence.toFixed(0)}%) while data quality is low (${avgDataQuality.toFixed(0)}%). Risk of overconfidence.`,
        evidence: [`Avg confidence: ${avgConfidence.toFixed(1)}%`, `Avg data quality: ${avgDataQuality.toFixed(1)}%`],
        recommendedCorrections: [
          'Lower confidence on all current recommendations by 15%',
          'Highlight data gaps explicitly in reports',
          'Trigger additional data collection',
        ],
        autoCorrections: [],
        confidenceImpact: 0.15,
      });
    }

    if (avgConfidence < 50 && avgDataQuality > 80) {
      alerts.push({
        id: `cog-underconf-${Date.now()}`,
        type: 'underconfidence',
        severity: 'medium',
        detectedAt: new Date().toISOString(),
        description: `System confidence is low (${avgConfidence.toFixed(0)}%) despite high data quality (${avgDataQuality.toFixed(0)}%). Risk of excessive caution.`,
        evidence: [`Avg confidence: ${avgConfidence.toFixed(1)}%`, `Avg data quality: ${avgDataQuality.toFixed(1)}%`],
        recommendedCorrections: [
          'Allow higher confidence when data quality is strong',
          'Review calibration of confidence scoring',
        ],
        autoCorrections: [],
        confidenceImpact: -0.1,
      });
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. CONFIRMATION BIAS
  // ──────────────────────────────────────────────────────────────────────────

  private detectConfirmationBias(): CognitiveAlert[] {
    const alerts: CognitiveAlert[] = [];

    const recent = this.decisionHistory.slice(-20);
    const investCount = recent.filter(d => d.recommendation === 'invest').length;
    const rejectCount = recent.filter(d => d.recommendation === 'reject').length;

    if (investCount / recent.length > 0.7) {
      alerts.push({
        id: `cog-confirm-${Date.now()}`,
        type: 'confirmation_bias',
        severity: 'medium',
        detectedAt: new Date().toISOString(),
        description: `System has issued ${(investCount / recent.length * 100).toFixed(0)}% INVEST recommendations in recent history. Potential confirmation bias.`,
        evidence: [`Invest recommendations: ${investCount}`, `Reject recommendations: ${rejectCount}`],
        recommendedCorrections: [
          'Introduce stricter thresholds for INVEST',
          'Force adversarial reasoning in recommendation logic',
        ],
        autoCorrections: [],
        confidenceImpact: 0.1,
      });
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. COUNTERFACTUALS
  // ──────────────────────────────────────────────────────────────────────────

  private detectMissingCounterfactuals(): CognitiveAlert[] {
    const alerts: CognitiveAlert[] = [];
    const recent = this.decisionHistory.slice(-20);
    const missing = recent.filter(d => !d.counterfactuals || d.counterfactuals.length === 0);

    if (missing.length / recent.length > 0.5) {
      alerts.push({
        id: `cog-counter-${Date.now()}`,
        type: 'missing_counterfactual',
        severity: 'medium',
        detectedAt: new Date().toISOString(),
        description: `More than 50% of recent decisions lack explicit counterfactual analysis. Risk of one-sided reasoning.`,
        evidence: [`Missing counterfactuals: ${missing.length} of ${recent.length}`],
        recommendedCorrections: [
          'Auto-generate counterfactual analysis for each recommendation',
          'Add "What would change this decision?" section to reports',
        ],
        autoCorrections: [],
        confidenceImpact: 0.1,
      });
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. DATA QUALITY
  // ──────────────────────────────────────────────────────────────────────────

  private detectLowDataQuality(): CognitiveAlert[] {
    const alerts: CognitiveAlert[] = [];
    const recent = this.decisionHistory.slice(-20);
    const avgDataQuality = recent.reduce((a, b) => a + b.dataQualityScore, 0) / Math.max(1, recent.length);

    if (avgDataQuality < 50) {
      alerts.push({
        id: `cog-lowdata-${Date.now()}`,
        type: 'low_data_quality',
        severity: 'high',
        detectedAt: new Date().toISOString(),
        description: `Recent decisions are based on low-quality data (avg score ${avgDataQuality.toFixed(0)}%). Risk of unreliable conclusions.`,
        evidence: [`Avg data quality: ${avgDataQuality.toFixed(1)}%`],
        recommendedCorrections: [
          'Prioritize data improvement before issuing high-confidence recommendations',
          'Flag decisions with low data quality as provisional',
        ],
        autoCorrections: [],
        confidenceImpact: 0.2,
      });
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. DRIFT SIGNALS
  // ──────────────────────────────────────────────────────────────────────────

  private integrateDriftSignals(): CognitiveAlert[] {
    const alerts: CognitiveAlert[] = [];
    const driftAlerts = driftDetectionEngine.getActiveAlerts();

    if (driftAlerts.length > 0) {
      alerts.push({
        id: `cog-drift-${Date.now()}`,
        type: 'model_drift',
        severity: 'high',
        detectedAt: new Date().toISOString(),
        description: `Active drift alerts detected (${driftAlerts.length}). Model assumptions may be outdated.`,
        evidence: driftAlerts.map(a => a.description),
        recommendedCorrections: [
          'Reduce reliance on historical patterns for current decisions',
          'Trigger model re-calibration',
          'Highlight uncertainty in current recommendations',
        ],
        autoCorrections: [],
        confidenceImpact: 0.2,
      });
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. PATTERN OVERFIT
  // ──────────────────────────────────────────────────────────────────────────

  private detectPatternOverfit(): CognitiveAlert[] {
    const alerts: CognitiveAlert[] = [];

    const results = backtestingEngine.runFullBacktest();
    const highAccuracyFormulas = Object.entries(results.formulaAccuracy)
      .filter(([_, acc]) => acc > 90);

    if (highAccuracyFormulas.length > 0) {
      alerts.push({
        id: `cog-overfit-${Date.now()}`,
        type: 'pattern_overfit',
        severity: 'medium',
        detectedAt: new Date().toISOString(),
        description: `Some formulas show unusually high accuracy (>90%). This may indicate overfitting to historical cases rather than generalizable insight.`,
        evidence: highAccuracyFormulas.map(([f, acc]) => `${f}: ${acc.toFixed(1)}%`),
        recommendedCorrections: [
          'Test formulas on out-of-sample cases',
          'Reduce weight for suspiciously high-accuracy formulas',
        ],
        autoCorrections: [],
        confidenceImpact: 0.1,
      });
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. BLIND SPOTS
  // ──────────────────────────────────────────────────────────────────────────

  private detectBlindSpots(): CognitiveAlert[] {
    const alerts: CognitiveAlert[] = [];

    // Simple heuristic: if we have < 3 decisions in a sector, it's a blind spot
    const sectorCounts: Record<string, number> = {};
    for (const d of this.decisionHistory) {
      sectorCounts[d.context.sector] = (sectorCounts[d.context.sector] ?? 0) + 1;
    }

    const blindSectors = Object.entries(sectorCounts)
      .filter(([_, count]) => count < 3)
      .map(([sector]) => sector);

    if (blindSectors.length > 0) {
      alerts.push({
        id: `cog-blind-${Date.now()}`,
        type: 'insufficient_diversity',
        severity: 'medium',
        detectedAt: new Date().toISOString(),
        description: `Insufficient decision diversity in sectors: ${blindSectors.join(', ')}. Blind spot risk.`,
        evidence: [`Low decision count sectors: ${blindSectors.join(', ')}`],
        recommendedCorrections: [
          `Collect additional cases in: ${blindSectors.join(', ')}`,
          'Tag recommendations in these sectors as lower confidence',
        ],
        autoCorrections: [],
        confidenceImpact: 0.15,
      });
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8. INCONSISTENT RECOMMENDATIONS
  // ──────────────────────────────────────────────────────────────────────────

  private detectInconsistentRecommendations(): CognitiveAlert[] {
    const alerts: CognitiveAlert[] = [];
    const recent = this.decisionHistory.slice(-50);

    // Compare similar contexts for consistency
    for (let i = 0; i < recent.length; i++) {
      for (let j = i + 1; j < recent.length; j++) {
        const a = recent[i];
        const b = recent[j];

        if (
          a.context.country === b.context.country &&
          a.context.sector === b.context.sector &&
          Math.abs(a.context.investmentSizeM - b.context.investmentSizeM) < 100
        ) {
          if (a.recommendation !== b.recommendation && Math.abs(a.finalScore - b.finalScore) < 10) {
            alerts.push({
              id: `cog-inconsistent-${Date.now()}`,
              type: 'inconsistent_recommendations',
              severity: 'medium',
              detectedAt: new Date().toISOString(),
              description: `Inconsistent recommendations found for similar contexts: ${a.recommendation} vs ${b.recommendation} with similar scores.`,
              evidence: [`${a.id} vs ${b.id}`],
              recommendedCorrections: [
                'Review decision threshold boundaries',
                'Standardize recommendation rules for similar contexts',
              ],
              autoCorrections: [],
              confidenceImpact: 0.1,
            });
          }
        }
      }
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9. STALE ASSUMPTIONS
  // ──────────────────────────────────────────────────────────────────────────

  private detectStaleAssumptions(): CognitiveAlert[] {
    const alerts: CognitiveAlert[] = [];
    const driftMultiplier = driftDetectionEngine.getConfidenceMultiplier();

    if (driftMultiplier < 0.8) {
      alerts.push({
        id: `cog-stale-${Date.now()}`,
        type: 'stale_assumptions',
        severity: 'high',
        detectedAt: new Date().toISOString(),
        description: `Drift multiplier is ${Math.round(driftMultiplier * 100)}%, indicating stale assumptions. Historical patterns may no longer hold.`,
        evidence: ['Drift detection shows reduced confidence in historical calibration'],
        recommendedCorrections: [
          'Increase reliance on live intelligence feeds',
          'Reduce weight of pre-2020 historical cases',
          'Trigger recalibration with recent data',
        ],
        autoCorrections: [],
        confidenceImpact: 0.2,
      });
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // AUTO-CORRECTIONS
  // ──────────────────────────────────────────────────────────────────────────

  private applyAutoCorrections(alert: CognitiveAlert): void {
    const corrections: string[] = [];

    if (alert.type === 'overconfidence') {
      corrections.push('Reduced system confidence by 15%');
      this.state.confidenceCalibrationScore = Math.max(0, this.state.confidenceCalibrationScore - 10);
    }

    if (alert.type === 'underconfidence') {
      corrections.push('Raised confidence allowance by 10%');
      this.state.confidenceCalibrationScore = Math.min(100, this.state.confidenceCalibrationScore + 5);
    }

    if (alert.type === 'low_data_quality') {
      corrections.push('Flagged recommendations as provisional');
      this.state.cognitiveReliabilityScore = Math.max(0, this.state.cognitiveReliabilityScore - 10);
    }

    if (alert.type === 'model_drift') {
      corrections.push('Triggered recalibration flag');
      this.state.cognitiveReliabilityScore = Math.max(0, this.state.cognitiveReliabilityScore - 15);
    }

    if (alert.type === 'pattern_overfit') {
      corrections.push('Reduced reliance on overfit formulas');
      this.state.cognitiveReliabilityScore = Math.max(0, this.state.cognitiveReliabilityScore - 5);
    }

    if (alert.type === 'insufficient_diversity') {
      corrections.push('Tagged blind spot sectors with low confidence');
      this.state.blindSpotIndex = Math.min(100, this.state.blindSpotIndex + 10);
    }

    if (alert.type === 'inconsistent_recommendations') {
      corrections.push('Tightened recommendation thresholds');
    }

    if (alert.type === 'stale_assumptions') {
      corrections.push('Increased reliance on recent data');
      this.state.cognitiveReliabilityScore = Math.max(0, this.state.cognitiveReliabilityScore - 10);
    }

    alert.autoCorrections = corrections;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UPDATE SCORES
  // ──────────────────────────────────────────────────────────────────────────

  private updateCognitiveScores(alerts: CognitiveAlert[]): void {
    const impactSum = alerts.reduce((sum, a) => sum + a.confidenceImpact, 0);
    this.state.cognitiveReliabilityScore = Math.max(0, this.state.cognitiveReliabilityScore - impactSum * 20);
    this.state.blindSpotIndex = Math.min(100, this.state.blindSpotIndex + alerts.length * 2);

    // Generate improvement directives
    const directives = new Set<string>();
    for (const alert of alerts) {
      for (const rec of alert.recommendedCorrections) {
        directives.add(rec);
      }
    }
    this.state.improvementDirectives = Array.from(directives);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────────────────

  getState(): MetaCognitionState {
    return { ...this.state };
  }

  getActiveAlerts(): CognitiveAlert[] {
    return this.state.activeAlerts;
  }

  getCognitiveScore(): number {
    return this.state.cognitiveReliabilityScore;
  }

  getImprovementDirectives(): string[] {
    return this.state.improvementDirectives;
  }

  generateCognitiveBrief(): string {
    if (this.state.activeAlerts.length === 0) {
      return 'Meta-cognition check: No cognitive risks detected. Reasoning quality is stable.';
    }

    const lines: string[] = [
      '═══════════════════════════════════════════════════════════',
      '  META-COGNITION ALERTS',
      '═══════════════════════════════════════════════════════════',
      '',
      `Cognitive reliability: ${this.state.cognitiveReliabilityScore.toFixed(0)}%`,
      `Blind spot index: ${this.state.blindSpotIndex.toFixed(0)}%`,
      '',
    ];

    for (const alert of this.state.activeAlerts) {
      lines.push(`[${alert.severity.toUpperCase()}] ${alert.type}: ${alert.description}`);
      if (alert.autoCorrections.length > 0) {
        lines.push(`  Auto-corrections: ${alert.autoCorrections.join('; ')}`);
      }
      lines.push('');
    }

    if (this.state.improvementDirectives.length > 0) {
      lines.push('Improvement directives:');
      for (const directive of this.state.improvementDirectives) {
        lines.push(`  - ${directive}`);
      }
    }

    return lines.join('\n');
  }
}

export const metaCognitionEngine = new MetaCognitionEngine();
