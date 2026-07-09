#!/usr/bin/env node

const fs = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");

function parseArgs(argv) {
  const result = {
    type: "all",
    scope: "",
    headed: false,
    list: false,
    grep: "",
    project: "",
    passthrough: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg.startsWith("--type=")) {
      result.type = arg.split("=")[1] || result.type;
      continue;
    }

    if (arg === "--type" && next) {
      result.type = next;
      index += 1;
      continue;
    }

    if (arg.startsWith("--scope=")) {
      result.scope = arg.split("=")[1] || "";
      continue;
    }

    if (arg === "--scope" && next) {
      result.scope = next;
      index += 1;
      continue;
    }

    if (arg === "--headed") {
      result.headed = true;
      continue;
    }

    if (arg === "--list") {
      result.list = true;
      continue;
    }

    if (arg.startsWith("--grep=")) {
      result.grep = arg.slice("--grep=".length);
      continue;
    }

    if (arg === "--grep" && next) {
      result.grep = next;
      index += 1;
      continue;
    }

    if (arg.startsWith("--project=")) {
      result.project = arg.slice("--project=".length);
      continue;
    }

    if (arg === "--project" && next) {
      result.project = next;
      index += 1;
      continue;
    }

    result.passthrough.push(arg);
  }

  return result;
}

function normalizeScope(scope) {
  return String(scope || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
}

function listScopeDirectories(type) {
  const root = path.join(process.cwd(), "tests", type);

  if (!fs.existsSync(root)) {
    return [];
  }

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && !entry.name.startsWith("_") && entry.name !== "support",
    )
    .map((entry) => entry.name)
    .sort();
}

function listTestFiles(rootPath) {
  if (!fs.existsSync(rootPath)) {
    return [];
  }

  return fs
    .readdirSync(rootPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.test\.(mjs|js|cjs)$/.test(entry.name))
    .map((entry) => path.join(rootPath, entry.name))
    .sort();
}

function resolveScopedPath(type, scope) {
  const normalized = normalizeScope(scope);
  const basePath = path.join("tests", type);

  if (!normalized) {
    return basePath;
  }

  const scopes = listScopeDirectories(type);
  const matchedScope = scopes.find((item) => item === normalized);

  if (!matchedScope) {
    const available = scopes.length > 0 ? scopes.join(", ") : "none";
    throw new Error(`Unknown ${type} scope "${scope}". Available: ${available}`);
  }

  return path.join(basePath, matchedScope);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
}

function runE2e(options) {
  const args = ["playwright", "test", resolveScopedPath("e2e", options.scope)];

  if (options.headed) {
    args.push("--headed");
  }

  if (options.list) {
    args.push("--list");
  }

  if (options.grep) {
    args.push("--grep", options.grep);
  }

  if (options.project) {
    args.push("--project", options.project);
  }

  args.push(...options.passthrough);
  run("npx", args);
}

function runUnit(options) {
  const scopedPath = resolveScopedPath("unit", options.scope);
  const testFiles = fs.statSync(scopedPath).isDirectory()
    ? listTestFiles(scopedPath)
    : [scopedPath];

  if (testFiles.length === 0) {
    throw new Error(`No unit test files found in ${scopedPath}`);
  }

  const args = ["--test", ...testFiles, ...options.passthrough];
  run("node", args);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const type = String(options.type || "all").toLowerCase();

  if (!["all", "e2e", "unit"].includes(type)) {
    throw new Error(`Unsupported test type: ${options.type}`);
  }

  if (type === "unit") {
    runUnit(options);
    return;
  }

  if (type === "e2e") {
    runE2e(options);
    return;
  }

  runUnit(options);
  runE2e(options);
}

main();
