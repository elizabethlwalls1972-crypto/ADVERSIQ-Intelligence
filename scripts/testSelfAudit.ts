import SelfAuditingKnowledge from '../server/core/SelfAuditingKnowledge.js';

console.log('SelfAuditingKnowledge:', typeof SelfAuditingKnowledge);
console.log('Is constructor:', typeof SelfAuditingKnowledge === 'function');

if (typeof SelfAuditingKnowledge === 'function') {
  const instance = new SelfAuditingKnowledge();
  console.log('Instance created:', instance);
} else {
  console.error('Failed to create instance - export is not a constructor');
  process.exit(1);
}
