import test from 'node:test';
import assert from 'node:assert/strict';
import { AutonomousResearchCognition } from '../services/nsil/autonomous_research_cognition.js';
import type { InteractionPolicy } from '../services/nsil/autonomous_interaction_learner.js';

const makePolicy = (mode: InteractionPolicy['mode']): InteractionPolicy => ({
  mode,
  confidence: 0.82,
  directives: [],
  tacticalFrame: {
    frame: 'decision',
    hypotheses: [],
    probes: [],
    actions: [],
    verificationChecks: [],
    adaptationRule: 'adapt from evidence',
  },
});

test('AutonomousResearchCognition turns decision input into evidence-seeking questions', () => {
  const cognition = new AutonomousResearchCognition();
  const plan = cognition.plan(
    'Should we enter the Philippines healthcare market, and what risks should we verify first?',
    makePolicy('decision_verification'),
  );

  assert.equal(plan.questions.length, 2);
  assert.ok(plan.questions.some((question) => question.id === 'primary_problem_scan'));
  assert.ok(plan.questions.some((question) => question.id === 'assumption_stress_test'));
  assert.ok(plan.questions.every((question) => question.query.includes('Philippines') || question.query.includes('healthcare')));
  assert.ok(plan.reasoningRules.some((rule) => rule.includes('sources are evidence')));
});

test('AutonomousResearchCognition evidence block demands synthesis instead of parroting', () => {
  const cognition = new AutonomousResearchCognition();
  const plan = cognition.plan(
    'Diagnose why the OS is not reading user input before it answers.',
    makePolicy('diagnostic'),
  );

  const block = cognition.buildEvidenceReasoningBlock(plan, [{
    query: 'agentic AI route wiring live retrieval fallback failure',
    sources: ['https://example.test/diagnostic'],
    content: '[Web Search Summary]\nRoute failures can occur when clients post to a legacy endpoint.',
  }]);

  assert.match(block, /Do not quote or paraphrase sources as the answer/);
  assert.match(block, /Required synthesis behavior/);
  assert.match(block, /fault tree, decision tree, risk register, or action sequence/);
  assert.match(block, /system_failure_pattern/);
});

test('AutonomousResearchCognition adds public counterparty due diligence for government business risk', () => {
  const cognition = new AutonomousResearchCognition();
  const plan = cognition.plan(
    'Is it safe to do business with the Philippine government in Pagadian City for a public-private investment project?',
    makePolicy('decision_verification'),
  );

  assert.ok(plan.questions.some((question) => question.id === 'public_counterparty_due_diligence'));
  assert.ok(plan.questions.some((question) => /procurement counterpart authority anti corruption security/i.test(question.query)));
});
