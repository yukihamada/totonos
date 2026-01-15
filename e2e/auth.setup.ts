import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

// E2E Test Key from environment
const E2E_TEST_KEY = process.env.VITE_E2E_TEST_KEY;

setup('authenticate', async ({ page }) => {
  if (!E2E_TEST_KEY) {
    console.log('⚠️  VITE_E2E_TEST_KEY not set, skipping auth setup');
    console.log('   Set VITE_E2E_TEST_KEY in .env (e.g., "my-secret-test-key")');
    console.log('   Then login with email: test+e2e-my-secret-test-key@example.com');

    // Create empty auth state for unauthenticated tests
    await page.goto('/');
    await page.context().storageState({ path: authFile });
    return;
  }

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
});
