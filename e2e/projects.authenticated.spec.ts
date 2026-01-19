import { test, expect } from '@playwright/test';
import { shouldSkipAuthTests, skipAuthMessage } from './test-utils';

test.describe('Projects - Main Page', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test('should display projects page', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should display project list or empty state', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // Page should be rendered
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Projects - Time Log', () => {
  test('should display time log page', async ({ page }) => {
    await page.goto('/timelog');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Reports - Main Page', () => {
  test('should display reports page', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Sales - Deals', () => {
  test('should display deals page', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Sales - Pipeline', () => {
  test('should display pipeline page', async ({ page }) => {
    await page.goto('/pipeline');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Sales - Activities', () => {
  test('should display activities page', async ({ page }) => {
    await page.goto('/activities');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Sales - Clients', () => {
  test('should display clients page', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Sales - Products', () => {
  test('should display products page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});
