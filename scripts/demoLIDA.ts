import * as LIDAControllerModule from '../server/core/LIDAController.js';
import * as UniversalInputProcessorModule from '../server/core/UniversalInputProcessor.js';
import * as SelfAuditingKnowledgeModule from '../server/core/SelfAuditingKnowledge.js';
import * as HistoricalParallelMatcherModule from '../server/core/HistoricalParallelMatcher.js';
import * as FailurePatternRecognizerModule from '../server/core/FailurePatternRecognizer.js';
import * as OSMorphologyGraphModule from '../server/core/OSMorphologyGraph.js';
import * as SelfEvolvingAlgorithmEngineModule from '../server/core/SelfEvolvingAlgorithmEngine.js';

const LIDAController = LIDAControllerModule.default || LIDAControllerModule.LIDAController;
const UniversalInputProcessor = UniversalInputProcessorModule.default || UniversalInputProcessorModule.UniversalInputProcessor;
const SelfAuditingKnowledge = SelfAuditingKnowledgeModule.default || SelfAuditingKnowledgeModule.SelfAuditingKnowledge;
const HistoricalParallelMatcher = HistoricalParallelMatcherModule.default || HistoricalParallelMatcherModule.HistoricalParallelMatcher;
const FailurePatternRecognizer = FailurePatternRecognizerModule.default || FailurePatternRecognizerModule.FailurePatternRecognizer;
const OSMorphologyGraph = OSMorphologyGraphModule.default || OSMorphologyGraphModule.OSMorphologyGraph;
const SelfEvolvingAlgorithmEngine = SelfEvolvingAlgorithmEngineModule.default || SelfEvolvingAlgorithmEngineModule.SelfEvolvingAlgorithmEngine;

console.log('LIDAController:', typeof LIDAController);
console.log('UniversalInputProcessor:', typeof UniversalInputProcessor);
console.log('SelfAuditingKnowledge:', typeof SelfAuditingKnowledge);
console.log('HistoricalParallelMatcher:', typeof HistoricalParallelMatcher);
console.log('FailurePatternRecognizer:', typeof FailurePatternRecognizer);
console.log('OSMorphologyGraph:', typeof OSMorphologyGraph);
console.log('SelfEvolvingAlgorithmEngine:', typeof SelfEvolvingAlgorithmEngine);

async function runDemo() {
  console.log('═'.repeat(70));
  console.log('ADVERSIQ LIDA Cognitive Architecture - Demo');
  console.log('Stan Franklin 2007 AGI Foundation Applied to Strategic Intelligence');
  console.log('═'.repeat(70));
  console.log();

  const lida = new LIDAController();
  const inputProcessor = new UniversalInputProcessor();
  const selfAudit = new SelfAuditingKnowledge();
  const historical = new HistoricalParallelMatcher();
  const failure = new FailurePatternRecognizer();
  const morphology = new OSMorphologyGraph();
  const evolving = new SelfEvolvingAlgorithmEngine([]);

  // Seed some historical cases
  await historical.addHistoricalCase({
    domain: 'technology',
    description: 'Building a cloud platform in a new market',
    actions: ['market research', 'local partnerships', 'regulatory compliance'],
    outcomes: { result: 'success', revenue: '$50M ARR' },
    successMetric: 0.85,
    context: { region: 'Asia-Pacific', industry: 'Technology' },
  });

  await historical.addHistoricalCase({
    domain: 'healthcare',
    description: 'Launching telehealth services in rural areas',
    actions: ['infrastructure investment', 'local talent acquisition', 'government partnerships'],
    outcomes: { result: 'partial_success', revenue: '$12M ARR' },
    successMetric: 0.55,
    context: { region: 'Sub-Saharan Africa', industry: 'Healthcare' },
  });

  await historical.addHistoricalCase({
    domain: 'finance',
    description: 'Digital banking expansion into emerging markets',
    actions: ['regulatory navigation', 'mobile-first design', 'agent network'],
    outcomes: { result: 'failure', revenue: '$0' },
    successMetric: 0.15,
    context: { region: 'Latin America', industry: 'Financial Services' },
  });

  // Seed a failure case
  await failure.addFailureCase({
    domain: 'technology',
    action: 'Launch without regulatory compliance',
    expectedOutcome: 'Fast market entry',
    actualOutcome: 'Banned from market, $20M loss',
    failureMode: 'Regulatory blindspot',
    lesson: 'Always map regulatory landscape before market entry',
  });

  // Build morphology graph
  morphology.addNode({ id: 'lida', type: 'controller', label: 'LIDA Controller', activity: 1.0 });
  morphology.addNode({ id: 'input', type: 'module', label: 'Input Processor', activity: 0.9 });
  morphology.addNode({ id: 'audit', type: 'module', label: 'Self Audit', activity: 0.8 });
  morphology.addNode({ id: 'memory', type: 'module', label: 'Episodic Memory', activity: 0.7 });
  morphology.addNode({ id: 'action', type: 'module', label: 'Action Selection', activity: 0.85 });
  morphology.addEdge('lida', 'input', 0.9);
  morphology.addEdge('lida', 'audit', 0.8);
  morphology.addEdge('lida', 'memory', 0.7);
  morphology.addEdge('lida', 'action', 0.85);
  morphology.evolve();

  // Run demo scenarios
  const scenarios = [
    'We need to expand our cloud platform into the Southeast Asian market',
    'Launching a telehealth service in rural Kenya',
    'Building a digital banking solution for Latin America',
  ];

  for (const scenario of scenarios) {
    console.log('─'.repeat(70));
    console.log(`SCENARIO: ${scenario}`);
    console.log('─'.repeat(70));

    // Step 1: Universal Input Processing
    const parsed = await inputProcessor.processInput(scenario);
    console.log(`[INPUT] Domain: ${parsed.domain} | Language: ${parsed.language} | Urgency: ${(parsed.urgency ?? 0).toFixed(2)} | Confidence: ${(parsed.confidence ?? 0).toFixed(2)}`);

    // Step 2: Self-Auditing Knowledge
    const audit = await selfAudit.auditKnowledge(scenario);
    console.log(`[AUDIT] Known: ${audit.known} | Confidence: ${audit.confidence.toFixed(2)} | Gaps: ${audit.gaps.length}`);

    // Step 3: LIDA Cognitive Cycle
    const cycle = await lida.runCycle(scenario);
    console.log(`[LIDA] Cycle #${cycle.cycleNumber} | Conscious: ${cycle.consciousContent?.ignition ? 'IGNITION' : 'no ignition'} | Action: ${cycle.selectedAction?.name || 'none'}`);

    // Step 4: Historical Parallels
    const parallels = await historical.findParallels(scenario, 2);
    console.log(`[HISTORY] Found ${parallels.length} parallels:`);
    for (const p of parallels) {
      console.log(`  - ${p.case.description} (similarity: ${p.similarity.toFixed(2)}, applicability: ${p.applicability}%)`);
    }

    // Step 5: Failure Risk
    const risk = await failure.getFailureRisk({ actions: [scenario] });
    console.log(`[FAILURE] Risk: ${risk.risk.toFixed(2)} | Patterns: ${risk.patterns.length} | Mitigations: ${risk.mitigations.length}`);

    console.log();
  }

  // System status
  console.log('═'.repeat(70));
  console.log('SYSTEM STATUS');
  console.log('═'.repeat(70));
  console.log(`LIDA Cycles: ${lida.getCycleCount()}`);
  console.log(`Inputs Processed: ${inputProcessor.getProcessedCount()}`);
  console.log(`Historical Cases: ${historical.getCaseCount()}`);
  console.log(`Failure Patterns: ${failure.getPatternCount()}`);
  console.log(`Morphology Nodes: ${morphology.getNodeCount()}`);
  console.log(`Morphology Edges: ${morphology.getEdgeCount()}`);
  console.log(`Bottlenecks: ${morphology.getBottlenecks().length}`);

  const auditResult = await selfAudit.selfAudit();
  console.log(`Knowledge Coverage: ${(auditResult.coverage * 100).toFixed(1)}%`);
  console.log(`Knowledge Gaps: ${auditResult.gaps.length}`);

  console.log();
  console.log('═'.repeat(70));
  console.log('LIDA Cognitive Architecture: ONLINE');
  console.log('═'.repeat(70));
}

runDemo().catch(console.error);
