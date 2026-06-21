import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectConsultantOutputType,
  detectConsultantNeedType,
  buildNeedRoutingClose,
  shouldAskNeedClarification,
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

test('detectConsultantNeedType separates information, solution, and document needs', () => {
  assert.equal(detectConsultantNeedType('Tell me about Pagadian City government.'), 'information');
  assert.equal(detectConsultantNeedType('Help me expand my car manufacturing company into Pagadian.'), 'solution');
  assert.equal(detectConsultantNeedType('Draft a letter to the mayor requesting a meeting.'), 'letter');
  assert.equal(detectConsultantNeedType('Build a board report on this investment.'), 'report');
});

test('shouldAskNeedClarification only triggers for substantive ambiguous needs', () => {
  assert.equal(shouldAskNeedClarification('hello', 'general'), false);
  assert.equal(shouldAskNeedClarification('I have a project with a mayor and an investor but I am not sure what I need yet', 'general'), true);
  assert.equal(shouldAskNeedClarification('I need a full report for the board', 'general'), false);
});

test('buildNeedRoutingClose adds OS capability path when model omits it', () => {
  const close = buildNeedRoutingClose(
    'Help me expand my car manufacturing company into Pagadian.',
    'Pagadian requires verification of local government, infrastructure, and incentives.'
  );

  assert.match(close, /information only/);
  assert.match(close, /recommended solution pathway/);
  assert.match(close, /letter\/document/);
  assert.match(close, /full case pack/);
});

test('buildNeedRoutingClose does not duplicate an existing routing prompt', () => {
  const close = buildNeedRoutingClose(
    'Help me assess this market.',
    'Choose information only, recommended solution pathway, report/brief, letter/document, or full case pack.'
  );

  assert.equal(close, '');
});

test('buildNeedRoutingClose fills in partial output-choice prompts', () => {
  const close = buildNeedRoutingClose(
    'Help me expand my manufacturing company into Pagadian.',
    'Would you prefer a detailed report, a letter, a document pack, or a stakeholder brief?'
  );

  assert.match(close, /information only/);
  assert.match(close, /recommended solution pathway/);
  assert.match(close, /full case pack/);
});
