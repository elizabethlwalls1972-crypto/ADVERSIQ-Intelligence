# ADVERSIQ Learning System: Problem-Solution Memory Engine

## Overview

The ADVERSIQ platform now includes a **persistent learning system** that transforms conversations into actionable knowledge. This implements the "continual improvement harness" core to the NSIL architecture.

### What Changed

Previously: Conversations happened, solutions were applied, but learning wasn't captured.

**Now**: Every problem, solution, and conversation outcome feeds a permanent knowledge base that:
- ✅ Identifies similar problems when new users encounter them
- ✅ Suggests proven solutions based on past effectiveness
- ✅ Tracks which solutions work best in specific sectors/regions
- ✅ Resets user sessions between people but **preserves all learning**
- ✅ Integrates learned patterns into the NSIL decision pipeline
- ✅ Allows users to save conversations for future reference

---

## Architecture: Six-Discipline Integration

### Core ADVERSIQ Components

| Component | Function | Integration with Memory |
|-----------|----------|------------------------|
| **Formal Logic** | SAT solver checks assumptions | Memory stores contradiction patterns |
| **Bayesian Statistics** | Five-persona debate engine | Memory tracks persona effectiveness by sector |
| **Decision Science** | 10-layer NSIL pipeline | Memory suggests formulas based on problem domain |
| **Cognitive Neuroscience** | Bias modeling | Memory detects if certain biases recur |
| **Financial Modelling** | 54+ proprietary formulas | Memory knows which formulas solved similar problems |
| **Software Architecture** | DAG scheduling + contracts | Memory integrates learned dependencies |

### New: Problem-Solution Memory Engine

```
User Input
    ↓
[Problem Detector] → Register Problem Pattern
    ↓
[Semantic Matcher] → Find Similar Past Problems (80%+ match)
    ↓
[Solution Suggester] → Retrieve Proven Solutions
    ↓
[NSIL Pipeline] (54+ formulas, 5 personas, SAT solver, etc.)
    ↓
[Outcome Recorder] → Update Solution Effectiveness
    ↓
[Knowledge Base] (persistent, sector-calibrated, user-resettable)
```

---

## How It Works

### Phase 1: Problem Recognition

When a user encounters an issue:

```bash
POST /api/memory/register-problem
{
  "domain": "coding",
  "pattern": "Import path resolution fails in TypeScript",
  "symptoms": [
    "ERR_MODULE_NOT_FOUND",
    "Cannot resolve module",
    "Relative path issues"
  ],
  "rootCauses": [
    "ESM vs CommonJS mismatch",
    "File extension omission",
    "Wrong relative path depth"
  ],
  "tags": ["typescript", "imports", "esm", "modules"]
}
```

**System Records:**
- Problem ID: `problem_1727394510_abc123def`
- Frequency: Now 1 (increments if seen again)
- Domain: "coding"
- First seen: 2026-05-30T07:49:37Z

### Phase 2: Solution Application

Once the problem is solved:

```bash
POST /api/memory/register-solution
{
  "problemId": "problem_1727394510_abc123def",
  "steps": [
    "Check file extension in import statement",
    "Verify tsconfig.json module resolution settings",
    "Ensure .js extension on ESM imports",
    "Rebuild TypeScript if using tsc"
  ],
  "formulasUsed": ["CRI", "SEAM"],  // NSIL formulas
  "timeToResolve": 180000,  // milliseconds
  "successRate": 1.0,  // 100%
  "evidence": [
    "TypeScript 5.0 ESM documentation",
    "Node.js ESM resolution algorithm",
    "Successful deployment in production"
  ],
  "applicableConditions": [
    "Node.js 18+",
    "TypeScript 4.7+",
    "package.json type: module"
  ]
}
```

**System Records:**
- Solution linked to problem
- Success rate: 100%
- Time estimate: 3 minutes
- Applicable sectors: All (default)

### Phase 3: Conversation Capture

User saves the entire conversation for learning:

```bash
POST /api/memory/save-conversation
{
  "userId": "user_12345",
  "title": "Fixed TypeScript import path resolution in Omni-Node",
  "tags": ["typescript", "imports", "module-resolution", "omni-node"],
  "messages": [
    {
      "role": "user",
      "content": "Getting ERR_MODULE_NOT_FOUND when importing QuorumGatekeeper",
      "timestamp": "2026-05-30T07:45:00Z"
    },
    {
      "role": "system",
      "content": "Found 3 similar past issues. Most common: ESM import syntax.",
      "timestamp": "2026-05-30T07:45:15Z",
      "metadata": {
        "matchScore": 0.92,
        "fromMemory": true
      }
    },
    {
      "role": "research",
      "content": "Cobb-Douglas production formula suggests... (formula suggestion)",
      "timestamp": "2026-05-30T07:46:00Z"
    }
  ],
  "problemsIdentified": ["problem_1727394510_abc123def"],
  "solutionsApplied": ["solution_1727394600_xyz789"],
  "outcome": "resolved",
  "learningsExtracted": [
    "ESM imports require .js extension in paths",
    "QuorumGatekeeper needed ../ai/ prefix from core/"
  ],
  "researchFindingsUsed": ["economics", "logistics"],
  "isPublic": true  // Can be shared for organizational learning
}
```

**System Records:**
- Conversation ID: `conv_1727395000_abc123xyz`
- User ID: `user_12345`
- 2 problems identified, 1 solution applied
- Outcome: RESOLVED
- 2 learnings extracted
- Shared status: PUBLIC (other teams can learn from this)

### Phase 4: Real-Time Learning

When the same user (or a different one) encounters a similar problem:

```bash
GET /api/memory/find-similar/coding?query=import%20path%20error&tags=typescript,modules
```

**System Returns:**

```json
{
  "matchesFound": 2,
  "matches": [
    {
      "problemId": "problem_1727394510_abc123def",
      "pattern": "Import path resolution fails in TypeScript",
      "matchScore": "92%",
      "solutions": 1,
      "successRate": "100%"
    },
    {
      "problemId": "problem_1727388000_older",
      "pattern": "ESM module not found error",
      "matchScore": "78%",
      "solutions": 1,
      "successRate": "85%"
    }
  ]
}
```

The system immediately suggests the proven solution from past experience.

### Phase 5: Outcome Feedback

After applying a solution, record real results:

```bash
POST /api/memory/update-outcome
{
  "solutionId": "solution_1727394600_xyz789",
  "succeeded": true,
  "sector": "technology",
  "actualTimeMs": 210000  // Took 3.5 minutes instead of 3
}
```

**System Updates:**
- Solution success rate: recalculates (was 100%, stays ~100% with new success)
- Sector effectiveness: technology sector now scores 1.0
- Time estimate: adjusted to 195 seconds (moving average)
- Application count: incremented to 2

---

## Memory Structure

### Problems Database (`data/memory/problems.jsonl`)

```json
{
  "id": "problem_1727394510_abc123def",
  "domain": "coding",
  "pattern": "Import path resolution fails in TypeScript",
  "symptoms": ["ERR_MODULE_NOT_FOUND", "Cannot resolve module", "Relative path issues"],
  "rootCauses": ["ESM vs CommonJS mismatch", "File extension omission", "Wrong relative path depth"],
  "tags": ["typescript", "imports", "esm", "modules"],
  "firstIdentified": "2026-05-30T07:45:00Z",
  "frequency": 3,
  "lastSeen": "2026-05-30T08:15:30Z"
}
```

### Solutions Database (`data/memory/solutions.jsonl`)

```json
{
  "problemId": "problem_1727394510_abc123def",
  "steps": ["Check file extension...", "Verify tsconfig.json...", ...],
  "formulasUsed": ["CRI", "SEAM"],
  "timeToResolve": 180000,
  "successRate": 0.967,
  "evidence": ["TypeScript docs", "Node.js spec", "Production deployment"],
  "applicableConditions": ["Node.js 18+", "TypeScript 4.7+", "ESM enabled"],
  "sectorApplicability": {
    "technology": 1.0,
    "finance": 0.85,
    "healthcare": 0.70
  },
  "lastApplied": "2026-05-30T08:15:30Z",
  "applicationCount": 3
}
```

### Conversations Database (`data/memory/conversations.jsonl`)

```json
{
  "id": "conv_1727395000_abc123xyz",
  "userId": "user_12345",
  "timestamp": "2026-05-30T07:45:00Z",
  "title": "Fixed TypeScript import path resolution",
  "tags": ["typescript", "imports", "module-resolution", "omni-node"],
  "messages": [...],
  "problemsIdentified": ["problem_1727394510_abc123def"],
  "solutionsApplied": ["solution_1727394600_xyz789"],
  "outcome": "resolved",
  "learningsExtracted": ["ESM imports require .js extension", ...],
  "researchFindingsUsed": ["economics", "logistics"],
  "isPublic": true
}
```

---

## API Reference

### Save Conversation

```bash
POST /api/memory/save-conversation
Content-Type: application/json

{
  "userId": "user_12345",
  "title": "Conversation title",
  "tags": ["tag1", "tag2"],
  "messages": [...],
  "problemsIdentified": ["problem_id1", "problem_id2"],
  "solutionsApplied": ["solution_id1"],
  "outcome": "resolved" | "partial" | "unresolved" | "escalated",
  "learningsExtracted": ["Learning 1", "Learning 2"],
  "researchFindingsUsed": ["domain1", "domain2"],
  "isPublic": true
}
```

### Register Problem

```bash
POST /api/memory/register-problem

{
  "domain": "coding" | "strategy" | "analysis" | "decision",
  "pattern": "Clear problem description",
  "symptoms": ["observable symptom 1", "symptom 2"],
  "rootCauses": ["root cause 1", "root cause 2"],
  "tags": ["semantic", "tags"]
}
```

### Register Solution

```bash
POST /api/memory/register-solution

{
  "problemId": "problem_xyz",
  "steps": ["Step 1", "Step 2", ...],
  "formulasUsed": ["CRI", "SEAM"],
  "timeToResolve": 180000,
  "successRate": 0.95,
  "evidence": ["reference 1", "reference 2"],
  "applicableConditions": ["condition 1", "condition 2"]
}
```

### Find Similar Problems

```bash
GET /api/memory/find-similar/coding?query=your%20problem&tags=tag1,tag2
```

Returns: Top 5 matching problems with match scores and solutions.

### Update Outcome

```bash
POST /api/memory/update-outcome

{
  "solutionId": "solution_xyz",
  "succeeded": true,
  "sector": "technology",
  "actualTimeMs": 210000
}
```

### Get Memory Stats

```bash
GET /api/memory/stats
```

Returns:
- Problems learned
- Solutions available
- Average success rate
- Most frequent problems

### Get User Conversation History

```bash
GET /api/memory/history/user_12345
```

Returns: All saved conversations for the user.

### Clear User Session

```bash
POST /api/memory/clear-session/user_12345
```

- Resets user's active conversations
- **Preserves all learned problems and solutions**
- Next user starts fresh but benefits from knowledge base

---

## Integration with NSIL Pipeline

### How Memory Improves Decisions

**Layer 0 (The Laws):** Memory suggests which formulas worked for similar problems.

```
Similar Problem Found (92% match)
→ Past Solution Used Formula: CRI, SEAM
→ System Instantiates Same Formulas First
→ DAG Scheduler Benefits from Known Dependencies
```

**Layer 2 (The Boardroom):** Memory adjusts persona weights by sector.

```
Persona Historical Effectiveness in Technology:
- Skeptic: 0.92 (reliable doubter in this sector)
- Advocate: 0.78 (sometimes over-optimistic)
- Regulator: 0.88 (usually correct on compliance)
- Accountant: 0.95 (most reliable for tech ROI)
- Operator: 0.85 (decent execution assessment)
```

**Layer 8 (The Trust Layer):** Memory provides Trust Score based on calibration.

```
Confidence Grade: A (92% match to past successful analysis)
Evidence Depth: 3 previous similar cases, all resolved
Persona Agreement: 4 of 5 agree (Skeptic has 8% doubt)
Uncertainty: "Sector-specific variance possible in healthcare"
Historical Calibration: "This type of decision was right 93% of the time"
```

---

## User Session Management

### Session Flow

```
NEW USER (Jane)
    ↓
[Jane starts conversation]
    ↓
[System suggests solutions from knowledge base]
    ↓
[Jane solves her problem and saves conversation]
    ↓
[System records Jane's problem, solution, learning]
    ↓
[Jane logs off]

NEW USER (Tom)
    ↓
[Tom starts conversation]
    ↓
[System finds 3 similar problems from Jane's and others' histories]
    ↓
[Tom benefits from proven solutions]
    ↓
[Memory base now has 4 problems, 6 solutions, 2 conversations]
    ↓
[Tom logs off]

JANE RETURNS
    ↓
[Jane logs in as user_12345]
    ↓
[Active conversations cleared (her session reset)]
    ↓
[Knowledge base untouched (still has all Jane + Tom + others' learnings)]
    ↓
[Jane immediately gets better suggestions due to accumulated knowledge]
```

---

## Example: From Conversation to Continuous Learning

### Day 1: Jane's Problem

**Jane:** "I'm getting ERR_MODULE_NOT_FOUND when importing QuorumGatekeeper"

**System:**
1. Registers problem: "Import path resolution fails in TypeScript"
2. Searches memory: No matches (first time)
3. Applies NSIL pipeline: SAT solver, 5-persona debate, formulas
4. Suggests solution: "Add .js extension to imports"

**Jane:** "That worked! Saves conversation"

**System:**
- Records problem (frequency: 1)
- Records solution (success rate: 100%)
- Saves conversation (tags: typescript, imports, modules)

---

### Day 2: Tom's Problem

**Tom:** "Getting module not found error in my TypeScript project"

**System:**
1. Searches memory: Finds Jane's problem (87% match)
2. **Immediately suggests:** "Add .js extension to imports" (proven successful)
3. Applies NSIL pipeline: Formulas suggested from Jane's case
4. Trust Score: "A grade - 87% match to past successful case"

**Tom:** "Fixed it! Thanks for the suggestion"

**System:**
- Updates problem frequency: 2
- Updates solution success rate: still 100% (Tom also succeeded)
- Saves Tom's conversation
- Notes: Tom's sector is "finance" - tracks finance-specific effectiveness

---

### Day 3: Jane Returns

**Jane:** (logs in, her session is cleared but knowledge base is intact)

**Jane:** "Now I need to debug the Morphic Field Engine"

**System:**
1. Clears Jane's active session (fresh start)
2. Maintains: 2 problems, 2 solutions, 2 conversations in memory
3. Deploys knowledge: Draws from both Jane's and Tom's learnings
4. System is smarter than it was on Day 1

---

## Benefits

| Benefit | Metric | Impact |
|---------|--------|--------|
| **Faster Problem Recognition** | 50-80% match on second occurrence | Solves recurring issues in seconds instead of hours |
| **Higher Success Rates** | Solutions refined by real outcomes | Success rate improves each application |
| **Sector Calibration** | Per-sector solution effectiveness | Finance solutions differ from tech solutions |
| **Lower Escalations** | Problems remembered reduce unknowns | Fewer "never seen this before" moments |
| **Knowledge Preservation** | User reset doesn't erase learning | New users benefit immediately |
| **Better Trust Signals** | Evidence-backed recommendations | Investors/stakeholders see proof of competence |
| **Continuous Improvement** | Outcome feedback loops | System gets smarter every day |

---

## Where This Fits in ADVERSIQ

```
Original NSIL (10 layers):
[SAT Solver] → [Debate] → [Formulas] → [Simulation] → [Bias Check] → 
[Ethics Gate] → [Twins] → [Trust Score] → [Self-Audit] → [Release]

Enhanced with Memory:
[SAT Solver] + Memory insights
↓
[Debate] + Memory-calibrated persona weights
↓
[Formulas] + Memory-suggested formula combinations
↓
[Simulation] + Memory-based scenario distribution
↓
... (enhanced at every layer)
↓
[Trust Score] + Memory-based confidence grading
↓
[Release] + Memory insights on similar past outcomes
```

---

## Files Modified

- `server/core/ProblemSolutionMemoryEngine.ts` - Core memory system (500+ lines)
- `server/routes/memory-learning.ts` - Memory API endpoints (300+ lines)
- `server/index.ts` - Integrated memory routes

## Files to Implement Next

- `components/ConversationSaver.tsx` - UI for saving conversations
- `components/SimilarProblemsPanel.tsx` - Display matching past problems
- `components/MemoryStats.tsx` - Show system knowledge base health
- `update-dashboard.ts` - Enhance all dashboards with memory awareness

---

## Testing the System

### Test 1: Save a Conversation

```bash
curl -X POST http://localhost:3004/api/memory/save-conversation \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "title": "Fixed import resolution",
    "tags": ["typescript", "imports"],
    "messages": [{"role": "user", "content": "Error..."}],
    "problemsIdentified": [],
    "outcome": "resolved"
  }'
```

### Test 2: Register Problem

```bash
curl -X POST http://localhost:3004/api/memory/register-problem \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "coding",
    "pattern": "Import path fails",
    "tags": ["typescript", "imports"]
  }'
```

### Test 3: Get Memory Stats

```bash
curl http://localhost:3004/api/memory/stats
```

Expected: Shows growing knowledge base size over time.

---

## The Vision

**Every conversation teaches the system.**
**Every problem solved improves future solutions.**
**Every user benefits from all previous users' learnings.**
**Sessions reset but knowledge persists.**

This is the "continual improvement harness" that makes ADVERSIQ truly autonomous — not just making better decisions, but **learning from every decision made**.

---

**ADVERSIQ Learning System v1.0**
*Six disciplines. One pipeline. Every outcome teaches.*
