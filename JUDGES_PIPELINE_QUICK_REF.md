# QUICK REFERENCE — Judge & Pipeline System

## One-Liner Summary

**3 Judges (Safety, Logic, Knowledge) feed 10 Layers (Reasoning→Generation) through 8-dimensional Confidence Scoring.**

---

## Judge System (3 Judges)

### Judge 1: Extended Thinking (Safety)
```typescript
// What could go wrong?
const judge1 = await runJudge1({
  taskDescription: "...",
  constraints: ["...", "..."],
  contextBefore: "..."
});

// Output: riskLevel, edgeCases, assumptionsToVerify, safetyViolations, escalate
// Escalates if: critical risk detected
```

### Judge 2: Logical Reasoning (Proof)
```typescript
// Is this logically sound?
const judge2 = await runJudge2({
  claim: "...",
  premises: ["...", "..."],
  contextData: { ... }
});

// Output: isLogicallySound, proofSteps, fallaciesDetected, logicalGaps, reproduced
// Rejects if: fatal logical gaps found
```

### Judge 3: Broad-Knowledge (Patterns)
```typescript
// What have we missed? What worked elsewhere?
const judge3 = await runJudge3({
  problem: "...",
  knownApproaches: ["...", "..."],
  industry: "...",
  lookupDomains: ["...", "..."]
});

// Output: crossDomainPatterns, recommendedApproaches, missingPerspectives, novelInsights
// Enriches with: patterns from other domains
```

### Run All 3 Judges

```typescript
// Orchestration modes:
// 'parallel'  - Fast, all at once
// 'serial'    - Building, each builds on previous
// 'cascading' - Gated, stops early on failures

const consensus = await judgeOrchestrator.runAllJudges(
  task, constraints, context,
  'parallel'  // or 'serial' or 'cascading'
);

// consensus.verdict.recommendation: 'proceed'|'review'|'escalate'
// If escalate: STOP immediately
```

---

## 10-Layer Pipeline

```
Layer 01: Adversarial Reasoning → counterarguments, edge cases
          ↓
Layer 02: Contradiction Detection → resolve conflicts
          ↓
Layer 03: Stress Testing → test robustness
          ↓
Layer 04: Cognitive Modelling → build mental models ─────┐
          ↓                                                │
Layer 05: Self-Improving → propose improvements          │
          ↓                                                ↓
Layer 06: Reflexive Oversight → meta-reasoning ← Feedback (restart max 3×)
          ↓
Layer 07: Entity Verification → fact-check
          ↓
Layer 08: Confidence Scoring → 8-dimension aggregate
          ↓
Layer 09: Parallel Orchestration → prepare for generation
          ↓
Layer 10: Document Generation → final output
```

### Running Pipeline

```typescript
// Full pipeline (all 10 layers)
const result = await pipelineOrchestrator.executeFullPipeline({
  query: "...",
  constraints: ["...", "..."],
  context: { industry: "...", ... }
});

// result.content: string
// result.metadata.confidence: 0-1
// result.metadata.escalationFlags: string[]

// Single layer (diagnostic)
const layer03Output = await pipelineOrchestrator.executeLayer(3, input);
```

---

## Confidence Scoring (8 Dimensions)

### The 8 Dimensions

```
1. Logical       (20%) <- Judge 2 validation
2. Safety        (25%) <- Judge 1 assessment
3. Knowledge     (15%) <- Judge 3 coverage
4. Robustness    (15%) <- Layer 03 stress tests
5. Coherence     (10%) <- Layer 04 mental models
6. Entity Verify (10%) <- Layer 07 fact-check
7. Reflexive     (10%) <- Layer 06 meta-reasoning
8. Consensus      (5%) <- Judge agreement
```

### Score & Interpret

```typescript
const scores = await confidenceScorer.computeResult(state);

// Result:
// - overallConfidence: 0-1
// - topCandidate: string
// - recommendation: 'proceed'|'review'|'reject'|'escalate'
// - confidenceCurve: {veryLow, low, medium, high, veryHigh}

// Thresholds:
// >= 0.85 -> proceed (auto-approve)
// 0.60-0.85 -> review (flag for human)
// 0.40-0.60 -> merge (multiple candidates)
// < 0.40 -> reject/escalate

if (scores.overallConfidence < 0.60) {
  // Escalate or retry
}
```

---

## Failure Scenarios

### Judge 1 Says "CRITICAL"
```
-> STOP immediately
-> Escalate to human
-> Do NOT proceed to pipeline
```

### Judge 2 Says "Logically Unsound"
```
-> Pipeline proceeds with 'review' flag
-> Increase scrutiny in Layers 04-06
-> May escalate in Layer 08 if confidence too low
```

### Layer 06 Says "Restart"
```
-> Restart pipeline to Layer 01
-> Max 3 restarts per session
-> On 4th: ESCALATE
```

### Layer 08 Confidence < 0.60
```
-> Option A: Return multiple candidates
-> Option B: Escalate to human
-> Option C: Retry with different seed
```

---

## Integration Checklist

- [ ] Import JudgeOrchestrator
- [ ] Import PipelineOrchestrator
- [ ] Import ConfidenceScorer
- [ ] Configure gemmaService (GOOGLE_AI_API_KEY)
- [ ] Configure monitoringService
- [ ] Set up error handling (ESCALATION check)
- [ ] Add retry logic for low confidence
- [ ] Expose via REST API (optional)
- [ ] Set up monitoring dashboard
- [ ] Log all executions for audit

---

## File Reference

| File | Lines | Purpose |
|------|-------|---------|
| ARCHITECTURE_HIGH_RESOLUTION.md | 1200 | Full specification |
| INTEGRATION_GUIDE.md | 600 | How-to & examples |
| JudgeOrchestrator.ts | 500 | Judge implementation |
| PipelineOrchestrator.ts | 800 | Layer implementation |
| ConfidenceScorer.ts | 400 | Scoring logic |
| TRANSFORMATION_SUMMARY.md | 400 | Before/after overview |

---

## Copy-Paste Examples

### Full Pipeline (Simplest)
```typescript
const output = await pipelineOrchestrator.executeFullPipeline({
  query: "What should we do about X?",
  constraints: ["Must be ethical", "Budget < $10k"],
  context: { industry: 'healthcare' }
});
console.log(output.content); // Final answer
```

### Judges Only
```typescript
const consensus = await judgeOrchestrator.runAllJudges(
  "Is this approach safe?",
  ["Constraints..."],
  { industry: 'healthcare' },
  'parallel'
);
if (consensus.verdict.recommendation === 'escalate') {
  console.log('STOP');
}
```

### Check Confidence
```typescript
const scores = await confidenceScorer.computeResult(state);
console.log(`Confidence: ${scores.overallConfidence}`);
console.log(`Recommendation: ${scores.recommendation}`);
```

---

## Monitoring (Built-In)

All calls automatically logged:
```typescript
// No need to manually track -- it's automatic
// Access metrics:
const metrics = await monitoringService.getMetrics();
console.log(metrics.totalTokens);
console.log(metrics.averageLatency);
console.log(metrics.escalationCount);
```

---

## Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| ESCALATION: Critical safety risk | Judge 1 flag | Review constraint violations |
| LOW CONFIDENCE | Score < 0.60 | Retry with different context |
| Max restart count exceeded | Layer 06 loop limit | Check for circular logic |
| GOOGLE_AI_API_KEY not found | Env var missing | Set in .env file |
| Slow execution | All serial mode | Switch to 'parallel' |
| Multiple low-confidence candidates | No clear winner | Return top 3 for user choice |

---

## Weights Are Adjustable

Want to prioritize safety over speed?
```typescript
// Increase Judge 1 weight in ConfidenceScorer
scoreLogical(judge2, 0.15),   // was 0.2
scoreSafety(judge1, 0.35),    // was 0.25 -> increased
scoreKnowledge(judge3, 0.10), // was 0.15 -> decreased
// ... adjust others proportionally
```

---

## Activation Flow Summary

```
1. User Input
2. Judges (parallel/serial/cascading)
   - If critical risk -> STOP
3. Pipeline Layers 01-10
   - Layer 06 checks for restarts (max 3)
4. Confidence Scorer (8 dimensions)
   - If < 0.60 -> escalate or retry
5. Output + Metadata
```

---

## Success Criteria

Your system is working well when:

- Judge 1 escalations = rare (real issues only)
- Judge 2 logic errors = almost never found
- Judge 3 insights = found in 80%+ of tasks
- Layer restarts = < 5% of executions
- Final confidence >= 0.75 typically
- Token efficiency = good reasoning per token
- User satisfaction = high with results

---

Last Updated: 2026-04-16
Version: 1.0 (High Resolution)
