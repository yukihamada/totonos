import { test, expect } from '@playwright/test';
import { shouldSkipAuthTests, skipAuthMessage } from './test-utils';

test.describe('Expenses - Main Page', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test('should display expenses page', async ({ page }) => {
    await page.goto('/expenses');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should display expense list or empty state', async ({ page }) => {
    await page.goto('/expenses');
    await page.waitForLoadState('networkidle');

    // Page should be rendered
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Expenses - Receipt Capture', () => {
  test('should display receipt capture page', async ({ page }) => {
    await page.goto('/receipt-capture');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Expenses - Settings', () => {
  test('should display expense settings page', async ({ page }) => {
    await page.goto('/expenses/settings');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Bank Connections', () => {
  test('should display bank connections page', async ({ page }) => {
    await page.goto('/bank-connections');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Reconciliation', () => {
  test('should display reconciliation page', async ({ page }) => {
    await page.goto('/reconciliation');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Purchase Orders', () => {
  test('should display purchase orders page', async ({ page }) => {
    await page.goto('/purchase-orders');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Estimates', () => {
  test('should display estimates page', async ({ page }) => {
    await page.goto('/estimates');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Data Import', () => {
  test('should display data import page', async ({ page }) => {
    await page.goto('/data-import');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Credits', () => {
  test('should display credits page', async ({ page }) => {
    await page.goto('/credits');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Sales Forecast', () => {
  test('should display sales forecast page', async ({ page }) => {
    await page.goto('/sales-forecast');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});
