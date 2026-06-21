# BW Nexus AI - Agentic Autonomous Build Spec

Date: 2026-02-21
Status: Execution-ready

## 1) Objective
Transform the current reactive consultant and report system into a governed, fully agentic autonomous system that:

1. Senses continuously
2. Plans proactively
3. Executes controlled actions
4. Verifies outcomes
5. Learns and updates strategy over time

This upgrade is additive to the existing strengths in:
- Consultant flow and case-building UX
- NSIL intelligence layers
- Formula scoring and explainability
- Report payload assembly and validation

## 2) Current Baseline (What is already strong)

### Reactive intelligence and orchestration
- Consultant case builder flow exists in components/BWConsultantOS.tsx
- Full report assembly pipeline exists in services/ReportOrchestrator.ts
- Full NSIL multi-layer analysis exists in services/NSILIntelligenceHub.ts

### Existing agentic/autonomous primitives available
- Optimized reasoning stack (SAT, memory retrieval, debate, DAG formula execution) in services/algorithms
- Proactive modules already present in services/proactive
- Self-improvement and self-fixing components present in services/SelfImprovementEngine.ts and services/SelfFixingEngine.ts
- Event-driven infrastructure available via services/EventBus.ts

## 3) Gaps to close
Current system is still mostly request-response. To become fully autonomous, these gaps must be closed:

1. Mission persistence gap
- No single mission graph that persists goals, constraints, and changing priorities across runs

2. Closed-loop execution gap
- System can recommend and generate, but does not consistently execute action plans and verify outcomes automatically

3. Unified memory gap
- Learning signals, case data, outcomes, and strategic context are not one consolidated long-term memory model

4. Triggered autonomy gap
- Proactive components exist, but no mandatory loop that wakes on drift/event thresholds and self-replans

5. Governance-at-action gap
- Governance exists at analysis/report layer, but needs stronger action-level policy gates and rollback rules

## 4) Target architecture (Autonomous Control Loop)

Add a top-level control loop called Autonomous Mission Loop with this cycle:

Sense -> Understand -> Plan -> Simulate -> Approve -> Execute -> Verify -> Learn -> Re-plan

### New layers to add

Layer A: Mission Brain
- Persistent mission state and objective hierarchy
- Priority manager and conflict resolver

Layer B: World Model and Forecasting
- Causal graph of key variables
- Scenario and counterfactual expansion for second/third-order effects

Layer C: Action Orchestrator
- Tool-using action runner with preconditions, postconditions, retries, and compensating actions

Layer D: Outcome Verification
- KPI delta tracking against expected effects
- Failure diagnosis and automatic plan adjustment

Layer E: Governance and Safety Envelope
- Action policy checks
- Confidence gates
- Human approval checkpoints
- Rollback policies

## 5) New services to implement

Create the following services under services/autonomy:

1. MissionGraphService.ts
- Stores mission, goals, subgoals, constraints, dependencies, statuses
- Supports reprioritization based on evidence and urgency

2. AutonomousPlanner.ts
- Builds and updates action plans from mission graph
- Produces executable task DAG with confidence and rationale

3. WorldModelEngine.ts
- Maintains causal assumptions and impact model
- Runs what-if expansions before action commits

4. ActionExecutionEngine.ts
- Executes approved tasks using existing services/tools
- Enforces precondition checks, retries, and compensating actions

5. OutcomeVerificationEngine.ts
- Compares expected vs observed outcomes
- Assigns success/failure labels and root-cause tags

6. MissionMemoryStore.ts
- Unified memory schema for case context, actions, outcomes, lessons
- Time-versioned snapshots

7. AutonomyGovernanceGate.ts
- Centralized action-level governance checks
- Confidence thresholds, approvals, prohibited action types

8. AutonomousLoopOrchestrator.ts
- Main continuous loop coordinator
- Trigger-based wakeup and periodic review cycles

## 6) Data schemas (Minimum contracts)

Add these interfaces in a new file types/autonomy.ts:

1. MissionRecord
- missionId
- objective
- constraints
- targetKPIs
- horizon
- status
- createdAt
- updatedAt

2. GoalNode
- goalId
- missionId
- description
- parentGoalId
- priority
- dependencies
- confidence
- status
- ownerAgent

3. ActionTask
- taskId
- goalId
- type
- input
- expectedOutcome
- preconditions
- postconditions
- rollbackPlan
- riskScore
- approvalMode

4. SimulationResult
- taskId
- baseCase
- upsideCase
- downsideCase
- sensitivityDrivers
- recommendedProceed

5. ExecutionRecord
- runId
- taskId
- startedAt
- finishedAt
- status
- outputs
- errors
- retries

6. OutcomeRecord
- taskId
- expectedKPIChange
- observedKPIChange
- variance
- verdict
- rootCauseTags
- lesson

7. GovernanceDecision
- taskId
- policyChecks
- decision
- reasons
- reviewer
- timestamp

8. MissionSnapshot
- mission
- goals
- activePlan
- inFlightTasks
- latestOutcomes
- nextReviewAt

## 7) How this integrates with current system

### Existing integration points
- services/ReportOrchestrator.ts remains the deterministic payload assembler
- services/NSILIntelligenceHub.ts remains the core intelligence source
- components/BWConsultantOS.tsx remains the interactive front-end for case input

### New integration requirements
1. BWConsultantOS should display Mission status and next autonomous actions
2. ReportOrchestrator should accept optional mission context and active plan references
3. NSILIntelligenceHub outputs should feed planner inputs (especially risk, trust, and confidence)
4. EventBus should publish autonomy lifecycle events:
- mission.created
- plan.updated
- task.started
- task.completed
- task.failed
- outcome.verified
- mission.replanned

## 8) Four-week implementation sequence

## Week 1 - Foundation and contracts
Goal: establish mission and memory backbone

Deliverables:
1. Create types/autonomy.ts with all base contracts
2. Implement MissionGraphService.ts and MissionMemoryStore.ts
3. Add EventBus event types for mission and task lifecycle
4. Add basic mission panel view in BWConsultantOS (read-only)

Acceptance:
- Mission can be created, loaded, updated, and persisted
- Goals can be attached and reprioritized
- UI shows mission state reliably

## Week 2 - Planning and simulation
Goal: move from reactive recommendation to proactive planning

Deliverables:
1. Implement AutonomousPlanner.ts
2. Implement WorldModelEngine.ts with baseline what-if simulation
3. Connect NSIL outputs into plan scoring
4. Add planner output panel in BWConsultantOS

Acceptance:
- Planner can generate executable task DAG from mission
- Simulation summary is attached to each candidate task
- User can inspect why one plan is chosen over another

## Week 3 - Controlled execution and governance
Goal: introduce safe autonomous action execution

Deliverables:
1. Implement ActionExecutionEngine.ts
2. Implement AutonomyGovernanceGate.ts
3. Add approval workflows (auto, conditional, manual)
4. Add rollback and retry policy handling

Acceptance:
- Tasks execute under governance checks
- Failed tasks trigger retry or rollback policy
- All decisions are auditable with timestamps and reasons

## Week 4 - Verification and continuous autonomy
Goal: close the learning loop and make it self-improving

Deliverables:
1. Implement OutcomeVerificationEngine.ts
2. Implement AutonomousLoopOrchestrator.ts
3. Add trigger-based re-planning (drift, missed KPI, new risk)
4. Add mission health dashboard and trend summaries

Acceptance:
- System verifies outcomes and logs lessons
- Planner updates from observed performance
- Continuous loop runs with safe gating and full audit trail

## 9) KPIs for success

Track these metrics from day 1:

1. Planning quality
- Plan acceptance rate
- Predicted vs realized KPI accuracy

2. Execution reliability
- Task success rate
- Retry rate
- Rollback frequency

3. Learning effectiveness
- Time-to-convergence for strategy weights
- Error recurrence reduction

4. Autonomy maturity
- Percentage of tasks completed without manual intervention
- Percentage of autonomous decisions passing governance first attempt

5. Business impact
- Improvement in case outcome quality
- Reduction in cycle time from intake to validated action

## 10) Guardrails and non-negotiables

1. Never allow ungated high-risk action execution
2. Require confidence thresholds and policy checks before execution
3. Keep deterministic audit trails for every autonomous decision
4. Keep human override and emergency stop always available
5. Ensure explainability at mission, goal, task, and outcome levels

## 11) First three concrete coding tasks to start immediately

Task 1
- Add types/autonomy.ts with contracts in Section 6

Task 2
- Implement MissionGraphService.ts with in-memory + persistence adapter

Task 3
- Add Mission panel to BWConsultantOS showing:
  - Active mission
  - Top 5 goals
  - Next 3 planned tasks
  - Governance status

These three tasks unlock all subsequent autonomy layers while preserving current behavior.

## 12) Expected result after this roadmap

You move from:
- Intelligent assistant that analyzes and generates

to:
- Autonomous strategic operating system that continuously senses, plans, acts, verifies, learns, and improves with governance.
