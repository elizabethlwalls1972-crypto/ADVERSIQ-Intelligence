import * as fs from 'fs';
import * as path from 'path';
import { AutonomousInteractionLearner, type InteractionMode } from '../services/nsil/autonomous_interaction_learner';
import { deriveConsultantCapabilityProfile } from '../server/routes/consultantCapabilities';
import { runStrategicIntelligencePipeline } from '../server/routes/strategicIntelligencePipeline';
import { buildOverlookedIntelligenceSnapshot } from '../server/routes/overlookedFirstEngine';

interface StressScenario {
  id: string;
  expectedMode: InteractionMode;
  message: string;
  taskType: string;
  readinessScore: number;
  context?: unknown;
}

interface StressResult {
  id: string;
  expectedMode: InteractionMode;
  actualMode: InteractionMode;
  passed: boolean;
  confidence: number;
  readinessScore: number;
  gapCount: number;
  strategicReadiness: number;
  evidenceCredibility: number;
  directiveCount: number;
  tacticalProbeCount: number;
  simulatedOutcomeScore: number;
  issues: string[];
}

const sectors = ['healthcare', 'energy', 'infrastructure', 'fintech', 'agriculture', 'manufacturing', 'education', 'climate resilience'];
const countries = ['Philippines', 'Singapore', 'Australia', 'India', 'Indonesia', 'Vietnam', 'Kenya', 'Brazil', 'Chile', 'South Africa'];

const diagnosticSeeds = [
  'ADVERSIQ is not reading what I enter. Is this an API key issue or route wiring issue with live NSIL?',
  'The Decision Verification System responds like a generic chatbot instead of using my input.',
  'The intelligence panel says waiting, but I typed a full case. Find the configuration fault.',
  'Susan is not reacting to the user input and the continual harness does not seem live.',
];

const intakeSeeds = [
  'I have a possible government engagement and need to know what to do.',
  'We are looking at a partnership somewhere in Southeast Asia but the situation is still unclear.',
  'I need help turning a rough market idea into a proper decision case.',
  'A regional project is stuck and I need the OS to figure out what matters first.',
];

const decisionSeeds = [
  'Should we enter COUNTRY with a SECTOR partnership given regulatory and funding risk?',
  'Evaluate whether ORGANIZATION should proceed with a SECTOR investment in COUNTRY before the board meeting.',
  'Stress test this market entry decision for COUNTRY and identify contradictions before we commit capital.',
  'Verify the assumptions behind a government-backed SECTOR pilot in COUNTRY.',
];

const documentSeeds = [
  'Draft a board report for a COUNTRY SECTOR market entry decision.',
  'Prepare a ministerial briefing letter for our COUNTRY partnership proposal.',
  'Create a case study structure for a SECTOR investment in COUNTRY.',
  'Write a concise investor brief for a COUNTRY regional development opportunity.',
];

const directSeeds = [
  'What is the first practical step for a COUNTRY SECTOR market scan?',
  'Tell me briefly what risk matters most in COUNTRY for SECTOR.',
  'What should I ask a potential partner in COUNTRY?',
  'Give me a quick answer on whether SECTOR needs local approvals in COUNTRY.',
];

const pick = <T>(items: T[], index: number): T => items[index % items.length];

const expand = (template: string, index: number): string =>
  template
    .replace(/COUNTRY/g, pick(countries, index))
    .replace(/SECTOR/g, pick(sectors, index))
    .replace(/ORGANIZATION/g, `${pick(sectors, index)} Growth Authority`);

const scenarios: StressScenario[] = Array.from({ length: 100 }, (_, index) => {
  const bucket = index % 5;
  if (bucket === 0) {
    return {
      id: `diagnostic-${index + 1}`,
      expectedMode: 'diagnostic',
      message: expand(pick(diagnosticSeeds, index), index),
      taskType: 'risk_review',
      readinessScore: 25,
    };
  }
  if (bucket === 1) {
    return {
      id: `guided-${index + 1}`,
      expectedMode: 'guided_intake',
      message: expand(pick(intakeSeeds, index), index),
      taskType: 'general_assist',
      readinessScore: 15,
    };
  }
  if (bucket === 2) {
    return {
      id: `decision-${index + 1}`,
      expectedMode: 'decision_verification',
      message: expand(pick(decisionSeeds, index), index),
      taskType: 'risk_review',
      readinessScore: 72,
      context: {
        caseStudy: {
          country: pick(countries, index),
          organizationType: pick(sectors, index),
          objectives: `Make a go/no-go decision for ${pick(sectors, index)} in ${pick(countries, index)}`,
        },
      },
    };
  }
  if (bucket === 3) {
    return {
      id: `document-${index + 1}`,
      expectedMode: 'document_builder',
      message: expand(pick(documentSeeds, index), index),
      taskType: 'report_build',
      readinessScore: 68,
      context: {
        caseStudy: {
          country: pick(countries, index),
          targetAudience: 'board',
          currentMatter: expand(pick(documentSeeds, index), index),
        },
      },
    };
  }
  return {
    id: `direct-${index + 1}`,
    expectedMode: 'direct_answer',
    message: expand(pick(directSeeds, index), index),
    taskType: 'info_lookup',
    readinessScore: 55,
  };
});

const runId = `interaction-stress-100-${new Date().toISOString().replace(/[:.]/g, '-')}`;
const learner = new AutonomousInteractionLearner(path.join('data', 'interaction_stress_state', runId));
const results: StressResult[] = [];

for (const scenario of scenarios) {
  const capability = deriveConsultantCapabilityProfile(scenario.message, scenario.context);
  const strategic = runStrategicIntelligencePipeline(scenario.message, scenario.context);
  const overlooked = buildOverlookedIntelligenceSnapshot(scenario.message, scenario.context);
  const policy = learner.planTurn({
    message: scenario.message,
    taskType: scenario.taskType,
    intent: capability.mode,
    readinessScore: scenario.readinessScore,
    unresolvedGapCount: capability.gaps.length,
    context: scenario.context,
  });

  const issues: string[] = [];
  if (policy.mode !== scenario.expectedMode) issues.push(`mode:${policy.mode}!=${scenario.expectedMode}`);
  if (!policy.tacticalFrame.hypotheses.length) issues.push('missing_tactical_hypotheses');
  if (!policy.tacticalFrame.verificationChecks.length) issues.push('missing_verification_checks');
  if (policy.confidence < 0.35) issues.push('low_policy_confidence');
  if (policy.directives.length < 1) issues.push('missing_directives');

  const simulatedResponse = issues.length
    ? 'Let me know a bit more about what you are working on and I can help.'
    : `${policy.tacticalFrame.frame} ${policy.tacticalFrame.actions[0]} Verified against current case signals.`;

  learner.observeTurn({
    requestId: scenario.id,
    timestamp: new Date().toISOString(),
    message: scenario.message,
    response: simulatedResponse,
    taskType: scenario.taskType,
    intent: capability.mode,
    readinessScore: scenario.readinessScore,
    unresolvedGapCount: capability.gaps.length,
    provider: 'stress-harness',
    latencyMs: 250 + (scenario.id.length * 3),
    context: scenario.context,
  }, policy);

  results.push({
    id: scenario.id,
    expectedMode: scenario.expectedMode,
    actualMode: policy.mode,
    passed: issues.length === 0,
    confidence: Number(policy.confidence.toFixed(3)),
    readinessScore: scenario.readinessScore,
    gapCount: capability.gaps.length,
    strategicReadiness: strategic.readinessScore,
    evidenceCredibility: overlooked.evidenceCredibility,
    directiveCount: policy.directives.length,
    tacticalProbeCount: policy.tacticalFrame.probes.length,
    simulatedOutcomeScore: issues.length ? 0.42 : 0.86,
    issues,
  });
}

const passed = results.filter((item) => item.passed).length;
const modeFailures = results.filter((item) => item.actualMode !== item.expectedMode);
const avgConfidence = results.reduce((sum, item) => sum + item.confidence, 0) / results.length;
const byMode = results.reduce<Record<string, { total: number; passed: number }>>((acc, item) => {
  acc[item.expectedMode] ??= { total: 0, passed: 0 };
  acc[item.expectedMode].total += 1;
  if (item.passed) acc[item.expectedMode].passed += 1;
  return acc;
}, {});

const report = {
  runId,
  timestamp: new Date().toISOString(),
  total: results.length,
  passed,
  failed: results.length - passed,
  passRate: Number((passed / results.length).toFixed(3)),
  averagePolicyConfidence: Number(avgConfidence.toFixed(3)),
  modeFailures: modeFailures.map((item) => ({ id: item.id, expected: item.expectedMode, actual: item.actualMode, issues: item.issues })),
  byMode,
  learnerState: {
    observations: learner.getState().observations.length,
    learnedDirectives: learner.getState().learnedDirectives.length,
    policyWeights: learner.getState().policyWeights,
  },
  results,
};

fs.mkdirSync('test-results', { recursive: true });
const outPath = path.join('test-results', 'interaction-stress-100.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

console.log('\nADVERSIQ Interaction Stress 100');
console.log(`Passed: ${passed}/${results.length} (${(report.passRate * 100).toFixed(1)}%)`);
console.log(`Average policy confidence: ${report.averagePolicyConfidence}`);
console.log(`Learned directives: ${report.learnerState.learnedDirectives}`);
console.table(Object.entries(byMode).map(([mode, stats]) => ({
  mode,
  passed: stats.passed,
  total: stats.total,
  rate: `${((stats.passed / stats.total) * 100).toFixed(1)}%`,
})));
if (modeFailures.length) {
  console.log('\nMode failures:');
  for (const failure of modeFailures.slice(0, 10)) {
    console.log(`- ${failure.id}: expected ${failure.expectedMode}, got ${failure.actualMode} (${failure.issues.join(', ')})`);
  }
}
console.log(`\nSaved: ${outPath}`);

if (report.passRate < 0.9) {
  process.exitCode = 1;
}
