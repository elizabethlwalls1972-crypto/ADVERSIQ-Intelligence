import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectConsultantOutputType,
  shouldRequireOutputClarification
} from '../server/routes/consultantBehavior.js';

test('does not require clarification for normal chat requests', () => {
  const result = shouldRequireOutputClarification(
    'Can you help me evaluate this partnership approach in Australia?',
    'general'
  );

  assert.equal(result, false);
});

test('requires clarification when user explicitly asks to choose a format', () => {
  const result = shouldRequireOutputClarification(
    'I am not sure which format I should use for this.',
    'general'
  );

  assert.equal(result, true);
});

test('does not require clarification when output type is already explicit', () => {
  const result = shouldRequireOutputClarification(
    'Which format should I use if I need a full report for the board?',
    'general'
  );

  assert.equal(result, false);
});

test('does not require clarification in report_build intent', () => {
  const result = shouldRequireOutputClarification(
    'Pick a format for me.',
    'report_build'
  );

  assert.equal(result, false);
});

test('detectConsultantOutputType classifies report and unknown correctly', () => {
  assert.equal(detectConsultantOutputType('Please write a full report for cabinet review.'), 'report');
  assert.equal(detectConsultantOutputType('Help me think this through.'), 'unknown');
});