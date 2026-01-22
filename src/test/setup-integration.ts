/**
 * Integration Test Setup
 *
 * This setup file connects to a real Supabase Local instance.
 * Run `supabase start` before running integration tests.
 *
 * Usage: npm run test:integration
 */

import "@testing-library/jest-dom";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { beforeAll, afterAll, beforeEach, vi } from "vitest";
import type { Database } from "@/integrations/supabase/types";

// Environment variables for local Supabase (loaded from .env.test)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

// Test user credentials
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || "test@example.com";
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || "testpassword123";

// Create real Supabase clients
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key: string) => globalThis.localStorage?.getItem(key) ?? null,
      setItem: (key: string, value: string) => globalThis.localStorage?.setItem(key, value),
      removeItem: (key: string) => globalThis.localStorage?.removeItem(key),
    },
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Admin client for test setup/cleanup (bypasses RLS)
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Test user state
let testUser: User | null = null;

/**
 * Create or sign in as test user
 */
export async function signInAsTestUser(): Promise<User> {
  // Retry logic for concurrent test runs
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });

    if (signInData.user) {
      testUser = signInData.user;
      return signInData.user;
    }

    // If sign in failed due to invalid credentials, try to create the user
    if (signInError?.message?.includes("Invalid login credentials")) {
      try {
        // Check if user already exists (might have been created by another test)
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const users = existingUsers?.users || [];
        const existingUser = users.find((u: { email?: string }) => u.email === TEST_USER_EMAIL);

        if (!existingUser) {
          const { error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email: TEST_USER_EMAIL,
            password: TEST_USER_PASSWORD,
            email_confirm: true,
          });

          if (signUpError && !signUpError.message.includes("already been registered")) {
            lastError = new Error(`Failed to create test user: ${signUpError.message}`);
            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
            continue;
          }
        }

        // Now sign in
        const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        });

        if (newSignIn?.user) {
          testUser = newSignIn.user;
          return newSignIn.user;
        }

        lastError = new Error(`Failed to sign in after creating test user: ${newSignInError?.message}`);
      } catch (err) {
        lastError = err as Error;
      }
    } else {
      lastError = new Error(`Failed to sign in as test user: ${signInError?.message}`);
    }

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
  }

  throw lastError || new Error("Failed to sign in as test user after retries");
}

/**
 * Sign out test user
 */
export async function signOutTestUser(): Promise<void> {
  await supabase.auth.signOut();
  testUser = null;
}

/**
 * Get current test user
 */
export function getTestUser(): User | null {
  return testUser;
}

/**
 * Clean up test data from a table
 */
export async function cleanupTable(tableName: string, userId?: string): Promise<void> {
  if (userId) {
    // Delete records for specific user - use any to bypass strict typing for dynamic table names
    await (supabaseAdmin as any).from(tableName).delete().eq("user_id", userId);
  } else {
    // Delete all records (be careful!)
    await (supabaseAdmin as any).from(tableName).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }
}

/**
 * Estate-specific cleanup for integration tests
 */
export async function cleanupEstateData(userId: string): Promise<void> {
  // Clean up in reverse dependency order
  await cleanupTable("rent_payments", userId);
  await cleanupTable("owner_payments", userId);
  await cleanupTable("bank_transactions", userId);
  await cleanupTable("rent_invoices", userId);
  await cleanupTable("rental_contracts", userId);
  await cleanupTable("tenants", userId);
  await cleanupTable("units", userId);
  await cleanupTable("buildings", userId);
  await cleanupTable("property_owners", userId);
}

// Mock window.matchMedia (needed for some UI components)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scrollTo
window.scrollTo = vi.fn();

// Provide the real supabase client to the app
vi.mock("@/integrations/supabase/client", () => ({
  supabase,
}));

// Global setup
beforeAll(async () => {
  console.log("🚀 Integration tests starting - connecting to Supabase Local...");

  // Verify connection
  const { error } = await supabase.from("profiles").select("id").limit(1);
  if (error && !error.message.includes("Results contain 0 rows")) {
    console.warn("⚠️  Could not connect to Supabase Local. Make sure to run: supabase start");
  }
});

afterAll(async () => {
  await signOutTestUser();
  console.log("✅ Integration tests completed");
});
