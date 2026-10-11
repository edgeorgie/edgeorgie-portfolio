import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end suite against a production build. `npm run e2e` builds, starts
 * `next start` on :3100 and runs every spec in ./e2e. Chromium only: the
 * suite is a regression net for navigation, links, accessibility and
 * console hygiene, not a cross-browser matrix.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  timeout: 45_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3100",
    trace: "retain-on-failure",
    colorScheme: "dark",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run start -- -p 3100",
        url: "http://localhost:3100",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
