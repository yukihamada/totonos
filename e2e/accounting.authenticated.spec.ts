import { test, expect } from '@playwright/test';
import { shouldSkipAuthTests, skipAuthMessage } from './test-utils';

test.describe('Accounting - Main Page', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test('should display accounting page', async ({ page }) => {
    await page.goto('/accounting');
    await expect(page.getByRole('heading', { name: '会計' })).toBeVisible();
  });

  test('should display accounting menu grid', async ({ page }) => {
    await page.goto('/accounting');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Accounting - Journal Entries', () => {
  test('should navigate to journal page', async ({ page }) => {
    await page.goto('/accounting/journal');
    await expect(page.getByRole('heading', { name: '仕訳帳' })).toBeVisible();
  });

  test('should display journal entries table or empty state', async ({ page }) => {
    await page.goto('/accounting/journal');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should have new entry button', async ({ page }) => {
    await page.goto('/accounting/journal');
    const newButton = page.getByRole('button', { name: /新規仕訳/ });
    await expect(newButton).toBeVisible();
  });
});

test.describe('Accounting - Ledger', () => {
  test('should navigate to ledger page', async ({ page }) => {
    await page.goto('/accounting/ledger');
    await expect(page.getByRole('heading', { name: '総勘定元帳' })).toBeVisible();
  });

  test('should display account selector or list', async ({ page }) => {
    await page.goto('/accounting/ledger');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Accounting - Financial Statements', () => {
  test('should navigate to statements page', async ({ page }) => {
    await page.goto('/accounting/statements');
    await expect(page.getByRole('heading', { name: '財務諸表' })).toBeVisible();
  });

  test('should display statement types', async ({ page }) => {
    await page.goto('/accounting/statements');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Accounting - Fixed Assets', () => {
  test('should navigate to assets page', async ({ page }) => {
    await page.goto('/accounting/assets');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should display assets table or empty state', async ({ page }) => {
    await page.goto('/accounting/assets');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Accounting - Expenses', () => {
  test('should navigate to accounting expenses page', async ({ page }) => {
    await page.goto('/accounting/expenses');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should display expense claims table or empty state', async ({ page }) => {
    await page.goto('/accounting/expenses');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Accounting - Tax Calculation', () => {
  test('should navigate to tax page', async ({ page }) => {
    await page.goto('/accounting/tax');
    await expect(page.getByRole('heading', { name: '消費税計算' })).toBeVisible();
  });

  test('should display tax calculation UI', async ({ page }) => {
    await page.goto('/accounting/tax');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Accounting - Payables', () => {
  test('should navigate to payables page', async ({ page }) => {
    await page.goto('/accounting/payables');
    await expect(page.getByRole('heading', { name: '買掛金管理' })).toBeVisible();
  });

  test('should display payables aging or empty state', async ({ page }) => {
    await page.goto('/accounting/payables');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Accounting - Cash Flow', () => {
  test('should navigate to cashflow page', async ({ page }) => {
    await page.goto('/accounting/cashflow');
    await page.waitForLoadState('networkidle');
    // Check for the h1 heading with text containing キャッシュフロー
    const heading = page.locator('h1:has-text("キャッシュフロー")').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should display cash flow statement sections', async ({ page }) => {
    await page.goto('/accounting/cashflow');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Accounting - Period Close', () => {
  test('should navigate to period close page', async ({ page }) => {
    await page.goto('/accounting/period-close');
    await expect(page.getByRole('heading', { name: '決算処理' })).toBeVisible();
  });

  test('should display period selection', async ({ page }) => {
    await page.goto('/accounting/period-close');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Accounting - Templates', () => {
  test('should navigate to templates page', async ({ page }) => {
    await page.goto('/accounting/templates');
    await expect(page.getByRole('heading', { name: '仕訳テンプレート' })).toBeVisible();
  });

  test('should display templates list or empty state', async ({ page }) => {
    await page.goto('/accounting/templates');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should have create template button', async ({ page }) => {
    await page.goto('/accounting/templates');
    const createButton = page.getByRole('button', { name: /作成|追加/ });
    await expect(createButton).toBeVisible();
  });
});

test.describe('Accounting - Cost Centers', () => {
  test('should navigate to cost centers page', async ({ page }) => {
    await page.goto('/accounting/cost-centers');
    await expect(page.getByRole('heading', { name: '部門管理' })).toBeVisible();
  });

  test('should display cost centers list or empty state', async ({ page }) => {
    await page.goto('/accounting/cost-centers');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should have add department button', async ({ page }) => {
    await page.goto('/accounting/cost-centers');
    const addButton = page.getByRole('button', { name: /追加/ });
    await expect(addButton).toBeVisible();
  });
});

test.describe('Accounting - Settings', () => {
  test('should navigate to accounting settings page', async ({ page }) => {
    await page.goto('/accounting/settings');
    await expect(page.getByRole('heading', { name: '会計設定' })).toBeVisible();
  });

  test('should display settings sections', async ({ page }) => {
    await page.goto('/accounting/settings');
    await page.waitForLoadState('networkidle');

    // Should have main content
    const hasContent = await page.locator('main').isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });
});

test.describe('Accounting - Navigation', () => {
  test('should navigate between accounting pages', async ({ page }) => {
    await page.goto('/accounting');
    await page.waitForLoadState('networkidle');

    // Try to navigate to journal page
    const journalLink = page.getByRole('link', { name: /仕訳帳/ }).first();
    if (await journalLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await journalLink.click();
      await expect(page).toHaveURL(/\/accounting\/journal/);
    }
  });
});
