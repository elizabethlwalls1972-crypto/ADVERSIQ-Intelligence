/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ INTELLIGENCE — JUDGE SAFETY & MATH CHECKS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Lightweight judge interfaces for the Omni-Node architecture.
 * Judge1SafetyCheck: validates autonomous branch operations for safety.
 * Judge2MathCheck: audits formula variance for the AlgorithmicMutator.
 *
 * These wrap the existing JudgeOrchestrator's safety patterns but are
 * purpose-built for autonomous operation (no human-in-the-loop required).
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Judge 1: Safety Check for Autonomous Branch Operations ─────────────────

export class Judge1SafetyCheck {
  private static readonly BLOCKED_PATTERNS = [
    /password/i, /secret/i, /private.?key/i, /credit.?card/i,
    /social.?security/i, /\.exe$/i, /eval\s*\(/i, /child/i,
    /weapon/i, /explosive/i, /hack/i,
  ];

  private static readonly MAX_BRANCH_DEPTH = 3;

  /**
   * Validate whether an autonomous branch operation is safe to proceed.
   * Returns true if the branch is approved, false if it should be terminated.
   */
  static async validateBranch(persona: string, missingFact: string): Promise<boolean> {
    // Check for dangerous content patterns
    for (const pattern of this.BLOCKED_PATTERNS) {
      if (pattern.test(missingFact)) {
        console.warn(`[JUDGE 1] BLOCKED: "${persona}" attempted to research blocked topic: "${missingFact}"`);
        return false;
      }
    }

    // Validate the query isn't excessively long (potential prompt injection)
    if (missingFact.length > 2000) {
      console.warn(`[JUDGE 1] BLOCKED: Query too long (${missingFact.length} chars) — possible injection`);
      return false;
    }

    // Validate persona is a known safe string
    if (!persona || persona.length > 200) {
      console.warn(`[JUDGE 1] BLOCKED: Invalid persona identifier`);
      return false;
    }

    console.log(`[JUDGE 1] APPROVED: "${persona}" branch for "${missingFact.slice(0, 80)}..."`);
    return true;
  }
}

// ─── Judge 2: Mathematical Formula Variance Audit ───────────────────────────

export interface FormulaAuditReport {
  hasCriticalVariance: boolean;
  targetFormula: string | null;
  varianceContext: string;
  varianceScore: number;
  auditTimestamp: string;
}

export class Judge2MathCheck {
  /**
   * Audit all formulas for statistical variance against expected outcomes.
   * In production, this would compare formula outputs against real-world data.
   * Currently returns a baseline audit (no critical variance) since the system
   * needs historical outcome data to detect actual drift.
   */
  static async auditFormulaVariance(): Promise<FormulaAuditReport> {
    const timestamp = new Date().toISOString();

    // In production: load historical outcome data from the persistence layer,
    // run each formula against known inputs, compare outputs to actual results,
    // flag any formula whose error exceeds 2 standard deviations.

    // For now: return baseline audit indicating no critical variance detected
    // until real-world outcome data is available for backtesting.
    return {
      hasCriticalVariance: false,
      targetFormula: null,
      varianceContext: 'Baseline audit — no historical outcome data available for backtesting.',
      varianceScore: 0,
      auditTimestamp: timestamp,
    };
  }
}

export default { Judge1SafetyCheck, Judge2MathCheck };
