import { test, expect } from "@playwright/test";

/**
 * Harness smoke test — proves the Playwright webServer boots the built app
 * and the home page is reachable. The agents add the real Notes UI e2e
 * tests (create flow, delete flow) during the E2E; this one just keeps the
 * harness honest so a broken server surfaces immediately rather than as a
 * confusing failure inside a feature test.
 */
test("home page loads", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBeLessThan(400);
});
