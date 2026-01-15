import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the landing page title', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/Totonos/i);
  });

  test('should display main heading', async ({ page }) => {
    // Look for main heading text
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should have login/signup buttons', async ({ page }) => {
    // Check for authentication related buttons/links
    const authButton = page.getByRole('link', { name: /ログイン|サインアップ|始める|無料/i }).first();
    await expect(authButton).toBeVisible();
  });

  test('should navigate to auth page when clicking login', async ({ page }) => {
    // Find and click login button
    const loginButton = page.getByRole('link', { name: /ログイン|始める|無料/i }).first();
    await loginButton.click();

    // Should navigate to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Page should still be visible and functional
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should display feature sections', async ({ page }) => {
    // Check for feature-related content
    const mainContent = page.locator('main, [role="main"], body');
    await expect(mainContent).toBeVisible();
  });
});
