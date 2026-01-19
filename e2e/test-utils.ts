/**
 * E2E Test Utilities
 * Shared helpers for authenticated tests
 */

// Check if real E2E credentials are configured
const E2E_TEST_KEY = process.env.VITE_E2E_TEST_KEY;

/**
 * Returns true if authenticated tests should be skipped
 * (when no real E2E key is configured)
 */
export const shouldSkipAuthTests = !E2E_TEST_KEY || E2E_TEST_KEY === 'test-key-12345';

/**
 * Skip message for authenticated tests
 */
export const skipAuthMessage = 'Skipping: VITE_E2E_TEST_KEY not configured for real authentication';
