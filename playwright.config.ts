import { defineConfig, devices } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env file for E2E tests
const envPath = resolve(__dirname, '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value;
    }
  });
}

/**
 * Totonos E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Global timeout for each test
  timeout: 60000,

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:8080',

    // Collect trace for all tests
    trace: 'on',

    // Screenshot for all tests
    screenshot: 'on',

    // Video for all tests
    video: 'on',

    // Action timeout
    actionTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    // Setup project - authenticates and saves state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // Unauthenticated tests (public pages)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /.*\.authenticated\.spec\.ts/,
    },

    // Authenticated tests (protected pages)
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        // Use saved auth state
        storageState: 'e2e/.auth/user.json',
      },
      testMatch: /.*\.authenticated\.spec\.ts/,
      dependencies: ['setup'],
    },

    // ZeroStep AI tests - unauthenticated
    {
      name: 'zerostep',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /zerostep\/.*\.zerostep\.spec\.ts/,
      testIgnore: /.*\.authenticated\.spec\.ts/,
    },

    // ZeroStep AI tests - authenticated
    {
      name: 'zerostep-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      testMatch: /zerostep\/.*\.zerostep\.authenticated\.spec\.ts/,
      dependencies: ['setup'],
    },

    // Uncomment to test on more browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
