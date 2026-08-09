# TODO - Fix ADVERSIQ Decision Verification System Major Bugs

## Plan (confirmed in progress)
- [ ] Locate the runtime / logic path for the ADVERSIQ Decision Verification System.
- [ ] Identify the concrete “major bugs” by reproducing/reading failure points (type errors, runtime exceptions, wrong scoring/thresholds).
- [x] Read core ADVERSIQ verification/adversarial components to find likely bug sources:
  - [x] services/AdversarialReasoningService.ts
  - [x] services/OutcomeTracker.ts
  - [x] services/autonomy/OutcomeVerificationEngine.ts
  - [x] services/ReasoningTribunal.ts
  - [x] services/autonomy/AutonomyGovernanceGate.ts
- [ ] Patch issues in the verification/adversarial pipeline:
  - [ ] Verify AdversarialReasoningService confidence mapping + guardrails (empty histories, NaNs).
  - [ ] Verify OutcomeTracker accuracy + calibration logic for division-by-zero/empty states (and bad formulas).
  - [ ] Verify OutcomeVerificationEngine replan behavior + decision state mapping.
  - [ ] Verify AutonomyGovernanceGate decision transitions (approved/rejected/review-required).
- [ ] Add/adjust defensive checks and unit tests.
- [ ] Run build/tests/lint and fix any compilation errors.

## Notes
- Repo tooling: ripgrep missing in the environment, so codebase-wide search may require alternative approaches (TS compile errors, manual file reads, or node-based search scripts).


