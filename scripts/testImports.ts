import { LIDAController } from '../server/core/LIDAController.js';
import { UniversalInputProcessor } from '../server/core/UniversalInputProcessor.js';
import { SelfAuditingKnowledge } from '../server/core/SelfAuditingKnowledge.js';
import { HistoricalParallelMatcher } from '../server/core/HistoricalParallelMatcher.js';
import { FailurePatternRecognizer } from '../server/core/FailurePatternRecognizer.js';
import { OSMorphologyGraph } from '../server/core/OSMorphologyGraph.js';
import { SelfEvolvingAlgorithmEngine } from '../server/core/SelfEvolvingAlgorithmEngine.js';

console.log('LIDAController:', typeof LIDAController);
console.log('UniversalInputProcessor:', typeof UniversalInputProcessor);
console.log('SelfAuditingKnowledge:', typeof SelfAuditingKnowledge);
console.log('HistoricalParallelMatcher:', typeof HistoricalParallelMatcher);
console.log('FailurePatternRecognizer:', typeof FailurePatternRecognizer);
console.log('OSMorphologyGraph:', typeof OSMorphologyGraph);
console.log('SelfEvolvingAlgorithmEngine:', typeof SelfEvolvingAlgorithmEngine);

console.log('\nAll modules loaded successfully!');
