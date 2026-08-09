import { chromium } from 'playwright';
import fs from 'fs';

const APP_URL = 'http://localhost:3001';

console.log('\n🚀 BWGA Intelligence AI - COMPREHENSIVE SYSTEM TEST');
console.log('Testing with Real Gemini API Key\n');
console.log('='.repeat(80));

const testScenarios = [
  { name: 'Tech Market Entry', org: 'TechFlow Vietnam', problem: 'Establish R&D center in Vietnam to access engineering talent pool and expand ASEAN operations', industry: 'Technology', dealSize: 5000000 },
  { name: 'Healthcare Acquisition', org: 'MedCare Thailand', problem: 'Acquire hospital chain to dominate Bangkok medical tourism market', industry: 'Healthcare', dealSize: 50000000 },
  { name: 'Energy Joint Venture', org: 'GreenPower Saudi', problem: 'Develop 500MW solar farm under Saudi Vision 2030 sustainability goals', industry: 'Energy', dealSize: 200000000 },
  { name: 'Fintech Expansion', org: 'PayStream Singapore', problem: 'Launch digital payment platform across Southeast Asia markets', industry: 'Fintech', dealSize: 15000000 },
  { name: 'Manufacturing Greenfield', org: 'AutoParts India', problem: 'Build automotive components factory to serve growing Indian vehicle market', industry: 'Manufacturing', dealSize: 25000000 },
  { name: 'Government PPP', org: 'Infrastructure Indonesia', problem: 'Develop toll road network through public-private partnership model', industry: 'Infrastructure', dealSize: 500000000 },
  { name: 'ESG Carbon Program', org: 'EcoFund Brazil', problem: 'Amazon rainforest reforestation carbon offset program for corporate clients', industry: 'Sustainability', dealSize: 50000000 },
  { name: 'Tech Transfer', org: 'SemiChip Taiwan', problem: 'License advanced 5nm semiconductor manufacturing technology', industry: 'Semiconductors', dealSize: 100000000 },
  { name: 'Supply Chain Alliance', org: 'LogisticsPro Netherlands', problem: 'Build integrated European supply chain network with local partners', industry: 'Logistics', dealSize: 35000000 },
  { name: 'Education Initiative', org: 'LearnAfrica Kenya', problem: 'Deploy 100 digital learning centers in rural areas', industry: 'Education', dealSize: 10000000 }
];

const results = {
  timestamp: new Date().toISOString(),
  totalTests: testScenarios.length,
  passed: 0,
  failed: 0,
  tests: [],
  systemIssues: [],
  improvements: []
};

async function closeAnyModals(page) {
  try {
    // Strategy 1: Click X button inside modal content
    const xButton = page.locator('button:has(svg)').filter({ hasText: '' }).first();
    if (await xButton.isVisible({ timeout: 1000 })) {
      await xButton.click({ force: true });
      await page.waitForTimeout(500);
      return true;
    }
    
    // Strategy 2: Press Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Strategy 3: Click modal backdrop (force click through)
    const backdrop = page.locator('div.fixed.inset-0.bg-black\\/50').first();
    if (await backdrop.isVisible({ timeout: 500 })) {
      await backdrop.click({ force: true });
      await page.waitForTimeout(500);
    }
    
  } catch (error) {
    // Try force closing any visible modal
    try {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } catch {
      // Ignore
    }
  }
  return false;
}

async function runTest(page, scenario, testNum) {
  console.log(`\n[${testNum}/${testScenarios.length}] ${scenario.name}`);
  console.log(`Organization: ${scenario.org}`);
  
  const testResult = {
    testNumber: testNum,
    name: scenario.name,
    organization: scenario.org,
    startTime: new Date().toISOString(),
    steps: [],
    success: false,
    readinessScore: 0,
    errors: []
  };
  
  try {
    // Close any open modals first
    await closeAnyModals(page);
    await page.waitForTimeout(500);
    
    // Step 1: Fill Identity
    console.log('  → Opening Identity section...');
    await page.locator('button:has-text("1. Identity")').first().click({ force: true, timeout: 5000 });
    await page.waitForTimeout(800);
    testResult.steps.push('Identity section opened');
    
    console.log('  → Entering organization name...');
    const orgInput = page.locator('input[type="text"]').first();
    await orgInput.clear({ force: true });
    await orgInput.fill(scenario.org);
    await page.waitForTimeout(300);
    testResult.steps.push(`Organization set to: ${scenario.org}`);
    
    // Close Identity modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
    
    // Step 2: Fill Mandate
    console.log('  → Opening Mandate section...');
    await page.locator('button:has-text("2. Mandate")').first().click({ force: true, timeout: 5000 });
    await page.waitForTimeout(800);
    testResult.steps.push('Mandate section opened');
    
    console.log('  → Entering business problem...');
    const problemInput = page.locator('textarea').first();
    await problemInput.clear({ force: true });
    await problemInput.fill(scenario.problem);
    await page.waitForTimeout(300);
    testResult.steps.push('Business problem defined');
    
    // Close Mandate modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
    
    // Check readiness score
    const bodyText = await page.textContent('body');
    const percentMatch = bodyText.match(/(\d+)%/);
    testResult.readinessScore = percentMatch ? parseInt(percentMatch[1]) : 0;
    console.log(`  → Readiness Score: ${testResult.readinessScore}%`);
    
    // Try to generate if ready
    if (testResult.readinessScore >= 40) {
      console.log('  → Attempting report generation with Gemini API...');
      const generateBtn = page.locator('button:has-text("Generate")').first();
      
      if (await generateBtn.isEnabled({ timeout: 2000 })) {
        await generateBtn.click();
        testResult.steps.push('Generate button clicked');
        
        // Wait for AI generation
        console.log('  → Waiting for AI to generate report...');
        await page.waitForTimeout(10000);
        
        // Check if report was generated
        const afterGenBody = await page.textContent('body');
        if (afterGenBody.includes('Executive Summary') || 
            afterGenBody.includes('Market Analysis') ||
            afterGenBody.includes('Strategic Recommendations')) {
          console.log('  ✅ SUCCESS - Report generated with AI!');
          testResult.success = true;
          testResult.steps.push('AI report successfully generated');
          results.passed++;
        } else {
          console.log('  ⚠️  Generate clicked but report not visible');
          testResult.errors.push('Report generation incomplete or not rendered');
          results.failed++;
        }
      } else {
        console.log('  ⚠️  Generate button not enabled');
        testResult.errors.push('Generate button disabled despite readiness score');
        results.failed++;
      }
    } else {
      console.log(`  ⚠️  Insufficient data (${testResult.readinessScore}% < 40%)`);
      testResult.errors.push('Readiness score too low for generation');
      results.failed++;
    }
    
    // Start new mission for next test
    if (testNum < testScenarios.length) {
      console.log('  → Starting new mission...');
      const newBtn = page.locator('button:has-text("New Mission")').first();
      if (await newBtn.isVisible({ timeout: 2000 })) {
        await newBtn.click();
        await page.waitForTimeout(1000);
      } else {
        // Try alternative: reload page
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
      }
    }
    
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    testResult.errors.push(error.message);
    results.failed++;
    
    // Try to recover
    try {
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    } catch (recoveryError) {
      console.log('  ⚠️  Could not recover from error');
    }
  }
  
  testResult.endTime = new Date().toISOString();
  results.tests.push(testResult);
}

// Main execution
const browser = await chromium.launch({ 
  headless: false,
  slowMo: 200
});

const page = await browser.newPage();

try {
  console.log('Navigating to BWGA Intelligence AI system...\n');
  await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('Entering system through landing page...\n');
  await page.locator('text=Initialize System Access').first().click();
  await page.waitForTimeout(1500);
  
  await page.locator('text=/I have read and accept/i').first().click();
  await page.waitForTimeout(500);
  
  await page.locator('text=Initiate New Mission').first().click();
  await page.waitForTimeout(2000);
  
  console.log('✅ System access initialized');
  console.log('='.repeat(80));
  
  // Run all test scenarios
  for (let i = 0; i < testScenarios.length; i++) {
    await runTest(page, testScenarios[i], i + 1);
  }
  
  // Analyze results
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`);
  console.log('='.repeat(80));
  
  // Identify system issues
  const errorPatterns = {};
  results.tests.forEach(test => {
    test.errors.forEach(error => {
      errorPatterns[error] = (errorPatterns[error] || 0) + 1;
    });
  });
  
  if (Object.keys(errorPatterns).length > 0) {
    console.log('\n🔍 IDENTIFIED ISSUES:');
    Object.entries(errorPatterns)
      .sort((a, b) => b[1] - a[1])
      .forEach(([error, count]) => {
        console.log(`  • ${error} (${count} occurrences)`);
        results.systemIssues.push({ issue: error, occurrences: count });
      });
  }
  
  // Generate improvement recommendations
  console.log('\n💡 IMPROVEMENT RECOMMENDATIONS:');
  
  if (results.passed === 0) {
    console.log('  1. CRITICAL: Fix modal/overlay click interception issues');
    console.log('  2. Improve form field detection and interaction');
    console.log('  3. Add better error recovery mechanisms');
    results.improvements.push('Fix UI click interception from modals/overlays');
    results.improvements.push('Improve form interaction reliability');
    results.improvements.push('Add error recovery and retry logic');
  } else if (results.passed < results.totalTests * 0.5) {
    console.log('  1. Stabilize modal close behavior');
    console.log('  2. Improve readiness calculation to reach generation threshold');
    console.log('  3. Add loading indicators for AI generation');
    results.improvements.push('Stabilize modal/dialog behavior');
    results.improvements.push('Improve readiness score calculation');
    results.improvements.push('Add visual feedback for AI operations');
  } else {
    console.log('  1. Optimize AI generation speed');
    console.log('  2. Add batch processing capabilities');
    console.log('  3. Implement results caching');
    results.improvements.push('Optimize AI response times');
    results.improvements.push('Add batch operations support');
    results.improvements.push('Implement intelligent caching');
  }
  
  // Save detailed results
  const resultsFile = 'test-results-comprehensive.json';
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed results saved to: ${resultsFile}`);
  
  console.log('\n✅ Testing complete! Browser will remain open for inspection...');
  console.log('Press Ctrl+C to close.\n');
  
  // Keep browser open for manual inspection
  await page.waitForTimeout(60000);
  
} catch (error) {
  console.log(`\n❌ CRITICAL ERROR: ${error.message}`);
  results.systemIssues.push({ issue: `Critical: ${error.message}`, severity: 'HIGH' });
} finally {
  await browser.close();
}
