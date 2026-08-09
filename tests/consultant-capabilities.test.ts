import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectConsultantCapabilityMode,
  deriveConsultantCapabilityProfile,
  extractConsultantCaseSignals,
  identifyConsultantGaps
} from '../server/routes/consultantCapabilities.js';

test('detects case_study and document development modes from user text', () => {
  assert.equal(detectConsultantCapabilityMode('Please build a full case study for this matter.'), 'case_study');
  assert.equal(detectConsultantCapabilityMode('Draft a board memo and investor letter.'), 'document_development');
});

test('extracts structured case signals from message and context', () => {
  const signals = extractConsultantCaseSignals(
    'My name is Maria Chen. I represent Nexus Growth Partners in Australia. Objective is to secure ministry approval by Q3 2026 for the board.',
    {
      caseStudy: {
        jurisdiction: 'National / State',
        constraints: 'Budget cap is $2M'
      }
    }
  );

  assert.equal(signals.decisionOwner, 'Maria Chen');
  assert.equal(signals.organization, 'Nexus Growth Partners in Australia');
  assert.equal(signals.country, 'Australia');
  assert.equal(signals.jurisdiction, 'National / State');
  assert.match(signals.objective, /secure ministry approval/i);
  assert.equal(signals.constraints, 'Budget cap is $2M');
});

test('identifies critical gaps when major case fields are missing', () => {
  const gaps = identifyConsultantGaps({
    decisionOwner: '',
    organization: '',
    role: '',
    country: '',
    jurisdiction: '',
    objective: '',
    decision: 'Need help',
    deadline: '',
    audience: '',
    constraints: '',
    evidence: ''
  });

  assert.ok(gaps.some((gap) => gap.key === 'organization' && gap.severity === 'critical'));
  assert.ok(gaps.some((gap) => gap.key === 'country' && gap.severity === 'critical'));
  assert.ok(gaps.some((gap) => gap.key === 'objective' && gap.severity === 'critical'));
});

test('derives capability profile with mode, tags, and brief', () => {
  const profile = deriveConsultantCapabilityProfile('Analyze this and fill in the gaps for my case study draft.', {
    caseStudy: {
      organizationName: 'BWGA',
      country: 'Philippines',
      objectives: 'Enter new government partnerships in 2026',
      currentMatter: 'Need a board decision package for ministry and investor review.',
      targetAudience: 'Board and ministry',
      uploadedDocuments: ['brief.pdf']
    }
  });

  assert.equal(profile.mode, 'case_study');
  assert.ok(profile.capabilityTags.includes('gap-aware') || profile.capabilityTags.includes('gap-satisfied'));
  assert.match(profile.brief, /KNOWN CASE SIGNALS:/);
  assert.match(profile.brief, /DELIVERY RULES:/);
});