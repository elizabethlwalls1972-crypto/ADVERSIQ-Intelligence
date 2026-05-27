/**
 * Store Classes for NSIL Component CRUD
 * 
 * FormulaStore: Create, read, update, delete formula coefficients
 * LayerStore: Create, read, update, delete layer stacking and thresholds
 * DebateStore: Create, read, update, delete Bayesian persona priors
 * MemoryStore: Create, read, update, delete regional knowledge patterns
 * 
 * Each store persists to JSON and maintains version history.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface StoreItem<T> {
  id: string;
  name: string;
  description: string;
  data: T;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface FormulaCoefficient {
  formula_id: string;
  formula_name: string;
  coefficients: Record<string, number>;
  regions?: string[];
  sectors?: string[];
  confidence: number;
}

export interface LayerWeight {
  layer_id: string;
  layer_name: string;
  execution_order: number;
  weight: number; // 0-1, importance in final decision
  threshold: number; // consensus threshold to proceed to next layer
}

export interface DebatePrior {
  persona_id: string;
  persona_name: string;
  bayesian_prior: number; // probability this persona is correct
  bias_correction: number; // adjust for known biases
  regions?: string[];
}

export interface MemoryPattern {
  pattern_id: string;
  pattern_text: string;
  category: string;
  regions: string[];
  sectors: string[];
  confidence: number;
  supporting_evidence: string[];
}

export class BaseStore<T> {
  protected store_path: string;
  protected items: Map<string, StoreItem<T>> = new Map();
  
  constructor(store_name: string, data_dir: string = 'data/evolved_state') {
    this.store_path = path.join(data_dir, `${store_name}.json`);
    
    // Ensure directory exists
    const dir = path.dirname(this.store_path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Load existing items
    this.load_from_disk();
  }
  
  /**
   * Create a new item
   */
  create(
    id: string,
    name: string,
    description: string,
    data: T
  ): StoreItem<T> {
    const item: StoreItem<T> = {
      id,
      name,
      description,
      data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
    };
    
    this.items.set(id, item);
    this.persist_to_disk();
    return item;
  }
  
  /**
   * Read an item by ID
   */
  read(id: string): StoreItem<T> | undefined {
    return this.items.get(id);
  }
  
  /**
   * Update an item's data
   */
  update(id: string, data: Partial<T>): StoreItem<T> | undefined {
    const item = this.items.get(id);
    if (!item) return undefined;
    
    item.data = { ...item.data, ...data };
    item.updated_at = new Date().toISOString();
    item.version += 1;
    
    this.persist_to_disk();
    return item;
  }
  
  /**
   * Delete an item by ID
   */
  delete(id: string): boolean {
    const deleted = this.items.delete(id);
    if (deleted) {
      this.persist_to_disk();
    }
    return deleted;
  }
  
  /**
   * Get tree overview (for NSILRefiner to review harness state)
   */
  get_tree_overview(): Record<string, any> {
    const overview: Record<string, any> = {};
    
    for (const [id, item] of this.items) {
      overview[id] = {
        name: item.name,
        description: item.description,
        version: item.version,
        updated_at: item.updated_at,
      };
    }
    
    return overview;
  }
  
  /**
   * Get all items
   */
  get_all(): StoreItem<T>[] {
    return Array.from(this.items.values());
  }
  
  protected load_from_disk(): void {
    if (!fs.existsSync(this.store_path)) {
      return;
    }
    
    try {
      const data = JSON.parse(fs.readFileSync(this.store_path, 'utf-8'));
      if (Array.isArray(data)) {
        for (const item of data) {
          this.items.set(item.id, item);
        }
      }
    } catch (error) {
      console.error(`Failed to load store from ${this.store_path}:`, error);
    }
  }
  
  protected persist_to_disk(): void {
    const data = Array.from(this.items.values());
    fs.writeFileSync(this.store_path, JSON.stringify(data, null, 2));
  }
}

/**
 * FormulaStore: CRUD on 46 proprietary formulas
 */
export class FormulaStore extends BaseStore<FormulaCoefficient> {
  constructor(data_dir: string = 'data/evolved_state') {
    super('formula_store', data_dir);
  }
  
  /**
   * Update formula coefficient for a specific region
   */
  update_regional_coefficient(
    formula_id: string,
    region: string,
    coefficient_name: string,
    value: number
  ): void {
    const formula = this.read(formula_id);
    if (!formula) return;
    
    formula.data.coefficients[coefficient_name] = value;
    formula.updated_at = new Date().toISOString();
    formula.version += 1;
    
    this.persist_to_disk();
  }
  
  /**
   * Get formulas applicable to a sector
   */
  get_by_sector(sector: string): StoreItem<FormulaCoefficient>[] {
    return this.get_all().filter(item =>
      item.data.sectors?.includes(sector)
    );
  }
  
  /**
   * Get formulas applicable to a region
   */
  get_by_region(region: string): StoreItem<FormulaCoefficient>[] {
    return this.get_all().filter(item =>
      item.data.regions?.includes(region)
    );
  }
}

/**
 * LayerStore: CRUD on 17-layer architecture
 */
export class LayerStore extends BaseStore<LayerWeight> {
  constructor(data_dir: string = 'data/evolved_state') {
    super('layer_store', data_dir);
  }
  
  /**
   * Reorder layer execution (change execution_order)
   */
  reorder_layer(layer_id: string, new_order: number): void {
    const layer = this.read(layer_id);
    if (!layer) return;
    
    layer.data.execution_order = new_order;
    layer.updated_at = new Date().toISOString();
    layer.version += 1;
    
    this.persist_to_disk();
  }
  
  /**
   * Adjust layer weight (importance in final decision)
   */
  adjust_weight(layer_id: string, new_weight: number): void {
    const layer = this.read(layer_id);
    if (!layer) return;
    
    layer.data.weight = Math.max(0, Math.min(1, new_weight));
    layer.updated_at = new Date().toISOString();
    layer.version += 1;
    
    this.persist_to_disk();
  }
  
  /**
   * Adjust consensus threshold for layer
   */
  adjust_threshold(layer_id: string, new_threshold: number): void {
    const layer = this.read(layer_id);
    if (!layer) return;
    
    layer.data.threshold = Math.max(0, Math.min(1, new_threshold));
    layer.updated_at = new Date().toISOString();
    layer.version += 1;
    
    this.persist_to_disk();
  }
  
  /**
   * Get layers in execution order
   */
  get_execution_order(): StoreItem<LayerWeight>[] {
    return this.get_all().sort(
      (a, b) => a.data.execution_order - b.data.execution_order
    );
  }
}

/**
 * DebateStore: CRUD on 5 Bayesian personas
 */
export class DebateStore extends BaseStore<DebatePrior> {
  constructor(data_dir: string = 'data/evolved_state') {
    super('debate_store', data_dir);
  }
  
  /**
   * Update Bayesian prior (how correct is this persona?)
   */
  update_prior(persona_id: string, new_prior: number): void {
    const persona = this.read(persona_id);
    if (!persona) return;
    
    persona.data.bayesian_prior = Math.max(0, Math.min(1, new_prior));
    persona.updated_at = new Date().toISOString();
    persona.version += 1;
    
    this.persist_to_disk();
  }
  
  /**
   * Apply bias correction (adjust for known biases)
   */
  apply_bias_correction(persona_id: string, correction: number): void {
    const persona = this.read(persona_id);
    if (!persona) return;
    
    persona.data.bias_correction = correction;
    persona.updated_at = new Date().toISOString();
    persona.version += 1;
    
    this.persist_to_disk();
  }
  
  /**
   * Get personas by region (regional calibration)
   */
  get_by_region(region: string): StoreItem<DebatePrior>[] {
    return this.get_all().filter(item =>
      !item.data.regions || item.data.regions.includes(region)
    );
  }
}

/**
 * MemoryStore: CRUD on regional knowledge base
 */
export class MemoryStore extends BaseStore<MemoryPattern> {
  constructor(data_dir: string = 'data/evolved_state') {
    super('memory_store', data_dir);
  }
  
  /**
   * Add a new pattern discovered from trajectories
   */
  add_pattern(
    category: string,
    pattern_text: string,
    regions: string[],
    sectors: string[],
    confidence: number
  ): StoreItem<MemoryPattern> {
    const pattern_id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return this.create(pattern_id, pattern_text, `${category} pattern`, {
      pattern_id,
      pattern_text,
      category,
      regions,
      sectors,
      confidence,
      supporting_evidence: [],
    });
  }
  
  /**
   * Get patterns for a specific region
   */
  get_by_region(region: string): StoreItem<MemoryPattern>[] {
    return this.get_all().filter(item =>
      item.data.regions.includes(region)
    );
  }
  
  /**
   * Get patterns for a specific sector
   */
  get_by_sector(sector: string): StoreItem<MemoryPattern>[] {
    return this.get_all().filter(item =>
      item.data.sectors.includes(sector)
    );
  }
  
  /**
   * Add supporting evidence to a pattern
   */
  add_evidence(pattern_id: string, evidence: string): void {
    const pattern = this.read(pattern_id);
    if (!pattern) return;
    
    pattern.data.supporting_evidence.push(evidence);
    pattern.updated_at = new Date().toISOString();
    pattern.version += 1;
    
    this.persist_to_disk();
  }
  
  /**
   * Demote pattern importance (not relevant anymore)
   */
  demote_pattern(pattern_id: string): void {
    const pattern = this.read(pattern_id);
    if (!pattern) return;
    
    pattern.data.confidence = Math.max(0, pattern.data.confidence - 0.1);
    pattern.updated_at = new Date().toISOString();
    pattern.version += 1;
    
    this.persist_to_disk();
  }
}

export default {
  BaseStore,
  FormulaStore,
  LayerStore,
  DebateStore,
  MemoryStore,
};
