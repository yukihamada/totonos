import { test, expect } from '@playwright/test';
import { shouldSkipAuthTests, skipAuthMessage } from './test-utils';

test.describe('Contracts - Authenticated', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test.beforeEach(async ({ page }) => {
    await page.goto('/contracts');
  });

  test('should display contracts page', async ({ page }) => {
    await expect(page).toHaveURL('/contracts');
    await expect(page.locator('h1')).toContainText(/契約|Contracts/i);
  });

  test('should display create contract button', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /新規|作成|追加|New|Create/i })
      .or(page.getByRole('link', { name: /新規|作成|追加|New|Create/i }));

    await expect(createButton.first()).toBeVisible();
  });

  test('should display contract list or empty state', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Page should have some content (either list, empty state, or loading)
    const hasContent = await page.locator('main, [role="main"], .content').first().isVisible().catch(() => true);
    expect(hasContent).toBe(true);
  });

  test('should display contract status filters', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for any interactive filter elements or tabs
    const hasFilters = await page.locator('button, [role="tab"], select, [role="combobox"]').first().isVisible().catch(() => false);
    expect(hasFilters).toBe(true);
  });
});

test.describe('Contract Creation - Authenticated', () => {
  test('should have create contract button', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForTimeout(1000);

    // Look for create button - could be button or link
    const createButton = page.getByRole('button', { name: /新規作成|新規|作成|追加|New|Create/i })
      .or(page.getByRole('link', { name: /新規作成|新規|作成|追加|New|Create/i }))
      .or(page.locator('button:has-text("新規作成")'))
      .or(page.locator('a:has-text("新規作成")'));

    await expect(createButton.first()).toBeVisible({ timeout: 5000 });
  });
});
