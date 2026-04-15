/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE 4: CODE EXECUTION SANDBOX
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sandboxed JavaScript/TypeScript execution environment for financial
 * calculations, data transformations, and formula evaluation.
 * Uses Node.js vm module with strict resource limits.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SandboxResult {
  success: boolean;
  output: unknown;
  logs: string[];
  error?: string;
  executionTimeMs: number;
}

export interface SandboxConfig {
  timeoutMs?: number;
  maxMemoryMB?: number;
  allowedModules?: string[];
}

// ─── Financial Built-ins ────────────────────────────────────────────────────

const FINANCIAL_FUNCTIONS = `
  function NPV(rate, cashflows) {
    return cashflows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, i + 1), 0);
  }

  function IRR(cashflows, guess) {
    guess = guess || 0.1;
    for (let iter = 0; iter < 1000; iter++) {
      let npv = 0, dnpv = 0;
      for (let i = 0; i < cashflows.length; i++) {
        npv += cashflows[i] / Math.pow(1 + guess, i);
        dnpv -= i * cashflows[i] / Math.pow(1 + guess, i + 1);
      }
      if (Math.abs(dnpv) < 1e-12) break;
      var next = guess - npv / dnpv;
      if (Math.abs(next - guess) < 1e-10) return next;
      guess = next;
    }
    return guess;
  }

  function PMT(rate, nper, pv, fv, type) {
    fv = fv || 0; type = type || 0;
    if (rate === 0) return -(pv + fv) / nper;
    var pvif = Math.pow(1 + rate, nper);
    var pmt = rate * (pv * pvif + fv) / ((1 + rate * type) * (pvif - 1));
    return -pmt;
  }

  function FV(rate, nper, pmt, pv, type) {
    pv = pv || 0; type = type || 0;
    if (rate === 0) return -(pv + pmt * nper);
    var pvif = Math.pow(1 + rate, nper);
    return -(pv * pvif + pmt * (1 + rate * type) * (pvif - 1) / rate);
  }

  function CAGR(beginValue, endValue, years) {
    return Math.pow(endValue / beginValue, 1 / years) - 1;
  }

  function monteCarlo(fn, iterations) {
    iterations = iterations || 10000;
    var results = [];
    for (var i = 0; i < iterations; i++) results.push(fn());
    results.sort(function(a,b){ return a-b; });
    return {
      mean: results.reduce(function(a,b){ return a+b; }, 0) / results.length,
      median: results[Math.floor(results.length / 2)],
      p5: results[Math.floor(results.length * 0.05)],
      p25: results[Math.floor(results.length * 0.25)],
      p75: results[Math.floor(results.length * 0.75)],
      p95: results[Math.floor(results.length * 0.95)],
      min: results[0],
      max: results[results.length - 1],
      stdDev: Math.sqrt(results.reduce(function(sum, x) {
        var m = results.reduce(function(a,b){return a+b;},0)/results.length;
        return sum + (x - m) * (x - m);
      }, 0) / results.length)
    };
  }

  function percentile(arr, p) {
    var sorted = arr.slice().sort(function(a,b){return a-b;});
    var idx = (p / 100) * (sorted.length - 1);
    var low = Math.floor(idx), high = Math.ceil(idx);
    return sorted[low] + (sorted[high] - sorted[low]) * (idx - low);
  }
`;

// ─── Sandbox Execution (runs only on server via vm module) ──────────────────

export async function executeSandbox(
  code: string,
  config: SandboxConfig = {}
): Promise<SandboxResult> {
  const start = Date.now();
  const timeoutMs = config.timeoutMs ?? 5000;
  const logs: string[] = [];

  // Security: Block dangerous patterns
  const blocked = [
    /require\s*\(/,
    /import\s+/,
    /process\./,
    /global\./,
    /globalThis/,
    /eval\s*\(/,
    /Function\s*\(/,
    /child_process/,
    /fs\./,
    /\.constructor/,
    /__proto__/,
    /prototype\[/,
  ];

  for (const pattern of blocked) {
    if (pattern.test(code)) {
      return {
        success: false,
        output: null,
        logs,
        error: `Blocked: code contains restricted pattern "${pattern.source}"`,
        executionTimeMs: Date.now() - start,
      };
    }
  }

  try {
    // Dynamic import — vm only available on server (Node.js)
    const vm = await import('vm');

    const consoleMock = {
      log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
      warn: (...args: unknown[]) => logs.push('[WARN] ' + args.map(String).join(' ')),
      error: (...args: unknown[]) => logs.push('[ERROR] ' + args.map(String).join(' ')),
    };

    const sandbox = {
      console: consoleMock,
      Math,
      Date,
      JSON,
      parseFloat,
      parseInt,
      isNaN,
      isFinite,
      Number,
      String,
      Array,
      Object,
      Map,
      Set,
      Promise: undefined, // no async to prevent escape
      result: undefined as unknown,
    };

    const wrappedCode = `
      ${FINANCIAL_FUNCTIONS}
      try {
        result = (function() {
          ${code}
        })();
      } catch(e) {
        result = { error: e.message };
      }
    `;

    const context = vm.createContext(sandbox);
    const script = new vm.Script(wrappedCode);
    script.runInContext(context, { timeout: timeoutMs });

    return {
      success: true,
      output: sandbox.result,
      logs,
      executionTimeMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      output: null,
      logs,
      error: message.includes('timed out')
        ? `Execution timed out after ${timeoutMs}ms`
        : message,
      executionTimeMs: Date.now() - start,
    };
  }
}

// ─── Helper: Extract and run code from LLM output ──────────────────────────

export async function extractAndExecute(llmOutput: string): Promise<SandboxResult | null> {
  // Find code blocks tagged as javascript, js, or typescript
  const codeBlockRegex = /```(?:javascript|js|typescript|ts)?\s*\n([\s\S]*?)```/g;
  const matches: string[] = [];
  let match;
  while ((match = codeBlockRegex.exec(llmOutput)) !== null) {
    matches.push(match[1].trim());
  }

  if (matches.length === 0) return null;

  // Execute the last code block (usually the complete one)
  const code = matches[matches.length - 1];
  return executeSandbox(code);
}
