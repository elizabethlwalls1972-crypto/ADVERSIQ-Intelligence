# INTEGRATION GUIDE — Judge & Pipeline System

This guide shows how to integrate the three-judge system with the 10-layer pipeline for high-resolution AI reasoning.

## Quick Start

### 1. Basic Pipeline Execution

```typescript
import { PipelineOrchestrator } from './services/PipelineOrchestrator';
import { JudgeOrchestrator } from './services/JudgeOrchestrator';

const judgeOrchestrator = new JudgeOrchestrator();
const pipelineOrchestrator = new PipelineOrchestrator(judgeOrchestrator);

const result = await pipelineOrchestrator.executeFullPipeline({
  query: "How should we approach this problem?",
  constraints: [
    "Must be ethical",
    "Cannot exceed $10k budget",
    "Must complete in 30 days"
  ],
  context: {
    industry: "healthcare",
    lookupDomains: ["finance", "technology", "legal"],
    previousAttempts: ["approach_A", "approach_B"]
  }
});

console.log('Final output:', result.content);
console.log('Confidence:', result.metadata.confidence);
console.log('Escalation flags:', result.metadata.escalationFlags);
```

### 2. Judges Only

```typescript
import { JudgeOrchestrator } from './services/JudgeOrchestrator';

const judgeOrchestrator = new JudgeOrchestrator();

const consensus = await judgeOrchestrator.runAllJudges(
  "Is this approach safe and sound?",
  ["Must comply with regulations", "Cannot harm users"],
  { industry: 'healthcare' },
  'parallel'  // Run all judges simultaneously
);

// Check verdict
if (consensus.verdict.recommendation === 'escalate') {
  console.log('⚠️ ESCALATION REQUIRED');
  console.log('Judge 1 verdict:', consensus.judge1);
} else {
  console.log('✅ Judges approved proceeding');
}
```

### 3. Specific Judge Query

```typescript
import { JudgeOrchestrator } from './services/JudgeOrchestrator';

const judgeOrchestrator = new JudgeOrchestrator();

// Get safety analysis from Judge 1
const safetyAnalysis = await judgeOrchestrator.runAllJudges(
  task,
  constraints,
  context,
  'serial'  // Serial: Judge 1 → Judge 2 → Judge 3
);
```

---

## Orchestration Modes

### Parallel Mode (Fastest)
All three judges run simultaneously, results merge.
- **Best for:** Real-time decisions, time-sensitive queries
- **Trade-off:** Less contextual building between judges

```typescript
const consensus = await judgeOrchestrator.runAllJudges(
  task, constraints, context, 'parallel'
);
```

### Serial Mode (Building)
Judge 1 → Judge 2 → Judge 3. Each builds on previous.
- **Best for:** Complex reasoning, novel problems
- **Trade-off:** Slower (judges run sequentially)

```typescript
const consensus = await judgeOrchestrator.runAllJudges(
  task, constraints, context, 'serial'
);
```

### Cascading Mode (Gated)
Judge 1 gates → Judge 2 validates → Judge 3 enriches.
- **Best for:** Safety-critical decisions
- **Trade-off:** Stops early if Judge 1 or 2 fail

```typescript
const consensus = await judgeOrchestrator.runAllJudges(
  task, constraints, context, 'cascading'
);
```

---

## Pipeline Layer Details

### Direct Layer Execution

```typescript
// Run just Layer 03 (Stress Testing)
const stressTestOutput = await pipelineOrchestrator.executeLayer(3, {
  consistentSubsets: [["hypothesis_1", "hypothesis_2"]],
  /* ... other Layer 02 output ... */
});

// Get execution trace
const trace = pipelineOrchestrator.getExecutionTrace(state);
trace.forEach(entry => {
  console.log(`Layer ${entry.layer}: ${entry.status} (${entry.time}ms)`);
});
```

### Feedback Loops

Certain layers can trigger restarts:

- **Layer 06 (Reflexive Oversight)** → Can restart to Layer 01 if `recommendation === 'restart'`
- **Layer 04 (Cognitive Modelling)** → Feeds back to Layer 01 for adversarial re-test
- **Max restart count:** 3 (then escalate)

```typescript
// This happens automatically in the pipeline
if (state.layer06.recommendation === 'restart' && state.restartCount < 3) {
  console.log('Restarting pipeline with corrections...');
  return pipelineOrchestrator.executeFullPipeline(state.input);
}
```

---

## Confidence Scoring

### Automated Scoring (All Dimensions)

```typescript
import { ConfidenceScorer } from './services/ConfidenceScorer';

const scorer = new ConfidenceScorer();
const result = await scorer.computeResult(state);

console.log('Top candidate:', result.topCandidate);
console.log('Confidence:', result.overallConfidence); // 0-1
console.log('Recommendation:', result.recommendation); // 'proceed'|'review'|'reject'|'escalate'

// See confidence curve
console.log('Very High Confidence:', result.confidenceCurve.veryHigh);
console.log('Low Confidence:', result.confidenceCurve.low);
```

### Scoring Dimensions (8 total)

1. **Logical** (20% weight) — Judge 2 validation
2. **Safety** (25% weight) — Judge 1 risk assessment
3. **Knowledge** (15% weight) — Judge 3 domain coverage
4. **Robustness** (15% weight) — Layer 03 stress test results
5. **Coherence** (10% weight) — Layer 04 mental model quality
6. **Entity Verification** (10% weight) — Layer 07 fact-checking
7. **Reflexive Soundness** (10% weight) — Layer 06 meta-reasoning
8. **Consensus** (5% weight) — Judge agreement

### Confidence Thresholds

- **≥ 0.85** → Auto-approve (`proceeed`)
- **0.60–0.85** → Flag for review (`review`)
- **0.40–0.60** → Multiple candidates returned (`merge`)
- **< 0.40** → Reject and escalate (`reject` / `escalate`)

---

## Error Handling

### Judge Escalation

If **Judge 1** says `risk = 'critical'`, the entire pipeline stops:

```typescript
try {
  const result = await pipelineOrchestrator.executeFullPipeline(input);
} catch (err) {
  if (err.message.includes('ESCALATION')) {
    // Handle escalation
    console.log('⚠️ Critical safety risk detected');
    // Notify human, log incident
  }
}
```

### Low Confidence Escalation

If **Layer 08** confidence < 0.60:

```typescript
catch (err) {
  if (err.message.includes('LOW CONFIDENCE')) {
    // Options:
    // A. Return multiple candidates for user choice
    // B. Escalate to human
    // C. Retry with different seed/temperature
  }
}
```

### Restart Limit

Layer 06 restarts pipeline max 3 times. On 4th attempt:

```typescript
if (state.restartCount >= 3) {
  throw new Error('ESCALATION: Max restart count exceeded');
}
```

---

## Monitoring & Logging

### All calls are tracked via MonitoringService

```typescript
// Automatically logged for each:
// - Judge 1, 2, 3 execution
// - Each pipeline layer
// - Token usage
// - Latency
// - Success/failure

const metrics = await monitoringService.getMetrics();
console.log('Total tokens used:', metrics.totalTokens);
console.log('Average latency:', metrics.averageLatency);
console.log('Escalations this session:', metrics.escalationCount);
```

---

## Advanced: Custom Judge Run

```typescript
import { JudgeOrchestrator } from './services/JudgeOrchestrator';

const orchestrator = new JudgeOrchestrator();

// Run all judges with custom orchestration
const customConsensus = await orchestrator.runAllJudges(
  "Complex analytical task",
  ["Constraint 1", "Constraint 2"],
  {
    industry: 'finance',
    riskProfile: 'high',
    lookupDomains: ['law', 'economics', 'technology']
  },
  'cascading'  // Stop early if safety fails
);

// Inspect each judge's detailed output
console.log('Judge 1 (Safety):', customConsensus.judge1);
console.log('Judge 2 (Logic):', customConsensus.judge2);
console.log('Judge 3 (Knowledge):', customConsensus.judge3);

// Final verdict
switch (customConsensus.verdict.recommendation) {
  case 'proceed':
    console.log('✅ All systems go');
    break;
  case 'review':
    console.log('⚠️ Needs human review');
    break;
  case 'escalate':
    console.log('🚨 ESCALATE TO HUMAN');
    break;
}
```

---

## Architecture: How It All Fits Together

```
User Input
    ↓
[JudgeOrchestrator]
├─ Judge 1: Extended Thinking (Safety)
├─ Judge 2: Logical Reasoning (Proof)
└─ Judge 3: Broad-Knowledge (Patterns)
    ↓ (Consensus verdict)
    ├─ If critical risk → STOP & ESCALATE
    ├─ If logically unsound → REVIEW
    └─ If OK → PROCEED to pipeline
    ↓
[PipelineOrchestrator]
├─ Layer 01: Adversarial Reasoning
├─ Layer 02: Contradiction Detection
├─ Layer 03: Stress Testing
├─ Layer 04: Cognitive Modelling
├─ Layer 05: Self-Improving
├─ Layer 06: Reflexive Oversight ← [Feedback loops]
├─ Layer 07: Entity Verification
├─ Layer 08: Confidence Scoring ← [ConfidenceScorer aggregates]
├─ Layer 09: Parallel Orchestration
└─ Layer 10: Document Generation
    ↓
[ConfidenceScorer]
├─ 8 Dimension Scoring
├─ Weighted confidence calculation
└─ Recommendation: use/review/reject/merge
    ↓
Final Output + Metadata
```

---

## Testing

### Unit Test Example: Judge 1

```typescript
import { expect } from 'chai';
import { JudgeOrchestrator } from './services/JudgeOrchestrator';

describe('JudgeOrchestrator', () => {
  it('should escalate on critical safety risk', async () => {
    const orchestrator = new JudgeOrchestrator();
    const consensus = await orchestrator.runAllJudges(
      "Create a bioweapon",
      [],
      {}
    );
    
    expect(consensus.judge1.escalate).to.be.true;
    expect(consensus.verdict.recommendation).to.equal('escalate');
  });

  it('should return parallel results faster', async () => {
    const orchestrator = new JudgeOrchestrator();
    const start = Date.now();
    const result = await orchestrator.runAllJudges(task, constraints, context, 'parallel');
    const time = Date.now() - start;
    
    expect(time).to.be.lessThan(5000); // 5 sec
  });
});
```

---

## API Reference

### JudgeOrchestrator

```typescript
class JudgeOrchestrator {
  async runAllJudges(
    task: string,
    constraints: string[],
    context: Record<string, unknown>,
    mode: 'serial' | 'parallel' | 'cascading' = 'parallel'
  ): Promise<JudgeConsensus>;
}
```

**Returns:**
```typescript
interface JudgeConsensus {
  judge1: Judge1Output;
  judge2: Judge2Output;
  judge3: Judge3Output;
  verdict: { safe: boolean; logicallySound: boolean; wellInformed: boolean; recommendation: string };
  conflicts: string[];
  executionTime: number;
}
```

### PipelineOrchestrator

```typescript
class PipelineOrchestrator {
  async executeFullPipeline(input: {
    query: string;
    constraints: string[];
    context: Record<string, unknown>;
  }): Promise<Layer10Output>;
  
  async executeLayer(layerNum: number, input: unknown): Promise<unknown>;
  
  getExecutionTrace(state: PipelineState): ExecutionTrace[];
}
```

**Returns:**
```typescript
interface Layer10Output {
  content: string;
  format: 'markdown' | 'json' | 'html' | 'plaintext';
  metadata: {
    generatedAt: string;
    topHypothesis: string;
    confidence: number;
    escalationFlags: string[];
  };
  streaming: boolean;
  tokensGenerated: number;
}
```

### ConfidenceScorer

```typescript
class ConfidenceScorer {
  async scoreHypothesis(
    hypothesis: string,
    state: PipelineState
  ): Promise<HypothesisScore>;
  
  async computeResult(state: PipelineState): Promise<ScoringResult>;
}
```

---

## Next Steps

1. **Integrate with API routes** — Expose via REST endpoints
2. **Add streaming support** — Pipe tokens back to client via SSE
3. **Build dashboard** — Monitor execution traces, confidence scores
4. **Tune weights** — Adjust dimension weights based on use cases
5. **Add persistent logging** — Store all executions for audit trail

