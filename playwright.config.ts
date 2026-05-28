import { defineConfig } from "@playwright/test";

/**
 * Playwright harness for the Notes app the agents build (E2E #8 v12).
 *
 * `webServer` builds the app and serves it with `next start` on a fixed
 * port, waits for the URL to respond, and reuses an already-running dev
 * server locally (but always boots a fresh one in CI). QA (the platform's
 * quality gate) drives this same running app for its UI acceptance checks.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
