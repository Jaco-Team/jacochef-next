const fs = require("fs");
const { defineConfig, devices } = require("@playwright/test");

const systemChromiumCandidates = [
  process.env.PLAYWRIGHT_EXECUTABLE_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);
const systemChromiumPath = systemChromiumCandidates.find((candidate) => fs.existsSync(candidate));

module.exports = defineConfig({
  testDir: "./tests/e2e/design-system",
  outputDir: "./test-results/design-system",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.STORYBOOK_BASE_URL || "http://127.0.0.1:6006",
    ...devices["Desktop Chrome"],
    viewport: { width: 800, height: 400 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        ...(systemChromiumPath
          ? {
              launchOptions: {
                executablePath: systemChromiumPath,
              },
            }
          : {}),
      },
    },
  ],
  webServer: {
    command: "npm run storybook -- --host 127.0.0.1 --ci",
    url: "http://127.0.0.1:6006",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
