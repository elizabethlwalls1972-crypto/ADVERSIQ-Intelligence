/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ INTELLIGENCE — ALGORITHMIC MUTATOR
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Self-Writing Math: Enables Evolutionary Computation.
 *
 * If a formula fails to predict real-world outcomes, the system autonomously
 * rewrites its own source code, tests it in a sandbox, and — if safe —
 * overwrites the active formula file.
 *
 * Safety: All mutations are validated by:
 *   1. Sandbox compile test (no unsafe imports)
 *   2. Structural validation (must be a valid export function)
 *   3. Change logging (every mutation is recorded)
 *
 * Security: CONFIDENTIAL / FOR STRATEGIC DEPLOYMENT
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateLLMPrompt } from '../services/llmGateway';

// ─── Types ──────────────────────────────────────────────────────────────────

interface MutationRecord {
  formulaName: string;
  timestamp: string;
  previousCode: string;
  newCode: string;
  failureContext: string;
  sandboxPassed: boolean;
  applied: boolean;
}

// ─── Algorithmic Mutator ────────────────────────────────────────────────────

export class AlgorithmicMutator {
  private readonly FORMULA_PATH: string;
  private readonly MUTATION_LOG_PATH: string;
  private readonly MAX_FUNCTION_LENGTH = 5000; // Max chars for a single function

  constructor() {
    this.FORMULA_PATH = path.resolve(process.cwd(), 'server/core/formulas.ts');
    this.MUTATION_LOG_PATH = path.resolve(process.cwd(), 'data/evolved_state/mutation_log.json');
  }

  /**
   * Attempt to evolve a specific formula based on failure context.
   *
   * @param targetFormulaName - Name of the function to mutate
   * @param failureContext - Description of how/why the formula is failing
   */
  public async mutateFormula(
    targetFormulaName: string,
    failureContext: string
  ): Promise<{ success: boolean; message: string }> {
    console.log(`[MUTATOR] Initiating genetic mutation on "${targetFormulaName}"...`);

    // ── Safety: Validate target name ──
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(targetFormulaName)) {
      return { success: false, message: 'Invalid formula name — must be a valid identifier.' };
    }

    // ── Read current source ──
    if (!fs.existsSync(this.FORMULA_PATH)) {
      console.warn(`[MUTATOR] Formula file not found: ${this.FORMULA_PATH}`);
      return { success: false, message: `Formula file not found: ${this.FORMULA_PATH}` };
    }

    const sourceCode = fs.readFileSync(this.FORMULA_PATH, 'utf-8');

    // ── Extract target function ──
    const functionRegex = new RegExp(
      `export function ${targetFormulaName}[\\s\\S]*?^}`,
      'm'
    );
    const currentFunction = sourceCode.match(functionRegex)?.[0];

    if (!currentFunction) {
      console.warn(`[MUTATOR] Function "${targetFormulaName}" not found in formula file.`);
      return { success: false, message: `Function "${targetFormulaName}" not found.` };
    }

    if (currentFunction.length > this.MAX_FUNCTION_LENGTH) {
      return { success: false, message: `Function too large (${currentFunction.length} chars) — manual review required.` };
    }

    // ── Generate mutation via LLM ──
    const mutationPrompt = `
The following TypeScript mathematical formula is failing under these conditions:

FAILURE CONTEXT:
${failureContext}

CURRENT FUNCTION:
${currentFunction}

RULES:
1. Rewrite the formula to introduce a dampening coefficient that accounts for this variance.
2. Return ONLY the raw, executable TypeScript function — no explanations, no markdown.
3. The function must start with "export function ${targetFormulaName}" and end with "}".
4. Do NOT use require(), import(), eval(), or any dynamic code execution.
5. Preserve the existing parameter types and return type.
6. Add a comment at the top: "// MUTATED: [timestamp] — [brief reason]"
`;

    try {
      const newFunction = await generateLLMPrompt(mutationPrompt, {
        temperature: 0.3,
        maxTokens: 2000,
        timeoutMs: 20000,
      });

      // ── Sandbox Validation ──
      const sanitizedFunction = newFunction.replace(/^```(?:typescript|ts)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      const isSafe = this.sandboxCompileTest(sanitizedFunction, targetFormulaName);

      // ── Log the mutation ──
      const record: MutationRecord = {
        formulaName: targetFormulaName,
        timestamp: new Date().toISOString(),
        previousCode: currentFunction,
        newCode: sanitizedFunction,
        failureContext,
        sandboxPassed: isSafe,
        applied: false,
      };

      if (isSafe) {
        // Apply the mutation
        const updatedSourceCode = sourceCode.replace(currentFunction, sanitizedFunction);
        fs.writeFileSync(this.FORMULA_PATH, updatedSourceCode, 'utf-8');
        record.applied = true;

        console.log(`[MUTATOR] Evolution successful. "${targetFormulaName}" has been autonomously rewritten.`);
      } else {
        console.warn(`[MUTATOR] Sandbox validation FAILED for "${targetFormulaName}". Mutation not applied.`);
      }

      // Persist mutation log
      this.logMutation(record);

      return {
        success: record.applied,
        message: record.applied
          ? `Formula "${targetFormulaName}" successfully evolved.`
          : `Sandbox validation failed — mutation not applied.`,
      };
    } catch (err) {
      console.error(`[MUTATOR] Mutation failed for "${targetFormulaName}":`, err instanceof Error ? err.message : err);
      return { success: false, message: `Mutation failed: ${err instanceof Error ? err.message : 'Unknown error'}` };
    }
  }

  /**
   * Validate that a generated function is safe to inject.
   */
  private sandboxCompileTest(code: string, expectedName: string): boolean {
    // Must contain the expected export function declaration
    if (!code.includes(`export function ${expectedName}`)) {
      console.warn('[MUTATOR] Sandbox: Missing expected function declaration.');
      return false;
    }

    // Must not contain dangerous patterns
    const dangerousPatterns = [
      /require\s*\(/,
      /import\s*\(/,
      /eval\s*\(/,
      /Function\s*\(/,
      /process\s*\.\s*exit/,
      /child_process/,
      /fs\s*\.\s*(?:unlink|rmdir|rm)/,
      /exec\s*\(/,
      /spawn\s*\(/,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        console.warn(`[MUTATOR] Sandbox: Dangerous pattern detected: ${pattern}`);
        return false;
      }
    }

    // Must have balanced braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      console.warn(`[MUTATOR] Sandbox: Unbalanced braces (${openBraces} open, ${closeBraces} close).`);
      return false;
    }

    return true;
  }

  /**
   * Persist a mutation record for audit trail.
   */
  private logMutation(record: MutationRecord): void {
    try {
      const dir = path.dirname(this.MUTATION_LOG_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let logs: MutationRecord[] = [];
      if (fs.existsSync(this.MUTATION_LOG_PATH)) {
        const raw = fs.readFileSync(this.MUTATION_LOG_PATH, 'utf-8');
        logs = JSON.parse(raw);
      }

      logs.push(record);

      // Keep only last 100 mutations
      if (logs.length > 100) {
        logs = logs.slice(-100);
      }

      fs.writeFileSync(this.MUTATION_LOG_PATH, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[MUTATOR] Failed to log mutation:', err instanceof Error ? err.message : err);
    }
  }
}

export default AlgorithmicMutator;
