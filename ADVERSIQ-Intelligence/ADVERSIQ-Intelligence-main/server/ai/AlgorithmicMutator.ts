import * as fs from 'fs';
import * as path from 'path';
import { generateLLMPrompt } from '../services/llmGateway.js';
import { CYBER_VALIDATOR_REGISTRY, getCyberValidator } from '../core/formulas.js';

/**
 * AlgorithmicMutator: Self-writing code system
 * Monitors cyber validator performance. If a validator fails backtesting,
 * the system autonomously rewrites its TypeScript code and tests it.
 */
export class AlgorithmicMutator {
  private readonly VALIDATOR_PATH = path.resolve(process.cwd(), 'server', 'core', 'formulas.ts');
  private readonly MUTATION_LOG = path.resolve(process.cwd(), 'data', 'mutations.jsonl');
  private mutationCount: number = 0;

  public async monitorAndMutate(formulaName: string, performanceMetrics: {
    expectedOutcome: number;
    actualOutcome: number;
    variance: number;
    testCount: number;
  }): Promise<{ mutated: boolean; reason: string }> {
    const VARIANCE_THRESHOLD = 0.15; // 15% variance triggers mutation

    if (performanceMetrics.variance < VARIANCE_THRESHOLD) {
      return { mutated: false, reason: `Variance within acceptable threshold (${performanceMetrics.variance})` };
    }

    console.log(`[MUTATOR] Cyber validator ${formulaName} variance CRITICAL: ${performanceMetrics.variance}`);
    return this.initiateEvolutionaryMutation(formulaName, performanceMetrics);
  }

  private async initiateEvolutionaryMutation(
    formulaName: string,
    metrics: any
  ): Promise<{ mutated: boolean; reason: string }> {
    if (!fs.existsSync(this.VALIDATOR_PATH)) {
      return { mutated: false, reason: 'Cyber validator source file not found' };
    }

    if (!getCyberValidator(formulaName)) {
      return { mutated: false, reason: `Cyber validator ${formulaName} not found in registry` };
    }

    const sourceCode = fs.readFileSync(this.VALIDATOR_PATH, 'utf-8');
    const functionRegex = new RegExp(`export function ${formulaName}\\s*\\([^)]*\\)[^{]*\\{[\\s\\S]*?\\n\\}`, 'g');
    const currentFunction = sourceCode.match(functionRegex)?.[0];

    if (!currentFunction) {
      return { mutated: false, reason: `Cyber validator ${formulaName} not found in source` };
    }

    console.log(`[MUTATOR] Current function signature extracted. Initiating rewrite...`);

    const mutationPrompt = `
You are the ADVERSIQ Algorithmic Mutator. A cyber validator has failed backtesting and needs evolutionary correction.

CURRENT VALIDATOR:
\`\`\`typescript
${currentFunction}
\`\`\`

FAILURE CONTEXT:
- Expected security outcome: ${metrics.expectedOutcome}
- Actual security outcome: ${metrics.actualOutcome}
- Variance: ${metrics.variance}
- Test cases failed: ${metrics.testCount}

MUTATION DIRECTIVE:
Rewrite this validator to:
1. Add a dampening coefficient for high-variance security telemetry
2. Introduce stochastic smoothing if the validator is overfitting to a narrow attack pattern
3. Maintain the original signature and return type
4. Keep the validator deterministic enough for CI/CD gating

Return ONLY the rewritten TypeScript function, no markdown or explanation.
`;

    try {
      const mutatedCode = await generateLLMPrompt(mutationPrompt);
      const isSafe = this.validateMutation(mutatedCode);

      if (!isSafe) {
        return { mutated: false, reason: 'Mutation failed safety validation' };
      }

      const newSourceCode = sourceCode.replace(currentFunction, mutatedCode.trim());
      fs.writeFileSync(this.VALIDATOR_PATH, newSourceCode, 'utf-8');

      this.logMutation(formulaName, currentFunction, mutatedCode, metrics);
      console.log(`[MUTATOR] SUCCESS: Cyber validator ${formulaName} autonomously evolved.`);

      return { mutated: true, reason: `Cyber validator evolved to handle variance ${metrics.variance}` };
    } catch (err) {
      console.error(`[MUTATOR ERROR]`, err);
      return { mutated: false, reason: `Mutation failed: ${String(err)}` };
    }
  }

  private validateMutation(code: string): boolean {
    // Safety checks
    if (!code.includes('export function')) return false;
    if (code.includes('require(')) return false;
    if (code.includes('import ') && !code.includes('from')) return false;
    if (code.split('function').length > 2) return false; // Only one function
    
    return true;
  }

  private logMutation(
    formulaName: string,
    before: string,
    after: string,
    metrics: any
  ): void {
    this.mutationCount++;

    const logEntry = {
      timestamp: new Date().toISOString(),
      mutationId: this.mutationCount,
      formula: formulaName,
      validator: formulaName,
      metrics,
      diff: {
        before: before.substring(0, 100),
        after: after.substring(0, 100)
      }
    };

    const logDir = path.dirname(this.MUTATION_LOG);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(this.MUTATION_LOG, JSON.stringify(logEntry) + '\n', 'utf-8');
    console.log(`[MUTATOR LOG] Mutation #${this.mutationCount} logged`);
  }

  public getMutationHistory(): any[] {
    if (!fs.existsSync(this.MUTATION_LOG)) return [];

    return fs.readFileSync(this.MUTATION_LOG, 'utf-8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  }
}
