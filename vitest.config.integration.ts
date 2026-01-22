/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Integration test config - connects to real Supabase Local
export default defineConfig(({ mode }) => {
  // Load .env.test for integration tests
  const env = loadEnv("test", process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Expose env vars to tests
      "process.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
      "process.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY),
      "process.env.SUPABASE_SERVICE_ROLE_KEY": JSON.stringify(env.SUPABASE_SERVICE_ROLE_KEY),
      "process.env.TEST_USER_EMAIL": JSON.stringify(env.TEST_USER_EMAIL),
      "process.env.TEST_USER_PASSWORD": JSON.stringify(env.TEST_USER_PASSWORD),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup-integration.ts"],
      include: ["src/**/*.integration.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      testTimeout: 30000, // Longer timeout for DB operations
      hookTimeout: 30000,
      maxConcurrency: 1, // Run tests sequentially to avoid DB conflicts
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: [
          "node_modules/",
          "src/test/",
          "**/*.d.ts",
          "src/components/ui/",
        ],
      },
    },
  };
});
