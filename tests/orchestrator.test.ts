import test from 'node:test';
import assert from 'node:assert/strict';
import { AutonomousOrchestrator } from '../services/AutonomousOrchestrator.js';

test('AutonomousOrchestrator - should solve and act on a problem', async () => {
  const result = await AutonomousOrchestrator.solveAndAct(
    'Test problem',
    { context: 'test' },
    { organizationName: 'TestOrg' } as any,
    { autoAct: false, urgency: 'normal' }
  );

  assert.ok(result, 'Result should be truthy');
  assert.ok(result.solutions, 'Result should contain solutions');
  assert.ok(result.auditTrail, 'Result should contain auditTrail');
  assert.equal(Array.isArray(result.solutions), true, 'Solutions should be an array');
});