import test from 'node:test';
import assert from 'node:assert/strict';
import { ApexExecutionLoop } from '../services/ApexExecutionLoop';
import { MacroSwarmRouter } from '../services/MacroSwarmRouter';
import { QuorumGatekeeper } from '../services/QuorumGatekeeper';
import { executeMonteCarlo } from '../core/MonteCarloEngine';

test('MacroSwarmRouter - huntGlobalInefficiencies', async () => {
  const router = new MacroSwarmRouter();
  const target = await router.huntGlobalInefficiencies();
  assert.ok(target, 'Target should be returned');
  assert.equal(target.region, 'Global Supply Chain');
  assert.equal(target.executiveEmail, 'exec@example.com');
});

test('QuorumGatekeeper - assembleQuorum', async () => {
  const gatekeeper = new QuorumGatekeeper();
  const quorum = await gatekeeper.assembleQuorum('Test Problem', 5);
  assert.equal(Array.isArray(quorum), true, 'Quorum should be an array');
  assert.equal(quorum.length, 2, 'Stub returns 2 members');
});

test('MonteCarloEngine - executeMonteCarlo', () => {
  const result = executeMonteCarlo([0.9, 0.8, 0.7]);
  assert.equal(typeof result, 'number');
  assert.equal(result, 89.5);
});

test('ApexExecutionLoop - stripEmotionalBias', () => {
  const loop = new ApexExecutionLoop();
  // Using 'any' cast to test private method
  const truth = (loop as any).stripEmotionalBias('Some political rhetoric');
  assert.ok(truth.coreProblem, 'Should return core problem');
  assert.ok(truth.logisticalReality, 'Should return logistical reality');
});

test('ApexExecutionLoop - evaluateHistoricalRepetition', () => {
  const loop = new ApexExecutionLoop();
  const historical = (loop as any).evaluateHistoricalRepetition({});
  assert.equal(historical.isRepeatingFailure, true);
  assert.ok(historical.eraMatch);
});

test('ApexExecutionLoop - compileMasterDossier', () => {
  const loop = new ApexExecutionLoop();
  const truth = { coreProblem: 'Test Core Problem' };
  const solution = { executionPlan: 'Test Execution Plan' };
  const probability = 95.5;
  
  const dossier = (loop as any).compileMasterDossier(truth, solution, probability);
  assert.equal(typeof dossier, 'string');
  assert.ok(dossier.includes('Test Core Problem'));
  assert.ok(dossier.includes('Test Execution Plan'));
  assert.ok(dossier.includes('95.5%'));
});
