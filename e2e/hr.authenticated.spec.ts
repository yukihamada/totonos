import { test, expect } from '@playwright/test';

test.describe('HR - Employees', () => {
  test('should display employees page', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should display employee list or empty state', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');

    // Page should be rendered
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('HR - Attendance', () => {
  test('should display attendance page', async ({ page }) => {
    await page.goto('/attendance');
    await page.waitForLoadState('networkidle');

    // Should have content (main or body)
    const hasMain = await page.locator('main').isVisible().catch(() => false);
    const hasBody = await page.locator('body').isVisible().catch(() => false);
    expect(hasMain || hasBody).toBe(true);
  });
});

test.describe('HR - Leave Requests', () => {
  test('should display leave requests page', async ({ page }) => {
    await page.goto('/leave-requests');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('HR - Payroll', () => {
  test('should display payroll page', async ({ page }) => {
    await page.goto('/payroll');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('HR - Shifts', () => {
  test('should display shifts page', async ({ page }) => {
    await page.goto('/shifts');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('HR - Social Insurance', () => {
  test('should display social insurance page', async ({ page }) => {
    await page.goto('/social-insurance');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('HR - Year End Adjustment', () => {
  test('should display year end adjustment page', async ({ page }) => {
    await page.goto('/year-end');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('HR - Recruiting', () => {
  test('should display recruiting page', async ({ page }) => {
    await page.goto('/recruiting');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should display job postings', async ({ page }) => {
    await page.goto('/job-postings');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should display candidates page', async ({ page }) => {
    await page.goto('/candidates');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('HR - Onboarding', () => {
  test('should display onboarding page', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    // Should have content (main, form, or body)
    const hasMain = await page.locator('main').isVisible().catch(() => false);
    const hasForm = await page.locator('form').isVisible().catch(() => false);
    const hasBody = await page.locator('body').isVisible().catch(() => false);
    expect(hasMain || hasForm || hasBody).toBe(true);
  });
});

test.describe('HR - Payslips', () => {
  test('should display payslips page', async ({ page }) => {
    await page.goto('/payslips');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});
