import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test.describe('404 Page', () => {
    test('should display 404 page for non-existent routes', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-12345');
      await page.waitForLoadState('networkidle');

      // Should show 404 content
      const content = await page.textContent('body');
      expect(content).toMatch(/404|not found|ページが見つかりません/i);
    });

    test('should have a link back to home or dashboard', async ({ page }) => {
      await page.goto('/non-existent-page');
      await page.waitForLoadState('networkidle');

      // Should have a navigation link
      const hasLink = await page.locator('a[href="/"], a[href="/dashboard"]').first().isVisible();
      expect(hasLink).toBe(true);
    });
  });

  test.describe('Authentication Redirects', () => {
    test('should redirect to auth page when accessing protected route without login', async ({ page }) => {
      // Clear any existing auth state
      await page.context().clearCookies();
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should redirect to auth or show login form
      const url = page.url();
      const hasAuthContent = url.includes('/auth') || 
        await page.locator('input[type="email"], input[type="text"][name="email"]').isVisible();
      
      expect(hasAuthContent).toBe(true);
    });

    test('should redirect to auth when accessing settings without login', async ({ page }) => {
      await page.context().clearCookies();
      
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      const hasAuthContent = url.includes('/auth') || 
        await page.locator('input[type="email"], input[type="text"][name="email"]').isVisible();
      
      expect(hasAuthContent).toBe(true);
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation error for empty email on auth page', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');

      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /ログイン|送信|Login|Submit/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for validation message
        await page.waitForTimeout(500);
        
        // Check for HTML5 validation or custom error message
        const emailInput = page.getByRole('textbox');
        const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
        expect(isInvalid).toBe(true);
      }
    });
  });

  test.describe('Network Error Handling', () => {
    test('should handle slow network gracefully', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });

      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Page should still load
      const body = await page.locator('body').isVisible();
      expect(body).toBe(true);
    });
  });

  test.describe('Empty States', () => {
    test('should display landing page content', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Landing page should have main content
      const hasContent = await page.locator('main, [role="main"], #root').first().isVisible();
      expect(hasContent).toBe(true);
    });
  });
});
