#!/usr/bin/env node

const fs = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");
const { styleText } = require("node:util");
const {
  emptyReport,
  fromVitest,
  formatReports,
  line,
  startupReason,
  createReportDirectory,
} = require("./test-reporters/report.cjs");

function parseArgs(argv) {
  const result = {
    type: "unit",
    scope: "",
    headed: false,
    list: false,
    grep: "",
    project: "",
    passthrough: [],
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") {
      result.passthrough = argv.slice(index + 1);
      break;
    }
    const match = /^--(type|scope|grep|project)(?:=(.*))?$/.exec(arg);
    if (match) {
      const value = match[2] ?? argv[++index];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for --${match[1]}`);
      result[match[1]] = value;
    } else if (arg === "--headed") result.headed = true;
    else if (arg === "--list") result.list = true;
    else throw new Error(`Unknown test option: ${arg}`);
  }
  result.type = result.type.toLowerCase();
  result.scope = result.scope.trim().toLowerCase().replace(/_/g, "-");
  if (!["unit", "all", "legacy", "vitest", "e2e"].includes(result.type))
    throw new Error(`Unsupported test type: ${result.type}`);
  if (result.headed && result.type !== "e2e") throw new Error("--headed applies only to test:e2e");
  if (
    (result.list || result.project || result.passthrough.length) &&
    ["unit", "all"].includes(result.type)
  ) {
    throw new Error("Use test:legacy, test:vitest or test:e2e for runner-specific options");
  }
  if ((result.list || result.project) && result.type === "legacy")
    throw new Error("--list and --project do not apply to the legacy runner");
  return result;
}

function directories(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && !entry.name.startsWith("_") && entry.name !== "support",
    )
    .map((entry) => entry.name);
}

function files(directory, pattern) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const filename = path.join(directory, entry.name);
      return entry.isDirectory()
        ? files(filename, pattern)
        : pattern.test(entry.name)
          ? [filename]
          : [];
    })
    .sort();
}

function buildCommands(options, root = process.cwd()) {
  const legacyRoot = path.join(root, "tests/unit");
  const vitestRoots = ["unit", "components"].map((name) => path.join(root, "tests/vitest", name));
  const e2eRoot = path.join(root, "tests/e2e");
  const legacyScopes = directories(legacyRoot);
  const vitestScopes = [...new Set(vitestRoots.flatMap(directories))];
  const scopes =
    options.type === "legacy"
      ? legacyScopes
      : options.type === "vitest"
        ? vitestScopes
        : options.type === "e2e"
          ? directories(e2eRoot)
          : [...new Set([...legacyScopes, ...vitestScopes])];
  if (options.scope && !scopes.includes(options.scope))
    throw new Error(
      `Unknown ${options.type} scope "${options.scope}". Available: ${scopes.sort().join(", ")}`,
    );
  const commands = [];
  if (
    ["unit", "all", "legacy"].includes(options.type) &&
    (!options.scope || legacyScopes.includes(options.scope))
  ) {
    const testFiles = files(path.join(legacyRoot, options.scope), /\.test\.(mjs|js|cjs)$/);
    if (!testFiles.length) throw new Error("No legacy unit tests found");
    commands.push({
      runner: "node",
      root,
      name: "Legacy unit tests",
      command: process.execPath,
      args: [
        "--test",
        ...(options.grep ? [`--test-name-pattern=${options.grep}`] : []),
        ...options.passthrough,
        ...testFiles,
      ],
    });
  }
  if (
    ["unit", "all", "vitest"].includes(options.type) &&
    (!options.scope || vitestScopes.includes(options.scope))
  ) {
    const testFiles = vitestRoots.flatMap((directory) =>
      files(path.join(directory, options.scope), /\.test\.(mjs|js|jsx)$/),
    );
    if (!testFiles.length) throw new Error("No Vitest tests found");
    const cli = path.join(path.dirname(require.resolve("vitest/package.json")), "vitest.mjs");
    commands.push({
      runner: "vitest",
      root,
      list: options.list,
      name: "Vitest unit and component tests",
      command: process.execPath,
      args: [
        cli,
        options.list ? "list" : "run",
        ...(options.scope ? testFiles : []),
        ...(options.grep ? ["--testNamePattern", options.grep] : []),
        ...(options.project ? ["--project", options.project] : []),
        ...options.passthrough,
      ],
    });
  }
  if (options.type === "e2e") {
    const configs = {
      "design-system": "playwright.design-system.config.js",
      "sklad-items": "playwright.sklad.config.js",
    };
    const cli = path.join(path.dirname(require.resolve("@playwright/test/package.json")), "cli.js");
    commands.push({
      runner: "playwright",
      root,
      list: options.list,
      name: "Playwright",
      command: process.execPath,
      args: [
        cli,
        "test",
        "--config",
        configs[options.scope] || "playwright.config.js",
        ...(options.scope ? [path.join(e2eRoot, options.scope)] : []),
        ...(options.headed ? ["--headed"] : []),
        ...(options.list ? ["--list"] : []),
        ...(options.grep ? ["--grep", options.grep] : []),
        ...(options.project ? ["--project", options.project] : []),
        ...options.passthrough,
      ],
    });
  }
  return commands;
}

function runCommands(commands, spawn = spawnSync, options = {}) {
  let failed = false;
  let directory;
  const reports = [];
  for (const task of commands) {
    if (task.list) {
      const result = spawn(task.command, task.args, {
        stdio: "inherit",
        env: process.env,
        cwd: task.root,
      });
      if (result.error) console.error(line(result.error.message));
      if (result.error || result.status !== 0) failed = true;
      continue;
    }
    console.log(
      styleText(
        "cyan",
        `Запуск ${task.runner === "node" ? "Node.js" : task.runner === "vitest" ? "Vitest" : "Playwright"}…`,
      ),
    );
    const root = task.root || process.cwd();
    if (!directory) {
      directory = createReportDirectory(root, "run-", options.directory);
    }
    const reportFile = path.join(directory, `${task.runner}.json`);
    const logFile = path.join(directory, `${task.runner}-full.log`);
    let args = [...task.args];
    if (task.runner === "node")
      args.splice(1, 0, `--test-reporter=${path.join(__dirname, "test-reporters", "node.cjs")}`);
    if (task.runner === "vitest")
      args.push("--reporter=json", `--outputFile=${reportFile}`, "--includeTaskLocation");
    const fd = fs.openSync(logFile, "a");
    let result;
    try {
      result = spawn(task.command, args, {
        stdio: ["inherit", fd, fd],
        env: { ...process.env, CHEF_TEST_REPORT_FILE: reportFile },
        cwd: root,
      });
    } finally {
      fs.closeSync(fd);
    }
    let report;
    try {
      const raw = JSON.parse(fs.readFileSync(reportFile, "utf8"));
      report = task.runner === "vitest" ? fromVitest(raw) : raw;
      if (!Array.isArray(report.failures) || !Array.isArray(report.errors))
        throw new Error("invalid report");
    } catch {
      report = emptyReport(
        task.runner === "node" ? "Node.js" : task.runner === "vitest" ? "Vitest" : "Playwright",
      );
      let firstOutput = "";
      try {
        firstOutput = fs.readFileSync(logFile, "utf8").trim();
      } catch {}
      report.errors.push({
        message: result.error
          ? line(result.error.message)
          : `Не создан структурированный отчёт (код ${result.status ?? result.signal ?? "неизвестен"}). ${startupReason(firstOutput)}`,
      });
    }
    if (
      !fs.existsSync(logFile) &&
      !report.errors.some((error) => error.kind === "report-persistence")
    ) {
      report.errors.push({
        kind: "report-persistence",
        message: "Подробный журнал удалён во время запуска; полный вывод не сохранился",
      });
    }
    if (result.error || result.status !== 0) {
      failed = true;
      if (!report.failed && !report.cancelled && !report.errors.length)
        report.errors.push({
          message: result.error
            ? line(result.error.message)
            : `Раннер завершился с кодом ${result.status ?? result.signal}`,
        });
    }
    if (report.failed || report.cancelled || report.errors.length) failed = true;
    reports.push(report);
  }
  if (reports.length) {
    let saved = false;
    try {
      fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(path.join(directory, "summary.json"), JSON.stringify(reports, null, 2));
      saved = true;
    } catch (error) {
      failed = true;
      console.error(`Не удалось сохранить сводный отчёт: ${line(error.message)}`);
    }
    console.log(
      formatReports(reports, {
        root: commands[0]?.root || process.cwd(),
        directory: saved ? directory : undefined,
        style: styleText,
      }),
    );
  }
  return failed ? 1 : 0;
}

if (require.main === module) {
  try {
    process.exitCode = runCommands(buildCommands(parseArgs(process.argv.slice(2))));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { parseArgs, buildCommands, runCommands };
