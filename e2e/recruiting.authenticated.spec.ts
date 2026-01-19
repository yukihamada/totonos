import { test, expect } from '@playwright/test';

test.describe('Recruiting Module', () => {
  test.describe('Recruiting Page', () => {
    test('should display recruiting page', async ({ page }) => {
      await page.goto('/recruiting');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Job Postings Page', () => {
    test('should display job postings page', async ({ page }) => {
      await page.goto('/job-postings');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Job Posting New Page', () => {
    test('should display new job posting page', async ({ page }) => {
      await page.goto('/job-postings/new');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Candidates Page', () => {
    test('should display candidates page', async ({ page }) => {
      await page.goto('/candidates');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Interview Schedule Page', () => {
    test('should display interview schedule page', async ({ page }) => {
      await page.goto('/interview-schedule');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });

  test.describe('Recruiting Reports Page', () => {
    test('should display recruiting reports page', async ({ page }) => {
      await page.goto('/recruiting-reports');
      await page.waitForLoadState('networkidle');

      const hasContent = await page.locator('main').isVisible();
      expect(hasContent).toBe(true);
    });
  });
});
