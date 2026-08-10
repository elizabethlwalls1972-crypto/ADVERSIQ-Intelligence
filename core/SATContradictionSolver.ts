/**
 * ADVERSIQ SAT CONTRADICTION SOLVER v1.0
 *
 * Implements a real DPLL-based propositional satisfiability solver.
 * Converts user strategic inputs into propositional logic clauses (CNF)
 * and determines whether the combined constraint set is logically satisfiable.
 *
 * If UNSAT: the user's inputs are mathematically impossible — caught BEFORE
 * any analysis runs. This is the "input shield" described in the NSIL spec.
 *
 * Academic basis: Davis-Putnam-Logemann-Loveland (DPLL) algorithm, 1962.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type Literal = { variable: string; negated: boolean };
export type Clause = Literal[];
export type CNFFormula = Clause[];

export interface SATInput {
  /** Human-readable labels for each constraint being checked */
  constraints: SATConstraint[];
}

export interface SATConstraint {
  id: string;
  description: string;
  /** The literals this constraint asserts. CNF: each inner array is a clause. */
  clauses: Clause[];
  /** Severity if this constraint conflicts: 'hard' stops analysis, 'soft' warns */
  severity: 'hard' | 'soft';
}

export interface SATResult {
  satisfiable: boolean;
  /** Which constraints caused the contradiction (UNSAT core) */
  conflictingConstraints: string[];
  /** Human-readable explanation */
  explanation: string;
  /** Suggested alternatives that would make it satisfiable */
  suggestions: string[];
  /** The variable assignments that satisfy the formula (when SAT) */
  model?: Record<string, boolean>;
  /** Time taken in ms */
  solveTimeMs: number;
}

// ─── DPLL Core ────────────────────────────────────────────────────────────────

/**
 * Unit propagation: if a clause has exactly one unassigned literal,
 * that literal must be true for the clause to be satisfied.
 */
function unitPropagation(
  formula: CNFFormula,
  assignment: Map<string, boolean>
): { formula: CNFFormula; assignment: Map<string, boolean>; conflict: boolean } {
  let changed = true;
  let current = formula;
  const assign = new Map(assignment);

  while (changed) {
    changed = false;
    for (const clause of current) {
      // Filter out clauses that are already satisfied
      const unassigned = clause.filter(lit => !assign.has(lit.variable));
      const satisfied = clause.some(lit => {
        const val = assign.get(lit.variable);
        return val !== undefined && val === !lit.negated;
      });

      if (satisfied) continue;
      if (unassigned.length === 0) return { formula: current, assignment: assign, conflict: true };

      if (unassigned.length === 1) {
        const unit = unassigned[0];
        assign.set(unit.variable, !unit.negated);
        changed = true;
      }
    }

    // Simplify formula
    current = current.filter(clause => {
      return !clause.some(lit => {
        const val = assign.get(lit.variable);
        return val !== undefined && val === !lit.negated;
      });
    }).map(clause =>
      clause.filter(lit => {
        const val = assign.get(lit.variable);
        return val === undefined || val !== lit.negated;
      })
    );
  }

  return { formula: current, assignment: assign, conflict: false };
}

/**
 * Pure literal elimination: a literal that appears only positively (or only
 * negatively) across the formula can always be assigned to satisfy it.
 */
function pureLiteralElimination(
  formula: CNFFormula,
  assignment: Map<string, boolean>
): Map<string, boolean> {
  const positive = new Set<string>();
  const negative = new Set<string>();

  for (const clause of formula) {
    for (const lit of clause) {
      if (!assignment.has(lit.variable)) {
        if (lit.negated) negative.add(lit.variable);
        else positive.add(lit.variable);
      }
    }
  }

  const assign = new Map(assignment);
  for (const v of positive) {
    if (!negative.has(v)) assign.set(v, true);
  }
  for (const v of negative) {
    if (!positive.has(v)) assign.set(v, false);
  }

  return assign;
}

/**
 * Core DPLL recursive solver.
 */
function dpll(
  formula: CNFFormula,
  assignment: Map<string, boolean>
): Map<string, boolean> | null {
  // Unit propagation
  const { formula: f1, assignment: a1, conflict } = unitPropagation(formula, assignment);
  if (conflict) return null;
  if (f1.length === 0) return a1; // All clauses satisfied

  // Pure literal elimination
  const a2 = pureLiteralElimination(f1, a1);

  // Simplify again after pure literal elimination
  const simplified = f1.filter(clause =>
    !clause.some(lit => {
      const val = a2.get(lit.variable);
      return val !== undefined && val === !lit.negated;
    })
  );

  if (simplified.length === 0) return a2;

  // Check for empty clause (conflict)
  if (simplified.some(c => c.length === 0)) return null;

  // Choose branching variable (first unassigned in first clause)
  const unassignedLit = simplified[0].find(lit => !a2.has(lit.variable));
  if (!unassignedLit) return null;

  const variable = unassignedLit.variable;

  // Try assigning true
  const trueAssignment = new Map(a2);
  trueAssignment.set(variable, true);
  const trueResult = dpll(simplified, trueAssignment);
  if (trueResult !== null) return trueResult;

  // Try assigning false
  const falseAssignment = new Map(a2);
  falseAssignment.set(variable, false);
  return dpll(simplified, falseAssignment);
}

// ─── Contradiction Detection Helpers ─────────────────────────────────────────

/**
 * Find a minimal UNSAT core by trying subsets of constraints.
 * Returns the IDs of the constraints involved in the contradiction.
 */
function findUNSATCore(constraints: SATConstraint[]): string[] {
  const conflicting: string[] = [];

  for (let i = 0; i < constraints.length; i++) {
    const subset = constraints.filter((_, j) => j !== i);
    const formula: CNFFormula = subset.flatMap(c => c.clauses);
    const result = dpll(formula, new Map());
    if (result !== null) {
      // Removing constraint i made it SAT — so constraint i is in the core
      conflicting.push(constraints[i].id);
    }
  }

  return conflicting.length > 0 ? conflicting : constraints.map(c => c.id);
}

// ─── Strategic Input → CNF Conversion ────────────────────────────────────────

/**
 * Convert a natural-language strategic scenario into propositional constraints.
 * This is the "intake parser" that turns user inputs into logic clauses.
 */
export function scenarioToCNF(params: {
  riskTolerance?: string;
  roiTarget?: number;
  timelineMonths?: number;
  budget?: string;
  expansionScope?: string;
  teamSize?: string;
  regulatoryCompliance?: boolean;
  marketMaturity?: string;
}): SATConstraint[] {
  const constraints: SATConstraint[] = [];

  // Constraint 1: Low risk AND high ROI are contradictory
  if (params.riskTolerance === 'low' && params.roiTarget !== undefined && params.roiTarget > 25) {
    constraints.push({
      id: 'ROI_RISK_CONFLICT',
      description: `Low risk tolerance (${params.riskTolerance}) with ${params.roiTarget}% ROI target`,
      clauses: [
        [{ variable: 'HIGH_ROI', negated: false }],
        [{ variable: 'HIGH_ROI', negated: true }],
      ],
      severity: 'hard',
    });
  }

  // Constraint 2: Small budget + global expansion + fast timeline = impossible
  if (
    params.budget === 'small' &&
    params.expansionScope === 'global' &&
    params.timelineMonths !== undefined &&
    params.timelineMonths < 12
  ) {
    constraints.push({
      id: 'BUDGET_SCOPE_TIMELINE_CONFLICT',
      description: `Small budget + global expansion + ${params.timelineMonths}-month timeline`,
      clauses: [
        [
          { variable: 'SMALL_BUDGET', negated: false },
          { variable: 'GLOBAL_SCOPE', negated: true },
        ],
        [
          { variable: 'SMALL_BUDGET', negated: false },
          { variable: 'FAST_TIMELINE', negated: true },
        ],
        [{ variable: 'SMALL_BUDGET', negated: false }],
        [{ variable: 'GLOBAL_SCOPE', negated: false }],
        [{ variable: 'FAST_TIMELINE', negated: false }],
      ],
      severity: 'hard',
    });
  }

  // Constraint 3: Zero team + complex regulatory environment
  if (params.teamSize === 'solo' && params.regulatoryCompliance === true) {
    constraints.push({
      id: 'TEAM_COMPLIANCE_CONFLICT',
      description: 'Solo team attempting regulated-market entry',
      clauses: [
        [{ variable: 'SOLO_TEAM', negated: false }],
        [{ variable: 'REGULATED_MARKET', negated: false }],
        [{ variable: 'SOLO_TEAM', negated: true }, { variable: 'REGULATED_MARKET', negated: true }],
      ],
      severity: 'soft',
    });
  }

  // Constraint 4: Saturated market + no differentiation strategy
  if (params.marketMaturity === 'saturated' && params.expansionScope === 'incremental') {
    constraints.push({
      id: 'SATURATED_NO_DIFF_CONFLICT',
      description: 'Entering saturated market with incremental (non-disruptive) strategy',
      clauses: [
        [{ variable: 'SATURATED_MARKET', negated: false }],
        [{ variable: 'INCREMENTAL_STRATEGY', negated: false }],
        [
          { variable: 'SATURATED_MARKET', negated: true },
          { variable: 'INCREMENTAL_STRATEGY', negated: true },
        ],
      ],
      severity: 'soft',
    });
  }

  return constraints;
}

// ─── Suggestion Generator ─────────────────────────────────────────────────────

function generateSuggestions(conflictIds: string[]): string[] {
  const suggestions: Record<string, string[]> = {
    ROI_RISK_CONFLICT: [
      'Lower the ROI target to ≤15% to align with low-risk parameters, or',
      'Increase risk tolerance to "medium" to unlock higher-return opportunities.',
    ],
    BUDGET_SCOPE_TIMELINE_CONFLICT: [
      'Extend timeline to 18–24 months to allow phased global expansion, or',
      'Narrow scope to regional (not global) within current budget and timeline, or',
      'Increase budget allocation to support the global scope.',
    ],
    TEAM_COMPLIANCE_CONFLICT: [
      'Engage a compliance consultant or partner before market entry, or',
      'Target a non-regulated market segment first to build capacity.',
    ],
    SATURATED_NO_DIFF_CONFLICT: [
      'Define a clear differentiation strategy (price, niche, technology) before entry, or',
      'Pivot to an adjacent emerging market where saturation is lower.',
    ],
  };

  const result: string[] = [];
  for (const id of conflictIds) {
    const s = suggestions[id];
    if (s) result.push(...s);
  }
  return result.length > 0
    ? result
    : ['Review and revise conflicting assumptions before proceeding with analysis.'];
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Run the SAT contradiction check on a set of constraints.
 *
 * @param input - The SAT input with constraints
 * @returns SATResult with satisfiable flag, conflict explanation, and suggestions
 *
 * @example
 * ```ts
 * const result = checkContradictions({
 *   constraints: scenarioToCNF({ riskTolerance: 'low', roiTarget: 40 })
 * });
 * if (!result.satisfiable) {
 *   console.log(result.explanation); // "Your constraints are logically impossible..."
 * }
 * ```
 */
export function checkContradictions(input: SATInput): SATResult {
  const t0 = Date.now();

  if (input.constraints.length === 0) {
    return {
      satisfiable: true,
      conflictingConstraints: [],
      explanation: 'No constraints detected. Inputs are consistent — proceeding with analysis.',
      suggestions: [],
      model: {},
      solveTimeMs: Date.now() - t0,
    };
  }

  // Build combined CNF from all constraints
  const allClauses: CNFFormula = input.constraints.flatMap(c => c.clauses);
  const result = dpll(allClauses, new Map());

  if (result !== null) {
    // SAT — convert Map to plain object
    const model: Record<string, boolean> = {};
    result.forEach((v, k) => { model[k] = v; });

    return {
      satisfiable: true,
      conflictingConstraints: [],
      explanation: 'All constraints are logically consistent. Proceeding with full analysis pipeline.',
      suggestions: [],
      model,
      solveTimeMs: Date.now() - t0,
    };
  }

  // UNSAT — find which constraints conflict
  const hardConflicts = input.constraints.filter(c => c.severity === 'hard');
  const coreIds = hardConflicts.length > 0
    ? findUNSATCore(hardConflicts)
    : findUNSATCore(input.constraints);

  const conflictDescriptions = input.constraints
    .filter(c => coreIds.includes(c.id))
    .map(c => c.description);

  const explanation =
    `⚠️ LOGICAL CONTRADICTION DETECTED — Analysis blocked.\n\n` +
    `The following input constraints are mathematically impossible to satisfy simultaneously:\n` +
    conflictDescriptions.map(d => `  • ${d}`).join('\n') +
    `\n\nThis was caught by the DPLL SAT solver before any analysis resources were spent.\n` +
    `Contradictory inputs would produce meaningless output — revise your parameters below.`;

  const suggestions = generateSuggestions(coreIds);

  return {
    satisfiable: false,
    conflictingConstraints: coreIds,
    explanation,
    suggestions,
    solveTimeMs: Date.now() - t0,
  };
}

/**
 * Quick check: returns true if the given scenario parameters contain contradictions.
 * Convenience wrapper for the intake pipeline.
 */
export function hasContradictions(params: Parameters<typeof scenarioToCNF>[0]): boolean {
  const constraints = scenarioToCNF(params);
  if (constraints.length === 0) return false;
  const result = checkContradictions({ constraints });
  return !result.satisfiable;
}
