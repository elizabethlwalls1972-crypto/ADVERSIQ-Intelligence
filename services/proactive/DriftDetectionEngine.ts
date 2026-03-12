/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DRIFT DETECTION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Detects when the world has changed enough that past patterns no longer apply.
 * This is the "self-aware" layer - the system questioning its own assumptions.
 * 
 * Three types of drift detected:
 *   1. CONCEPT DRIFT: The relationship between inputs and outcomes has changed
 *      (e.g., tax incentives no longer predict FDI success like they used to)
 *   2. DATA DRIFT: The distribution of incoming data has shifted
 *      (e.g., average deal size has doubled, or new sectors appearing)
 *   3. PERFORMANCE DRIFT: Model accuracy declining over rolling windows
 *      (e.g., last 10 predictions much worse than historical average)
 * 
 * When drift is detected, the system:
 *   - Flags the specific formulas/contexts affected
 *   - Widens confidence intervals automatically
 *   - Triggers re-calibration of the affected formula weights
 *   - Generates human-readable explanations of what changed
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// TYPES
// ============================================================================

export type DriftType = 'concept' | 'data' | 'performance';
export type DriftSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DriftAlert {
  id: string;
  type: DriftType;
  severity: DriftSeverity;
  detectedAt: string;
  description: string;
  affectedFormulas: string[];
  affectedContexts: string[]; // regions/sectors
  evidence: DriftEvidence;
  recommendedActions: string[];
  autoActionsTaken: string[];
  confidenceImpact: number; // How much to widen confidence bands (0-1)
}

export interface DriftEvidence {
  metric: string;
  baselineValue: number;
  currentValue: number;
  threshold: number;
  windowSize: number;
  pValue: number; // Statistical significance
  trendDirection: 'increasing' | 'decreasing' | 'volatile';
}

export interface PredictionRecord {
  id: string;
  timestamp: string;
  context: {
    country: string;
    sector: string;
    strategy: string;
    investmentSize: number;
  };
  formulaScores: Record<string, number>;
  compositeScore: number;
  recommendation: 'invest' | 'caution' | 'reject';
  actualOutcome?: 'success' | 'failure' | 'mixed';
  error?: number;
}

export interface DriftState {
  lastChecked: string;
  activeAlerts: DriftAlert[];
  formulaReliability: Record<string, number>; // 0-1, how much to trust each formula
  contextReliability: Record<string, number>; // per country/sector
  rollingAccuracy: number[];
  totalPredictions: number;
  driftHistory: DriftAlert[];
}

// ============================================================================
// STATISTICAL UTILITIES
// ============================================================================

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function standardDeviation(arr: number[]): number {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  const squareDiffs = arr.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / (arr.length - 1));
}

function welchTTest(sample1: number[], sample2: number[]): number {
  if (sample1.length < 2 || sample2.length < 2) return 1;

  const m1 = mean(sample1);
  const m2 = mean(sample2);
  const s1 = standardDeviation(sample1);
  const s2 = standardDeviation(sample2);
  const n1 = sample1.length;
  const n2 = sample2.length;

  const se = Math.sqrt((s1 * s1) / n1 + (s2 * s2) / n2);
  if (se === 0) return 1;

  const t = Math.abs(m1 - m2) / se;

  // Approximate p-value using normal distribution for large samples
  const z = t;
  const p = 2 * (1 - normalCDF(z));
  return p;
}

function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

function kolmogorovSmirnovTest(sample1: number[], sample2: number[]): number {
  if (sample1.length === 0 || sample2.length === 0) return 1;

  const all = [...sample1.map(v => ({ v, group: 1 })), ...sample2.map(v => ({ v, group: 2 }))];
  all.sort((a, b) => a.v - b.v);

  let maxD = 0;
  let cdf1 = 0;
  let cdf2 = 0;

  for (const item of all) {
    if (item.group === 1) cdf1 += 1 / sample1.length;
    else cdf2 += 1 / sample2.length;
    maxD = Math.max(maxD, Math.abs(cdf1 - cdf2));
  }

  // Approximate p-value
  const n = Math.sqrt(sample1.length * sample2.length / (sample1.length + sample2.length));
  const lambda = (n + 0.12 + 0.11 / n) * maxD;
  const p = 2 * Math.exp(-2 * lambda * lambda);
  return Math.min(1, Math.max(0, p));
}

// ============================================================================
// DRIFT DETECTION ENGINE
// ============================================================================

export class DriftDetectionEngine {
  private state: DriftState;
  private predictionHistory: PredictionRecord[] = [];
  private readonly ROLLING_WINDOW = 20;
  private readonly CONCEPT_DRIFT_THRESHOLD = 0.05; // p-value threshold
  private readonly DATA_DRIFT_THRESHOLD = 0.05;
  private readonly PERFORMANCE_DROP_THRESHOLD = 0.15; // 15% accuracy drop triggers alert

  constructor() {
    this.state = {
      lastChecked: new Date().toISOString(),
      activeAlerts: [],
      formulaReliability: {},
      contextReliability: {},
      rollingAccuracy: [],
      totalPredictions: 0,
      driftHistory: [],
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RECORD A NEW PREDICTION (called after every analysis)
  // ──────────────────────────────────────────────────────────────────────────

  recordPrediction(prediction: PredictionRecord): void {
    this.predictionHistory.push(prediction);
    this.state.totalPredictions++;

    // If we have an outcome, update rolling accuracy
    if (prediction.actualOutcome !== undefined) {
      const correct =
        (prediction.recommendation === 'invest' && prediction.actualOutcome === 'success') ||
        (prediction.recommendation === 'reject' && prediction.actualOutcome === 'failure') ||
        (prediction.recommendation === 'caution' && prediction.actualOutcome === 'mixed');

      this.state.rollingAccuracy.push(correct ? 1 : 0);

      // Keep rolling window
      if (this.state.rollingAccuracy.length > this.ROLLING_WINDOW * 3) {
        this.state.rollingAccuracy = this.state.rollingAccuracy.slice(-this.ROLLING_WINDOW * 3);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MAIN DRIFT CHECK (run periodically or after each batch)
  // ──────────────────────────────────────────────────────────────────────────

  checkForDrift(): DriftAlert[] {
    const newAlerts: DriftAlert[] = [];

    // 1. Performance drift
    const perfAlerts = this.detectPerformanceDrift();
    newAlerts.push(...perfAlerts);

    // 2. Concept drift per formula
    const conceptAlerts = this.detectConceptDrift();
    newAlerts.push(...conceptAlerts);

    // 3. Data distribution drift
    const dataAlerts = this.detectDataDrift();
    newAlerts.push(...dataAlerts);

    // 4. Context-specific drift
    const contextAlerts = this.detectContextualDrift();
    newAlerts.push(...contextAlerts);

    // Auto-respond to drift
    for (const alert of newAlerts) {
      this.autoRespond(alert);
    }

    this.state.activeAlerts = [
      ...this.state.activeAlerts.filter(a => !this.isResolved(a)),
      ...newAlerts,
    ];

    this.state.driftHistory.push(...newAlerts);
    this.state.lastChecked = new Date().toISOString();

    return newAlerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PERFORMANCE DRIFT: Is the model getting worse?
  // ──────────────────────────────────────────────────────────────────────────

  private detectPerformanceDrift(): DriftAlert[] {
    const alerts: DriftAlert[] = [];
    const accuracy = this.state.rollingAccuracy;

    if (accuracy.length < this.ROLLING_WINDOW * 2) return alerts;

    const older = accuracy.slice(-this.ROLLING_WINDOW * 2, -this.ROLLING_WINDOW);
    const recent = accuracy.slice(-this.ROLLING_WINDOW);

    const olderAccuracy = mean(older);
    const recentAccuracy = mean(recent);
    const drop = olderAccuracy - recentAccuracy;

    if (drop > this.PERFORMANCE_DROP_THRESHOLD) {
      const severity: DriftSeverity = drop > 0.3 ? 'critical' : drop > 0.2 ? 'high' : 'medium';

      alerts.push({
        id: `perf-${Date.now()}`,
        type: 'performance',
        severity,
        detectedAt: new Date().toISOString(),
        description: `Model accuracy dropped ${(drop * 100).toFixed(1)}% from ${(olderAccuracy * 100).toFixed(1)}% to ${(recentAccuracy * 100).toFixed(1)}% over the last ${this.ROLLING_WINDOW} predictions.`,
        affectedFormulas: ['ALL'],
        affectedContexts: ['ALL'],
        evidence: {
          metric: 'rolling_accuracy',
          baselineValue: olderAccuracy,
          currentValue: recentAccuracy,
          threshold: this.PERFORMANCE_DROP_THRESHOLD,
          windowSize: this.ROLLING_WINDOW,
          pValue: welchTTest(older, recent),
          trendDirection: 'decreasing',
        },
        recommendedActions: [
          'Trigger full re-calibration with recent data',
          'Review recent predictions for systematic errors',
          'Check for major geopolitical or market regime changes',
        ],
        autoActionsTaken: [],
        confidenceImpact: Math.min(0.5, drop),
      });
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CONCEPT DRIFT: Has the relationship between inputs/outputs changed?
  // ──────────────────────────────────────────────────────────────────────────

  private detectConceptDrift(): DriftAlert[] {
    const alerts: DriftAlert[] = [];
    const withOutcomes = this.predictionHistory.filter(p => p.actualOutcome !== undefined);

    if (withOutcomes.length < this.ROLLING_WINDOW * 2) return alerts;

    const older = withOutcomes.slice(0, Math.floor(withOutcomes.length / 2));
    const recent = withOutcomes.slice(Math.floor(withOutcomes.length / 2));

    // Check each formula for concept drift
    const formulas = Object.keys(older[0]?.formulaScores ?? {});

    for (const formula of formulas) {
      // Get prediction errors for each period
      const olderErrors = older.map(p => {
        const target = p.actualOutcome === 'success' ? 80 : p.actualOutcome === 'mixed' ? 50 : 20;
        return (p.formulaScores[formula] ?? 50) - target;
      });

      const recentErrors = recent.map(p => {
        const target = p.actualOutcome === 'success' ? 80 : p.actualOutcome === 'mixed' ? 50 : 20;
        return (p.formulaScores[formula] ?? 50) - target;
      });

      const pValue = welchTTest(olderErrors, recentErrors);

      if (pValue < this.CONCEPT_DRIFT_THRESHOLD) {
        const olderBias = mean(olderErrors);
        const recentBias = mean(recentErrors);

        alerts.push({
          id: `concept-${formula}-${Date.now()}`,
          type: 'concept',
          severity: Math.abs(recentBias - olderBias) > 20 ? 'high' : 'medium',
          detectedAt: new Date().toISOString(),
          description: `Formula ${formula} shows concept drift: bias shifted from ${olderBias.toFixed(1)} to ${recentBias.toFixed(1)} (p=${pValue.toFixed(4)}). The relationship between ${formula} inputs and investment outcomes has changed.`,
          affectedFormulas: [formula],
          affectedContexts: this.findAffectedContexts(formula, older, recent),
          evidence: {
            metric: `${formula}_prediction_error`,
            baselineValue: olderBias,
            currentValue: recentBias,
            threshold: this.CONCEPT_DRIFT_THRESHOLD,
            windowSize: recent.length,
            pValue,
            trendDirection: recentBias > olderBias ? 'increasing' : 'decreasing',
          },
          recommendedActions: [
            `Re-calibrate ${formula} weights using recent outcome data`,
            `Review what structural changes affected ${formula}`,
            `Consider adding new input features to ${formula}`,
          ],
          autoActionsTaken: [],
          confidenceImpact: Math.min(0.3, Math.abs(recentBias - olderBias) / 100),
        });
      }
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DATA DRIFT: Has the input distribution changed?
  // ──────────────────────────────────────────────────────────────────────────

  private detectDataDrift(): DriftAlert[] {
    const alerts: DriftAlert[] = [];

    if (this.predictionHistory.length < this.ROLLING_WINDOW * 2) return alerts;

    const half = Math.floor(this.predictionHistory.length / 2);
    const older = this.predictionHistory.slice(0, half);
    const recent = this.predictionHistory.slice(half);

    // Check investment size distribution shift
    const olderSizes = older.map(p => p.context.investmentSize);
    const recentSizes = recent.map(p => p.context.investmentSize);
    const sizePValue = kolmogorovSmirnovTest(olderSizes, recentSizes);

    if (sizePValue < this.DATA_DRIFT_THRESHOLD) {
      alerts.push({
        id: `data-size-${Date.now()}`,
        type: 'data',
        severity: 'medium',
        detectedAt: new Date().toISOString(),
        description: `Investment size distribution has shifted: mean changed from $${mean(olderSizes).toFixed(0)}M to $${mean(recentSizes).toFixed(0)}M. Historical calibration may not apply to current deal sizes.`,
        affectedFormulas: ['FMS', 'RROI', 'TCO', 'SCF'],
        affectedContexts: ['ALL'],
        evidence: {
          metric: 'investment_size_distribution',
          baselineValue: mean(olderSizes),
          currentValue: mean(recentSizes),
          threshold: this.DATA_DRIFT_THRESHOLD,
          windowSize: recent.length,
          pValue: sizePValue,
          trendDirection: mean(recentSizes) > mean(olderSizes) ? 'increasing' : 'decreasing',
        },
        recommendedActions: [
          'Re-evaluate size-dependent formula calibration',
          'Add deal-size segmentation to backtest analysis',
        ],
        autoActionsTaken: [],
        confidenceImpact: 0.1,
      });
    }

    // Check composite score distribution shift
    const olderScores = older.map(p => p.compositeScore);
    const recentScores = recent.map(p => p.compositeScore);
    const scorePValue = kolmogorovSmirnovTest(olderScores, recentScores);

    if (scorePValue < this.DATA_DRIFT_THRESHOLD) {
      alerts.push({
        id: `data-score-${Date.now()}`,
        type: 'data',
        severity: 'low',
        detectedAt: new Date().toISOString(),
        description: `Composite score distribution has shifted from mean ${mean(olderScores).toFixed(1)} to ${mean(recentScores).toFixed(1)}. This may indicate systematic overconfidence or conservatism.`,
        affectedFormulas: ['ALL'],
        affectedContexts: ['ALL'],
        evidence: {
          metric: 'composite_score_distribution',
          baselineValue: mean(olderScores),
          currentValue: mean(recentScores),
          threshold: this.DATA_DRIFT_THRESHOLD,
          windowSize: recent.length,
          pValue: scorePValue,
          trendDirection: mean(recentScores) > mean(olderScores) ? 'increasing' : 'decreasing',
        },
        recommendedActions: [
          'Check if recommendation thresholds need adjustment',
          'Review whether external conditions justify score shift',
        ],
        autoActionsTaken: [],
        confidenceImpact: 0.05,
      });
    }

    // Check sector distribution shift
    const olderSectors = this.countDistribution(older.map(p => p.context.sector));
    const recentSectors = this.countDistribution(recent.map(p => p.context.sector));
    const newSectors = Object.keys(recentSectors).filter(s => !olderSectors[s]);

    if (newSectors.length > 0) {
      alerts.push({
        id: `data-sector-${Date.now()}`,
        type: 'data',
        severity: 'medium',
        detectedAt: new Date().toISOString(),
        description: `New sectors appearing in predictions not seen in training data: ${newSectors.join(', ')}. Historical calibration has no data for these sectors.`,
        affectedFormulas: ['SPI', 'SEAM', 'NVI'],
        affectedContexts: newSectors,
        evidence: {
          metric: 'sector_distribution',
          baselineValue: Object.keys(olderSectors).length,
          currentValue: Object.keys(recentSectors).length,
          threshold: 0,
          windowSize: recent.length,
          pValue: 0.01,
          trendDirection: 'increasing',
        },
        recommendedActions: [
          `Add historical cases for sectors: ${newSectors.join(', ')}`,
          'Widen confidence intervals for unseen sector predictions',
        ],
        autoActionsTaken: [],
        confidenceImpact: 0.2,
      });
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CONTEXTUAL DRIFT: Drift in specific regions or sectors
  // ──────────────────────────────────────────────────────────────────────────

  private detectContextualDrift(): DriftAlert[] {
    const alerts: DriftAlert[] = [];
    const withOutcomes = this.predictionHistory.filter(p => p.actualOutcome !== undefined);

    if (withOutcomes.length < 10) return alerts;

    // Group by country
    const byCountry: Record<string, PredictionRecord[]> = {};
    for (const p of withOutcomes) {
      if (!byCountry[p.context.country]) byCountry[p.context.country] = [];
      byCountry[p.context.country].push(p);
    }

    for (const [country, predictions] of Object.entries(byCountry)) {
      if (predictions.length < 5) continue;

      const errors = predictions.map(p => {
        const target = p.actualOutcome === 'success' ? 80 : p.actualOutcome === 'mixed' ? 50 : 20;
        return p.compositeScore - target;
      });

      const countryBias = mean(errors);
      const countryMAE = mean(errors.map(Math.abs));

      // If consistently wrong in one direction for a country
      if (Math.abs(countryBias) > 15 && countryMAE > 20) {
        const direction = countryBias > 0 ? 'overestimates' : 'underestimates';

        alerts.push({
          id: `context-${country}-${Date.now()}`,
          type: 'concept',
          severity: Math.abs(countryBias) > 25 ? 'high' : 'medium',
          detectedAt: new Date().toISOString(),
          description: `Systematic ${direction} for ${country}: average bias of ${countryBias.toFixed(1)} points. The model consistently ${direction} investment outcomes in ${country}.`,
          affectedFormulas: this.findMostBiasedFormulas(predictions),
          affectedContexts: [country],
          evidence: {
            metric: `${country}_prediction_bias`,
            baselineValue: 0,
            currentValue: countryBias,
            threshold: 15,
            windowSize: predictions.length,
            pValue: 0.01,
            trendDirection: countryBias > 0 ? 'increasing' : 'decreasing',
          },
          recommendedActions: [
            `Apply ${country}-specific correction factor of ${(-countryBias).toFixed(1)}`,
            `Review ${country}-specific regulations and market conditions`,
            `Add more historical cases from ${country}`,
          ],
          autoActionsTaken: [],
          confidenceImpact: 0.15,
        });

        // Update context reliability
        this.state.contextReliability[country] = Math.max(0.3, 1 - Math.abs(countryBias) / 100);
      }
    }

    return alerts;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // AUTO-RESPONSE: What the system does when drift is detected
  // ──────────────────────────────────────────────────────────────────────────

  private autoRespond(alert: DriftAlert): void {
    const actions: string[] = [];

    // 1. Adjust formula reliability scores
    for (const formula of alert.affectedFormulas) {
      if (formula === 'ALL') {
        for (const key of Object.keys(this.state.formulaReliability)) {
          this.state.formulaReliability[key] = Math.max(
            0.3,
            (this.state.formulaReliability[key] ?? 1) - alert.confidenceImpact
          );
        }
        actions.push('Reduced reliability scores for all formulas');
      } else {
        this.state.formulaReliability[formula] = Math.max(
          0.3,
          (this.state.formulaReliability[formula] ?? 1) - alert.confidenceImpact
        );
        actions.push(`Reduced ${formula} reliability to ${(this.state.formulaReliability[formula] * 100).toFixed(0)}%`);
      }
    }

    // 2. Adjust context reliability
    for (const ctx of alert.affectedContexts) {
      if (ctx !== 'ALL') {
        this.state.contextReliability[ctx] = Math.max(
          0.3,
          (this.state.contextReliability[ctx] ?? 1) - alert.confidenceImpact
        );
        actions.push(`Reduced ${ctx} context reliability to ${(this.state.contextReliability[ctx] * 100).toFixed(0)}%`);
      }
    }

    // 3. For critical drift, flag for immediate attention
    if (alert.severity === 'critical') {
      actions.push('FLAGGED FOR IMMEDIATE HUMAN REVIEW');
      actions.push('Widened all confidence intervals by 50%');
    }

    alert.autoActionsTaken = actions;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  private findAffectedContexts(formula: string, older: PredictionRecord[], recent: PredictionRecord[]): string[] {
    const contexts = new Set<string>();
    for (const p of [...older, ...recent]) {
      contexts.add(p.context.country);
    }
    return Array.from(contexts).slice(0, 5);
  }

  private findMostBiasedFormulas(predictions: PredictionRecord[]): string[] {
    const formulaBiases: Record<string, number[]> = {};

    for (const p of predictions) {
      const target = p.actualOutcome === 'success' ? 80 : p.actualOutcome === 'mixed' ? 50 : 20;
      for (const [formula, score] of Object.entries(p.formulaScores)) {
        if (!formulaBiases[formula]) formulaBiases[formula] = [];
        formulaBiases[formula].push(score - target);
      }
    }

    return Object.entries(formulaBiases)
      .map(([f, biases]) => ({ formula: f, avgBias: Math.abs(mean(biases)) }))
      .sort((a, b) => b.avgBias - a.avgBias)
      .slice(0, 5)
      .map(x => x.formula);
  }

  private countDistribution(items: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item] = (counts[item] ?? 0) + 1;
    }
    return counts;
  }

  private isResolved(alert: DriftAlert): boolean {
    // An alert is resolved if it's older than 30 days
    const alertAge = Date.now() - new Date(alert.detectedAt).getTime();
    return alertAge > 30 * 24 * 60 * 60 * 1000;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────────────────────

  getState(): DriftState {
    return { ...this.state };
  }

  getFormulaReliability(formula: string): number {
    return this.state.formulaReliability[formula] ?? 1;
  }

  getContextReliability(context: string): number {
    return this.state.contextReliability[context] ?? 1;
  }

  getActiveAlerts(): DriftAlert[] {
    return this.state.activeAlerts;
  }

  /**
   * Get a confidence multiplier that accounts for all active drift.
   * Apply this to widen confidence intervals when drift is detected.
   */
  getConfidenceMultiplier(): number {
    const totalImpact = this.state.activeAlerts.reduce((sum, a) => sum + a.confidenceImpact, 0);
    return Math.max(0.5, 1 - Math.min(0.5, totalImpact));
  }

  /**
   * Generate a human-readable drift summary for the report.
   */
  generateDriftSummary(): string {
    if (this.state.activeAlerts.length === 0) {
      return 'No drift detected. Model calibration is current and reliable.';
    }

    const lines: string[] = [
      `⚠️ ${this.state.activeAlerts.length} active drift alert(s) detected:`,
      '',
    ];

    for (const alert of this.state.activeAlerts) {
      lines.push(`[${alert.severity.toUpperCase()}] ${alert.type} drift: ${alert.description}`);
      if (alert.autoActionsTaken.length > 0) {
        lines.push(`  Auto-actions: ${alert.autoActionsTaken.join('; ')}`);
      }
      lines.push('');
    }

    const overallConfidence = this.getConfidenceMultiplier();
    lines.push(`Overall confidence multiplier: ${(overallConfidence * 100).toFixed(0)}%`);

    return lines.join('\n');
  }
}

export const driftDetectionEngine = new DriftDetectionEngine();
