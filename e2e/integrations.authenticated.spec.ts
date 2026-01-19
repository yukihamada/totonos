import { test, expect } from '@playwright/test';
import { shouldSkipAuthTests, skipAuthMessage } from './test-utils';

test.describe('External Integrations', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test.describe('Integrations Page', () => {
    test('should display integrations page', async ({ page }) => {
      await page.goto('/integrations');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Email Integration Page', () => {
    test('should display email integration page', async ({ page }) => {
      await page.goto('/email-integration');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Slack Integration Page', () => {
    test('should display Slack integration page', async ({ page }) => {
      await page.goto('/slack-integration');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('LINE Settings Page', () => {
    test('should display LINE settings page', async ({ page }) => {
      await page.goto('/line-settings');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Bank Connections Page', () => {
    test('should display bank connections page', async ({ page }) => {
      await page.goto('/bank-connections');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Inbound Emails Page', () => {
    test('should display inbound emails page', async ({ page }) => {
      await page.goto('/inbound-emails');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Data Import Page', () => {
    test('should display data import page', async ({ page }) => {
      await page.goto('/data-import');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });
});
