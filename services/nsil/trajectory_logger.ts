/**
 * NSILTrajectoryLogger
 * 
 * Autonomous trajectory logging for NSIL brain refinement.
 * Records layer outputs, formula results, debate consensus, and ground truth outcomes.
 * 
 * This logger hooks into each stage of the NSIL intelligence pipeline and captures:
 * - Input data (client context, project parameters)
 * - Layer-by-layer outputs (17 layers of intelligence)
 * - Formula results (46 formulas computing indices)
 * - Debate consensus (5 personas voting on recommendations)
 * - Final recommendation output
 * - Ground truth outcome (what actually happened post-recommendation)
 * 
 * Trajectories are persisted to JSONL for analysis by NSILFailureDetector and NSILRefiner.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface LayerOutput {
  layer_id: string;
  layer_name: string;
  input: Record<string, any>;
  output: Record<string, any>;
  confidence: number;
  execution_time_ms: number;
  timestamp: string;
}

export interface FormulaResult {
  formula_id: string;
  formula_name: string;
  inputs: Record<string, number>;
  output: number;
  normalized_output: number; // 0-1 scale
  execution_time_ms: number;
  timestamp: string;
}

export interface DebateVote {
  persona_id: string;
  persona_name: string; // Skeptic, Advocate, Regulator, Accountant, Operator
  reasoning: string;
  recommendation: string;
  confidence: number;
  timestamp: string;
}

export interface NSILTrajectory {
  // Session metadata
  session_id: string;
  timestamp: string;
  region_id?: string;
  client_id?: string;
  
  // Input
  input: {
    project_type: string;
    sector: string;
    region: string;
    parameters: Record<string, any>;
  };
  
  // Layer-by-layer execution
  layer_outputs: LayerOutput[];
  
  // Formula calculations
  formula_results: FormulaResult[];
  
  // 46 proprietary indices (derived from formulas)
  indices: {
    core_indices: Record<string, number>; // 5 main indices
    derivative_indices: Record<string, number>; // 16 sub-indices
    risk_formulas: Record<string, number>; // 7 risk scores
    financial_metrics: Record<string, number>; // 6 financial scores
    operational_scores: Record<string, number>; // 6 operational scores
    market_formulas: Record<string, number>; // 5 market scores
    governance_metrics: Record<string, number>; // 9 governance scores
  };
  
  // Adversarial debate
  debate: {
    votes: DebateVote[];
    consensus: number; // 0-1, how much agreement
    dissent: DebateVote[]; // outlier votes
    timestamp: string;
  };
  
  // Final recommendation
  recommendation: {
    primary: string;
    secondary: string[];
    confidence: number;
    rationale: string;
    audit_trail: string[];
  };
  
  // Ground truth outcome (filled later when available)
  ground_truth?: {
    actual_outcome: string;
    success: boolean;
    quantitative_result?: number;
    timestamp: string;
    feedback: string;
  };
  
  // Execution metadata
  execution: {
    total_time_ms: number;
    layer_count: number;
    formula_count: number;
  };
}

export class NSILTrajectoryLogger {
  private trajectory_dir: string;
  private session_id: string;
  private current_trajectory: Partial<NSILTrajectory> = {};
  
  constructor(trajectory_dir: string = 'data/nsil_trajectories') {
    this.trajectory_dir = trajectory_dir;
    this.session_id = `nsil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure directory exists
    if (!fs.existsSync(trajectory_dir)) {
      fs.mkdirSync(trajectory_dir, { recursive: true });
    }
  }
  
  /**
   * Initialize a new trajectory for a consulting session
   */
  start_session(input: {
    project_type: string;
    sector: string;
    region: string;
    parameters: Record<string, any>;
    region_id?: string;
    client_id?: string;
  }): string {
    this.session_id = `nsil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.current_trajectory = {
      session_id: this.session_id,
      timestamp: new Date().toISOString(),
      region_id: input.region_id,
      client_id: input.client_id,
      input: {
        project_type: input.project_type,
        sector: input.sector,
        region: input.region,
        parameters: input.parameters,
      },
      layer_outputs: [],
      formula_results: [],
      indices: {
        core_indices: {},
        derivative_indices: {},
        risk_formulas: {},
        financial_metrics: {},
        operational_scores: {},
        market_formulas: {},
        governance_metrics: {},
      },
      debate: {
        votes: [],
        consensus: 0,
        dissent: [],
        timestamp: new Date().toISOString(),
      },
      recommendation: {
        primary: '',
        secondary: [],
        confidence: 0,
        rationale: '',
        audit_trail: [],
      },
      execution: {
        total_time_ms: 0,
        layer_count: 0,
        formula_count: 0,
      },
    };
    return this.session_id;
  }
  
  /**
   * Log output from a single NSIL layer
   */
  log_layer_output(layer: LayerOutput): void {
    if (this.current_trajectory.layer_outputs) {
      this.current_trajectory.layer_outputs.push(layer);
    }
  }
  
  /**
   * Log formula calculation result
   */
  log_formula_result(formula: FormulaResult): void {
    if (this.current_trajectory.formula_results) {
      this.current_trajectory.formula_results.push(formula);
    }
  }
  
  /**
   * Log all 46 proprietary indices after calculation
   */
  log_indices(indices: {
    core_indices: Record<string, number>;
    derivative_indices: Record<string, number>;
    risk_formulas: Record<string, number>;
    financial_metrics: Record<string, number>;
    operational_scores: Record<string, number>;
    market_formulas: Record<string, number>;
    governance_metrics: Record<string, number>;
  }): void {
    if (this.current_trajectory.indices) {
      this.current_trajectory.indices = indices;
    }
  }
  
  /**
   * Log debate results from 5 AI personas
   */
  log_debate_results(debate: {
    votes: DebateVote[];
    consensus: number;
    dissent: DebateVote[];
  }): void {
    if (this.current_trajectory.debate) {
      this.current_trajectory.debate = {
        votes: debate.votes,
        consensus: debate.consensus,
        dissent: debate.dissent,
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  /**
   * Log final recommendation
   */
  log_recommendation(recommendation: {
    primary: string;
    secondary: string[];
    confidence: number;
    rationale: string;
    audit_trail: string[];
  }): void {
    if (this.current_trajectory.recommendation) {
      this.current_trajectory.recommendation = recommendation;
    }
  }
  
  /**
   * Complete session with execution metadata
   */
  end_session(execution_time_ms: number): string {
    if (this.current_trajectory.execution) {
      this.current_trajectory.execution.total_time_ms = execution_time_ms;
      this.current_trajectory.execution.layer_count = 
        this.current_trajectory.layer_outputs?.length || 0;
      this.current_trajectory.execution.formula_count = 
        this.current_trajectory.formula_results?.length || 0;
    }
    
    // Persist trajectory to JSONL
    const trajectory_path = path.join(
      this.trajectory_dir,
      `nsil_trajectories.jsonl`
    );
    
    const trajectory_line = JSON.stringify(this.current_trajectory) + '\n';
    fs.appendFileSync(trajectory_path, trajectory_line);
    
    console.log(`Trajectory persisted: ${this.session_id}`);
    return this.session_id;
  }
  
  /**
   * Record ground truth outcome for a previous session (can be called weeks later)
   */
  record_ground_truth(session_id: string, outcome: {
    actual_outcome: string;
    success: boolean;
    quantitative_result?: number;
    feedback: string;
  }): void {
    const trajectory_path = path.join(
      this.trajectory_dir,
      `nsil_trajectories.jsonl`
    );
    
    // Read all trajectories
    const lines = fs.readFileSync(trajectory_path, 'utf-8').split('\n').filter(l => l);
    const trajectories = lines.map(l => JSON.parse(l));
    
    // Find and update matching session
    const trajectory = trajectories.find(t => t.session_id === session_id);
    if (!trajectory) {
      console.error(`Session ${session_id} not found`);
      return;
    }
    
    trajectory.ground_truth = {
      actual_outcome: outcome.actual_outcome,
      success: outcome.success,
      quantitative_result: outcome.quantitative_result,
      timestamp: new Date().toISOString(),
      feedback: outcome.feedback,
    };
    
    // Write back
    const updated_lines = trajectories.map(t => JSON.stringify(t) + '\n');
    fs.writeFileSync(trajectory_path, updated_lines.join(''));
    
    console.log(`Ground truth recorded for ${session_id}`);
  }
  
  /**
   * Get current session ID
   */
  get_session_id(): string {
    return this.session_id;
  }
  
  /**
   * Fetch all trajectories (for NSILFailureDetector analysis)
   */
  get_all_trajectories(): NSILTrajectory[] {
    const trajectory_path = path.join(
      this.trajectory_dir,
      `nsil_trajectories.jsonl`
    );
    
    if (!fs.existsSync(trajectory_path)) {
      return [];
    }
    
    const lines = fs.readFileSync(trajectory_path, 'utf-8').split('\n').filter(l => l);
    return lines.map(l => JSON.parse(l) as NSILTrajectory);
  }
  
  /**
   * Fetch recent trajectories within a time window
   */
  get_recent_trajectories(window_ms: number = 86400000): NSILTrajectory[] {
    const now = Date.now();
    return this.get_all_trajectories().filter(t => {
      const trajectory_time = new Date(t.timestamp).getTime();
      return now - trajectory_time <= window_ms;
    });
  }
  
  /**
   * Fetch trajectories for a specific region (for regional analysis)
   */
  get_regional_trajectories(region_id: string): NSILTrajectory[] {
    return this.get_all_trajectories().filter(t => t.region_id === region_id);
  }
}

export default NSILTrajectoryLogger;
