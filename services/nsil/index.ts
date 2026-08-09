/**
 * NSIL (Nexus System Intelligence Layer) - Autonomous Refinement Hub
 * 
 * Complete reset-free self-improving intelligence system for ADVERSIQ platform.
 * Applies Continual Harness framework (Karten et al., 2026) to regional development analysis.
 * 
 * Core Components:
 * 1. trajectory_logger.ts - Captures all layer outputs, formula results, debate votes, ground truth
 * 2. failure_detector.ts - Analyzes trajectories for 7 failure modes
 * 3. stores.ts - CRUD operations on formulas, layers, debate priors, memory
 * 4. nsil_refiner.ts - 4 independent evolution passes (orchestration, formulas, debate, memory)
 * 5. bootstrap_manager.ts - Saves/loads evolved state for regional warm-start
 * 6. regional_development_config.ts - Domain configuration for regional analysis
 * 
 * Integration Points:
 * - NSILIntelligenceHub.ts: Use NSILTrajectoryLogger to hook outputs
 * - ReportOrchestrator.ts: Trigger NSILRefiner after each consulting session
 * - GlobalCityIndex.ts: Leverage regional patterns from MemoryStore
 * - RegionalDevelopmentOrchestrator.ts: Load bootstrap bundles for warm-start
 * - RegionalIntelligenceAgent.ts: Use refined formulas automatically
 */

// Export all NSIL components
export { NSILTrajectoryLogger } from './trajectory_logger';
export type { NSILTrajectory } from './trajectory_logger';
export { NSILFailureDetector } from './failure_detector';
export type { FailureSignature } from './failure_detector';
export {
  BaseStore,
  FormulaStore,
  LayerStore,
  DebateStore,
  MemoryStore,
} from './stores';
export { NSILRefiner } from './nsil_refiner';
export type { HarnessEdits } from './nsil_refiner';
export { NSILBootstrapManager } from './bootstrap_manager';
export type { BootstrapBundle } from './bootstrap_manager';
export { LiveGlobalMatterRunner, runLiveGlobalMatters } from './live_global_matter_runner';
export type {
  LiveGlobalMatter,
  LiveGlobalMatterOptions,
  LiveGlobalMatterRun,
} from './live_global_matter_runner';
export { ContinualHarnessAdapter } from './continual_harness_adapter';
export type {
  ContinualHarnessAdaptation,
  ContinualHarnessState,
  HarnessMemoryState,
  HarnessPromptState,
  HarnessSkillState,
  HarnessSubagentState,
} from './continual_harness_adapter';
export { ContinualHarnessAuditor, runContinualHarnessAudit } from './continual_harness_auditor';
export type {
  AuditFinding,
  ContinualHarnessAuditOptions,
  ContinualHarnessAuditReport,
  HarnessCapabilityCheck,
} from './continual_harness_auditor';
export { AutonomousInteractionLearner, autonomousInteractionLearner } from './autonomous_interaction_learner';
export type {
  InteractionMode,
  InteractionObservation,
  InteractionPolicy,
  InteractionLearningState,
  TacticalInteractionFrame,
} from './autonomous_interaction_learner';
export { AutonomousResearchCognition, autonomousResearchCognition } from './autonomous_research_cognition';
export type {
  ResearchCognitionPlan,
  ResearchEvidenceBundle,
  ResearchQuestion,
} from './autonomous_research_cognition';
export { MoGenWiringTransformer } from './mogen_wiring_transformer';
export type {
  BrainWiringGraph,
  LocalGeometryContext,
  Point3D,
  TransformOptions,
  WiringAnomaly,
  WiringCondition,
  WiringEdge,
  WiringEdgeKind,
  WiringMorphologyMetrics,
  WiringNode,
  WiringNodeKind,
  WiringPoint,
  WiringTransformResult,
} from './mogen_wiring_transformer';
export {
  assessRuntimeOSMorphology,
  buildRuntimeOSGraph,
} from './os_morphology_runtime';
export type { RuntimeMorphologyInput } from './os_morphology_runtime';
export type {
  RegionalDevelopmentProfile,
  RegionalFailureMode,
  CrossSectoralSolution,
} from './regional_development_config';

/**
 * Example: Integrating NSIL into existing service
 * 
 * // In NSILIntelligenceHub.ts or similar:
 * import {
 *   NSILTrajectoryLogger,
 *   NSILFailureDetector,
 *   NSILRefiner,
 *   NSILBootstrapManager,
 * } from './nsil';
 * 
 * class NSILAutonomousRefinementEngine {
 *   private logger: NSILTrajectoryLogger;
 *   private bootstrap: NSILBootstrapManager;
 *   private refiner: NSILRefiner;
 *   private step_count = 0;
 *   
 *   async run_consulting_session(region_id: string, project: Project) {
 *     // Load warm-start bootstrap if available
 *     const bootstrap = this.bootstrap.load_bootstrap(region_id);
 *     
 *     // Start trajectory logging
 *     this.logger.start_session({
 *       region_id,
 *       sector: project.sector,
 *       ...project.params,
 *     });
 *     
 *     // Execute NSIL analysis (17 layers, 46 formulas, 5 personas, etc.)
 *     const start_time = Date.now();
 *     const result = await this.nsil_brain.analyze(project);
 *     const exec_time = Date.now() - start_time;
 *     
 *     // Log all outputs
 *     this.logger.log_layer_outputs(result.layer_outputs);
 *     this.logger.log_formula_results(result.formulas);
 *     this.logger.log_indices(result.indices);
 *     this.logger.log_debate_results(result.debate);
 *     this.logger.log_recommendation(result.recommendation);
 *     
 *     const session_id = this.logger.end_session(exec_time);
 *     
 *     // Adaptive refinement schedule (every F steps after warmup)
 *     this.step_count++;
 *     const trajectories = this.logger.get_all_trajectories();
 *     
 *     if (this.refiner.should_evolve(this.step_count)) {
 *       console.log('Triggering autonomous harness refinement...');
 *       
 *       // Run 4 independent evolution passes
 *       const edits = this.refiner.evolve(this.step_count, trajectories);
 *       
 *       // Edits apply immediately to next session
 *       console.log(`Applied ${edits.total_changes} harness edits`);
 *     }
 *     
 *     // Save evolved state periodically
 *     if (this.step_count % 10 === 0) {
 *       this.bootstrap.save_bootstrap(region_id, project.sector);
 *     }
 *     
 *     return { session_id, result, metrics: this.refiner.get_metrics() };
 *   }
 * }
 */
