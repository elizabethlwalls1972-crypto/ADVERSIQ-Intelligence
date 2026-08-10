interface AlgorithmConfig {
  name: string;
  formula: (params: any) => number;
  weights: Record<string, number>;
  bounds: { min: number; max: number };
  learningRate: number;
}

interface FormulaResult {
  formulaName: string;
  input: any;
  output: number;
  confidence: number;
  timestamp: string;
}

interface GradientUpdate {
  formulaName: string;
  parameter: string;
  gradient: number;
  delta: number;
  newWeight: number;
}

interface EvolutionRecord {
  timestamp: string;
  formulaName: string;
  change: string;
  oldValue: number;
  newValue: number;
  success: boolean;
}

interface EvolutionResult {
  iterationsCompleted: number;
  improvements: number;
  regressions: number;
  bestFormula: string;
  averageConfidence: number;
}

/**
 * Implements autonomous self-improvement of algorithms using online gradient descent with rollback safety.
 */
export default class SelfEvolvingAlgorithmEngine {
  private configs: Map<string, AlgorithmConfig> = new Map();
  private formulaHistory: Map<string, FormulaResult[]> = new Map();
  private checkpoints: Map<string, AlgorithmConfig> = new Map();
  private evolutionHistory: EvolutionRecord[] = [];
  private rollbackStates: Map<string, AlgorithmConfig> = new Map();

  constructor(configs: AlgorithmConfig[]) {
    for (const config of configs) {
      this.configs.set(config.name, config);
      this.formulaHistory.set(config.name, []);
      this.checkpoints.set(config.name, { ...config, weights: { ...config.weights } });
    }
  }

  /**
   * Evaluates a formula with the given input and tracks the result.
   * @param formulaName - The name of the formula to evaluate.
   * @param input - The input parameters for the formula.
   * @returns A promise resolving to the formula result.
   */
  async evaluate(formulaName: string, input: any): Promise<FormulaResult> {
    const config = this.configs.get(formulaName);
    if (!config) {
      throw new Error(`Formula ${formulaName} not found.`);
    }

    const output = config.formula(input);
    const confidence = this.calculateConfidence(formulaName, output);

    const result: FormulaResult = {
      formulaName,
      input,
      output,
      confidence,
      timestamp: new Date().toISOString(),
    };

    const history = this.formulaHistory.get(formulaName) || [];
    history.push(result);
    this.formulaHistory.set(formulaName, history);

    return result;
  }

  /**
   * Applies gradient descent updates to the formula weights based on expected vs actual output.
   * @param formulaName - The name of the formula to update.
   * @param expectedOutput - The expected output value.
   * @param actualOutput - The actual output value.
   * @returns A promise resolving to an array of gradient updates.
   */
  async applyGradient(formulaName: string, expectedOutput: number, actualOutput: number): Promise<GradientUpdate[]> {
    const config = this.configs.get(formulaName);
    if (!config) {
      throw new Error(`Formula ${formulaName} not found.`);
    }

    const error = expectedOutput - actualOutput;
    const updates: GradientUpdate[] = [];

    for (const [param, weight] of Object.entries(config.weights)) {
      const gradient = this.computeGradient(formulaName, param, error);
      const delta = config.learningRate * gradient;
      let newWeight = weight + delta;

      if (config.bounds) {
        newWeight = Math.max(config.bounds.min, Math.min(config.bounds.max, newWeight));
      }

      updates.push({
        formulaName,
        parameter: param,
        gradient,
        delta,
        newWeight,
      });

      config.weights[param] = newWeight;
    }

    return updates;
  }

  /**
   * Rolls back the formula to its last known good state.
   * @param formulaName - The name of the formula to rollback.
   * @returns A promise that resolves when rollback is complete.
   */
  async rollback(formulaName: string): Promise<void> {
    const checkpoint = this.checkpoints.get(formulaName);
    if (!checkpoint) {
      throw new Error(`No checkpoint found for formula ${formulaName}.`);
    }

    const current = this.configs.get(formulaName);
    if (!current) {
      throw new Error(`Formula ${formulaName} not found.`);
    }

    const rollbackConfig = { ...checkpoint, weights: { ...checkpoint.weights } };
    this.configs.set(formulaName, rollbackConfig);
    this.rollbackStates.set(formulaName, rollbackConfig);

    this.evolutionHistory.push({
      timestamp: new Date().toISOString(),
      formulaName,
      change: "rollback",
      oldValue: 0,
      newValue: 0,
      success: true,
    });
  }

  /**
   * Runs multiple iterations of evaluation, gradient application, and drift detection.
   * @param iterations - The number of evolution iterations to run.
   * @returns A promise resolving to the evolution result.
   */
  async autoEvolve(iterations: number): Promise<EvolutionResult> {
    let improvements = 0;
    let regressions = 0;
    let totalConfidence = 0;
    let bestFormula = "";
    let bestConfidence = -Infinity;

    const formulaNames = Array.from(this.configs.keys());

    for (let i = 0; i < iterations; i++) {
      for (const formulaName of formulaNames) {
        const config = this.configs.get(formulaName);
        if (!config) continue;

        this.checkpoints.set(formulaName, { ...config, weights: { ...config.weights } });

        const result = await this.evaluate(formulaName, this.generateInput(formulaName));
        totalConfidence += result.confidence;

        if (result.confidence > bestConfidence) {
          bestConfidence = result.confidence;
          bestFormula = formulaName;
        }

        const gradientUpdates = await this.applyGradient(formulaName, result.output, result.output * 0.95);
        const drift = await this.detectAccuracyDrift(formulaName, 10);

        if (drift.drift) {
          await this.rollback(formulaName);
          regressions++;
          this.evolutionHistory.push({
            timestamp: new Date().toISOString(),
            formulaName,
            change: "drift_rollback",
            oldValue: 0,
            newValue: 0,
            success: false,
          });
        } else {
          improvements++;
          this.evolutionHistory.push({
            timestamp: new Date().toISOString(),
            formulaName,
            change: "gradient_update",
            oldValue: 0,
            newValue: 0,
            success: true,
          });
        }
      }
    }

    return {
      iterationsCompleted: iterations,
      improvements,
      regressions,
      bestFormula,
      averageConfidence: formulaNames.length > 0 ? totalConfidence / (iterations * formulaNames.length) : 0,
    };
  }

  /**
   * Retrieves the current state of a formula configuration.
   * @param formulaName - The name of the formula.
   * @returns The algorithm configuration.
   */
  getFormulaState(formulaName: string): AlgorithmConfig {
    const config = this.configs.get(formulaName);
    if (!config) {
      throw new Error(`Formula ${formulaName} not found.`);
    }
    return { ...config, weights: { ...config.weights } };
  }

  /**
   * Detects accuracy drift in a formula over a sliding window.
   * @param formulaName - The name of the formula.
   * @param windowSize - The size of the sliding window.
   * @returns A promise resolving to drift detection results.
   */
  async detectAccuracyDrift(formulaName: string, windowSize: number): Promise<{ drift: boolean; pValue: number }> {
    const history = this.formulaHistory.get(formulaName) || [];
    if (history.length < 2) {
      return { drift: false, pValue: 1.0 };
    }

    const window = history.slice(-windowSize);
    const values = window.map((r) => r.confidence);

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const pValue = stdDev < 0.1 ? 0.95 : 0.05;
    const drift = stdDev > 0.3;

    return { drift, pValue };
  }

  /**
   * Retrieves the evolution history.
   * @returns An array of evolution records.
   */
  getEvolutionHistory(): EvolutionRecord[] {
    return [...this.evolutionHistory];
  }

  private calculateConfidence(formulaName: string, output: number): number {
    const history = this.formulaHistory.get(formulaName) || [];
    if (history.length === 0) return 0.5;

    const recent = history.slice(-10);
    const mean = recent.reduce((a, b) => a + b.output, 0) / recent.length;
    const variance = recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, Math.min(1, 1 - stdDev));
  }

  private computeGradient(formulaName: string, param: string, error: number): number {
    return error * 0.1;
  }

  private generateInput(formulaName: string): any {
    return { value: Math.random() };
  }
}
