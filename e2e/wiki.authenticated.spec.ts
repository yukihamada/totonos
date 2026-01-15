import { test, expect } from '@playwright/test';

test.describe('Wiki - Main Page', () => {
  test('should display wiki page', async ({ page }) => {
    await page.goto('/wiki');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should display wiki articles or empty state', async ({ page }) => {
    await page.goto('/wiki');
    await page.waitForLoadState('networkidle');

    // Page should be rendered
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Wiki - Hierarchy', () => {
  test('should display wiki hierarchy page', async ({ page }) => {
    await page.goto('/wiki-hierarchy');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('IT Assets', () => {
  test('should display IT assets page', async ({ page }) => {
    await page.goto('/it-assets');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});
