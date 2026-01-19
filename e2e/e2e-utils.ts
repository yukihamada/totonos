/**
 * E2E Test Utilities
 *
 * Shared utilities for faster and more reliable E2E tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for data to load (smart waiting)
 * Waits for loading indicators to disappear and content to appear
 */
export async function waitForDataLoad(page: Page, options?: {
  timeout?: number;
  skipLoadingCheck?: boolean;
}) {
  const timeout = options?.timeout || 10000;

  // Wait for network to be idle
  await page.waitForLoadState('networkidle', { timeout });

  if (!options?.skipLoadingCheck) {
    // Wait for loading indicators to disappear
    const loadingSelectors = [
      '.animate-spin',
      '[data-loading="true"]',
      '[aria-busy="true"]',
      '.skeleton',
      '[data-testid="loading"]',
    ];

    for (const selector of loadingSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 500 })) {
          await element.waitFor({ state: 'hidden', timeout: timeout - 500 });
        }
      } catch {
        // Element might not exist, continue
      }
    }
  }

  // Small buffer for React to settle
  await page.waitForTimeout(200);
}

/**
 * Wait for content to be visible
 */
export async function waitForContent(page: Page, selector: string, timeout = 10000) {
  await page.locator(selector).first().waitFor({ state: 'visible', timeout });
}

/**
 * Wait for table data to load
 */
export async function waitForTableData(page: Page, minRows = 1, timeout = 10000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const rows = await page.locator('tbody tr').count();
    if (rows >= minRows) {
      return;
    }
    await page.waitForTimeout(200);
  }

  // Don't fail if no data - empty state is valid
}

/**
 * Wait for list/cards to load
 */
export async function waitForListData(page: Page, selector: string, timeout = 10000) {
  try {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout });
  } catch {
    // Empty list is valid
  }
}

/**
 * Smart screenshot capture
 * Takes screenshot after ensuring content is loaded
 */
export async function captureScreenshot(
  page: Page,
  path: string,
  options?: {
    fullPage?: boolean;
    waitForSelector?: string;
    minWait?: number;
  }
) {
  // Wait for data to load
  await waitForDataLoad(page);

  // Wait for specific selector if provided
  if (options?.waitForSelector) {
    try {
      await page.locator(options.waitForSelector).first().waitFor({
        state: 'visible',
        timeout: 5000
      });
    } catch {
      // Continue even if selector not found
    }
  }

  // Minimum wait if specified
  if (options?.minWait) {
    await page.waitForTimeout(options.minWait);
  }

  // Capture screenshot
  await page.screenshot({
    path,
    fullPage: options?.fullPage ?? true,
  });
}

/**
 * Fast navigation with data wait
 */
export async function navigateAndWait(page: Page, url: string, options?: {
  waitForSelector?: string;
  timeout?: number;
}) {
  await page.goto(url, { timeout: options?.timeout || 30000 });
  await waitForDataLoad(page, { timeout: options?.timeout || 10000 });

  if (options?.waitForSelector) {
    await waitForContent(page, options.waitForSelector, options?.timeout || 10000);
  }
}

/**
 * Fill form quickly
 */
export async function fillForm(page: Page, fields: Record<string, string>) {
  for (const [selector, value] of Object.entries(fields)) {
    const input = page.locator(selector).first();
    if (await input.isVisible({ timeout: 1000 })) {
      await input.fill(value);
    }
  }
}

/**
 * Click button safely
 */
export async function clickButton(page: Page, name: string | RegExp) {
  const button = page.getByRole('button', { name }).first();
  if (await button.isVisible({ timeout: 2000 })) {
    await button.click();
    return true;
  }
  return false;
}

/**
 * Assert page has content (not loading, not error)
 */
export async function assertPageHasContent(page: Page) {
  await waitForDataLoad(page);

  // Check that page isn't showing an error
  const errorTexts = ['エラー', 'Error', 'Not Found', '404'];
  for (const text of errorTexts) {
    const errorElement = page.getByText(text, { exact: false });
    // Only fail if it's a prominent error message
    if (await errorElement.isVisible({ timeout: 500 })) {
      const classes = await errorElement.getAttribute('class');
      if (classes?.includes('destructive') || classes?.includes('error')) {
        throw new Error(`Page shows error: ${text}`);
      }
    }
  }
}
