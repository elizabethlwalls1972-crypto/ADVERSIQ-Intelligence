#!/usr/bin/env tsx
/**
 * Training Data Collection Script
 * Generates synthetic strategic decision scenarios for AI training
 * Run: tsx scripts/collect-training-data.ts [scenario_count] [duration_seconds]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface TrainingScenario {
  id: string;
  timestamp: string;
  type: 'strategic' | 'financial' | 'operational' | 'market' | 'risk';
  domain: string;
  context: string;
  decision: string;
  expectedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

interface CollectionResult {
  scenariosGenerated: number;
  testsPassed: number;
  testsFailed: number;
  averageResponseTime: number;
  dataFilePath: string;
  timestamp: string;
}

const dataDir = path.join(process.cwd(), 'data');
const scenariosPath = path.join(dataDir, 'training_scenarios.jsonl');
const logsDir = path.join(dataDir, 'collection_logs');

// Ensure directories exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const scenarios: TrainingScenario[] = [
  {
    id: 'sc_001',
    timestamp: new Date().toISOString(),
    type: 'strategic',
    domain: 'Market Entry',
    context: 'Company considering expansion into emerging market with 40% tariffs and political instability.',
    decision: 'Phased market entry with local partnerships and risk insurance',
    expectedOutcome: 'Reduced upfront capital risk, local expertise, faster market adaptation',
    riskLevel: 'medium',
    confidence: 0.78,
  },
  {
    id: 'sc_002',
    timestamp: new Date().toISOString(),
    type: 'financial',
    domain: 'Capital Allocation',
    context: 'Portfolio optimization with $50M to allocate across 5 strategic initiatives.',
    decision: 'Allocate 40% to core business, 35% to adjacent market, 25% to innovation lab',
    expectedOutcome: 'Balanced risk/return profile, 3-year CAGR target of 18%',
    riskLevel: 'low',
    confidence: 0.85,
  },
  {
    id: 'sc_003',
    timestamp: new Date().toISOString(),
    type: 'operational',
    domain: 'Supply Chain',
    context: 'Supply chain disruption risk: single-source dependency on Asian component supplier.',
    decision: 'Dual-source strategy with nearshoring 20% to Mexico',
    expectedOutcome: '85% supply resilience improvement, 5% cost increase',
    riskLevel: 'medium',
    confidence: 0.82,
  },
  {
    id: 'sc_004',
    timestamp: new Date().toISOString(),
    type: 'market',
    domain: 'Pricing Strategy',
    context: 'Entering competitive market with 3 established players. Cost structure 15% higher than leader.',
    decision: 'Premium differentiation strategy: feature bundling + loyalty program + brand positioning',
    expectedOutcome: 'Capture 8-12% market share in 18 months, maintain margin above competitor average',
    riskLevel: 'high',
    confidence: 0.72,
  },
  {
    id: 'sc_005',
    timestamp: new Date().toISOString(),
    type: 'risk',
    domain: 'Regulatory',
    context: 'New data privacy regulation effective in 90 days affects 60% of customer data processing.',
    decision: 'Implement privacy-by-design framework + customer communications + compliance tools',
    expectedOutcome: 'Full compliance achieved 30 days early, customer trust metric +15%',
    riskLevel: 'high',
    confidence: 0.68,
  },
];

async function collectTrainingData(): Promise<CollectionResult> {
  console.log('🚀 Starting Training Data Collection...\n');

  const startTime = Date.now();
  const result: CollectionResult = {
    scenariosGenerated: 0,
    testsPassed: 0,
    testsFailed: 0,
    averageResponseTime: 0,
    dataFilePath: scenariosPath,
    timestamp: new Date().toISOString(),
  };

  let totalResponseTime = 0;
  let responseTimes: number[] = [];

  // Send each scenario to backend for learning
  for (const scenario of scenarios) {
    try {
      console.log(`📊 Processing scenario: ${scenario.id} (${scenario.type})`);

      // Send to backend learning endpoint
      const scenarioJson = JSON.stringify({
        userId: `training_bot_${Date.now()}`,
        messages: [
          {
            role: 'user',
            content: `${scenario.context}. What's the best decision?`,
          },
          {
            role: 'assistant',
            content: `Recommended: ${scenario.decision}. Expected outcome: ${scenario.expectedOutcome}`,
          },
        ],
        metadata: {
          type: scenario.type,
          domain: scenario.domain,
          riskLevel: scenario.riskLevel,
          confidence: scenario.confidence,
        },
      });

      const reqStart = Date.now();

      try {
        const response = execSync(
          `curl -s -X POST http://localhost:3004/api/memory-learning/save-conversation -H "Content-Type: application/json" -d '${scenarioJson.replace(/'/g, "'\\''")}'`,
          { encoding: 'utf-8' }
        );

        const reqTime = Date.now() - reqStart;
        responseTimes.push(reqTime);
        totalResponseTime += reqTime;

        const parsed = JSON.parse(response);
        if (parsed.status === 'conversation_saved') {
          result.testsPassed++;
          console.log(`  ✅ Saved | Response time: ${reqTime}ms\n`);
        } else {
          result.testsFailed++;
          console.log(`  ❌ Failed to save | Response: ${JSON.stringify(parsed)}\n`);
        }
      } catch (curlError) {
        result.testsFailed++;
        console.log(`  ❌ Network error: ${curlError instanceof Error ? curlError.message : 'Unknown error'}\n`);
      }

      result.scenariosGenerated++;

      // Append to file
      fs.appendFileSync(scenariosPath, JSON.stringify(scenario) + '\n');
    } catch (error) {
      console.log(`  ⚠️  Error processing scenario: ${error instanceof Error ? error.message : 'Unknown'}\n`);
    }
  }

  result.averageResponseTime = responseTimes.length > 0 ? Math.round(totalResponseTime / responseTimes.length) : 0;
  const elapsed = (Date.now() - startTime) / 1000;

  // Generate report
  const report = {
    timestamp: result.timestamp,
    executionTimeSeconds: Math.round(elapsed),
    scenariosGenerated: result.scenariosGenerated,
    successRate: `${Math.round((result.testsPassed / (result.testsPassed + result.testsFailed)) * 100)}%`,
    averageResponseTime: `${result.averageResponseTime}ms`,
    testResults: {
      passed: result.testsPassed,
      failed: result.testsFailed,
    },
    dataFilePath: result.dataFilePath,
    responseTimes,
  };

  // Save report
  const reportPath = path.join(logsDir, `collection_${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📈 Collection Summary:');
  console.log(`  ✅ Scenarios generated: ${result.scenariosGenerated}`);
  console.log(`  ✅ Tests passed: ${result.testsPassed}`);
  console.log(`  ❌ Tests failed: ${result.testsFailed}`);
  console.log(`  ⏱️  Average response: ${result.averageResponseTime}ms`);
  console.log(`  📁 Data saved to: ${scenariosPath}`);
  console.log(`  📊 Report saved to: ${reportPath}`);
  console.log(`  ⏳ Total time: ${elapsed.toFixed(1)}s\n`);

  return result;
}

// Run collection
collectTrainingData()
  .then(result => {
    console.log('✅ Training data collection complete!');
    console.log(`\n🎯 Next steps:\n`);
    console.log(`  1. Monitor learning: curl http://localhost:3004/api/learning/metrics`);
    console.log(`  2. Check system health: curl http://localhost:3004/api/health`);
    console.log(`  3. Review telemetry: tail -f data/omni_node_telemetry.jsonl`);
    console.log(`  4. Run more scenarios: tsx scripts/collect-training-data.ts\n`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error during collection:', error);
    process.exit(1);
  });
