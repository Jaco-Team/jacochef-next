const { defineConfig, devices } = require("@playwright/test");
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
const devPort = Number(new URL(baseURL).port || 3000);

module.exports = defineConfig({
  testDir: "./tests/e2e/sklad-items",
  outputDir: "./test-results/sklad-items",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report/sklad-items", open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } }
      : {}),
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${devPort}`,
    url: `${baseURL}/sklad_items`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
