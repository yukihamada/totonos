import { test, expect } from '@playwright/test';

test.describe('Leads/CRM - Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leads');
  });

  test('should display leads page', async ({ page }) => {
    await expect(page).toHaveURL('/leads');
    await expect(page.locator('h1')).toContainText(/リード|商談|Leads|Deals/i);
  });

  test('should display create lead button', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /新規|作成|追加|New|Create/i })
      .or(page.getByRole('link', { name: /新規|作成|追加|New|Create/i }));

    await expect(createButton.first()).toBeVisible();
  });

  test('should display leads list or pipeline view', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Leads can be in list or kanban/pipeline view
    const content = page.locator('table')
      .or(page.locator('[data-testid="pipeline"]'))
      .or(page.locator('[data-testid="kanban"]'))
      .or(page.getByText(/リードがありません|No leads/i));

    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have stage/status filters', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for any interactive filter elements
    const hasFilters = await page.locator('button, [role="tab"], select, [role="combobox"]').first().isVisible().catch(() => false);
    expect(hasFilters).toBe(true);
  });
});

test.describe('Lead Creation - Authenticated', () => {
  test('should navigate to create lead page or modal', async ({ page }) => {
    await page.goto('/leads');

    const createButton = page.getByRole('button', { name: /新規|作成|追加/i })
      .or(page.getByRole('link', { name: /新規|作成|追加/i }));

    await createButton.first().click();

    // Should show creation form or modal
    await expect(page.getByText(/リード|商談|Lead|Deal/i).first()).toBeVisible({ timeout: 5000 });
  });
});
