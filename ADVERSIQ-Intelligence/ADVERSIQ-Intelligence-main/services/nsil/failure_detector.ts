/**
 * NSILFailureDetector
 * 
 * Analyzes NSIL trajectories to extract failure signatures.
 * Detects patterns where recommendations diverge from ground truth outcomes.
 * 
 * Failure modes detected:
 * - Recommendation misses (confidence was high, outcome was poor)
 * - Debate stalls (consensus < 0.5 after multiple debate cycles)
 * - Formula errors (result > 3 std devs from mean, post-hoc)
 * - Layer contradictions (layer N says "proceed", layer M says "halt")
 * - Debate outliers (1 persona right, 4 wrong repeatedly)
 * - Regional drift (formula optimal for Region A, fails in Region B)
 * - Sector blind spots (strong on manufacturing, weak on agriculture)
 */

import { NSILTrajectory } from './trajectory_logger';

export interface FailureSignature {
  failure_type: string;
  severity: number; // 0-1, higher = more severe
  affected_component: string; // layer_N, formula_X, persona_Y, etc.
  trajectory_ids: string[];
  frequency: number;
  pattern_description: string;
  recommended_fix: string;
}

export interface FormulaError {
  formula_id: string;
  expected_output: number;
  actual_output: number;
  deviation_std: number;
  contributing_factor: string;
}

export interface DebateOutlier {
  persona_id: string;
  persona_name: string;
  accuracy: number; // fraction of votes that led to success
  bias: string; // overconfident, too skeptical, etc.
}

export interface LayerContradiction {
  layer_ids: string[];
  conflicting_outputs: Record<string, any>;
  resolution: string; // which layer prediction was actually correct?
}

export class NSILFailureDetector {
  private trajectories: NSILTrajectory[] = [];
  private failure_signatures: FailureSignature[] = [];
  
  constructor(trajectories: NSILTrajectory[] = []) {
    this.trajectories = trajectories;
  }
  
  /**
   * Main detection pipeline: analyze all trajectories for failure patterns
   */
  detect_all_failures(trajectories?: NSILTrajectory[]): FailureSignature[] {
    if (trajectories) {
      this.trajectories = trajectories;
    }
    const failures = new Map<string, FailureSignature>();
    
    // 1. Find recommendation misses
    const recommendation_misses = this.detect_recommendation_misses();
    recommendation_misses.forEach(f => failures.set(f.affected_component, f));
    
    // 2. Find debate stalls
    const debate_stalls = this.detect_debate_stalls();
    debate_stalls.forEach(f => failures.set(f.affected_component, f));
    
    // 3. Find formula errors
    const formula_errors = this.detect_formula_errors();
    formula_errors.forEach(f => failures.set(f.affected_component, f));
    
    // 4. Find layer contradictions
    const layer_contradictions = this.detect_layer_contradictions();
    layer_contradictions.forEach(f => failures.set(f.affected_component, f));
    
    // 5. Find debate outliers
    const debate_outliers = this.detect_debate_outliers();
    debate_outliers.forEach(f => failures.set(f.affected_component, f));
    
    // 6. Find regional drift
    const regional_drift = this.detect_regional_drift();
    regional_drift.forEach(f => failures.set(f.affected_component, f));
    
    // 7. Find sector blind spots
    const sector_blind_spots = this.detect_sector_blind_spots();
    sector_blind_spots.forEach(f => failures.set(f.affected_component, f));
    
    this.failure_signatures = Array.from(failures.values());
    return this.failure_signatures;
  }
  
  /**
   * Failure Mode 1: Recommendations where confidence was high but outcome was poor
   */
  private detect_recommendation_misses(): FailureSignature[] {
    const misses: FailureSignature[] = [];
    
    const trajectories_with_ground_truth = this.trajectories.filter(
      t => t.ground_truth !== undefined
    );
    
    for (const traj of trajectories_with_ground_truth) {
      if (!traj.ground_truth || !traj.recommendation) continue;
      
      // High confidence but poor outcome = miss
      if (
        traj.recommendation.confidence > 0.8 &&
        !traj.ground_truth.success
      ) {
        const failure: FailureSignature = {
          failure_type: 'recommendation_miss',
          severity: 1.0 - traj.ground_truth.quantitative_result || 0.7,
          affected_component: `recommendation_${traj.input.sector}`,
          trajectory_ids: [traj.session_id],
          frequency: 1,
          pattern_description: `High confidence (${(traj.recommendation.confidence * 100).toFixed(1)}%) recommendation failed: "${traj.recommendation.primary}" → Outcome: ${traj.ground_truth.actual_outcome}`,
          recommended_fix: `Review formula weights for ${traj.input.sector} sector. May need regional calibration.`,
        };
        misses.push(failure);
      }
    }
    
    // Aggregate by sector
    const aggregated = this.aggregate_failures_by_component(misses);
    return aggregated;
  }
  
  /**
   * Failure Mode 2: Debate consensus below 0.5 (personas disagreed significantly)
   */
  private detect_debate_stalls(): FailureSignature[] {
    const stalls: FailureSignature[] = [];
    
    for (const traj of this.trajectories) {
      if (!traj.debate || !traj.ground_truth) continue;
      
      // Low consensus + poor outcome = debate couldn't converge on right answer
      if (traj.debate.consensus < 0.5 && traj.ground_truth && !traj.ground_truth.success) {
        const failure: FailureSignature = {
          failure_type: 'debate_stall',
          severity: (1.0 - traj.debate.consensus) * 0.8,
          affected_component: `debate_consensus`,
          trajectory_ids: [traj.session_id],
          frequency: 1,
          pattern_description: `Personas disagreed (consensus ${(traj.debate.consensus * 100).toFixed(1)}%) and recommendation failed`,
          recommended_fix: `Reweight debate personas. ${traj.debate.dissent.map(d => d.persona_name).join(', ')} were outliers.`,
        };
        stalls.push(failure);
      }
    }
    
    return this.aggregate_failures_by_component(stalls);
  }
  
  /**
   * Failure Mode 3: Formula outputs far from expected (> 3 std dev)
   */
  private detect_formula_errors(): FailureSignature[] {
    const errors: FailureSignature[] = [];
    const formula_stats = this.calculate_formula_statistics();
    
    for (const traj of this.trajectories) {
      for (const formula of traj.formula_results) {
        const stats = formula_stats.get(formula.formula_id);
        if (!stats) continue;
        
        const z_score = Math.abs((formula.output - stats.mean) / (stats.std_dev || 1));
        if (z_score > 3.0) {
          // This formula is an outlier
          errors.push({
            failure_type: 'formula_error',
            severity: Math.min(1.0, z_score / 5.0),
            affected_component: formula.formula_id,
            trajectory_ids: [traj.session_id],
            frequency: 1,
            pattern_description: `${formula.formula_name} returned outlier: ${formula.output.toFixed(2)} (z=${z_score.toFixed(1)})`,
            recommended_fix: `Audit ${formula.formula_name} input logic. Check for edge cases in ${formula.formula_id}.`,
          });
        }
      }
    }
    
    return this.aggregate_failures_by_component(errors);
  }
  
  /**
   * Failure Mode 4: Layers giving contradictory outputs
   */
  private detect_layer_contradictions(): FailureSignature[] {
    const contradictions: FailureSignature[] = [];
    
    for (const traj of this.trajectories) {
      if (traj.layer_outputs.length < 2) continue;
      
      // Look for opposing layer outputs
      for (let i = 0; i < traj.layer_outputs.length - 1; i++) {
        const layer1 = traj.layer_outputs[i];
        const layer2 = traj.layer_outputs[i + 1];
        
        // Detect contradiction: layer1 says proceed, layer2 says halt (or similar)
        const output1_str = JSON.stringify(layer1.output).toLowerCase();
        const output2_str = JSON.stringify(layer2.output).toLowerCase();
        
        const is_contradiction =
          (output1_str.includes('proceed') && output2_str.includes('halt')) ||
          (output1_str.includes('reject') && output2_str.includes('accept'));
        
        if (is_contradiction && traj.ground_truth && !traj.ground_truth.success) {
          contradictions.push({
            failure_type: 'layer_contradiction',
            severity: 0.7,
            affected_component: `${layer1.layer_id}_vs_${layer2.layer_id}`,
            trajectory_ids: [traj.session_id],
            frequency: 1,
            pattern_description: `${layer1.layer_name} and ${layer2.layer_name} gave contradictory guidance`,
            recommended_fix: `Reorder layers or adjust layer ${layer2.layer_id} confidence thresholds.`,
          });
        }
      }
    }
    
    return this.aggregate_failures_by_component(contradictions);
  }
  
  /**
   * Failure Mode 5: Debate personas with systematic bias
   */
  private detect_debate_outliers(): FailureSignature[] {
    const outliers: FailureSignature[] = [];
    const persona_accuracy = this.calculate_persona_accuracy();
    
    for (const [persona_id, stats] of persona_accuracy.entries()) {
      if (stats.accuracy < 0.4) {
        // This persona is consistently wrong
        outliers.push({
          failure_type: 'debate_outlier',
          severity: 1.0 - stats.accuracy,
          affected_component: persona_id,
          trajectory_ids: stats.trajectory_ids,
          frequency: stats.votes_cast,
          pattern_description: `${stats.persona_name} correct only ${(stats.accuracy * 100).toFixed(1)}% of the time (${stats.votes_cast} votes)`,
          recommended_fix: `Reduce ${stats.persona_name} persona weight or retrain its reasoning rules.`,
        });
      }
    }
    
    return outliers;
  }
  
  /**
   * Failure Mode 6: Formulas optimal for one region, fail in another
   */
  private detect_regional_drift(): FailureSignature[] {
    const drift: FailureSignature[] = [];
    const regional_formula_stats = this.calculate_regional_formula_statistics();
    
    for (const [region_id, region_stats] of regional_formula_stats.entries()) {
      for (const [formula_id, stats] of region_stats.entries()) {
        if (stats.failure_rate > 0.4) {
          // This formula is failing in this region
          drift.push({
            failure_type: 'regional_drift',
            severity: stats.failure_rate,
            affected_component: `${formula_id}_in_${region_id}`,
            trajectory_ids: stats.failed_trajectory_ids,
            frequency: stats.total_uses,
            pattern_description: `${formula_id} fails ${(stats.failure_rate * 100).toFixed(1)}% of time in ${region_id}`,
            recommended_fix: `Add regional calibration factor for ${formula_id} in ${region_id}.`,
          });
        }
      }
    }
    
    return drift;
  }
  
  /**
   * Failure Mode 7: Sector where formulas consistently underperform
   */
  private detect_sector_blind_spots(): FailureSignature[] {
    const blind_spots: FailureSignature[] = [];
    const sector_success_rates = this.calculate_sector_success_rates();
    
    for (const [sector, stats] of sector_success_rates.entries()) {
      if (stats.success_rate < 0.6) {
        blind_spots.push({
          failure_type: 'sector_blind_spot',
          severity: 1.0 - stats.success_rate,
          affected_component: `${sector}_sector`,
          trajectory_ids: stats.trajectory_ids,
          frequency: stats.total_analyses,
          pattern_description: `${sector} sector has only ${(stats.success_rate * 100).toFixed(1)}% success rate (${stats.total_analyses} cases)`,
          recommended_fix: `Add sector-specific formulas or layers for ${sector}. May need domain expert knowledge.`,
        });
      }
    }
    
    return blind_spots;
  }
  
  // ===== Helper Methods =====
  
  private aggregate_failures_by_component(
    failures: FailureSignature[]
  ): FailureSignature[] {
    const aggregated = new Map<string, FailureSignature>();
    
    for (const failure of failures) {
      const existing = aggregated.get(failure.affected_component);
      if (existing) {
        existing.trajectory_ids.push(...failure.trajectory_ids);
        existing.frequency += failure.frequency;
        existing.severity = Math.max(existing.severity, failure.severity);
      } else {
        aggregated.set(failure.affected_component, failure);
      }
    }
    
    return Array.from(aggregated.values());
  }
  
  private calculate_formula_statistics(): Map<string, { mean: number; std_dev: number }> {
    const stats = new Map<string, number[]>();
    
    for (const traj of this.trajectories) {
      for (const formula of traj.formula_results) {
        if (!stats.has(formula.formula_id)) {
          stats.set(formula.formula_id, []);
        }
        stats.get(formula.formula_id)!.push(formula.output);
      }
    }
    
    const result = new Map<string, { mean: number; std_dev: number }>();
    for (const [formula_id, outputs] of stats.entries()) {
      const mean = outputs.reduce((a, b) => a + b, 0) / outputs.length;
      const variance =
        outputs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        outputs.length;
      const std_dev = Math.sqrt(variance);
      result.set(formula_id, { mean, std_dev });
    }
    
    return result;
  }
  
  private calculate_persona_accuracy(): Map<
    string,
    {
      persona_name: string;
      accuracy: number;
      votes_cast: number;
      trajectory_ids: string[];
    }
  > {
    const persona_stats = new Map<
      string,
      {
        correct: number;
        total: number;
        trajectory_ids: string[];
      }
    >();
    
    for (const traj of this.trajectories) {
      if (!traj.ground_truth || !traj.debate) continue;
      
      for (const vote of traj.debate.votes) {
        if (!persona_stats.has(vote.persona_id)) {
          persona_stats.set(vote.persona_id, {
            correct: 0,
            total: 0,
            trajectory_ids: [],
          });
        }
        
        const stats = persona_stats.get(vote.persona_id)!;
        stats.total += 1;
        stats.trajectory_ids.push(traj.session_id);
        
        // If persona recommended success and outcome was success, they were right
        if (
          (vote.recommendation.toLowerCase().includes('proceed') ||
            vote.recommendation.toLowerCase().includes('accept')) &&
          traj.ground_truth.success
        ) {
          stats.correct += 1;
        }
      }
    }
    
    const result = new Map<string, any>();
    for (const [persona_id, stats] of persona_stats.entries()) {
      const persona_name = this.get_persona_name(persona_id);
      result.set(persona_id, {
        persona_name,
        accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
        votes_cast: stats.total,
        trajectory_ids: stats.trajectory_ids,
      });
    }
    
    return result;
  }
  
  private get_persona_name(persona_id: string): string {
    const names: Record<string, string> = {
      skeptic: 'Skeptic',
      advocate: 'Advocate',
      regulator: 'Regulator',
      accountant: 'Accountant',
      operator: 'Operator',
    };
    return names[persona_id.toLowerCase()] || persona_id;
  }
  
  private calculate_regional_formula_statistics(): Map<
    string,
    Map<
      string,
      { failure_rate: number; failed_trajectory_ids: string[]; total_uses: number }
    >
  > {
    const regional_stats = new Map<
      string,
      Map<
        string,
        { failures: number; total: number; failed_trajectory_ids: string[] }
      >
    >();
    
    for (const traj of this.trajectories) {
      if (!traj.region_id || !traj.ground_truth) continue;
      
      if (!regional_stats.has(traj.region_id)) {
        regional_stats.set(traj.region_id, new Map());
      }
      
      const region_formulas = regional_stats.get(traj.region_id)!;
      
      for (const formula of traj.formula_results) {
        if (!region_formulas.has(formula.formula_id)) {
          region_formulas.set(formula.formula_id, {
            failures: 0,
            total: 0,
            failed_trajectory_ids: [],
          });
        }
        
        const stats = region_formulas.get(formula.formula_id)!;
        stats.total += 1;
        if (!traj.ground_truth.success) {
          stats.failures += 1;
          stats.failed_trajectory_ids.push(traj.session_id);
        }
      }
    }
    
    // Convert to output format
    const result = new Map<
      string,
      Map<
        string,
        { failure_rate: number; failed_trajectory_ids: string[]; total_uses: number }
      >
    >();
    
    for (const [region_id, formulas] of regional_stats.entries()) {
      const output_map = new Map<
        string,
        { failure_rate: number; failed_trajectory_ids: string[]; total_uses: number }
      >();
      
      for (const [formula_id, stats] of formulas.entries()) {
        output_map.set(formula_id, {
          failure_rate: stats.total > 0 ? stats.failures / stats.total : 0,
          failed_trajectory_ids: stats.failed_trajectory_ids,
          total_uses: stats.total,
        });
      }
      
      result.set(region_id, output_map);
    }
    
    return result;
  }
  
  private calculate_sector_success_rates(): Map<
    string,
    {
      success_rate: number;
      trajectory_ids: string[];
      total_analyses: number;
    }
  > {
    const sector_stats = new Map<
      string,
      { successes: number; total: number; trajectory_ids: string[] }
    >();
    
    for (const traj of this.trajectories) {
      if (!traj.ground_truth) continue;
      
      const sector = traj.input.sector;
      if (!sector_stats.has(sector)) {
        sector_stats.set(sector, { successes: 0, total: 0, trajectory_ids: [] });
      }
      
      const stats = sector_stats.get(sector)!;
      stats.total += 1;
      stats.trajectory_ids.push(traj.session_id);
      if (traj.ground_truth.success) {
        stats.successes += 1;
      }
    }
    
    const result = new Map<string, any>();
    for (const [sector, stats] of sector_stats.entries()) {
      result.set(sector, {
        success_rate: stats.total > 0 ? stats.successes / stats.total : 0,
        trajectory_ids: stats.trajectory_ids,
        total_analyses: stats.total,
      });
    }
    
    return result;
  }
}

export default NSILFailureDetector;
