import { test, expect } from '@playwright/test';
import { shouldSkipAuthTests, skipAuthMessage } from './test-utils';

test.describe('System & Settings', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test.describe('Notifications Page', () => {
    test('should display notifications page', async ({ page }) => {
      await page.goto('/notifications');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Team Members Page', () => {
    test('should display team members page', async ({ page }) => {
      await page.goto('/team');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Workflows Page', () => {
    test('should display workflows page', async ({ page }) => {
      await page.goto('/workflows');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Audit Log Page', () => {
    test('should display audit log page', async ({ page }) => {
      await page.goto('/audit-log');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('API Docs Page', () => {
    test('should display API documentation page', async ({ page }) => {
      await page.goto('/api-docs');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Developer Settings Page', () => {
    test('should display developer settings page', async ({ page }) => {
      await page.goto('/developer');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('MCP Settings Page', () => {
    test('should display MCP settings page', async ({ page }) => {
      await page.goto('/mcp-settings');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('AI Settings Page', () => {
    test('should display AI settings page', async ({ page }) => {
      await page.goto('/ai-settings');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Organization Settings Page', () => {
    test('should display organization settings page', async ({ page }) => {
      await page.goto('/organization');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Company Settings Page', () => {
    test('should display company settings page', async ({ page }) => {
      await page.goto('/company');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Profile Page', () => {
    test('should display profile page', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Settings Menu Page', () => {
    test('should display settings menu page', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Backup Settings Page', () => {
    test('should display backup settings page', async ({ page }) => {
      await page.goto('/backup-settings');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Webhook Settings Page', () => {
    test('should display webhook settings page', async ({ page }) => {
      await page.goto('/webhook-settings');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });
});
