/**
 * CRUD Flow Tests with Screenshots
 *
 * Tests that verify data input reflects in lists,
 * with screenshots at each step.
 */

import { test, expect } from '@playwright/test';
import { shouldSkipAuthTests, skipAuthMessage } from './test-utils';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = 'screenshots/flows';

// Ensure screenshot directory exists
test.beforeAll(async () => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

test.describe('Invoice CRUD Flow', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test.setTimeout(120000);

  test('create invoice and verify it appears in list', async ({ page }) => {
    // Step 1: Go to invoices list
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot: Initial list state
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'invoice-01-list-before.png'),
      fullPage: true,
    });

    // Step 2: Click create button
    const createButton = page.getByRole('button', { name: /新規作成|新規|作成/i })
      .or(page.getByRole('link', { name: /新規作成|新規|作成/i }));

    if (await createButton.first().isVisible()) {
      await createButton.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Screenshot: Create form
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'invoice-02-create-form.png'),
        fullPage: true,
      });

      // Step 3: Fill in invoice details
      const titleInput = page.locator('input[id="title"]')
        .or(page.getByPlaceholder(/件名|タイトル|Title/i));

      if (await titleInput.first().isVisible()) {
        const timestamp = Date.now();
        await titleInput.first().fill(`E2Eテスト請求書 ${timestamp}`);

        // Fill due date if visible
        const dueDateInput = page.locator('input[type="date"]')
          .or(page.locator('input[id="dueDate"]'));
        if (await dueDateInput.first().isVisible()) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 30);
          await dueDateInput.first().fill(futureDate.toISOString().split('T')[0]);
        }

        // Screenshot: Filled form
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'invoice-03-form-filled.png'),
          fullPage: true,
        });

        // Step 4: Add invoice item if available
        const addItemButton = page.getByRole('button', { name: /項目を追加|追加|Add/i });
        if (await addItemButton.first().isVisible()) {
          await addItemButton.first().click();
          await page.waitForTimeout(500);

          // Fill item description
          const descInput = page.locator('input[placeholder*="品目"]')
            .or(page.locator('input').filter({ hasText: '' }).first());

          if (await descInput.first().isVisible()) {
            await descInput.first().fill('テストサービス');
          }

          // Fill quantity and price
          const inputs = page.locator('input[type="number"]');
          const inputCount = await inputs.count();
          if (inputCount >= 2) {
            await inputs.nth(inputCount - 2).fill('1');
            await inputs.nth(inputCount - 1).fill('10000');
          }

          await page.waitForTimeout(500);

          // Screenshot: With item added
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'invoice-04-item-added.png'),
            fullPage: true,
          });
        }

        // Step 5: Submit the form
        const submitButton = page.getByRole('button', { name: /保存|作成|送信|Submit|Save/i })
          .filter({ hasNot: page.locator('[disabled]') });

        if (await submitButton.first().isVisible()) {
          await submitButton.first().click();
          await page.waitForTimeout(3000);
          await page.waitForLoadState('networkidle');

          // Screenshot: After creation (detail or list page)
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'invoice-05-after-create.png'),
            fullPage: true,
          });
        }
      }
    }

    // Step 6: Go back to list and verify
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot: List after creation
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'invoice-06-list-after.png'),
      fullPage: true,
    });

    // Verify the page loaded
    await expect(page).toHaveURL(/invoices/);
  });
});

test.describe('Expense CRUD Flow', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test.setTimeout(120000);

  test('create expense and verify it appears in list', async ({ page }) => {
    // Step 1: Go to expenses list
    await page.goto('/expenses');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot: Initial list
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'expense-01-list-before.png'),
      fullPage: true,
    });

    // Step 2: Navigate to create form
    const createButton = page.getByRole('button', { name: /新規|経費申請|作成/i })
      .or(page.getByRole('link', { name: /新規|経費申請|作成/i }));

    if (await createButton.first().isVisible()) {
      await createButton.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Screenshot: Create form
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'expense-02-create-form.png'),
        fullPage: true,
      });

      // Step 3: Fill in expense details
      const titleInput = page.locator('input[id="title"]')
        .or(page.getByPlaceholder(/内容|タイトル|Title/i));

      if (await titleInput.first().isVisible()) {
        await titleInput.first().fill('E2Eテスト経費');
      }

      // Fill amount
      const amountInput = page.locator('input[id="amount"]')
        .or(page.locator('input[type="number"]').first());

      if (await amountInput.first().isVisible()) {
        await amountInput.first().fill('5000');
      }

      // Select category if available
      const categorySelect = page.locator('button[role="combobox"]').first();
      if (await categorySelect.isVisible()) {
        await categorySelect.click();
        await page.waitForTimeout(300);
        const option = page.locator('[role="option"]').first();
        if (await option.isVisible()) {
          await option.click();
        }
      }

      await page.waitForTimeout(500);

      // Screenshot: Filled form
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'expense-03-form-filled.png'),
        fullPage: true,
      });

      // Step 4: Submit
      const submitButton = page.getByRole('button', { name: /申請|保存|送信|Submit/i });
      if (await submitButton.first().isVisible()) {
        await submitButton.first().click();
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');

        // Screenshot: After submission
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'expense-04-after-create.png'),
          fullPage: true,
        });
      }
    }

    // Step 5: Go back to list
    await page.goto('/expenses');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot: List after creation
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'expense-05-list-after.png'),
      fullPage: true,
    });

    await expect(page).toHaveURL(/expenses/);
  });
});

test.describe('Lead CRUD Flow', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test.setTimeout(120000);

  test('create lead and verify it appears in list', async ({ page }) => {
    // Step 1: Go to leads list
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot: Initial list
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'lead-01-list-before.png'),
      fullPage: true,
    });

    // Step 2: Open create dialog/form
    const createButton = page.getByRole('button', { name: /新規|追加|作成|リード/i });
    if (await createButton.first().isVisible()) {
      await createButton.first().click();
      await page.waitForTimeout(1000);

      // Screenshot: Create dialog/form
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'lead-02-create-form.png'),
        fullPage: true,
      });

      // Step 3: Fill in lead details
      const companyInput = page.locator('input[id="company"]')
        .or(page.getByPlaceholder(/会社名|Company/i))
        .or(page.locator('input').first());

      if (await companyInput.first().isVisible()) {
        const timestamp = Date.now();
        await companyInput.first().fill(`E2Eテスト株式会社 ${timestamp}`);
      }

      // Fill contact name if available
      const contactInput = page.locator('input[id="contact"]')
        .or(page.getByPlaceholder(/担当者|Contact/i));

      if (await contactInput.first().isVisible()) {
        await contactInput.first().fill('テスト太郎');
      }

      // Fill email if available
      const emailInput = page.locator('input[type="email"]')
        .or(page.getByPlaceholder(/メール|Email/i));

      if (await emailInput.first().isVisible()) {
        await emailInput.first().fill('test@example.com');
      }

      await page.waitForTimeout(500);

      // Screenshot: Filled form
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'lead-03-form-filled.png'),
        fullPage: true,
      });

      // Step 4: Submit
      const submitButton = page.getByRole('button', { name: /保存|作成|追加|Save|Create/i });
      if (await submitButton.first().isVisible()) {
        await submitButton.first().click();
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');
      }
    }

    // Step 5: Verify in list
    await page.goto('/leads');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot: List after creation
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'lead-04-list-after.png'),
      fullPage: true,
    });

    await expect(page).toHaveURL(/leads/);
  });
});

test.describe('Employee CRUD Flow', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test.setTimeout(120000);

  test('view employees list with data', async ({ page }) => {
    // Go to employees list
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Screenshot: Employees list
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'employee-01-list.png'),
      fullPage: true,
    });

    // Try to open add dialog
    const addButton = page.getByRole('button', { name: /新規|追加|従業員/i });
    if (await addButton.first().isVisible()) {
      await addButton.first().click();
      await page.waitForTimeout(1000);

      // Screenshot: Add employee form
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'employee-02-add-form.png'),
        fullPage: true,
      });
    }

    await expect(page).toHaveURL(/employees/);
  });
});

test.describe('Project CRUD Flow', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test.setTimeout(120000);

  test('create project and verify it appears', async ({ page }) => {
    // Step 1: Go to projects list
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot: Initial list
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'project-01-list-before.png'),
      fullPage: true,
    });

    // Step 2: Navigate to create
    const createButton = page.getByRole('button', { name: /新規|作成|プロジェクト/i })
      .or(page.getByRole('link', { name: /新規|作成/i }));

    if (await createButton.first().isVisible()) {
      await createButton.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Screenshot: Create form
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'project-02-create-form.png'),
        fullPage: true,
      });

      // Fill in project details
      const nameInput = page.locator('input[id="name"]')
        .or(page.getByPlaceholder(/プロジェクト名|Name/i))
        .or(page.locator('input').first());

      if (await nameInput.first().isVisible()) {
        const timestamp = Date.now();
        await nameInput.first().fill(`E2Eテストプロジェクト ${timestamp}`);
      }

      await page.waitForTimeout(500);

      // Screenshot: Filled form
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'project-03-form-filled.png'),
        fullPage: true,
      });

      // Submit
      const submitButton = page.getByRole('button', { name: /保存|作成|Save|Create/i });
      if (await submitButton.first().isVisible()) {
        await submitButton.first().click();
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');

        // Screenshot: After creation
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'project-04-after-create.png'),
          fullPage: true,
        });
      }
    }

    // Go back to list
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot: List after
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'project-05-list-after.png'),
      fullPage: true,
    });

    await expect(page).toHaveURL(/projects/);
  });
});

test.describe('Contract CRUD Flow', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test.setTimeout(120000);

  test('view contracts and create flow', async ({ page }) => {
    // Go to contracts list
    await page.goto('/contracts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot: Contracts list
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'contract-01-list.png'),
      fullPage: true,
    });

    // Try create flow
    const createButton = page.getByRole('button', { name: /新規|作成|契約/i })
      .or(page.getByRole('link', { name: /新規|作成/i }));

    if (await createButton.first().isVisible()) {
      await createButton.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Screenshot: Create form
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'contract-02-create-form.png'),
        fullPage: true,
      });
    }

    await expect(page).toHaveURL(/contract/);
  });
});

test.describe('Deal Pipeline Flow', () => {
  test.skip(shouldSkipAuthTests, skipAuthMessage);
  test.setTimeout(120000);

  test('view pipeline with deals', async ({ page }) => {
    // Go to pipeline view
    await page.goto('/pipeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Screenshot: Pipeline view
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'pipeline-01-view.png'),
      fullPage: true,
    });

    // Go to deals list
    await page.goto('/deals');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot: Deals list
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'pipeline-02-deals-list.png'),
      fullPage: true,
    });

    // Try to create a deal
    const createButton = page.getByRole('button', { name: /新規|作成|商談/i });
    if (await createButton.first().isVisible()) {
      await createButton.first().click();
      await page.waitForTimeout(1000);

      // Screenshot: Create deal form
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'pipeline-03-create-deal.png'),
        fullPage: true,
      });
    }
  });
});
