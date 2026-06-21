/**
 * NSILRefiner
 * 
 * Main harness refinement engine for ADVERSIQ NSIL brain.
 * Implements the 4 independent evolution passes from Continual Harness:
 * 
 * Pass 1: _evolve_orchestration() - Reorder 17 layers, adjust thresholds
 * Pass 2: _evolve_formulas() - Adjust 46 formula coefficients
 * Pass 3: _evolve_debate_priors() - Update Bayesian weights of 5 personas
 * Pass 4: _evolve_memory() - Discover and codify regional knowledge patterns
 * 
 * Executed every F steps during live consulting sessions (reset-free).
 * Each pass reads trajectory failure data and emits CRUD edits.
 */

import * as fs from 'fs';
import { NSILTrajectory } from './trajectory_logger';
import {
  FormulaStore,
  LayerStore,
  DebateStore,
  MemoryStore,
} from './stores';
import { NSILFailureDetector, FailureSignature } from './failure_detector';

export interface HarnessEdits {
  orchestration_edits: Record<string, any>[];
  formula_edits: Record<string, any>[];
  debate_edits: Record<string, any>[];
  memory_edits: Record<string, any>[];
  timestamp: string;
}

export interface RefinementMetrics {
  failure_signatures_detected: number;
  orchestration_changes: number;
  formula_updates: number;
  debate_calibrations: number;
  memory_additions: number;
  total_changes: number;
}

export class NSILRefiner {
  private formula_store: FormulaStore;
  private layer_store: LayerStore;
  private debate_store: DebateStore;
  private memory_store: MemoryStore;
  private failure_detector: NSILFailureDetector;
  private evolution_log: HarnessEdits[] = [];
  
  // Adaptive refinement schedule (like Continual Harness)
  private MIN_WARMUP_STEPS = 25;
  private EARLY_FREQUENCY = 25;
  private STABLE_FREQUENCY = 100;
  private EARLY_PHASE_CUTOFF = 200;
  
  constructor(
    trajectories: NSILTrajectory[],
    data_dir: string = 'data/evolved_state'
  ) {
    this.formula_store = new FormulaStore(data_dir);
    this.layer_store = new LayerStore(data_dir);
    this.debate_store = new DebateStore(data_dir);
    this.memory_store = new MemoryStore(data_dir);
    this.failure_detector = new NSILFailureDetector(trajectories);
  }
  
  /**
   * Determine if we should run refinement at this step
   */
  should_evolve(current_step: number, frequency: number = 0): boolean {
    // Skip warmup phase
    if (current_step < this.MIN_WARMUP_STEPS) {
      return false;
    }
    
    // Adaptive frequency: early phase (25 steps), then stable (100 steps)
    const effective_frequency =
      current_step < this.EARLY_PHASE_CUTOFF
        ? this.EARLY_FREQUENCY
        : this.STABLE_FREQUENCY;
    
    return current_step % effective_frequency === 0;
  }
  
  /**
   * Main entry point: run all 4 refinement passes
   */
  evolve(current_step: number, trajectories: NSILTrajectory[]): HarnessEdits {
    console.log(
      `[NSILRefiner] Starting evolution at step ${current_step} with ${trajectories.length} trajectories`
    );
    
    // Re-initialize failure detector with latest trajectories
    this.failure_detector = new NSILFailureDetector(trajectories);
    
    // Detect failure signatures
    const failure_signatures = this.failure_detector.detect_all_failures();
    console.log(
      `[NSILRefiner] Detected ${failure_signatures.length} failure signatures`
    );
    
    const edits: HarnessEdits = {
      orchestration_edits: [],
      formula_edits: [],
      debate_edits: [],
      memory_edits: [],
      timestamp: new Date().toISOString(),
    };
    
    // Run 4 passes independently (failures in one pass don't block others)
    try {
      edits.orchestration_edits = this._evolve_orchestration(
        failure_signatures,
        trajectories
      );
      console.log(
        `[NSILRefiner] Orchestration pass completed: ${edits.orchestration_edits.length} edits`
      );
    } catch (error) {
      console.error('[NSILRefiner] Orchestration pass failed:', error);
    }
    
    try {
      edits.formula_edits = this._evolve_formulas(
        failure_signatures,
        trajectories
      );
      console.log(
        `[NSILRefiner] Formula pass completed: ${edits.formula_edits.length} edits`
      );
    } catch (error) {
      console.error('[NSILRefiner] Formula pass failed:', error);
    }
    
    try {
      edits.debate_edits = this._evolve_debate_priors(
        failure_signatures,
        trajectories
      );
      console.log(
        `[NSILRefiner] Debate pass completed: ${edits.debate_edits.length} edits`
      );
    } catch (error) {
      console.error('[NSILRefiner] Debate pass failed:', error);
    }
    
    try {
      edits.memory_edits = this._evolve_memory(failure_signatures, trajectories);
      console.log(
        `[NSILRefiner] Memory pass completed: ${edits.memory_edits.length} edits`
      );
    } catch (error) {
      console.error('[NSILRefiner] Memory pass failed:', error);
    }
    
    // Persist evolution edits to log
    this.evolution_log.push(edits);
    this.persist_evolution_log();
    
    return edits;
  }
  
  /**
   * Pass 1: Evolve Orchestration
   * - Reorder 17 layers
   * - Adjust consensus thresholds
   * - Promote/demote layer weights
   */
  private _evolve_orchestration(
    failures: FailureSignature[],
    trajectories: NSILTrajectory[]
  ): Record<string, any>[] {
    const edits: Record<string, any>[] = [];
    
    // Find layer contradiction failures
    const layer_contradictions = failures.filter(
      f => f.failure_type === 'layer_contradiction'
    );
    
    for (const failure of layer_contradictions) {
      // Extract layer IDs from component name: "layer_1_vs_layer_2"
      const match = failure.affected_component.match(
        /layer_(\d+)_vs_layer_(\d+)/
      );
      if (!match) continue;
      
      const layer1_id = `layer_${match[1]}`;
      const layer2_id = `layer_${match[2]}`;
      
      // Decision: reorder these layers
      const layer1 = this.layer_store.read(layer1_id);
      const layer2 = this.layer_store.read(layer2_id);
      
      if (layer1 && layer2) {
        // Swap their execution order
        const temp_order = layer1.data.execution_order;
        this.layer_store.reorder_layer(layer1_id, layer2.data.execution_order);
        this.layer_store.reorder_layer(layer2_id, temp_order);
        
        edits.push({
          type: 'reorder_layers',
          layer1: layer1_id,
          layer2: layer2_id,
          reason: failure.recommended_fix,
        });
      }
    }
    
    // Adjust thresholds for debate stalls
    const debate_stalls = failures.filter(
      f => f.failure_type === 'debate_stall'
    );
    
    for (const failure of debate_stalls) {
      // Lower threshold for next debate layer so it's easier to achieve consensus
      const debate_layer = this.layer_store.read('layer_2_bayesian_debate');
      if (debate_layer) {
        const new_threshold = Math.max(0.3, debate_layer.data.threshold - 0.1);
        this.layer_store.adjust_threshold('layer_2_bayesian_debate', new_threshold);
        
        edits.push({
          type: 'adjust_threshold',
          layer: 'layer_2_bayesian_debate',
          new_threshold,
          reason: 'Debate stalling, lowering consensus requirement',
        });
      }
    }
    
    return edits;
  }
  
  /**
   * Pass 2: Evolve Formulas
   * - Adjust coefficients of 46 formulas based on failure patterns
   * - Add regional calibrations
   * - Promote reliable formulas, demote unreliable ones
   */
  private _evolve_formulas(
    failures: FailureSignature[],
    trajectories: NSILTrajectory[]
  ): Record<string, any>[] {
    const edits: Record<string, any>[] = [];
    
    // Find formula errors
    const formula_errors = failures.filter(
      f => f.failure_type === 'formula_error'
    );
    
    for (const failure of formula_errors) {
      const formula_id = failure.affected_component;
      const formula = this.formula_store.read(formula_id);
      
      if (!formula) continue;
      
      // Adjust formula coefficients
      // Find which trajectories had this error
      const error_trajectories = trajectories.filter(t =>
        failure.trajectory_ids.includes(t.session_id)
      );
      
      for (const traj of error_trajectories) {
        // Reduce all coefficients by 10% (conservative adjustment)
        const new_coefficients: Record<string, number> = {};
        for (const [key, value] of Object.entries(formula.data.coefficients)) {
          new_coefficients[key] = value * 0.9;
        }
        
        this.formula_store.update(formula_id, {
          coefficients: new_coefficients,
          confidence: Math.max(0, formula.data.confidence - 0.05),
        });
        
        edits.push({
          type: 'adjust_coefficients',
          formula: formula_id,
          adjustment: 'reduce by 10%',
          reason: failure.recommended_fix,
        });
      }
    }
    
    // Find regional drift failures
    const regional_drifts = failures.filter(
      f => f.failure_type === 'regional_drift'
    );
    
    for (const failure of regional_drifts) {
      // Extract formula and region from component: "formula_X_in_region_Y"
      const match = failure.affected_component.match(
        /([^_]+_\d+)_in_([^_]+)/
      );
      if (!match) continue;
      
      const formula_id = match[1];
      const region = match[2];
      
      const formula = this.formula_store.read(formula_id);
      if (formula) {
        // Add regional calibration factor
        const region_factor = {
          [`${region}_calibration`]: 0.85, // Region-specific adjustment
        };
        
        const updated_coefficients = {
          ...formula.data.coefficients,
          ...region_factor,
        };
        
        this.formula_store.update(formula_id, {
          coefficients: updated_coefficients,
          regions: [...(formula.data.regions || []), region],
        });
        
        edits.push({
          type: 'add_regional_calibration',
          formula: formula_id,
          region,
          calibration: 0.85,
          reason: `Formula underperforming in ${region}`,
        });
      }
    }
    
    return edits;
  }
  
  /**
   * Pass 3: Evolve Debate Priors
   * - Update Bayesian priors of 5 personas
   * - Apply bias corrections
   * - Reweight debate contributions
   */
  private _evolve_debate_priors(
    failures: FailureSignature[],
    trajectories: NSILTrajectory[]
  ): Record<string, any>[] {
    const edits: Record<string, any>[] = [];
    
    // Find debate outliers
    const debate_outliers = failures.filter(
      f => f.failure_type === 'debate_outlier'
    );
    
    for (const failure of debate_outliers) {
      const persona_id = failure.affected_component;
      const persona = this.debate_store.read(persona_id);
      
      if (persona) {
        // Lower Bayesian prior (this persona is wrong often)
        const new_prior = Math.max(0.2, persona.data.bayesian_prior - 0.15);
        this.debate_store.update_prior(persona_id, new_prior);
        
        // Apply bias correction
        let bias_correction = 0;
        if (failure.pattern_description.includes('overconfident')) {
          bias_correction = -0.2; // Dial back confidence
        } else if (failure.pattern_description.includes('skeptical')) {
          bias_correction = 0.2; // More confidence
        }
        
        this.debate_store.apply_bias_correction(persona_id, bias_correction);
        
        edits.push({
          type: 'adjust_persona_prior',
          persona: persona_id,
          new_prior,
          bias_correction,
          reason: failure.recommended_fix,
        });
      }
    }
    
    // Find debate stalls and rebalance
    const debate_stalls = failures.filter(
      f => f.failure_type === 'debate_stall'
    );
    
    if (debate_stalls.length > 0) {
      // Find which personas are in consensus
      for (const traj of trajectories) {
        if (!traj.debate || traj.debate.consensus < 0.5) {
          // Low consensus trajectory
          const majority = this.find_debate_majority(traj.debate.votes);
          for (const vote of traj.debate.votes) {
            const persona = this.debate_store.read(vote.persona_id);
            if (persona) {
              if (majority.includes(vote.persona_id)) {
                // Boost majority
                const new_prior = Math.min(
                  1.0,
                  persona.data.bayesian_prior + 0.05
                );
                this.debate_store.update_prior(
                  vote.persona_id,
                  new_prior
                );
              }
            }
          }
        }
      }
      
      edits.push({
        type: 'rebalance_debate_priors',
        reason: 'Low consensus detected, reweighting personas',
      });
    }
    
    return edits;
  }
  
  /**
   * Pass 4: Evolve Memory
   * - Discover new regional patterns
   * - Add to memory store
   * - Demote stale patterns
   */
  private _evolve_memory(
    failures: FailureSignature[],
    trajectories: NSILTrajectory[]
  ): Record<string, any>[] {
    const edits: Record<string, any>[] = [];
    
    // Discover regional patterns from successful trajectories
    const successful_trajectories = trajectories.filter(
      t => t.ground_truth && t.ground_truth.success
    );
    
    const regional_patterns = this.extract_regional_patterns(
      successful_trajectories
    );
    
    for (const pattern of regional_patterns) {
      this.memory_store.add_pattern(
        'regional_success',
        pattern.text,
        pattern.regions,
        pattern.sectors,
        pattern.confidence
      );
      
      edits.push({
        type: 'add_memory_pattern',
        pattern: pattern.text,
        regions: pattern.regions,
        sectors: pattern.sectors,
        confidence: pattern.confidence,
      });
    }
    
    // Find sector blind spots
    const sector_blind_spots = failures.filter(
      f => f.failure_type === 'sector_blind_spot'
    );
    
    for (const failure of sector_blind_spots) {
      // Extract sector from component: "sector_name_sector"
      const sector = failure.affected_component.replace('_sector', '');
      
      // Mark that we need sector-specific knowledge
      this.memory_store.add_pattern(
        'sector_gap',
        `Need specialized knowledge for ${sector} sector`,
        [],
        [sector],
        0.5
      );
      
      edits.push({
        type: 'flag_sector_gap',
        sector,
        reason: failure.recommended_fix,
      });
    }
    
    return edits;
  }
  
  // ===== Helper Methods =====
  
  private find_debate_majority(votes: any[]): string[] {
    const vote_counts = new Map<string, number>();
    let max_votes = 0;
    let majority_position = '';
    
    for (const vote of votes) {
      const position = vote.recommendation.toLowerCase();
      const count = (vote_counts.get(position) || 0) + 1;
      vote_counts.set(position, count);
      
      if (count > max_votes) {
        max_votes = count;
        majority_position = position;
      }
    }
    
    return votes
      .filter(
        v =>
          v.recommendation.toLowerCase() === majority_position
      )
      .map(v => v.persona_id);
  }
  
  private extract_regional_patterns(
    trajectories: NSILTrajectory[]
  ): Array<{
    text: string;
    regions: string[];
    sectors: string[];
    confidence: number;
  }> {
    const patterns: Array<{
      text: string;
      regions: string[];
      sectors: string[];
      confidence: number;
    }> = [];
    
    // Extract sector success patterns by region
    const sector_region_success = new Map<
      string,
      { count: number; sectors: Set<string> }
    >();
    
    for (const traj of trajectories) {
      const region = traj.region_id || 'unknown';
      const sector = traj.input.sector;
      
      if (!sector_region_success.has(region)) {
        sector_region_success.set(region, { count: 0, sectors: new Set() });
      }
      
      const entry = sector_region_success.get(region)!;
      entry.count += 1;
      entry.sectors.add(sector);
    }
    
    // Generate patterns
    for (const [region, data] of sector_region_success.entries()) {
      if (data.count >= 3) {
        patterns.push({
          text: `${region} has demonstrated success in ${Array.from(data.sectors).join(', ')} sectors`,
          regions: [region],
          sectors: Array.from(data.sectors),
          confidence: Math.min(1.0, data.count / 10),
        });
      }
    }
    
    return patterns;
  }
  
  private persist_evolution_log(): void {
    const log_path = 'data/nsil_evolution_log.json';
    const dir = 'data';
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(
      log_path,
      JSON.stringify(this.evolution_log, null, 2)
    );
  }
  
  /**
   * Get refinement metrics
   */
  get_metrics(): RefinementMetrics {
    if (this.evolution_log.length === 0) {
      return {
        failure_signatures_detected: 0,
        orchestration_changes: 0,
        formula_updates: 0,
        debate_calibrations: 0,
        memory_additions: 0,
        total_changes: 0,
      };
    }
    
    const latest_edits = this.evolution_log[this.evolution_log.length - 1];
    
    return {
      failure_signatures_detected: this.failure_detector
        .detect_all_failures().length,
      orchestration_changes: latest_edits.orchestration_edits.length,
      formula_updates: latest_edits.formula_edits.length,
      debate_calibrations: latest_edits.debate_edits.length,
      memory_additions: latest_edits.memory_edits.length,
      total_changes:
        latest_edits.orchestration_edits.length +
        latest_edits.formula_edits.length +
        latest_edits.debate_edits.length +
        latest_edits.memory_edits.length,
    };
  }
}

export default NSILRefiner;
