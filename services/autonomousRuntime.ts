/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTONOMOUS RUNTIME BOOTSTRAP
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Single entry-point that activates all autonomous runtime services:
 *   - AutonomousScheduler    - timed task execution
 *   - MasterAutonomousOrchestrator - coordinates all sub-agents
 *   - AgentSpawner           - dynamic sub-agent creation
 *   - SelfFixingEngine       - error detection + auto-recovery
 *   - SelfImprovementEngine  - continuous self-upgrade
 *   - selfLearningEngine     - outcome tracking + weight adjustment
 *   - solveAndAct            - direct AI problem-solving client
 *   - MultiAgentOrchestrator - multi-agent consensus builder
 *
 * Call `initAutonomousRuntime()` once from App.tsx on mount.
 */

import { autonomousScheduler } from './AutonomousScheduler';
import { selfFixingEngine } from './SelfFixingEngine';
import { selfImprovementEngine, SelfImprovementEngine } from './SelfImprovementEngine';
import { selfLearningEngine } from './selfLearningEngine';
import { agentSpawner } from './AgentSpawner';
import { MasterAutonomousOrchestrator } from './MasterAutonomousOrchestrator';
import { solveAndAct } from './autonomousClient';
import { MultiAgentOrchestrator } from './MultiAgentBrainSystem';
import { narrativeSynthesisEngine } from './narrativeSynthesisEngine';
import OutcomeTracker from './OutcomeTracker';
import { loadData, saveData, autoSaveDraft } from './persistenceEngine';
import { DocumentTemplateService } from './DocumentTemplateService';
import { validateComprehensiveIntake } from './ComprehensiveIntakeValidation';
import InputShieldService from './InputShieldService';
import { enforceBounds, safeDivide } from './FormulaBoundsEngine';
import { validateField, validateStep } from './validationEngine';
import { MissingFormulasEngine } from './MissingFormulasEngine';

let _initialized = false;

/**
 * Bootstrap all autonomous services. Safe to call multiple times - idempotent.
 */
export function initAutonomousRuntime(): void {
  if (_initialized) return;
  _initialized = true;

  // 1. Scheduler - drives recurring autonomous tasks
  try {
    autonomousScheduler.start();
    console.log('[AutonomousRuntime] ✅ Scheduler started');
  } catch (e) {
    console.warn('[AutonomousRuntime] ⚠️ Scheduler start failed', e);
  }

  // 2. Master Orchestrator - lazy singleton, initializes sub-agents on demand
  try {
    const _orchestrator = MasterAutonomousOrchestrator.getInstance();
    void _orchestrator; // bound but not awaited at boot - activates on first report
    console.log('[AutonomousRuntime] ✅ MasterOrchestrator registered');
  } catch (e) {
    console.warn('[AutonomousRuntime] ⚠️ MasterOrchestrator init failed', e);
  }

  // 3. Register remaining singletons (activated via EventBus + direct calls)
  const registered = {
    selfFixingEngine,
    selfImprovementEngine,
    selfLearningEngine,
    agentSpawner,
    solveAndAct,
    MultiAgentOrchestrator,
    SelfImprovementEngine,
    narrativeSynthesisEngine,
    OutcomeTracker,
    DocumentTemplateService,
    InputShieldService,
    MissingFormulasEngine,
    // persistence & validation utilities
    loadData, saveData, autoSaveDraft,
    validateComprehensiveIntake,
    enforceBounds, safeDivide,
    validateField, validateStep,
  };

  console.log(
    `[AutonomousRuntime] ✅ ${Object.keys(registered).length + 2} autonomous services live:`,
    Object.keys(registered).concat(['autonomousScheduler', 'MasterAutonomousOrchestrator']).join(', ')
  );
}

export function isAutonomousRuntimeReady(): boolean {
  return _initialized;
}

// Re-export singletons for direct use elsewhere
export {
  autonomousScheduler,
  selfFixingEngine,
  selfImprovementEngine,
  selfLearningEngine,
  agentSpawner,
  MasterAutonomousOrchestrator,
};
