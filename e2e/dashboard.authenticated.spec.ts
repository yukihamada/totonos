import { test, expect } from '@playwright/test';
import { shouldSkipAuthTests, skipAuthMessage } from './test-utils';

test.describe('Dashboard - Authenticated', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display dashboard page', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('ダッシュボード');
  });

  test('should display KPI stats cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check for at least one stats-related text (cards may vary)
    const statsVisible = await page.getByText(/請求|入金|売上|パイプライン|成約|Revenue|Invoice/i).first().isVisible().catch(() => false);
    expect(statsVisible).toBe(true);
  });

  test('should display sidebar navigation', async ({ page }) => {
    // Check for navigation or menu elements
    const hasNav = await page.locator('nav, aside, [role="navigation"]').first().isVisible().catch(() => false);
    const hasMenuButton = await page.getByRole('button').first().isVisible().catch(() => false);

    expect(hasNav || hasMenuButton).toBe(true);
  });

  test('should navigate to invoices from sidebar', async ({ page }) => {
    await page.getByRole('link', { name: /請求書/i }).click();
    await expect(page).toHaveURL(/\/invoices/);
  });

  test('should display user menu or profile', async ({ page }) => {
    // Look for user avatar or profile section
    const userSection = page.locator('[data-testid="user-menu"]')
      .or(page.getByRole('button', { name: /ログアウト/i }))
      .or(page.locator('button:has-text("ログアウト")'));

    await expect(userSection).toBeVisible({ timeout: 10000 });
  });

  test('should have logout functionality', async ({ page }) => {
    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /ログアウト/i })
      .or(page.locator('button:has-text("ログアウト")'));

    await logoutButton.click();

    // Should redirect to auth page after logout
    await expect(page).toHaveURL(/\/(auth)?$/);
  });
});

test.describe('Dashboard - Charts and Widgets', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display revenue chart section', async ({ page }) => {
    // Wait for charts to load
    await page.waitForTimeout(1000);

    // Look for chart container
    const chartSection = page.locator('[data-testid="revenue-chart"]')
      .or(page.locator('.recharts-wrapper'))
      .or(page.getByText(/売上|収益|Revenue/i));

    // Chart or related text should be visible
    await expect(chartSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display recent activity section', async ({ page }) => {
    const activitySection = page.getByText(/アクティビティ|Activity/i)
      .or(page.locator('[data-testid="activity-feed"]'));

    await expect(activitySection.first()).toBeVisible({ timeout: 10000 });
  });
});
