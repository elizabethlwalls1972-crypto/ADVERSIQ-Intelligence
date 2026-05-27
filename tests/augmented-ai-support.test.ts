import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAugmentedAISnapshot,
  getAugmentedAITools,
  getRecommendedAugmentedToolsForMode
} from '../server/routes/augmentedAISupport.js';

test('returns tool registry and filters by category', () => {
  const all = getAugmentedAITools();
  const docs = getAugmentedAITools('document_authoring');

  assert.ok(all.length >= 8);
  assert.ok(docs.length >= 2);
  assert.ok(docs.every((tool) => tool.category === 'document_authoring'));
});

test('returns mode-based recommended tools', () => {
  const caseStudyTools = getRecommendedAugmentedToolsForMode('case_study');

  assert.equal(caseStudyTools.length, 6);
  assert.ok(caseStudyTools.some((tool) => tool.category === 'workflow_orchestration'));
});

test('builds 5-step augmented AI snapshot with human controls', () => {
  const snapshot = buildAugmentedAISnapshot({
    mode: 'gap_fill',
    signals: {
      decisionOwner: 'Alex',
      organization: 'BWGA',
      role: 'Director',
      country: 'Australia',
      jurisdiction: 'National / State',
      objective: 'Secure partner approval',
      decision: 'Need decision on market entry package',
      deadline: 'Q2 2026',
      audience: 'Board',
      constraints: 'Budget cap',
      evidence: 'Uploaded documents provided'
    },
    gaps: [
      {
        key: 'evidence',
        label: 'Evidence baseline',
        severity: 'medium',
        question: 'What evidence should be used?'
      }
    ],
    capabilityTags: ['gap-aware'],
    brief: 'test'
  });

  assert.equal(snapshot.model, 'augmented_ai_human_centered');
  assert.equal(snapshot.steps.length, 5);
  assert.deepEqual(snapshot.humanControls.approvalOptions, ['accept', 'modify', 'reject']);
});