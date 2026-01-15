import { test, expect } from '@playwright/test';

test.describe('Settings - Main Page', () => {
  test('should display settings page', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Should have settings heading or theme settings
    const hasSettings = await page.getByRole('heading', { name: /設定|テーマ/ }).first().isVisible().catch(() => false);
    expect(hasSettings).toBe(true);
  });
});

test.describe('Settings - Profile', () => {
  test('should display profile page', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Should have profile content - check for any content on the page
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Settings - Organization', () => {
  test('should display organization settings page', async ({ page }) => {
    await page.goto('/organization');
    await page.waitForLoadState('networkidle');

    // Should have organization content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Settings - Team Members', () => {
  test('should display team members page', async ({ page }) => {
    await page.goto('/team');
    await page.waitForLoadState('networkidle');

    // Should have team content
    const hasTeam = await page.getByText(/チーム|メンバー|ユーザー|Team/).isVisible().catch(() => false);
    expect(hasTeam).toBe(true);
  });
});

test.describe('Settings - Notifications', () => {
  test('should display notifications page', async ({ page }) => {
    await page.goto('/notifications');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Settings - Workflows', () => {
  test('should display workflows page', async ({ page }) => {
    await page.goto('/workflows');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Settings - Audit Log', () => {
  test('should display audit log page', async ({ page }) => {
    await page.goto('/audit-log');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Settings - AI Settings', () => {
  test('should display AI settings page', async ({ page }) => {
    await page.goto('/settings/ai');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Settings - Company Settings', () => {
  test('should display company settings page', async ({ page }) => {
    await page.goto('/settings/company');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});
