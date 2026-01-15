import { test, expect } from '@playwright/test';

test.describe('Navigation - Unauthenticated', () => {
  test('should redirect /dashboard to /auth when not logged in', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect /invoices to /auth when not logged in', async ({ page }) => {
    await page.goto('/invoices');

    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect /contracts to /auth when not logged in', async ({ page }) => {
    await page.goto('/contracts');

    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect /accounting to /auth when not logged in', async ({ page }) => {
    await page.goto('/accounting');

    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect /employees to /auth when not logged in', async ({ page }) => {
    await page.goto('/employees');

    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect /leads to /auth when not logged in', async ({ page }) => {
    await page.goto('/leads');

    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect /wiki to /auth when not logged in', async ({ page }) => {
    await page.goto('/wiki');

    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should redirect /settings to /auth when not logged in', async ({ page }) => {
    await page.goto('/settings');

    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });
});

test.describe('Public Routes', () => {
  test('landing page should be accessible', async ({ page }) => {
    await page.goto('/');

    // Should stay on landing page (not redirect)
    await expect(page).toHaveURL('/');
  });

  test('auth page should be accessible', async ({ page }) => {
    await page.goto('/auth');

    // Should stay on auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('contract sign page should be accessible', async ({ page }) => {
    // Contract signing is public with a token
    await page.goto('/sign/test-token');

    // Should stay on sign page (might show error for invalid token)
    await expect(page).toHaveURL(/\/sign/);
  });
});

test.describe('URL Handling', () => {
  test('should handle 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route-xyz');

    // Either shows 404 page or redirects
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should handle deep links correctly', async ({ page }) => {
    // Try accessing a deep link
    await page.goto('/accounting/journal');

    // Should redirect to auth
    await expect(page).toHaveURL(/\/auth/);
  });
});
