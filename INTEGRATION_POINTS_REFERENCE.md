# Integration Points: Where to Connect New Code to Existing NSIL

**Purpose**: Visual map showing exactly where each new Week 1 file hooks into your existing codebase

---

## Current Codebase Structure

```
services/
├── nsil/
│   ├── universal_input_processor.ts ✅ (400 lines - exists)
│   ├── self_audit_engine.ts ✅ (500 lines - exists)
│   ├── historical_development_analyzer.ts ✅ (450 lines - exists)
│   ├── human_failure_pattern_recognizer.ts ✅ (550 lines - exists)
│   ├── trajectory_logger.ts ✅ (450 lines - exists)
│   ├── failure_detector.ts ✅ (550 lines - exists)
│   ├── nsil_refiner.ts ✅ (550 lines - exists)
│   ├── bootstrap_manager.ts ✅ (550 lines - exists)
│   ├── stores.ts ✅ (Multi-file - exists)
│   └── global_nsil_orchestrator.ts ✅ (500 lines - exists)
├── NSILIntelligenceHub.ts ✅ (997 lines - exists, uses Gemini API)
├── ReportOrchestrator.ts ✅ (exists)
├── AIProviderOrchestrator.ts ✅ (existing cloud API wrapper)
│
├── OllamaBackendOrchestrator.ts 🆕 (NEW - Week 1)
├── LLMProviderUnifier.ts 🆕 (NEW - Week 1)
├── DocumentIngestEngine.ts 🆕 (NEW - Week 3)
├── IntakeProblemFlow.ts 🆕 (NEW - Week 3)
├── NSILContinualHarnessIntegration.ts 🆕 (NEW - Week 4)
├── WorkflowOrchestrator.ts 🆕 (NEW - Week 5)
└── Evolution/
    ├── EvolutionPass1-SystemPrompt.ts 🆕 (NEW - Week 4)
    ├── EvolutionPass2-SubAgents.ts 🆕 (NEW - Week 4)
    ├── EvolutionPass3-Formulas.ts 🆕 (NEW - Week 4)
    └── EvolutionPass4-Memory.ts 🆕 (NEW - Week 4)

server/
├── routes/
│   ├── ai.ts ✅ (exists - modify to use LLMProviderUnifier)
│   ├── workflow.ts 🆕 (NEW - Week 5)
│   ├── documents.ts 🆕 (NEW - Week 3)
│   └── intake.ts 🆕 (NEW - Week 3)
└── middleware/
    └── ollamaCheck.ts 🆕 (NEW - Week 1 optional)

components/
├── (120+ existing components) ✅
├── DocumentUploadPanel.tsx 🆕 (NEW - Week 3)
├── MultiTurnIntake.tsx 🆕 (NEW - Week 3)
├── NSILWorkflowPage.tsx 🆕 (NEW - Week 5)
├── LLMStatusBar.tsx 🆕 (NEW - Week 1 optional)
└── SystemLearningDashboard.tsx 🆕 (NEW - Week 5)
```

---

## WEEK 1: Integration Points (Ollama)

### Flow: Request → LLMProviderUnifier → OllamaBackendOrchestrator → Ollama

```
┌─────────────────────────────────────────────────────────┐
│ Your Existing Code                                      │
│ server/routes/ai.ts                                     │
│                                                         │
│ app.post('/api/ai/analyze', async (req, res) => {      │
│   const response = await callAI(prompt);               │
│   // ↓ CHANGE THIS LINE ↓                              │
│ });                                                     │
└─────────────────────────────────────────────────────────┘
                          ↕ (replace)
┌─────────────────────────────────────────────────────────┐
│ NEW CODE: services/LLMProviderUnifier.ts               │
│                                                         │
│ const response = await                                 │
│   LLMProviderUnifier.generate(prompt);                │
│                                                         │
│ // Automatically chooses Ollama or cloud fallback     │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│ NEW CODE: services/OllamaBackendOrchestrator.ts       │
│                                                         │
│ if (ollamaOrchestrator.isOllamaReady()) {             │
│   return await ollamaOrchestrator.generate(prompt);  │
│ } else {                                               │
│   // Fall back to cloud (AIProviderOrchestrator)      │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│ Local Ollama Instance                                   │
│ http://localhost:11434                                 │
│                                                         │
│ $ ollama serve                                          │
│                                                         │
│ POST /api/generate → Return text                        │
└─────────────────────────────────────────────────────────┘
```

### What to Modify in Existing Code

**File: `server/routes/ai.ts`**
```typescript
// BEFORE (current):
import { callAI } from '../services/AIProviderOrchestrator';

app.post('/api/ai/analyze', async (req, res) => {
  const response = await callAI(prompt); // ← Uses Gemini/Claude
  res.json(response);
});

// AFTER (Week 1):
import { LLMProviderUnifier } from '../services/LLMProviderUnifier';

app.post('/api/ai/analyze', async (req, res) => {
  const response = await LLMProviderUnifier.generate(prompt); // ← Tries Ollama, falls back
  res.json(response);
});

// NEW ENDPOINT (Week 1):
app.get('/api/system/llm-status', (req, res) => {
  res.json(LLMProviderUnifier.getSystemStatus());
});
```

**File: `server/routes/index.ts` (or main app setup)**
```typescript
// Add at startup:
import { ollamaOrchestrator } from '../services/OllamaBackendOrchestrator';

// Initialize Ollama when server starts
app.listen(3000, async () => {
  await ollamaOrchestrator.initialize();
  console.log('Server started, Ollama integration ready');
});
```

---

## WEEK 3: Integration Points (Document Intake)

### Flow: Document → DocumentIngestEngine → NSIL UniversalInputProcessor

```
┌──────────────────────────────┐
│ Frontend React Component      │
│ DocumentUploadPanel.tsx       │
│ (Drag-and-drop files)         │
└──────────────────────────────┘
           ↕
┌──────────────────────────────┐
│ API Route                     │
│ POST /api/documents/upload    │
│ server/routes/documents.ts    │
└──────────────────────────────┘
           ↕
┌──────────────────────────────────────────┐
│ NEW: DocumentIngestEngine.ts             │
│ - Parse PDF/Excel/Word/images            │
│ - Extract text, tables, entities         │
│ - Return structured DocumentData         │
└──────────────────────────────────────────┘
           ↕
┌──────────────────────────────────────────┐
│ EXISTING: UniversalInputProcessor        │
│ process_input(structured_document)       │
│ Returns: structured intent, entities     │
└──────────────────────────────────────────┘
           ↕
┌──────────────────────────────────────────┐
│ Rest of NSIL pipeline                    │
│ SelfAuditEngine → Analysis → Output      │
└──────────────────────────────────────────┘
```

### What to Modify in Existing Code

**File: `services/nsil/universal_input_processor.ts`**
```typescript
// EXISTING (lines 1-50):
export interface UniversalInput {
  source_type: 'text' | 'document' | 'image' | 'audio';
  metadata: InputMetadata;
  // ... existing fields
}

// ADD (new field):
export interface UniversalInput {
  source_type: 'text' | 'document' | 'image' | 'audio';
  metadata: InputMetadata;
  documents?: DocumentData[];  // ← NEW: from DocumentIngestEngine
  // ... rest of fields
}

// MODIFY process_input() to accept DocumentData:
async process_input(
  input: UniversalInput | string,
  documents?: DocumentData[]  // ← NEW parameter
): Promise<ProcessedInput> {
  // Extract text from documents if provided
  if (documents && documents.length > 0) {
    const documentText = this.mergeDocumentTexts(documents);
    input = `${input}\n\nSupporting Documents:\n${documentText}`;
  }
  
  // Rest of existing logic...
}
```

**File: `server/routes/documents.ts` (NEW)**
```typescript
import express from 'express';
import { DocumentIngestEngine } from '../services/DocumentIngestEngine';
import { UniversalInputProcessor } from '../services/nsil/universal_input_processor';

const router = express.Router();
const ingestEngine = new DocumentIngestEngine();
const inputProcessor = new UniversalInputProcessor();

router.post('/upload', async (req, res) => {
  try {
    const files = req.files; // Assuming multer middleware
    
    // Parse all documents
    const documentDatas = await Promise.all(
      files.map(file => ingestEngine.parseFile(file))
    );
    
    // Feed into NSIL
    const problem = req.body.problem_statement;
    const structuredInput = await inputProcessor.process_input(
      problem,
      documentDatas  // ← Pass parsed documents
    );
    
    res.json({
      success: true,
      input: structuredInput,
      documents_processed: documentDatas.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

---

## WEEK 4: Integration Points (Harness Evolution)

### Flow: NSIL Analysis → NSILTrajectoryLogger → NSILFailureDetector → NSILRefiner → Evolution Passes

```
┌──────────────────────────────────┐
│ GlobalNSILOrchestrator           │
│ solve_global_problem()           │
│ (existing NSIL 7-step flow)      │
└──────────────────────────────────┘
           ↕
┌──────────────────────────────────────────┐
│ EXISTING: NSILTrajectoryLogger           │
│ log_recommendation()                     │
│ (saves all outputs to JSONL)             │
└──────────────────────────────────────────┘
           ↕
         (Wait for outcome - days/weeks/months later)
           ↕
┌──────────────────────────────────────────┐
│ NEW: NSILContinualHarnessIntegration     │
│ - Read trajectory window (last 50 cases)  │
│ - Pass to failure detector                │
│ - Trigger evolution passes if failures    │
└──────────────────────────────────────────┘
           ↕
┌──────────────────────────────────────────┐
│ EXISTING: NSILFailureDetector            │
│ detect_all_failures()                    │
│ Returns: FailureSignature[]              │
└──────────────────────────────────────────┘
           ↕
┌──────────────────────────────────────────┐
│ EXISTING: NSILRefiner                    │
│ evolve(failures)                         │
│ - Calls 4 evolution passes               │
└──────────────────────────────────────────┘
           ↕
┌──────────────────────────────────────────┐
│ NEW: Evolution Passes 1-4                │
│ EvolutionPass1-SystemPrompt.ts           │
│ EvolutionPass2-SubAgents.ts              │
│ EvolutionPass3-Formulas.ts               │
│ EvolutionPass4-Memory.ts                 │
└──────────────────────────────────────────┘
```

### What to Modify in Existing Code

**File: `services/nsil/trajectory_logger.ts`**
```typescript
// EXISTING log_recommendation() method:
log_recommendation(recommendation: Recommendation): void {
  this.currentTrajectory.recommendation = recommendation;
  // Existing logic...
}

// ADD new method:
record_outcome(outcome: {
  success: boolean;
  actual_results: string;
  vs_predicted: string;
  feedback: string;
}): void {
  this.currentTrajectory.ground_truth = {
    outcome: outcome.success ? 'success' : 'failure',
    success: outcome.success,
    quantitative_result: outcome.actual_results,
    feedback: outcome.feedback,
  };
  
  this.endSession();
  
  // NEW: Trigger learning if enough data
  if (this.getAllTrajectories().length % 25 === 0) {
    this.triggerEvolutionPass();
  }
}

private triggerEvolutionPass(): void {
  console.log('🧠 Learning trigger: 25 new outcomes recorded');
  // NSILContinualHarnessIntegration will pick this up
}
```

**File: `services/NSILIntelligenceHub.ts` (modify existing)**
```typescript
// EXISTING solve() method - around line 200:
async solve(input: UniversalInput): Promise<Analysis> {
  // ... existing code...
  
  // After generating recommendation:
  const recommendation = await this.generateRecommendation();
  
  // NEW: Log trajectory for learning
  this.trajectoryLogger.log_recommendation(recommendation);
  
  // Return to user
  return {
    analysis: fullAnalysis,
    recommendation,
  };
}

// NEW: Add method to record outcomes
recordOutcome(analysisId: string, outcome: any): void {
  const trajectory = this.trajectoryLogger.getTrajectory(analysisId);
  this.trajectoryLogger.record_outcome(outcome);
  
  // Trigger learning if needed
  if (this.trajectoryLogger.getAllTrajectories().length % 25 === 0) {
    NSILContinualHarnessIntegration.triggerEvolutionPass(
      this.trajectoryLogger.getAllTrajectories()
    );
  }
}
```

**File: `server/routes/workflow.ts` (NEW)**
```typescript
router.post('/outcome/:analysisId', async (req, res) => {
  const { analysisId } = req.params;
  const { success, actual_results, feedback } = req.body;
  
  // Record outcome in NSIL system
  NSILIntelligenceHub.recordOutcome(analysisId, {
    success,
    actual_results,
    feedback,
  });
  
  res.json({
    success: true,
    message: 'Outcome recorded. System will learn from this.',
    learning_trigger_at: 'When 25 outcomes accumulated',
  });
});
```

---

## WEEK 5: Integration Points (A→Z Workflow)

### Flow: WorkflowOrchestrator manages all steps

```
┌──────────────────────┐
│ User Initiates       │
│ Upload document or   │
│ Ask question         │
└──────────────────────┘
         ↕
┌──────────────────────────────────────────┐
│ NEW: WorkflowOrchestrator                │
│ manage_workflow(userId, input)           │
│ Manages all 8 steps                      │
└──────────────────────────────────────────┘
         ↕
Step 1:  IntakeProblemFlow ↔ MultiTurnIntake component
Step 2:  DocumentIngestEngine ↔ DocumentUploadPanel component
Step 3:  SelfAuditEngine (existing NSIL)
Step 4:  GlobalNSILOrchestrator (existing NSIL)
Step 5:  ReportOrchestrator (existing NSIL)
Step 6:  ReviewPanel component (new)
Step 7:  FeedbackCollection (new)
Step 8:  NSILContinualHarnessIntegration (learning)
         ↕
        Database persistence
         ↕
    NSILWorkflowPage displays progress
```

### What to Modify

**File: `server/routes/workflow.ts` (NEW)**
```typescript
router.post('/start', async (req, res) => {
  const { userId, initialInput } = req.body;
  
  const workflowId = WorkflowOrchestrator.initializeWorkflow(
    userId,
    initialInput
  );
  
  res.json({ workflowId, currentStep: 1 });
});

router.post('/step/:step', async (req, res) => {
  const { workflowId, data } = req.body;
  
  const nextStep = await WorkflowOrchestrator.executeStep(
    workflowId,
    parseInt(req.params.step),
    data
  );
  
  res.json({ currentStep: nextStep });
});
```

**File: `components/NSILWorkflowPage.tsx` (NEW)**
```typescript
// Displays progress through all 8 steps
// Shows real-time status of each step
// Collects user input at appropriate steps
// Final step shows outcome feedback form
```

---

## Integration Dependency Graph

```
Week 1 (Ollama):
  LLMProviderUnifier ← OllamaBackendOrchestrator
  server/routes/ai.ts ← LLMProviderUnifier

Week 3 (Documents):
  DocumentIngestEngine (independent)
  IntakeProblemFlow (independent)
  server/routes/documents.ts ← DocumentIngestEngine
  UniversalInputProcessor (modified to accept DocumentData)

Week 4 (Evolution):
  NSILContinualHarnessIntegration ← NSILTrajectoryLogger, NSILFailureDetector
  EvolutionPass1-4 ← NSILFailureDetector results
  NSILIntelligenceHub (modified to trigger learning)

Week 5 (Workflow):
  WorkflowOrchestrator ← IntakeProblemFlow, DocumentIngestEngine, all NSIL
  server/routes/workflow.ts ← WorkflowOrchestrator
  NSILWorkflowPage ← WorkflowOrchestrator APIs
```

---

## Quick Command: Check Existing File Sizes

```bash
# Verify your existing files
wc -l services/nsil/*.ts
wc -l services/NSILIntelligenceHub.ts
wc -l server/routes/*.ts
wc -l components/*.tsx | tail -1

# Should show your existing NSIL is complete and ready to integrate with
```

---

## Summary: What You're Actually Doing

You're **not rewriting NSIL**. You're:

1. **Week 1**: Adding Ollama so it costs $0 (not Gemini prices)
2. **Week 3**: Adding document intake so users can upload files
3. **Week 4**: Adding learning loops so it improves from outcomes
4. **Week 5**: Adding workflow orchestration so it guides users A→Z

All existing NSIL code stays. You're just **integrating** new pieces around it.

**It's like building highways to connect your existing cities, not rebuilding the cities themselves.**

