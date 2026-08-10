import test from 'node:test';
import assert from 'node:assert/strict';
import RegionalDevelopmentOrchestrator from '../services/RegionalDevelopmentOrchestrator.ts';

test('regional orchestrator returns a synchronous kernel object with data fabric metrics', () => {
  const result = RegionalDevelopmentOrchestrator.run({
    country: 'Philippines',
    regionProfile: 'Energy transition',
    sector: 'infrastructure',
    constraints: 'budget constrained',
    fundingEnvelope: '$10m',
    governanceContext: 'local permitting',
    jurisdiction: 'Philippines',
    objective: 'Expand renewable energy investment',
    currentMatter: 'Market entry',
    evidenceNotes: ['feasibility study'],
    partnerCandidates: []
  });

  assert.ok(result && typeof result === 'object');
  assert.ok(result.dataFabric, 'dataFabric should exist');
  assert.equal(result.dataFabric.overallConfidence, 0.85);
  assert.equal(result.dataFabric.overallFreshnessHours, 12);
});
