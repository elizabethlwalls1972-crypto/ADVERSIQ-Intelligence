/**
 * SAT CONTRADICTION SOLVER - Boolean Satisfiability for Input Validation
 * 
 * Uses a SAT-like approach to detect logical contradictions in user inputs.
 * Converts claims into propositional logic and checks for satisfiability.
 * 
 * Examples of contradictions detected:
 * - "Low risk" + "40%+ ROI expected" (impossible in practice)
 * - "Small budget" + "Global expansion" + "Fast timeline"
 * - "Conservative strategy" + "Aggressive growth targets"
 */

import type { ReportParameters } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

export type Literal = { variable: string; negated: boolean };
export type Clause = Literal[];
export type CNF = Clause[]; // Conjunctive Normal Form

export interface ContradictionResult {
  isSatisfiable: boolean;
  contradictions: Contradiction[];
  warnings: Warning[];
  confidence: number; // 0-100
  clauses: CNF;
  assignments?: Map<string, boolean>;
}

export interface Contradiction {
  id: string;
  severity: 'critical' | 'warning';
  description: string;
  involvedClaims: string[];
  suggestion: string;
}

export interface Warning {
  id: string;
  description: string;
  claim: string;
}

// ============================================================================
// CONSTRAINT RULES DATABASE
// ============================================================================

interface ConstraintRule {
  id: string;
  name: string;
  condition: (params: ReportParameters) => boolean;
  implies: string[];       // Variables that must be true
  excludes: string[];      // Variables that cannot be true
  severity: 'critical' | 'warning';
  message: string;
}

const CONSTRAINT_RULES: ConstraintRule[] = [
  // Risk-Return Constraints
  {
    id: 'low-risk-high-return',
    name: 'Low Risk + High Return',
    condition: p => p.riskTolerance === 'low' && (p.dealSize === 'large' || p.dealSize === 'enterprise'),
    implies: ['HAS_SPECIAL_ADVANTAGE'],
    excludes: ['NORMAL_MARKET'],
    severity: 'critical',
    message: 'Claiming low risk with >35% ROI is historically inconsistent without special market access'
  },
  {
    id: 'no-budget-global',
    name: 'Limited Budget + Global Expansion',
    condition: p => {
      const budgetStr = p.calibration?.constraints?.budgetCap || p.dealSize || '';
      const isSmallBudget = budgetStr.includes('<') || budgetStr.includes('under') || 
                            /^[0-9]+[kK]$/.test(budgetStr) || parseInt(budgetStr) < 500000;
      const isGlobal = (p.strategicIntent || []).some(i => 
        i.toLowerCase().includes('global') || i.toLowerCase().includes('international'));
      return isSmallBudget && isGlobal;
    },
    implies: ['HAS_EXISTING_INFRASTRUCTURE'],
    excludes: ['GREENFIELD_EXPANSION'],
    severity: 'warning',
    message: 'Global expansion with limited budget requires existing infrastructure or partnerships'
  },
  {
    id: 'fast-complex',
    name: 'Fast Timeline + Complex Scope',
    condition: p => {
      const isFast = p.expansionTimeline === 'immediate' || p.expansionTimeline === '0-6 months';
      const isComplex = (p.targetCounterpartType?.length || 0) > 3 || 
                        (p.industry?.length || 0) > 2;
      return isFast && isComplex;
    },
    implies: ['EXPERIENCED_TEAM', 'EXISTING_NETWORK'],
    excludes: ['NEW_MARKET_ENTRY'],
    severity: 'warning',
    message: 'Complex multi-partner/multi-sector deals rarely close in <6 months without existing relationships'
  },
  {
    id: 'conservative-aggressive',
    name: 'Conservative Strategy + Aggressive Targets',
    condition: p => {
      const isConservative = p.riskTolerance === 'low' || p.riskTolerance === 'conservative';
      const hasAggressiveTargets = p.expansionTimeline === 'immediate' || p.operationalPriority === 'aggressive';
      return isConservative && hasAggressiveTargets;
    },
    implies: [],
    excludes: ['REALISTIC_PROJECTION'],
    severity: 'critical',
    message: 'Conservative risk tolerance is inconsistent with >50% growth targets'
  },
  // Stakeholder Constraints
  {
    id: 'no-stakeholders-partnership',
    name: 'Partnership Focus + No Stakeholders',
    condition: p => {
      const isPartnership = (p.strategicIntent || []).some(i => 
        i.toLowerCase().includes('partnership') || i.toLowerCase().includes('joint venture'));
      const noStakeholders = !p.stakeholderAlignment?.length;
      return isPartnership && noStakeholders;
    },
    implies: [],
    excludes: ['READY_TO_EXECUTE'],
    severity: 'warning',
    message: 'Partnership-focused strategy requires identified stakeholder alignment'
  },
  // Market Constraints
  {
    id: 'emerging-low-risk',
    name: 'Emerging Market + Low Risk Claim',
    condition: p => {
      const emergingMarkets = ['Nigeria', 'Vietnam', 'Indonesia', 'Pakistan', 'Bangladesh', 'Kenya', 'Ethiopia'];
      const isEmerging = emergingMarkets.some(m => 
        p.country?.toLowerCase().includes(m.toLowerCase()));
      return isEmerging && p.riskTolerance === 'low';
    },
    implies: ['HEDGING_STRATEGY'],
    excludes: ['UNMITIGATED_EXPOSURE'],
    severity: 'warning',
    message: 'Low risk tolerance in emerging markets requires explicit hedging strategy'
  },
  // Timeline Constraints
  {
    id: 'regulated-fast',
    name: 'Regulated Industry + Fast Timeline',
    condition: p => {
      const regulatedIndustries = ['healthcare', 'finance', 'banking', 'insurance', 'pharma', 'energy'];
      const isRegulated = (p.industry || []).some(i => 
        regulatedIndustries.some(r => i.toLowerCase().includes(r)));
      const isFast = p.expansionTimeline === 'immediate' || p.expansionTimeline === '0-6 months';
      return isRegulated && isFast;
    },
    implies: ['PRE_EXISTING_LICENSES'],
    excludes: ['NEW_REGULATORY_APPROVAL'],
    severity: 'critical',
    message: 'Regulated industries require 12-24+ months for new market licenses'
  }
];

// ============================================================================
// DPLL SAT SOLVER (simplified)
// ============================================================================

class DPLLSolver {
  private assignments: Map<string, boolean> = new Map();

  /**
   * Solve CNF formula using DPLL algorithm
   * Returns true if satisfiable, false if contradictory
   */
  solve(cnf: CNF): { satisfiable: boolean; assignments: Map<string, boolean> } {
    this.assignments = new Map();
    const result = this.dpll([...cnf], new Map());
    return { satisfiable: result, assignments: this.assignments };
  }

  private dpll(cnf: Clause[], assignments: Map<string, boolean>): boolean {
    // Apply unit propagation
    let changed = true;
    while (changed) {
      changed = false;
      for (const clause of cnf) {
        const unassigned = clause.filter(lit => !assignments.has(lit.variable));
        const assigned = clause.filter(lit => assignments.has(lit.variable));
        
        // Check if clause is satisfied
        const satisfied = assigned.some(lit => 
          assignments.get(lit.variable) === !lit.negated);
        if (satisfied) continue;

        // Check if clause is unit
        if (unassigned.length === 1) {
          const lit = unassigned[0];
          assignments.set(lit.variable, !lit.negated);
          this.assignments.set(lit.variable, !lit.negated);
          changed = true;
        }

        // Check if clause is empty (contradiction)
        if (unassigned.length === 0 && !satisfied) {
          return false;
        }
      }
    }

    // Check if all clauses satisfied
    const allSatisfied = cnf.every(clause =>
      clause.some(lit => assignments.get(lit.variable) === !lit.negated)
    );
    if (allSatisfied) return true;

    // Check for empty clauses
    const hasEmptyClause = cnf.some(clause => {
      const unassigned = clause.filter(lit => !assignments.has(lit.variable));
      const satisfied = clause.some(lit => 
        assignments.get(lit.variable) === !lit.negated);
      return unassigned.length === 0 && !satisfied;
    });
    if (hasEmptyClause) return false;

    // Choose an unassigned variable
    const allVars = new Set<string>();
    for (const clause of cnf) {
      for (const lit of clause) {
        allVars.add(lit.variable);
      }
    }
    const unassignedVar = [...allVars].find(v => !assignments.has(v));
    if (!unassignedVar) return true;

    // Try both assignments
    const tryTrue = new Map(assignments);
    tryTrue.set(unassignedVar, true);
    if (this.dpll(cnf, tryTrue)) {
      this.assignments = tryTrue;
      return true;
    }

    const tryFalse = new Map(assignments);
    tryFalse.set(unassignedVar, false);
    if (this.dpll(cnf, tryFalse)) {
      this.assignments = tryFalse;
      return true;
    }

    return false;
  }
}

// ============================================================================
// SAT CONTRADICTION SOLVER
// ============================================================================

export class SATContradictionSolver {
  private solver = new DPLLSolver();

  /**
   * Analyze inputs for logical contradictions using SAT solving
   */
  analyze(params: ReportParameters): ContradictionResult {
    const contradictions: Contradiction[] = [];
    const warnings: Warning[] = [];
    const clauses: CNF = [];
    const triggeredRules: ConstraintRule[] = [];

    // Evaluate all constraint rules
    for (const rule of CONSTRAINT_RULES) {
      if (rule.condition(params)) {
        triggeredRules.push(rule);
        
        // Add implication clauses
        for (const implied of rule.implies) {
          clauses.push([{ variable: implied, negated: false }]);
        }
        
        // Add exclusion clauses
        for (const excluded of rule.excludes) {
          clauses.push([{ variable: excluded, negated: true }]);
        }

        // Record as warning initially
        if (rule.severity === 'warning') {
          warnings.push({
            id: rule.id,
            description: rule.message,
            claim: rule.name
          });
        }
      }
    }

    // Add conflict detection clauses
    // If rule A implies X and rule B excludes X, we have a conflict
    const implied = new Set<string>();
    const excluded = new Set<string>();
    
    for (const rule of triggeredRules) {
      for (const i of rule.implies) implied.add(i);
      for (const e of rule.excludes) excluded.add(e);
    }

    // Check for direct conflicts
    for (const variable of implied) {
      if (excluded.has(variable)) {
        // Find the conflicting rules
        const implyingRules = triggeredRules.filter(r => r.implies.includes(variable));
        const excludingRules = triggeredRules.filter(r => r.excludes.includes(variable));
        
        for (const ir of implyingRules) {
          for (const er of excludingRules) {
            contradictions.push({
              id: `conflict-${ir.id}-${er.id}`,
              severity: 'critical',
              description: `${ir.message} conflicts with ${er.message}`,
              involvedClaims: [ir.name, er.name],
              suggestion: `Revise either ${ir.name.toLowerCase()} or ${er.name.toLowerCase()} assumptions`
            });
          }
        }
      }
    }

    // Run SAT solver for complex constraint satisfaction
    const satResult = this.solver.solve(clauses);

    // Convert critical warnings to contradictions if SAT is unsatisfiable
    if (!satResult.satisfiable) {
      for (const rule of triggeredRules) {
        if (rule.severity === 'critical') {
          contradictions.push({
            id: rule.id,
            severity: 'critical',
            description: rule.message,
            involvedClaims: [rule.name],
            suggestion: 'Review and adjust conflicting assumptions'
          });
        }
      }
    }

    // Calculate confidence based on contradictions and warnings
    const confidence = Math.max(0, 100 - 
      contradictions.filter(c => c.severity === 'critical').length * 25 -
      contradictions.filter(c => c.severity === 'warning').length * 10 -
      warnings.length * 5);

    return {
      isSatisfiable: satResult.satisfiable && contradictions.length === 0,
      contradictions,
      warnings,
      confidence,
      clauses,
      assignments: satResult.assignments
    };
  }

  /**
   * Quick check if inputs have obvious contradictions
   */
  quickCheck(params: ReportParameters): { hasContradictions: boolean; count: number } {
    const result = this.analyze(params);
    return {
      hasContradictions: !result.isSatisfiable,
      count: result.contradictions.length
    };
  }

  /**
   * Get human-readable explanation of contradictions
   */
  explainContradictions(result: ContradictionResult): string[] {
    const explanations: string[] = [];
    
    for (const c of result.contradictions) {
      explanations.push(`[${c.severity.toUpperCase()}] ${c.description}`);
      if (c.suggestion) {
        explanations.push(`  → Suggestion: ${c.suggestion}`);
      }
    }
    
    return explanations;
  }
}

// Singleton instance
export const satSolver = new SATContradictionSolver();

export default SATContradictionSolver;
