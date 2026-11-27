import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { stripVTControlCharacters } from "node:util";
import { afterEach, expect, test, vi } from "vitest";

const require = createRequire(import.meta.url);
const {
  reason,
  emptyReport,
  fromVitest,
  formatReports,
  startupReason,
} = require("../../../../scripts/test-reporters/report.cjs");
const nodeReporter = require("../../../../scripts/test-reporters/node.cjs");
const PlaywrightReporter = require("../../../../scripts/test-reporters/playwright.cjs");
const { runCommands } = require("../../../../scripts/test.js");
const temporaryDirectories = [];

function temporaryDirectory() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "chef-report-test-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});

test("a source assertion reports the missing pattern without dumping actual source", () => {
  const source = "PRIVATE_SOURCE_MARKER\n".repeat(1000);
  let failure;
  try {
    assert.match(source, /requiredCapability/);
  } catch (error) {
    failure = error;
  }
  const report = {
    ...emptyReport("Node.js"),
    total: 1,
    failed: 1,
    failures: [
      {
        name: "capability test",
        file: path.join(process.cwd(), "tests/unit/example.test.mjs"),
        line: 12,
        reason: reason({ cause: failure }),
      },
    ],
  };
  const text = formatReports([report]);
  expect(text).toContain("requiredCapability");
  expect(text).toContain("tests/unit/example.test.mjs:12");
  expect(text).not.toContain("PRIVATE_SOURCE_MARKER");
  expect(text.length).toBeLessThan(500);
});

test("primitive mismatches are explained and large structured values stay out of the console", () => {
  expect(reason({ operator: "strictEqual", expected: 1, actual: 0 })).toContain(
    "ожидалось 1, получено 0",
  );
  expect(reason({ operator: "deepStrictEqual", expected: { x: 1 }, actual: { x: 2 } })).toBe(
    "Структуры данных не соответствуют проверке deepStrictEqual",
  );
  expect(
    startupReason("Vitest banner\n\nSyntaxError: malformed configuration\nconst privateSource = 1"),
  ).toBe("SyntaxError: malformed configuration");
});

test("Vitest hook errors retain the file reason, and startup errors cannot become green zero-test runs", () => {
  const report = fromVitest({
    success: false,
    numTotalTests: 1,
    numFailedTests: 1,
    testResults: [
      {
        name: "hook.test.js",
        status: "failed",
        message: "Error: fixture could not initialize\nprivate code frame",
        assertionResults: [{ fullName: "dependent test", status: "failed", failureMessages: [] }],
      },
    ],
  });
  expect(report.failures[0].reason).toBe("Error: fixture could not initialize");
  const startup = fromVitest({
    success: false,
    numTotalTests: 0,
    testResults: [
      {
        name: "missing.test.js",
        status: "failed",
        message: "Error: Cannot find module fixture",
        assertionResults: [],
      },
    ],
  });
  expect(startup.errors[0].message).toContain("Cannot find module");
  expect(formatReports([startup])).toContain("ошибок запуска 1");
});

test("the combined report preserves both runners, a nonzero result and full logs outside stdout", () => {
  const directory = temporaryDirectory();
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const tasks = ["node", "vitest"].map((runner) => ({
    runner,
    root: process.cwd(),
    command: "fixture",
    args: runner === "node" ? ["--test"] : ["vitest", "run"],
  }));
  let call = 0;
  const spawn = vi.fn((command, args, options) => {
    fs.writeSync(options.stdio[1], "PRIVATE_RAW_LOG\n");
    const report =
      call++ === 0
        ? {
            ...emptyReport("Node.js"),
            total: 2,
            passed: 1,
            failed: 1,
            failures: [{ name: "failed fixture", reason: "Fixture reason" }],
          }
        : { success: true, numTotalTests: 3, numPassedTests: 3, testResults: [] };
    fs.writeFileSync(options.env.CHEF_TEST_REPORT_FILE, JSON.stringify(report));
    return { status: call === 1 ? 1 : 0 };
  });
  expect(runCommands(tasks, spawn, { directory })).toBe(1);
  expect(spawn).toHaveBeenCalledTimes(2);
  const text = stripVTControlCharacters(log.mock.calls.map((entry) => entry[0]).join("\n"));
  expect(text).toContain("Итого: всего 5, успешно 4, ошибок 1");
  expect(text).not.toContain("PRIVATE_RAW_LOG");
  const run = path.join(directory, fs.readdirSync(directory)[0]);
  expect(fs.readFileSync(path.join(run, "node-full.log"), "utf8")).toContain("PRIVATE_RAW_LOG");
});

test("node events distinguish expected TODO failures from failed suite hooks", async () => {
  const output = path.join(temporaryDirectory(), "node.json");
  vi.stubEnv("CHEF_TEST_REPORT_FILE", output);
  async function* events() {
    yield {
      type: "test:fail",
      data: {
        name: "expected todo",
        todo: true,
        details: { type: "test", error: new Error("not implemented") },
      },
    };
    yield {
      type: "test:fail",
      data: {
        name: "suite initialization",
        file: "test.cjs",
        line: 10,
        details: {
          type: "suite",
          error: { failureType: "hookFailed", cause: new Error("database fixture unavailable") },
        },
      },
    };
    yield {
      type: "test:summary",
      data: { counts: { tests: 2, passed: 0, failed: 0, skipped: 0, cancelled: 1, todo: 1 } },
    };
  }
  for await (const chunk of nodeReporter(events())) void chunk;
  const report = JSON.parse(fs.readFileSync(output, "utf8"));
  expect(report.failures).toEqual([]);
  expect(report.todo).toBe(1);
  expect(report.cancelled).toBe(1);
  expect(report.errors[0].message).toContain("database fixture unavailable");
});

test("Playwright counts final outcomes once across retries and keeps hook, cancellation and artifact details", () => {
  const directory = temporaryDirectory();
  const output = path.join(directory, "playwright.json");
  vi.stubEnv("CHEF_TEST_REPORT_FILE", output);
  const makeTest = (name, outcome, results) => ({
    titlePath: () => ["desktop", name],
    location: { file: path.join(directory, "fixture.spec.js"), line: 8 },
    expectedStatus: "passed",
    outcome: () => outcome,
    results,
  });
  const tests = [
    makeTest("flaky", "flaky", [
      { status: "failed", errors: [] },
      { status: "passed", errors: [] },
    ]),
    makeTest("hook dependent", "unexpected", [
      {
        status: "failed",
        errors: [{ message: "Error: Setup failed\nPRIVATE_CODE_FRAME" }],
        attachments: [{ name: "trace", path: path.join(directory, "trace.zip") }],
      },
    ]),
    makeTest("cancelled", "unexpected", [{ status: "interrupted", errors: [] }]),
    makeTest("skipped", "skipped", [{ status: "skipped", errors: [] }]),
  ];
  const reporter = new PlaywrightReporter();
  reporter.onBegin(
    {
      rootDir: path.join(directory, "nested/tests"),
      configFile: path.join(directory, "playwright.config.js"),
    },
    { allTests: () => tests },
  );
  expect(reporter.root).toBe(directory);
  reporter.onError({ message: "Error: global setup diagnostic\nPRIVATE_GLOBAL_FRAME" });
  reporter.onEnd({ status: "failed" });
  const report = JSON.parse(fs.readFileSync(output, "utf8"));
  expect([
    report.total,
    report.passed,
    report.failed,
    report.skipped,
    report.cancelled,
    report.flaky,
  ]).toEqual([4, 1, 1, 1, 1, 1]);
  expect(report.failures[0].reason).toBe("Error: Setup failed");
  expect(report.failures[0].artifacts[0].path).toMatch(/trace\.zip$/);
  expect(report.errors).toHaveLength(1);
  expect(formatReports([report])).not.toContain("PRIVATE_");
});

test("missing structured output explains a startup failure rather than reporting success", () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  const spawn = vi.fn((command, args, options) => {
    fs.writeSync(
      options.stdio[2],
      "Vitest banner\nError: Cannot load config file\nPRIVATE_CODE_FRAME",
    );
    return { status: 1 };
  });
  const directory = temporaryDirectory();
  expect(
    runCommands(
      [{ runner: "vitest", root: process.cwd(), command: "fixture", args: ["vitest", "run"] }],
      spawn,
      { directory },
    ),
  ).toBe(1);
  const run = path.join(directory, fs.readdirSync(directory)[0]);
  const report = JSON.parse(fs.readFileSync(path.join(run, "summary.json"), "utf8"))[0];
  expect(report.errors[0].message).toContain("Cannot load config file");
  expect(report.total).toBe(0);
});

test("real Playwright default output cleanup cannot remove summary or full logs", () => {
  const directory = temporaryDirectory();
  const playwright = path.dirname(require.resolve("@playwright/test/package.json"));
  const reporter = path.resolve("scripts/test-reporters/playwright.cjs");
  // A local package root contains Playwright's default outputDir entirely in this fixture.
  fs.writeFileSync(path.join(directory, "package.json"), JSON.stringify({ private: true }));
  const outputDirectory = path.join(directory, "test-results");
  fs.mkdirSync(outputDirectory);
  const cleanupMarker = path.join(outputDirectory, "pre-existing-output");
  fs.writeFileSync(cleanupMarker, "Playwright must remove this before the fixture runs");
  fs.writeFileSync(
    path.join(directory, "report.spec.cjs"),
    `
    const { test, expect } = require(${JSON.stringify(playwright)});
    test('fixture passed', () => { console.log('STDOUT_PRESERVED'); expect(1).toBe(1); });
    test('fixture failed', () => expect(1).toBe(2));
  `,
  );
  const config = path.join(directory, "playwright.config.cjs");
  fs.writeFileSync(
    config,
    `module.exports = { testDir: __dirname, testMatch: 'report.spec.cjs', workers: 1, reporter: [[${JSON.stringify(reporter)}]] };`,
  );
  vi.spyOn(console, "log").mockImplementation(() => {});
  const status = runCommands([
    {
      runner: "playwright",
      root: directory,
      command: process.execPath,
      args: [path.join(playwright, "cli.js"), "test", "--config", config],
    },
  ]);
  expect(status).toBe(1);
  expect(fs.existsSync(cleanupMarker)).toBe(false);
  const base = path.join(directory, "test-reports", "summary");
  const run = path.join(base, fs.readdirSync(base)[0]);
  const report = JSON.parse(fs.readFileSync(path.join(run, "summary.json"), "utf8"))[0];
  expect([report.total, report.passed, report.failed]).toEqual([2, 1, 1]);
  expect(report.errors).toEqual([]);
  const fullLog = fs.readFileSync(path.join(run, "playwright-full.log"), "utf8");
  expect(fullLog).toContain("STDOUT_PRESERVED");
  expect(fullLog).toContain("fixture failed");
});

test("external report-directory removal preserves the original launch reason without a secondary ENOENT", () => {
  const directory = temporaryDirectory();
  vi.spyOn(console, "log").mockImplementation(() => {});
  const spawn = vi.fn((command, args, options) => {
    fs.rmSync(path.dirname(options.env.CHEF_TEST_REPORT_FILE), { recursive: true, force: true });
    return { status: null, error: new Error("Original runner startup failed") };
  });
  expect(
    runCommands(
      [{ runner: "vitest", root: process.cwd(), command: "fixture", args: ["vitest", "run"] }],
      spawn,
      { directory },
    ),
  ).toBe(1);
  const run = path.join(directory, fs.readdirSync(directory)[0]);
  const report = JSON.parse(fs.readFileSync(path.join(run, "summary.json"), "utf8"))[0];
  expect(report.errors[0].message).toBe("Original runner startup failed");
  expect(report.errors.some((error) => error.kind === "report-persistence")).toBe(true);
  expect(fs.existsSync(path.join(run, "vitest-full.log"))).toBe(false);
});
