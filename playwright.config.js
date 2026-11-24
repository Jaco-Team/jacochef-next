const fs = require("fs");
const { defineConfig } = require("@playwright/test");

const systemChromiumCandidates = [
  process.env.PLAYWRIGHT_EXECUTABLE_PATH,
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);
const systemChromiumPath = systemChromiumCandidates.find((candidate) => fs.existsSync(candidate));

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    headless: process.env.PLAYWRIGHT_HEADLESS !== "0",
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
});
