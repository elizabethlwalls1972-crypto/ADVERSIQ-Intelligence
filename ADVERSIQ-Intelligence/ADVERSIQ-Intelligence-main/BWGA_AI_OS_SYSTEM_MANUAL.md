# BWGA AI Operating System Manual

## 1. Executive Summary

**BWGA AI** is an AI-first operating system designed to support strategic investment intelligence, partnership analysis, and autonomous report generation. The repository implements:

- a React-based intelligence workspace
- an Express backend API
- an autonomous runtime with self-learning and self-fixing services
- an event-driven system bus for cross-module signaling
- a function-calling AI agent layer for tool orchestration
- OS-style utilities for snapshotting, export, and reset
- a live training / learning dashboard

This system is architected to make “Susan” act as an orchestrator, not just a chatbot. The user interacts through UI modules, while the backend and runtime coordinate autonomous analysis, tool use, and document generation.

---

## 2. Architecture Overview

### 2.1 Core Layers

1. **Frontend UI**
   - `App.tsx`
   - `components/`
   - `hooks/`
   - `vite.config.ts`
   - `package.json`

2. **Backend API**
   - `server/index.ts`
   - `server/routes/`
   - `server/middleware/`

3. **Autonomous Runtime**
   - `services/autonomousRuntime.ts`
   - `services/AutonomousScheduler.ts`
   - `services/MasterAutonomousOrchestrator.ts`
   - `services/AgentSpawner.ts`
   - `services/selfLearningEngine.ts`
   - `services/SelfFixingEngine.ts`
   - `services/SelfImprovementEngine.ts`

4. **Event Bus**
   - `services/EventBus.ts`

5. **Function-Calling Agent Layer**
   - `services/autonomousFunctionCaller.ts`

6. **Learning Dashboard**
   - `server/routes/learning-dashboard.ts`

7. **Telemetry & Data**
   - `data/omni_node_telemetry.jsonl`
   - `data/self_play_scenarios.jsonl`

### 2.2 System Intent

The system is intended to operate as an AI OS by:
- transforming legacy modules into tools/skills
- giving the AI a central orchestration role
- exposing a utility shell for system controls
- maintaining continuous learning and self-improvement
- preserving modular UI flows while enabling autonomous backend action

---

## 3. File Tree and Component Map

### Top-level Core Files

- `App.tsx`
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `README.md`
- `.env`, `.env.local`, `.env.production.example`

### New Key Files Added

- `components/OSUtilityMenu.tsx`
- `services/autonomousFunctionCaller.ts`
- `services/autonomousRuntime.ts`
- `server/routes/learning-dashboard.ts`
- `data/omni_node_telemetry.jsonl`
- `data/self_play_scenarios.jsonl`
- `scripts/collect-training-data.ts`
- `scripts/run-system.ps1`
- `scripts/run-system.sh`
- `LIVE_TRAINING_SYSTEM_GUIDE.md`

### Component Directory Focus

`components/` includes the full UI surface:
- `CommandCenter.tsx`
- `BWConsultantOS.tsx`
- `SystemDashboard.tsx`
- `DocumentGenerationSuite.tsx`
- `AdvancedReportGenerator.tsx`
- `ExecutiveSummaryGenerator.tsx`
- `GlobalLocationIntelligence.tsx`
- `AgentSpawnerPanel.tsx`
- `HumanOversightUI.tsx`
- `OSUtilityMenu.tsx`
- `ProvenanceStrip.tsx`
- `GovernancePanel.tsx`
- `MatchmakingEngine.tsx`
- `NSILWorkspace.tsx`

### Services Directory Focus

`services/` contains the intelligence and autonomy logic:
- AI provider adapters: `geminiService.ts`, `ollamaService.ts`, `openaiClientService.ts`, `groqService.ts`, `togetherAIService.ts`
- orchestration: `AutonomousOrchestrator.ts`, `MasterAutonomousOrchestrator.ts`, `MultiAgentOrchestrator.ts`
- learning: `selfLearningEngine.ts`, `OutcomeTracker.ts`
- safety: `InputShieldService.ts`, `SafetyGuardrailsPipeline.ts`
- analysis engines: `GlobalIntelligenceEngine.ts`, `PartnerComparisonEngine.ts`
- document/report: `DocumentTemplateService.ts`, `ReportsService.ts`
- persistence: `persistenceEngine.ts`, `PersistentMemoryStore.ts`

---

## 4. Frontend Architecture

### 4.1 `App.tsx` — Main Shell

`App.tsx` is the central entry point for the React application and performs these functions:

- lazy-loads UI modules:
  - `NSILWorkspace`
  - `UserManual`
  - `CommandCenter`
  - `BWConsultantOS`
  - `GlobalLocationIntelligence`
  - `AdminDashboard`
  - `Gateway`
  - `MatchmakingEngine`
  - `DocumentGenerationSuite`
  - `AdvancedReportGenerator`
  - `ExecutiveSummaryGenerator`
  - `LettersCatalogModal`
  - `NSILShowcasePage`
  - `NSILBrainPanel`
  - `HumanOversightUI`
  - `SystemDashboard`
  - `AgentSpawnerPanel`

- manages global state:
  - reports and parameters
  - autonomous mode and insights
  - system status and online state
  - consultant insights
  - event bus ecosystem pulse

- boots the autonomous runtime:
  - `initAutonomousRuntime()`

- subscribes to `EventBus` events:
  - `insightsGenerated`
  - `suggestionsReady`
  - `ecosystemPulse`
  - `learningUpdate`
  - `fullyAutonomousRunComplete`
  - `improvementsSuggested`
  - `agentSpawned`
  - `consultantInsightsGenerated`
  - `searchResultReady`

### 4.2 `components/OSUtilityMenu.tsx` — OS Utility Overlay

This new component is the OS control menu. It exposes:

- Snapshot / Save State
- Recover / History
- Export Audit Trail
- Voice/Speech toggle
- System Reset / Clear

It is implemented as a floating panel and is meant to be available on every screen.

### 4.3 View Mode Routing

`App.tsx` controls the main UI route through `viewMode`, not through a router library. Common modes include:
- `command-center`
- `report-generator`
- `consultant-os`
- `global-location-intel`
- `admin`
- `documents`
- `agent-spawner`
- `system-dashboard`

This creates a single-page OS experience where the app switches workspace context dynamically.

---

## 5. Autonomous Runtime

### 5.1 `services/autonomousRuntime.ts`

This file is the bootstrapper for all autonomous services. It is safe to call repeatedly, but it initializes only once.

**Initialized services include:**
- `autonomousScheduler`
- `MasterAutonomousOrchestrator`
- `selfFixingEngine`
- `selfImprovementEngine`
- `selfLearningEngine`
- `agentSpawner`
- `solveAndAct`
- `MultiAgentOrchestrator`
- `narrativeSynthesisEngine`
- `OutcomeTracker`
- `DocumentTemplateService`
- `InputShieldService`
- `MissingFormulasEngine`
- `loadData`, `saveData`, `autoSaveDraft`
- `validateComprehensiveIntake`
- `enforceBounds`, `safeDivide`
- `validateField`, `validateStep`

It also logs startup state and registers these services for runtime use.

### 5.2 Scheduler and Orchestration

The runtime includes:
- a scheduler for timed tasks
- a master orchestrator for agent workflows
- a multi-agent orchestrator for consensus and parallel task execution
- an agent spawner for dynamic sub-agent creation
- self-fixing and self-improvement engines for resilience

### 5.3 Runtime Readiness

`isAutonomousRuntimeReady()` reports whether the runtime is initialized, allowing UI components or backend processes to know if the system is live.

---

## 6. EventBus

### 6.1 `services/EventBus.ts`

This file defines the singleton event bus used by both the frontend and backend runtime services.

**Key capabilities:**
- `publish(event)`
- `subscribe(type, handler)`
- `on(type, handler)` alias
- `emit(event)` alias
- `getRecentEvents(n)`
- `clear()`

### 6.2 Supported Events

The bus supports a broad event taxonomy including:
- intelligence lifecycle:
  - `insightsGenerated`
  - `payloadAssembled`
  - `executiveBriefReady`
  - `suggestionsReady`
  - `memoryUpdated`
- autonomous lifecycle:
  - `fullyAutonomousRunComplete`
  - `improvementsSuggested`
  - `agentSpawned`
  - `taskAssigned`
  - `agentTerminated`
  - `schedulerStarted`
  - `taskExecuted`
- monitoring / system state:
  - `systemOverload`
  - `systemDegraded`
  - `errorReported`
  - `errorResolved`
- search / advisor:
  - `searchResultReady`
  - `searchStarted`
  - `searchCompleted`
  - `consultantInsightsGenerated`
- governance:
  - `approvalUpdated`
  - `provenanceLogged`

### 6.3 Purpose

The EventBus provides the “meadow” view of the OS:
- it allows independent services to see each other
- it enables asynchronous updates
- it supports continuous learning signals
- it ensures UI components remain synchronized with backend activity

---

## 7. Agent Tool Calling

### 7.1 `services/autonomousFunctionCaller.ts`

This file implements the agent function-calling layer and a ReAct loop.

**Structure:**
- `SystemTool`
- `AutonomousFunctionCaller` class
- `registerTool(tool)`
- `getAvailableToolsDescription()`
- `executeTask(task, context)`

### 7.2 ReAct Loop Behavior

The loop works as follows:
1. Build a prompt describing available tools
2. Ask Gemini for a reasoning response
3. Parse the response as JSON
4. If the response contains:
   - `final_answer` → return it
   - `action` and `action_input` → execute the tool
5. Publish the tool observation back into the prompt
6. Iterate until final answer or iteration limit reached

### 7.3 Tool Execution

Tools are registered with:
- `name`
- `description`
- `execute(args)`
- `parametersSchema`

When a tool executes, the result is incorporated into the agent’s memory and used to decide next steps.

### 7.4 Failure Handling

The agent loop:
- rejects invalid JSON
- retries on parse failures
- reports missing tool names
- stops after a fixed number of iterations
- returns a timeout message if no conclusion is reached

---

## 8. Live Learning Dashboard

### 8.1 `server/routes/learning-dashboard.ts`

This route exposes live metrics for the learning system.

**Endpoints:**
- `GET /api/learning-dashboard/metrics`
- `GET /api/learning-dashboard/state`
- `GET /api/learning-dashboard/telemetry`
- `GET /api/learning-dashboard/scenarios`
- `GET /api/learning-dashboard/insights`

### 8.2 What It Reads

The learning dashboard reads from:
- `data/omni_node_telemetry.jsonl`
- `data/self_play_scenarios.jsonl`
- `core/continuous-learning/feature_weights.json`
- `core/continuous-learning/learning_config.json`
- `core/continuous-learning/metrics_log.json`
- `core/continuous-learning/outcome_log.json`
- `core/continuous-learning/pattern_store.json`
- `core/continuous-learning/model_state.json`

### 8.3 Metrics Provided

Returned metrics include:
- total conversations
- total problems
- total solutions
- success rate
- average confidence (placeholder)
- top patterns
- learning trend
- system status
- recommended actions
- alerts

### 8.4 Purpose

This dashboard provides visibility into:
- autonomous training health
- self-play scenario performance
- telemetry and outcome logging
- system learning insights

---

## 9. Backend and Security

### 9.1 `server/index.ts`

This is the Express server entrypoint. It provides:
- environment variable loading
- security middleware
- CORS policy
- rate limiting
- body parsing
- AI input sanitization
- route registration

### 9.2 Security Measures

The server uses:
- `helmet` for headers and CSP
- CORS allowlisted origins
- request size limits
- path traversal blocking
- null-byte sanitization
- prompt injection detection for AI endpoints
- express rate limits:
  - `/api/` max 60 requests/min
  - `/api/ai/` max 20 requests/min

### 9.3 Route Registration

Important routes included:
- `aiRoutes`
- `reportsRoutes`
- `searchRoutes`
- `autonomousRoutes`
- `governanceRoutes`
- `authRoutes`
- `learningRoutes`
- `memoryRoutes`
- `ollamaRoutes`
- `omniRoutes`
- `researchRoutes`
- `memoryLearningRoutes`
- `learningDashboardRoutes`

This means the OS can support:
- AI inference
- reports retrieval
- search and location intelligence
- autonomous orchestration
- governance controls
- memory and persistence operations
- third-party AI provider integration

---

## 10. Data & Telemetry Stores

### 10.1 Telemetry

- `data/omni_node_telemetry.jsonl`
  - records system operations and event telemetry

### 10.2 Self-Play Scenarios

- `data/self_play_scenarios.jsonl`
  - stores autonomous training scenarios
  - used for learning and outcome validation

### 10.3 Learning Store

- `core/continuous-learning/*`
  - `feature_weights.json`
  - `learning_config.json`
  - `metrics_log.json`
  - `outcome_log.json`
  - `pattern_store.json`
  - `model_state.json`

### 10.4 Purpose

These files support:
- live diagnostics
- system learning
- audit trails
- outcome validation
- trend analysis

---

## 11. Deployment and Run Instructions

### 11.1 Required Stack

- Node.js `>=18`
- React 19
- TypeScript 5
- Vite 6
- Yarn or npm

### 11.2 Useful scripts from `package.json`

- `npm run dev`
- `npm run dev:frontend`
- `npm run dev:server`
- `npm run build`
- `npm run build:client`
- `npm run build:server`
- `npm run start`
- `npm run test:system`
- `npm run test:e2e`
- `npm run audit:continual-harness`

### 11.3 Recommended start procedure

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run both frontend and server:
   ```bash
   npm run dev
   ```

### 11.4 Notes

- `App.tsx` will automatically boot the autonomous runtime.
- The learning dashboard is available at `/api/learning-dashboard/*`
- The OS utilities and function-calling layer are active within the loaded UI shell.

---

## 12. How the Full Pipeline Works

### 12.1 User Flow

1. User opens the app.
2. `App.tsx` loads the default `command-center` view.
3. User enters context and selects modules.
4. UI modules render based on `viewMode`.
5. `OSUtilityMenu` remains available for control actions.
6. Autonomous runtime services are active in the background.
7. User actions can trigger:
   - report generation
   - location intelligence
   - matchmaking
   - consultant insights
   - autonomous agent tasks

### 12.2 Autonomous Flow

1. `App.tsx` calls `initAutonomousRuntime()`.
2. runtime boots scheduler, orchestrator, engines.
3. system registers services and event listeners.
4. AI tool calls are available through `autonomousFunctionCaller`.
5. agent uses ReAct loop to choose tools.
6. tools execute and return observations.
7. EventBus publishes events to the UI.
8. results appear across dashboards and reports.
9. telemetry and outcomes are logged for learning.

### 12.3 EventBus Flow

- services publish domain events
- UI subscribes to events
- autonomous services react to events
- learning engines absorb event patterns
- system governance monitors status
- the OS maintains a live “meadow” state

### 12.4 Learning Flow

- scenario data is stored in `self_play_scenarios.jsonl`
- telemetry is stored in `omni_node_telemetry.jsonl`
- learning dashboard reads this data
- metrics and insights are surfaced for operators
- continuous learning and self-improvement services use the data to refine system behavior

---

## 13. Full Blueprint Summary

### 13.1 What has been developed

- A unified OS shell with multiple AI workspaces
- A floating OS utility menu for controls
- An autonomous runtime bootstrapper
- A tool-calling ReAct loop for Susan
- A shared EventBus for ecosystem communication
- A live training and learning metrics API
- Backend security and AI endpoint sanitization
- Telemetry and self-play training data capture

### 13.2 What this system is now capable of

- automated agent orchestration
- tool-based AI reasoning
- cross-module event-driven updates
- report and document generation
- live analytics and governance monitoring
- self-learning and system health tracking
- OS-style system control interface

### 13.3 What the new architecture enables

- reusing legacy modules as system tools
- letting Susan decide which tool to call
- presenting one coherent OS UI instead of isolated pages
- tracking outcomes and learning over time
- adding new tools without redesigning the entire UI
- enabling a truly autonomous agent orchestration layer

---

## 14. Recommended Document Structure

Use these sections in your final document:

1. Executive Summary
2. System Architecture
3. Frontend UI and OS Shell
4. Autonomous Runtime
5. Function Calling and Tool Orchestration
6. EventBus and Ecosystem Messaging
7. Live Learning Dashboard
8. Backend API and Security
9. Data and Telemetry
10. Deployment and Run Instructions
11. Full Pipeline Flow
12. Blueprint and System Capabilities

---

## 15. Copy-Ready Notes

This manual is intentionally written in Markdown so you can paste it into a file or document editor directly.

If you want, I can also provide a shorter “Executive Summary only” version, or I can turn this into a formal table of contents plus section headers for a polished report.
