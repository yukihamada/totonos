import { test as setup, expect } from '@playwright/test';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

const authFile = 'e2e/.auth/user.json';

// E2E Test Key from environment
const E2E_TEST_KEY = process.env.VITE_E2E_TEST_KEY;

setup('authenticate', async ({ page }) => {
  // Ensure auth directory exists
  const authDir = dirname(authFile);
  if (!existsSync(authDir)) {
    mkdirSync(authDir, { recursive: true });
  }

  if (!E2E_TEST_KEY || E2E_TEST_KEY === 'test-key-12345') {
    console.log('⚠️  VITE_E2E_TEST_KEY not set or using default, skipping real auth');
    console.log('   Authenticated tests will be skipped in CI without proper credentials');

    // Create empty auth state for unauthenticated tests
    await page.goto('/');
    
    // Save empty auth state
    const emptyState = {
      cookies: [],
      origins: []
    };
    writeFileSync(authFile, JSON.stringify(emptyState, null, 2));
    console.log(`Empty auth state saved to: ${authFile}`);
    return;
  }

  try {
    // Navigate to auth page
    await page.goto('/auth');

    // Enter test email with the secret key
    const testEmail = `e2e-test+e2e-${E2E_TEST_KEY}@totonos.jp`;
    console.log(`Logging in with: ${testEmail}`);

    const emailInput = page.getByRole('textbox');
    await emailInput.fill(testEmail);

    // Submit the form
    const submitButton = page.getByRole('button', { name: /ログイン|送信|Login|Submit/i });
    await submitButton.click();

    // Wait for redirect to dashboard (E2E test login is instant)
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Verify we're logged in
    await expect(page.locator('h1')).toContainText(/ダッシュボード|Dashboard/i);
    console.log('Authentication successful!');

    // Save authentication state
    await page.context().storageState({ path: authFile });
    console.log(`Auth state saved to: ${authFile}`);
  } catch (error) {
    console.log('⚠️  Authentication failed, saving empty state');
    console.log(`   Error: ${error}`);
    
    // Save empty auth state on failure
    const emptyState = {
      cookies: [],
      origins: []
    };
    writeFileSync(authFile, JSON.stringify(emptyState, null, 2));
  }
});
