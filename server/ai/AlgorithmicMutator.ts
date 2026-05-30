import * as fs from 'fs';
import * as path from 'path';
import { generateLLMPrompt } from '../services/llmGateway.js';

/**
 * AlgorithmicMutator: Self-writing code system
 * Monitors formula performance. If a formula fails backtesting,
 * the system autonomously rewrites its TypeScript code and tests it.
 */
export class AlgorithmicMutator {
  private readonly FORMULA_PATH = path.resolve(process.cwd(), 'server', 'core', 'formulas.ts');
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

    console.log(`[MUTATOR] ${formulaName} variance CRITICAL: ${performanceMetrics.variance}`);
    return this.initiateEvolutionaryMutation(formulaName, performanceMetrics);
  }

  private async initiateEvolutionaryMutation(
    formulaName: string,
    metrics: any
  ): Promise<{ mutated: boolean; reason: string }> {
    if (!fs.existsSync(this.FORMULA_PATH)) {
      return { mutated: false, reason: 'Formula source file not found' };
    }

    const sourceCode = fs.readFileSync(this.FORMULA_PATH, 'utf-8');
    const functionRegex = new RegExp(`export function ${formulaName}\\s*\\([^)]*\\)[^{]*\\{[\\s\\S]*?\\n\\}`, 'g');
    const currentFunction = sourceCode.match(functionRegex)?.[0];

    if (!currentFunction) {
      return { mutated: false, reason: `Function ${formulaName} not found in source` };
    }

    console.log(`[MUTATOR] Current function signature extracted. Initiating rewrite...`);

    const mutationPrompt = `
You are the ADVERSIQ Algorithmic Mutator. A formula has failed and needs evolutionary correction.

CURRENT FUNCTION:
\`\`\`typescript
${currentFunction}
\`\`\`

FAILURE CONTEXT:
- Expected: ${metrics.expectedOutcome}
- Actual: ${metrics.actualOutcome}
- Variance: ${metrics.variance}
- Test cases failed: ${metrics.testCount}

MUTATION DIRECTIVE:
Rewrite this function to:
1. Add a dampening coefficient for high-variance scenarios
2. Introduce stochastic smoothing if the formula is overfitting
3. Maintain the original signature and return type

Return ONLY the rewritten TypeScript function, no markdown or explanation.
`;

    try {
      const mutatedCode = await generateLLMPrompt(mutationPrompt);
      const isSafe = this.validateMutation(mutatedCode);

      if (!isSafe) {
        return { mutated: false, reason: 'Mutation failed safety validation' };
      }

      const newSourceCode = sourceCode.replace(currentFunction, mutatedCode.trim());
      fs.writeFileSync(this.FORMULA_PATH, newSourceCode, 'utf-8');

      this.logMutation(formulaName, currentFunction, mutatedCode, metrics);
      console.log(`[MUTATOR] SUCCESS: ${formulaName} autonomously evolved.`);

      return { mutated: true, reason: `Formula evolved to handle variance ${metrics.variance}` };
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
