/**
 * NSILBootstrapManager
 * 
 * Manages persistence of evolved NSIL state across consulting sessions.
 * 
 * When a region's NSIL brain improves (formulas refined, layers reordered,
 * personas recalibrated, memory enriched), those improvements are saved as
 * a "bootstrap bundle" specific to that region.
 * 
 * On the next consulting session for that region, the bootstrap bundle
 * loads automatically, providing a warm start with all prior refinements.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  FormulaStore,
  LayerStore,
  DebateStore,
  MemoryStore,
  type FormulaCoefficient,
  type LayerWeight,
  type DebatePrior,
  type MemoryPattern,
} from './stores';

export interface BootstrapBundle {
  region_id: string;
  sector?: string;
  created_at: string;
  last_updated: string;
  
  // Evolved state snapshots
  formulas: FormulaCoefficient[];
  layers: LayerWeight[];
  debate_priors: DebatePrior[];
  memory_patterns: MemoryPattern[];
  
  // Metadata
  training_sessions: number;
  success_rate: number;
  sectors_covered: string[];
}

export class NSILBootstrapManager {
  private bootstrap_dir: string;
  private formula_store: FormulaStore;
  private layer_store: LayerStore;
  private debate_store: DebateStore;
  private memory_store: MemoryStore;
  
  constructor(
    data_dir: string = 'data/evolved_state',
    bootstrap_dir: string = 'data/bootstrap_bundles'
  ) {
    this.bootstrap_dir = bootstrap_dir;
    this.formula_store = new FormulaStore(data_dir);
    this.layer_store = new LayerStore(data_dir);
    this.debate_store = new DebateStore(data_dir);
    this.memory_store = new MemoryStore(data_dir);
    
    // Ensure bootstrap directory exists
    if (!fs.existsSync(bootstrap_dir)) {
      fs.mkdirSync(bootstrap_dir, { recursive: true });
    }
  }
  
  /**
   * Save evolved state for a region as a bootstrap bundle
   */
  save_bootstrap(
    region_id: string,
    sector?: string,
    success_rate: number = 0.7
  ): BootstrapBundle {
    const bundle: BootstrapBundle = {
      region_id,
      sector,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      
      // Snapshot all evolved stores
      formulas: this.formula_store.get_all().map(item => item.data),
      layers: this.layer_store.get_all().map(item => item.data),
      debate_priors: this.debate_store.get_all().map(item => item.data),
      memory_patterns: this.memory_store.get_all().map(item => item.data),
      
      // Metadata
      training_sessions: this.get_training_session_count(region_id),
      success_rate,
      sectors_covered: this.extract_covered_sectors(),
    };
    
    // Persist to disk
    const bundle_path = this.get_bundle_path(region_id);
    fs.writeFileSync(bundle_path, JSON.stringify(bundle, null, 2));
    
    console.log(`[NSILBootstrapManager] Saved bootstrap bundle for ${region_id}`);
    return bundle;
  }
  
  /**
   * Load evolved state for a region from bootstrap bundle
   */
  load_bootstrap(region_id: string): BootstrapBundle | null {
    const bundle_path = this.get_bundle_path(region_id);
    
    if (!fs.existsSync(bundle_path)) {
      console.log(
        `[NSILBootstrapManager] No bootstrap bundle found for ${region_id}`
      );
      return null;
    }
    
    try {
      const bundle = JSON.parse(
        fs.readFileSync(bundle_path, 'utf-8')
      ) as BootstrapBundle;
      
      // Restore evolved state to stores
      this.restore_formulas(bundle.formulas);
      this.restore_layers(bundle.layers);
      this.restore_debate_priors(bundle.debate_priors);
      this.restore_memory_patterns(bundle.memory_patterns);
      
      console.log(
        `[NSILBootstrapManager] Loaded bootstrap bundle for ${region_id} (${bundle.training_sessions} prior sessions)`
      );
      return bundle;
    } catch (error) {
      console.error(
        `[NSILBootstrapManager] Failed to load bootstrap for ${region_id}:`,
        error
      );
      return null;
    }
  }
  
  /**
   * Save sector-specific bootstrap
   */
  save_sector_bootstrap(
    region_id: string,
    sector: string,
    success_rate: number = 0.7
  ): BootstrapBundle {
    const bundle_path = path.join(
      this.bootstrap_dir,
      `${region_id}_${sector}_bootstrap.json`
    );
    
    const bundle: BootstrapBundle = {
      region_id,
      sector,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      
      // Filter for this sector
      formulas: this.formula_store
        .get_by_sector(sector)
        .map(item => item.data),
      layers: this.layer_store.get_all().map(item => item.data), // Layers apply globally
      debate_priors: this.debate_store.get_all().map(item => item.data),
      memory_patterns: this.memory_store
        .get_by_sector(sector)
        .map(item => item.data),
      
      training_sessions: this.get_training_session_count(region_id, sector),
      success_rate,
      sectors_covered: [sector],
    };
    
    fs.writeFileSync(bundle_path, JSON.stringify(bundle, null, 2));
    console.log(
      `[NSILBootstrapManager] Saved sector bootstrap: ${region_id}/${sector}`
    );
    return bundle;
  }
  
  /**
   * Load sector-specific bootstrap
   */
  load_sector_bootstrap(region_id: string, sector: string): BootstrapBundle | null {
    const bundle_path = path.join(
      this.bootstrap_dir,
      `${region_id}_${sector}_bootstrap.json`
    );
    
    if (!fs.existsSync(bundle_path)) {
      return null;
    }
    
    try {
      const bundle = JSON.parse(
        fs.readFileSync(bundle_path, 'utf-8')
      ) as BootstrapBundle;
      
      // Restore sector-specific state
      this.restore_formulas(bundle.formulas);
      this.restore_memory_patterns(bundle.memory_patterns);
      
      return bundle;
    } catch (error) {
      console.error(
        `[NSILBootstrapManager] Failed to load sector bootstrap for ${region_id}/${sector}:`,
        error
      );
      return null;
    }
  }
  
  /**
   * Get list of available bootstrap bundles
   */
  list_available_bootstraps(): BootstrapBundle[] {
    const bundles: BootstrapBundle[] = [];
    
    if (!fs.existsSync(this.bootstrap_dir)) {
      return bundles;
    }
    
    const files = fs.readdirSync(this.bootstrap_dir);
    for (const file of files) {
      if (file.endsWith('_bootstrap.json')) {
        try {
          const bundle = JSON.parse(
            fs.readFileSync(
              path.join(this.bootstrap_dir, file),
              'utf-8'
            )
          ) as BootstrapBundle;
          bundles.push(bundle);
        } catch (error) {
          console.error(`Failed to read bootstrap ${file}:`, error);
        }
      }
    }
    
    return bundles;
  }
  
  /**
   * Export bootstrap in human-readable format (for audit trail)
   */
  export_bootstrap_report(region_id: string): string {
    const bundle_path = this.get_bundle_path(region_id);
    
    if (!fs.existsSync(bundle_path)) {
      return `No bootstrap found for ${region_id}`;
    }
    
    const bundle = JSON.parse(
      fs.readFileSync(bundle_path, 'utf-8')
    ) as BootstrapBundle;
    
    let report = `
=== NSIL Bootstrap Report ===
Region: ${bundle.region_id}
Sector: ${bundle.sector || 'All'}
Created: ${bundle.created_at}
Last Updated: ${bundle.last_updated}
Training Sessions: ${bundle.training_sessions}
Success Rate: ${(bundle.success_rate * 100).toFixed(1)}%
Covered Sectors: ${bundle.sectors_covered.join(', ')}

--- Evolved Formulas (${bundle.formulas.length}) ---
`;
    
    for (const formula of bundle.formulas) {
      report += `\n${formula.formula_name}:
  ID: ${formula.formula_id}
  Confidence: ${(formula.confidence * 100).toFixed(1)}%
  Coefficients: ${JSON.stringify(formula.coefficients, null, 2)}`;
    }
    
    report += `\n\n--- Layer Configuration (${bundle.layers.length}) ---\n`;
    for (const layer of bundle.layers) {
      report += `\n${layer.layer_name}:
  Order: ${layer.execution_order}
  Weight: ${(layer.weight * 100).toFixed(1)}%
  Threshold: ${(layer.threshold * 100).toFixed(1)}%`;
    }
    
    report += `\n\n--- Debate Persona Priors (${bundle.debate_priors.length}) ---\n`;
    for (const prior of bundle.debate_priors) {
      report += `\n${prior.persona_name}:
  Bayesian Prior: ${(prior.bayesian_prior * 100).toFixed(1)}%
  Bias Correction: ${prior.bias_correction}`;
    }
    
    report += `\n\n--- Memory Patterns (${bundle.memory_patterns.length}) ---\n`;
    for (const pattern of bundle.memory_patterns) {
      report += `\n[${pattern.category}] ${pattern.pattern_text}
  Confidence: ${(pattern.confidence * 100).toFixed(1)}%
  Regions: ${pattern.regions.join(', ')}
  Sectors: ${pattern.sectors.join(', ')}`;
    }
    
    return report;
  }
  
  // ===== Helper Methods =====
  
  private get_bundle_path(region_id: string): string {
    return path.join(this.bootstrap_dir, `${region_id}_bootstrap.json`);
  }
  
  private restore_formulas(formulas: FormulaCoefficient[]): void {
    for (const formula_data of formulas) {
      this.formula_store.create(
        formula_data.formula_id,
        formula_data.formula_name,
        'Restored from bootstrap',
        formula_data
      );
    }
  }
  
  private restore_layers(layers: LayerWeight[]): void {
    for (const layer_data of layers) {
      this.layer_store.create(
        layer_data.layer_id,
        layer_data.layer_name,
        'Restored from bootstrap',
        layer_data
      );
    }
  }
  
  private restore_debate_priors(priors: DebatePrior[]): void {
    for (const prior_data of priors) {
      this.debate_store.create(
        prior_data.persona_id,
        prior_data.persona_name,
        'Restored from bootstrap',
        prior_data
      );
    }
  }
  
  private restore_memory_patterns(patterns: MemoryPattern[]): void {
    for (const pattern_data of patterns) {
      this.memory_store.create(
        pattern_data.pattern_id,
        pattern_data.pattern_text,
        pattern_data.category,
        pattern_data
      );
    }
  }
  
  private get_training_session_count(
    region_id: string,
    sector?: string
  ): number {
    // Count consulting sessions from trajectory log
    const log_path = 'data/nsil_trajectories.jsonl';
    if (!fs.existsSync(log_path)) return 0;
    
    try {
      const lines = fs
        .readFileSync(log_path, 'utf-8')
        .split('\n')
        .filter(l => l);
      
      return lines.filter(line => {
        const traj = JSON.parse(line);
        const region_match = traj.region_id === region_id;
        const sector_match = !sector || traj.input.sector === sector;
        return region_match && sector_match;
      }).length;
    } catch (error) {
      return 0;
    }
  }
  
  private extract_covered_sectors(): string[] {
    const sectors = new Set<string>();
    for (const formula of this.formula_store.get_all()) {
      if (formula.data.sectors) {
        formula.data.sectors.forEach(s => sectors.add(s));
      }
    }
    return Array.from(sectors);
  }
}

export default NSILBootstrapManager;
