import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { AutonomousInteractionLearner } from '../services/nsil/autonomous_interaction_learner.js';

const makeLearner = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'adversiq-interaction-learner-'));
  return { learner: new AutonomousInteractionLearner(dir), dir };
};

test('AutonomousInteractionLearner selects diagnostic mode for OS failure reports', () => {
  const { learner } = makeLearner();

  const policy = learner.planTurn({
    message: 'The ADVERSIQ OS is not reading the user input and the NSIL live harness may have a wiring or API key issue.',
    taskType: 'risk_review',
    readinessScore: 20,
    unresolvedGapCount: 4,
  });

  assert.equal(policy.mode, 'diagnostic');
  assert.ok(policy.directives.some((directive) => directive.includes('system diagnostic')));
  assert.ok(policy.tacticalFrame.hypotheses.some((hypothesis) => hypothesis.includes('wrong backend endpoint')));
});

test('AutonomousInteractionLearner learns without explicit human correction', () => {
  const { learner } = makeLearner();
  const policy = learner.planTurn({
    message: 'This is still not reading what I entered. Why is the route not using the live NSIL stack?',
    taskType: 'risk_review',
    readinessScore: 25,
    unresolvedGapCount: 3,
  });

  learner.observeTurn({
    requestId: 'turn-1',
    timestamp: new Date().toISOString(),
    message: 'This is still not reading what I entered. Why is the route not using the live NSIL stack?',
    response: 'Let me know a bit more about what you are working on and I can help.',
    taskType: 'risk_review',
    intent: 'general',
    readinessScore: 25,
    unresolvedGapCount: 3,
    provider: 'local-intelligence',
    latencyMs: 1200,
  }, policy);

  const state = learner.getState();
  assert.equal(state.observations.length, 1);
  assert.ok(state.learnedDirectives.length >= 1);
  assert.ok(state.learnedDirectives.some((directive) => directive.text.includes('diagnostic turns')));
});

test('AutonomousInteractionLearner treats object dumps as response mismatch', () => {
  const { learner } = makeLearner();
  const policy = learner.planTurn({
    message: 'Is this a safe government investment market entry in Pagadian City?',
    taskType: 'risk_review',
    readinessScore: 50,
    unresolvedGapCount: 1,
  });

  learner.observeTurn({
    requestId: 'turn-object-dump',
    timestamp: new Date().toISOString(),
    message: 'Is this a safe government investment market entry in Pagadian City?',
    response: 'Composite score: [object Object]/100\nNSIL Assessment\n[object Object]',
    taskType: 'risk_review',
    intent: 'risk_assessment',
    readinessScore: 50,
    unresolvedGapCount: 1,
    provider: 'local-intelligence',
    latencyMs: 1000,
  }, policy);

  const state = learner.getState();
  assert.equal(state.observations.length, 1);
  assert.ok(state.observations[0].signals.responseMismatch > 0.8);
});
