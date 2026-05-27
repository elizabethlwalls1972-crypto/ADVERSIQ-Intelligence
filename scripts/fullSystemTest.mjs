import { chromium } from 'playwright';

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Test persona: Dr. Elena Rodriguez from MediTech Solutions Inc.
const testData = {
  // Identity
  organizationName: 'MediTech Solutions Inc.',
  organizationType: 'Private Limited Company (Ltd/Pty Ltd)',
  country: 'Vietnam',
  userCity: 'Ho Chi Minh City',
  industry: 'Healthcare & Medical Devices',
  strategicIntent: 'Market Entry (Greenfield)',
  
  // Mandate
  problemStatement: 'We need to establish a cost-effective manufacturing hub in Vietnam to serve the growing ASEAN medical device market. Current Singapore operations are at capacity and labor costs are prohibitive for scaling. Vietnam offers skilled technical workforce, favorable FDI policies, and proximity to key markets.',
  
  // Market context
  region: 'Asia-Pacific',
  expansionTimeline: '1-2 Years',
  
  // Partnership
  partnerPersonas: 'Local Manufacturing Partner, Government Trade Agency, Medical Equipment Distributor',
  
  // Financial
  dealSize: '15000000',
  fundingSource: 'Balance Sheet / Free Cash Flow',
  
  // Risk
  riskTolerance: 'medium'
};

(async () => {
  console.log('\n=== BWGA Intelligence AI - FULL SYSTEM TEST ===');
  console.log('Test Persona: Dr. Elena Rodriguez');
  console.log('Organization: MediTech Solutions Inc.');
  console.log('Mission: Vietnam Manufacturing Hub Expansion\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all console logs
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[BROWSER ${type.toUpperCase()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    console.error(`[PAGE ERROR] ${error.message}`);
  });

  try {
    console.log('STEP 1: Navigate to landing page...');
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✓ Page loaded successfully');
    await page.waitForTimeout(3000);

    console.log('STEP 2: Enter the system...');
    const initButton = page.locator('text=Initialize System Access').first();
    await initButton.waitFor({ state: 'visible', timeout: 10000 });
    await initButton.click();
    await page.waitForTimeout(1000);

    console.log('STEP 3: Accept terms...');
    const termsCheckbox = page.locator('text=/I have read and accept/i').first();
    await termsCheckbox.waitFor({ state: 'visible', timeout: 5000 });
    await termsCheckbox.click();
    await page.waitForTimeout(500);

    console.log('STEP 4: Initiate new mission...');
    const missionButton = page.locator('text=Initiate New Mission').first();
    await missionButton.click();
    await page.waitForTimeout(2000);

    console.log('\n--- FILLING IDENTITY SECTION ---');
    
    // Open Identity modal
    console.log('Opening Identity modal...');
    const identityButton = page.locator('button:has-text("1. Identity")').first();
    await identityButton.click();
    await page.waitForTimeout(1000);

    // Fill organization name
    console.log(`Setting organization: ${testData.organizationName}`);
    const orgNameInput = page.locator('input[placeholder*="organization" i], input[placeholder*="entity" i]').first();
    await orgNameInput.fill(testData.organizationName);

    // Select organization type
    console.log(`Setting type: ${testData.organizationType}`);
    const orgTypeSelect = page.locator('select').first();
    await orgTypeSelect.selectOption({ label: testData.organizationType });

    // Select country
    console.log(`Setting country: ${testData.country}`);
    const countrySelects = page.locator('select');
    for (let i = 0; i < await countrySelects.count(); i++) {
      const select = countrySelects.nth(i);
      const options = await select.locator('option').allTextContents();
      if (options.includes(testData.country)) {
        await select.selectOption({ label: testData.country });
        break;
      }
    }

    // Industry selection
    console.log(`Setting industry: ${testData.industry}`);
    const industryCheckbox = page.locator(`label:has-text("${testData.industry}")`).first();
    if (await industryCheckbox.count() > 0) {
      await industryCheckbox.click();
    }

    // Close Identity modal
    console.log('Saving Identity data...');
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Close")').first();
    if (await saveButton.count() > 0) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    console.log('\n--- FILLING MANDATE SECTION ---');
    
    const mandateButton = page.locator('button:has-text("2. Mandate")').first();
    await mandateButton.click();
    await page.waitForTimeout(1000);

    // Strategic intent
    console.log(`Setting strategic intent: ${testData.strategicIntent}`);
    const intentCheckbox = page.locator(`label:has-text("${testData.strategicIntent}")`).first();
    if (await intentCheckbox.count() > 0) {
      await intentCheckbox.click();
    }

    // Problem statement
    console.log('Entering problem statement...');
    const problemTextarea = page.locator('textarea').first();
    await problemTextarea.fill(testData.problemStatement);

    const mandateSaveBtn = page.locator('button:has-text("Save"), button:has-text("Close")').first();
    if (await mandateSaveBtn.count() > 0) {
      await mandateSaveBtn.click();
      await page.waitForTimeout(1000);
    }

    console.log('\n--- FILLING MARKET SECTION ---');
    
    const marketButton = page.locator('button:has-text("3. Market")').first();
    await marketButton.click();
    await page.waitForTimeout(1000);

    // City input
    console.log(`Setting city: ${testData.userCity}`);
    const cityInputs = page.locator('input[placeholder*="city" i]');
    if (await cityInputs.count() > 0) {
      await cityInputs.first().fill(testData.userCity);
    }

    const marketSaveBtn = page.locator('button:has-text("Save"), button:has-text("Close")').first();
    if (await marketSaveBtn.count() > 0) {
      await marketSaveBtn.click();
      await page.waitForTimeout(1000);
    }

    console.log('\n--- FILLING PARTNER PERSONAS ---');
    
    const partnerButton = page.locator('button:has-text("4. Partners")').first();
    await partnerButton.click();
    await page.waitForTimeout(1000);

    const partnerInput = page.locator('input').filter({ hasText: /partner/i }).first();
    if (await partnerInput.count() > 0) {
      await partnerInput.fill(testData.partnerPersonas);
    }

    const partnerSaveBtn = page.locator('button:has-text("Save"), button:has-text("Close")').first();
    if (await partnerSaveBtn.count() > 0) {
      await partnerSaveBtn.click();
      await page.waitForTimeout(1000);
    }

    console.log('\n--- FILLING FINANCIAL SECTION ---');
    
    const financialButton = page.locator('button:has-text("5. Financial")').first();
    await financialButton.click();
    await page.waitForTimeout(1000);

    const dealSizeInput = page.locator('input[type="number"]').first();
    if (await dealSizeInput.count() > 0) {
      await dealSizeInput.fill(testData.dealSize);
    }

    const finSaveBtn = page.locator('button:has-text("Save"), button:has-text("Close")').first();
    if (await finSaveBtn.count() > 0) {
      await finSaveBtn.click();
      await page.waitForTimeout(1000);
    }

    console.log('\n--- CHECKING READINESS ---');
    
    // Check completion percentage
    const readinessText = await page.textContent('body');
    const percentMatch = readinessText.match(/(\d+)%/);
    if (percentMatch) {
      console.log(`System Readiness: ${percentMatch[1]}%`);
    }

    console.log('\n--- GENERATING REPORT ---');
    
    const generateButton = page.locator('button:has-text("Generate Draft"), button:has-text("Generate")').first();
    if (await generateButton.isEnabled()) {
      console.log('Generate button is enabled! Triggering report generation...');
      await generateButton.click();
      await page.waitForTimeout(5000);
      
      console.log('Waiting for report generation to complete...');
      await page.waitForTimeout(10000);
      
      // Check for success indicators
      const bodyText = await page.textContent('body');
      if (bodyText.includes('Executive Summary') || bodyText.includes('complete')) {
        console.log('✓ Report generation appears successful!');
      }
    } else {
      console.log('⚠ Generate button is disabled. Checking requirements...');
    }

    console.log('\n--- TEST COMPLETE ---');
    console.log('Taking screenshot of final state...');
    await page.screenshot({ path: 'test-results.png', fullPage: true });

    console.log('\nTest session will remain open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n=== TEST SESSION ENDED ===\n');
  }
})();
