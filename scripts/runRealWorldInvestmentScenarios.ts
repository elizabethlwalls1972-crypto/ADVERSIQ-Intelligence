import * as fs from 'fs';
import * as path from 'path';
import {
  REAL_WORLD_SCENARIOS,
  RealWorldScenarioRunner,
} from '../services/nsil/real_world_scenario_runner';

async function main(): Promise<void> {
  const outputDir = path.join('data', 'nsil_scenarios');
  const runner = new RealWorldScenarioRunner(outputDir);
  const selected = REAL_WORLD_SCENARIOS.filter((scenario) =>
    scenario.scenario_id === 'ph_pagadian_public_private_entry' ||
    scenario.sector.toLowerCase().includes('public-private') ||
    scenario.country === 'Philippines'
  ).slice(0, 3);

  const results = [];
  for (const scenario of selected) {
    const cycle = await runner.runCompleteLearningCycle(scenario);
    results.push({
      scenarioId: scenario.scenario_id,
      title: scenario.title,
      session1Confidence: cycle.session1.confidence_level,
      session2Confidence: cycle.session2.confidence_level,
      gateImproved: cycle.improvement.metrics_improved,
      confidenceImproved: cycle.improvement.confidence_improved,
      failuresDetected: cycle.refinement.failures_detected.length,
      promptEdits: cycle.refinement.harness_edits.orchestration_edits?.length ?? 0,
      formulaAdjustments: cycle.refinement.formula_adjustments.length,
      personaCalibrations: cycle.refinement.persona_calibrations.length,
      memoryPatternsAdded: cycle.refinement.memory_patterns_added.length,
      firstRecommendation: cycle.session2.analysis.proposed_interventions[0]?.title ?? 'No intervention generated',
      firstRisk: cycle.session2.analysis.risks[0] ?? 'No risk generated',
    });
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const outPath = path.join(outputDir, 'government-investment-scenario-summary.json');
  fs.writeFileSync(outPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    scenarioCount: results.length,
    results,
  }, null, 2), 'utf8');

  console.log(`Ran ${results.length} government/private investment scenario cycles.`);
  for (const result of results) {
    console.log(`${result.scenarioId}: confidence ${result.session1Confidence} -> ${result.session2Confidence}; first action: ${result.firstRecommendation}`);
  }
  console.log(`Summary: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
