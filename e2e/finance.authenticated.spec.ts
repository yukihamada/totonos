import { test, expect } from '@playwright/test';

test.describe('Finance & Credits', () => {
  test.describe('Clients Page', () => {
    test('should display clients page', async ({ page }) => {
      await page.goto('/clients');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });

    test('should show client list or empty state', async ({ page }) => {
      await page.goto('/clients');
      await page.waitForLoadState('networkidle');

      const pageContent = await page.textContent('main');
      expect(pageContent).toBeTruthy();
    });
  });

  test.describe('Products Page', () => {
    test('should display products page', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Payment Links Page', () => {
    test('should display payment links page', async ({ page }) => {
      await page.goto('/payment-links');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Credits Page', () => {
    test('should display credits page', async ({ page }) => {
      await page.goto('/credits');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Credit Logs Page', () => {
    test('should display credit logs page', async ({ page }) => {
      await page.goto('/credit-logs');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Pricing Page', () => {
    test('should display pricing page', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Referrals Page', () => {
    test('should display referrals page', async ({ page }) => {
      await page.goto('/referrals');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Trust Passport Page', () => {
    test('should display trust passport page', async ({ page }) => {
      await page.goto('/trust-passport');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Boost Page', () => {
    test('should display boost page', async ({ page }) => {
      await page.goto('/boost');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Usage Dashboard Page', () => {
    test('should display usage dashboard page', async ({ page }) => {
      await page.goto('/usage');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Reports Page', () => {
    test('should display reports page', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Estimates Page', () => {
    test('should display estimates page', async ({ page }) => {
      await page.goto('/estimates');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Purchase Orders Page', () => {
    test('should display purchase orders page', async ({ page }) => {
      await page.goto('/purchase-orders');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });
});
