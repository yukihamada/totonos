import { test, expect } from '@playwright/test';
import { shouldSkipAuthTests, skipAuthMessage } from './test-utils';

test.describe('Invoices - Authenticated', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test.beforeEach(async ({ page }) => {
    await page.goto('/invoices');
  });

  test('should display invoices page', async ({ page }) => {
    await expect(page).toHaveURL('/invoices');
    await expect(page.locator('h1')).toContainText(/請求書|Invoices/i);
  });

  test('should display create invoice button', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /新規|作成|追加|New|Create/i })
      .or(page.getByRole('link', { name: /新規|作成|追加|New|Create/i }));

    await expect(createButton.first()).toBeVisible();
  });

  test('should display invoice list or empty state', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);

    // Either show invoice list or empty state
    const content = page.locator('table')
      .or(page.getByText(/請求書がありません|No invoices/i))
      .or(page.locator('[data-testid="invoice-list"]'));

    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have create invoice button', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for create button with various possible names
    const createButton = page.getByRole('button', { name: /新規作成|新規|作成|追加|New|Create/i });
    await expect(createButton.first()).toBeVisible({ timeout: 5000 });
  });
});
