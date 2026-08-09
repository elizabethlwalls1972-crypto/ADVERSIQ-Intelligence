import { chromium } from 'playwright';

const APP_URL = process.env.APP_URL || 'http://127.0.0.1:5174';
const APP_ACTION = process.env.APP_ACTION || '';
const APP_SELECTOR = process.env.APP_SELECTOR || 'text=Initialize System Access';
const APP_FLOW = process.env.APP_FLOW || '';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', (msg) => {
    console.log(`BROWSER ${msg.type()} ${msg.text()}`);
  });
  page.on('pageerror', (error) => {
    console.error(`BROWSER pageerror ${error.message}`);
  });

  try {
    await page.goto(APP_URL, { waitUntil: 'networkidle' });

    if (APP_ACTION === 'click') {
      await page.waitForSelector(APP_SELECTOR, { timeout: 5000 });
      await page.click(APP_SELECTOR);
    }

    if (APP_FLOW === 'enter-os') {
      const entryButton = page.locator('text=Initialize System Access');
      if (await entryButton.count()) {
        await entryButton.first().click();
      }

      const acceptLabel = page.locator('text=/I have read and accept/i');
      await acceptLabel.first().click();

      const missionButton = page.locator('text=Initiate New Mission');
      await missionButton.first().click();
    }

    await page.waitForTimeout(3000);
  } finally {
    await browser.close();
  }
})();
