import { test, expect } from '@playwright/test';

// baseURL is set in playwright.config.ts (http://localhost:3000)

test.describe('BW Nexus AI — Command Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#acceptTerms').scrollIntoViewIfNeeded();
    await page.locator('#acceptTerms').check();
    await page.getByRole('button', { name: /Launch Intelligence OS/i }).click();
    await expect(page.locator('[data-testid="bwai-search-input"]')).toBeVisible({ timeout: 15000 });
  });

  test('Command Center launches BW AI Global Search', async ({ page }) => {
    await expect(page.locator('[data-testid="bwai-search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="bwai-search-button"]')).toBeVisible();
  });

  test('BW AI Search — search for a city (Manila)', async ({ page }) => {
    const searchInput = page.locator('[data-testid="bwai-search-input"]');
    const searchButton = page.locator('[data-testid="bwai-search-button"]');

    await searchInput.fill('Manila');
    await searchButton.click();

    // Wait for research progress or result
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Manila').first()).toBeVisible({ timeout: 30000 });
  });

  test('BW AI Search — search for a company (Ayala Corporation)', async ({ page }) => {
    const searchInput = page.locator('[data-testid="bwai-search-input"]');
    const searchButton = page.locator('[data-testid="bwai-search-button"]');

    await searchInput.fill('Ayala Corporation');
    await searchButton.click();

    await page.waitForTimeout(3000);
    await expect(page.locator('text=Ayala Corporation').first()).toBeVisible({ timeout: 30000 });
  });

  test('BW AI Search — button disabled when input is empty', async ({ page }) => {
    const searchButton = page.locator('[data-testid="bwai-search-button"]');
    await expect(searchButton).toBeDisabled();
  });
});

test.describe('BW Nexus AI — Platform Health', () => {
  test('Page renders without critical errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Filter out expected non-critical errors (missing API keys, network, etc.)
    const criticalErrors = errors.filter(
      (e) => !e.includes('API key') && !e.includes('network') && !e.includes('fetch')
    );
    expect(criticalErrors.length).toBe(0);
  });
});
