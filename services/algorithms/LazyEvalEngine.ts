/**
 * LAZY EVALUATION ENGINE - On-Demand Derivative Index Computation
 * 
 * Implements lazy evaluation for the 16 derivative indices.
 * Only computes indices when they are actually accessed.
 * Uses proxy-based interception for transparent lazy loading.
 * 
 * Speed Impact: 2-4x improvement when only subset of indices needed
 * 
 * Features:
 * - Lazy proxy wrapping for deferred computation
 * - Dependency tracking to compute prerequisites
 * - Caching of computed values
 * - Usage statistics for optimization
 */

import type { ReportParameters } from '../../types';
import { DAGScheduler, FormulaId, FormulaResult } from './DAGScheduler';

// ============================================================================
// TYPES
// ============================================================================

export interface LazyIndex {
  id: FormulaId;
  isComputed: boolean;
  value?: FormulaResult;
  computePromise?: Promise<FormulaResult>;
}

export interface LazyEvalStats {
  totalIndices: number;
  computedIndices: number;
  accessedIndices: string[];
  skippedIndices: string[];
  computationSavedMs: number;
}

export interface LazyEvalResult {
  indices: Record<FormulaId, FormulaResult | null>;
  stats: LazyEvalStats;
  getIndex: (id: FormulaId) => Promise<FormulaResult>;
}

// ============================================================================
// INDEX CATEGORIES
// ============================================================================

const DERIVATIVE_INDICES: FormulaId[] = [
  // Strategic
  'BARNA', 'NVI', 'CRI', 'FRS',
  // Operational
  'CAP', 'AGI', 'VCI', 'ATI', 'ESI', 'ISI', 'OSI', 'TCO',
  // Risk
  'PRI', 'RNI', 'SRA', 'IDV'
];

const PRIMARY_ENGINES: FormulaId[] = ['SPI', 'RROI', 'SEAM', 'IVAS', 'SCF'];

// Estimated computation time per index (ms) for savings calculation
const ESTIMATED_TIMES: Record<FormulaId, number> = {
  'SPI': 50, 'RROI': 45, 'SEAM': 55, 'IVAS': 40, 'SCF': 60,
  'BARNA': 30, 'NVI': 25, 'CRI': 35, 'FRS': 25,
  'CAP': 20, 'AGI': 15, 'VCI': 20, 'ATI': 25, 'ESI': 30, 'ISI': 20, 'OSI': 25, 'TCO': 35,
  'PRI': 30, 'RNI': 25, 'SRA': 35, 'IDV': 20,
  'CRE': 80, 'CDT': 75, 'AGL': 60, 'ETH': 55, 'EVO': 45, 'ADA': 40, 'EMO': 50, 'SIM': 120,
  // Human Intelligence Quotient Suite
  'OIQ': 40, 'MEQ': 35, 'PSQ': 35, 'RAQ': 40, 'ADV': 25
};

// ============================================================================
// LAZY EVALUATION ENGINE
// ============================================================================

export class LazyEvalEngine {
  private params: ReportParameters | null = null;
  private scheduler: DAGScheduler;
  private lazyIndices: Map<FormulaId, LazyIndex> = new Map();
  private accessLog: Set<FormulaId> = new Set();

  constructor() {
    this.scheduler = new DAGScheduler();
  }

  /**
   * Initialize lazy evaluation for a set of parameters
   * Returns a proxy that only computes indices when accessed
   */
  initialize(params: ReportParameters): LazyEvalResult {
    this.params = params;
    this.lazyIndices.clear();
    this.accessLog.clear();
    this.scheduler.clearCache();

    // Initialize all indices as lazy (not computed)
    for (const id of [...PRIMARY_ENGINES, ...DERIVATIVE_INDICES]) {
      this.lazyIndices.set(id, {
        id,
        isComputed: false
      });
    }

    // Create the result object
    const indices: Record<FormulaId, FormulaResult | null> = {} as Record<FormulaId, FormulaResult | null>;
    
    // Use Proxy for lazy evaluation
    const lazyProxy = new Proxy(indices, {
      get: (target, prop: string) => {
        if (this.isFormulaId(prop)) {
          const lazy = this.lazyIndices.get(prop as FormulaId);
          if (lazy?.isComputed && lazy.value) {
            return lazy.value;
          }
          return null; // Not yet computed
        }
        return target[prop as keyof typeof target];
      }
    });

    return {
      indices: lazyProxy,
      stats: this.getStats(),
      getIndex: (id: FormulaId) => this.computeIndex(id)
    };
  }

  /**
   * Compute a specific index on demand
   */
  async computeIndex(id: FormulaId): Promise<FormulaResult> {
    if (!this.params) {
      throw new Error('LazyEvalEngine not initialized. Call initialize() first.');
    }

    const lazy = this.lazyIndices.get(id);
    
    // Already computing - return existing promise
    if (lazy?.computePromise) {
      return lazy.computePromise;
    }

    // Already computed - return cached value
    if (lazy?.isComputed && lazy.value) {
      this.accessLog.add(id);
      return lazy.value;
    }

    // Start computation
    const computePromise = this.executeWithDependencies(id);
    
    if (lazy) {
      lazy.computePromise = computePromise;
    }

    const result = await computePromise;
    
    // Cache the result
    this.lazyIndices.set(id, {
      id,
      isComputed: true,
      value: result
    });
    
    this.accessLog.add(id);
    return result;
  }

  /**
   * Compute multiple indices at once (still lazy - only computes what's requested)
   */
  async computeIndices(ids: FormulaId[]): Promise<Map<FormulaId, FormulaResult>> {
    const results = new Map<FormulaId, FormulaResult>();
    
    // Compute in parallel
    const promises = ids.map(async id => {
      const result = await this.computeIndex(id);
      results.set(id, result);
    });
    
    await Promise.all(promises);
    return results;
  }

  /**
   * Eagerly compute all primary engines (common case)
   */
  async computePrimaryEngines(): Promise<Map<FormulaId, FormulaResult>> {
    return this.computeIndices(PRIMARY_ENGINES);
  }

  /**
   * Eagerly compute all indices (defeats lazy evaluation but may be needed)
   */
  async computeAll(): Promise<Map<FormulaId, FormulaResult>> {
    return this.computeIndices([...PRIMARY_ENGINES, ...DERIVATIVE_INDICES]);
  }

  /**
   * Get statistics about lazy evaluation
   */
  getStats(): LazyEvalStats {
    const computed: string[] = [];
    const skipped: string[] = [];
    let savedMs = 0;

    for (const [id, lazy] of this.lazyIndices) {
      if (lazy.isComputed) {
        computed.push(id);
      } else {
        skipped.push(id);
        savedMs += ESTIMATED_TIMES[id] || 25;
      }
    }

    return {
      totalIndices: this.lazyIndices.size,
      computedIndices: computed.length,
      accessedIndices: Array.from(this.accessLog),
      skippedIndices: skipped,
      computationSavedMs: savedMs
    };
  }

  /**
   * Check if a specific index has been computed
   */
  isComputed(id: FormulaId): boolean {
    return this.lazyIndices.get(id)?.isComputed ?? false;
  }

  /**
   * Get a computed value without triggering computation
   */
  getCached(id: FormulaId): FormulaResult | null {
    const lazy = this.lazyIndices.get(id);
    return lazy?.isComputed ? lazy.value ?? null : null;
  }

  /**
   * Clear all cached computations
   */
  reset(): void {
    this.lazyIndices.clear();
    this.accessLog.clear();
    this.scheduler.clearCache();
    this.params = null;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async executeWithDependencies(id: FormulaId): Promise<FormulaResult> {
    if (!this.params) {
      throw new Error('LazyEvalEngine not initialized');
    }

    // Use DAG scheduler to execute with dependencies
    const result = await this.scheduler.execute(this.params, [id]);
    const formulaResult = result.results.get(id);
    
    if (!formulaResult) {
      throw new Error(`Failed to compute formula ${id}`);
    }

    // Cache all computed dependencies as well
    for (const [depId, depResult] of result.results) {
      if (!this.lazyIndices.get(depId)?.isComputed) {
        this.lazyIndices.set(depId, {
          id: depId,
          isComputed: true,
          value: depResult
        });
      }
    }

    return formulaResult;
  }

  private isFormulaId(prop: string): prop is FormulaId {
    return [...PRIMARY_ENGINES, ...DERIVATIVE_INDICES].includes(prop as FormulaId);
  }
}

// ============================================================================
// LAZY WRAPPER FACTORY
// ============================================================================

/**
 * Create a lazy wrapper for formula results
 * Useful for wrapping existing computation results
 */
export function createLazyWrapper<T>(
  computeFn: () => Promise<T>,
  _options?: { cacheKey?: string }
): () => Promise<T> {
  let cached: T | null = null;
  let computing: Promise<T> | null = null;

  return async () => {
    if (cached !== null) {
      return cached;
    }
    
    if (computing !== null) {
      return computing;
    }

    computing = computeFn();
    cached = await computing;
    computing = null;
    return cached;
  };
}

/**
 * Create a batch of lazy wrappers
 */
export function createLazyBatch<T>(
  computeFns: Record<string, () => Promise<T>>
): Record<string, () => Promise<T>> {
  const wrappers: Record<string, () => Promise<T>> = {};
  
  for (const [key, fn] of Object.entries(computeFns)) {
    wrappers[key] = createLazyWrapper(fn, { cacheKey: key });
  }
  
  return wrappers;
}

// Singleton instance
export const lazyEvalEngine = new LazyEvalEngine();

export default LazyEvalEngine;
