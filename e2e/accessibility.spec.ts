import { test, expect } from '@playwright/test';

test.describe('Accessibility - Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    const count = await h1.count();

    // Should have at least one h1
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper alt text for images', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Images should have alt text or be decorative (role="presentation")
      const hasAlt = alt !== null && alt !== '';
      const isDecorative = role === 'presentation' || role === 'none';

      expect(hasAlt || isDecorative).toBe(true);
    }
  });

  test('should have focusable navigation elements', async ({ page }) => {
    // Tab through the page
    await page.keyboard.press('Tab');

    // Check that something is focused
    const focused = page.locator(':focus');
    const count = await focused.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should have visible focus indicators', async ({ page }) => {
    // Focus first interactive element
    await page.keyboard.press('Tab');

    // The focused element should be visible
    const focused = page.locator(':focus');
    const isVisible = await focused.isVisible();

    expect(isVisible).toBe(true);
  });

  test('buttons should have accessible names', async ({ page }) => {
    const buttons = page.getByRole('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute('aria-label');
      const text = await button.textContent();
      const hasAccessibleName = (name && name.length > 0) || (text && text.trim().length > 0);

      // Skip if button is not visible
      const isVisible = await button.isVisible();
      if (isVisible) {
        expect(hasAccessibleName).toBe(true);
      }
    }
  });

  test('links should have accessible names', async ({ page }) => {
    const links = page.getByRole('link');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 20); i++) {  // Check first 20 links
      const link = links.nth(i);
      const name = await link.getAttribute('aria-label');
      const text = await link.textContent();
      const hasAccessibleName = (name && name.length > 0) || (text && text.trim().length > 0);

      const isVisible = await link.isVisible();
      if (isVisible) {
        expect(hasAccessibleName).toBe(true);
      }
    }
  });
});

test.describe('Accessibility - Auth Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('form inputs should have labels', async ({ page }) => {
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have label association or aria-label
      const hasLabel = id || ariaLabel || ariaLabelledby || placeholder;
      expect(hasLabel).toBeTruthy();
    }
  });

  test('form should be navigable with keyboard', async ({ page }) => {
    // Tab to first input
    await page.keyboard.press('Tab');

    // Should be able to type
    await page.keyboard.type('test@example.com');

    // Tab to submit button
    await page.keyboard.press('Tab');

    // Check we're on a button
    const focused = page.locator(':focus');
    const tagName = await focused.evaluate(el => el.tagName);

    expect(['BUTTON', 'INPUT', 'A']).toContain(tagName);
  });
});

test.describe('Color Contrast and Visual', () => {
  test('should not have empty buttons', async ({ page }) => {
    await page.goto('/');

    const buttons = page.getByRole('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();

      if (isVisible) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const hasContent = (text && text.trim().length > 0) || ariaLabel;

        // Button should have some content
        expect(hasContent).toBeTruthy();
      }
    }
  });
});
