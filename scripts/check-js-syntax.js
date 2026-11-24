#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");

const SUPPORTED_EXTENSIONS = new Set([".js", ".jsx", ".cjs", ".mjs"]);
const BABEL_PLUGINS = [
  "jsx",
  "classProperties",
  "classPrivateProperties",
  "classPrivateMethods",
  "dynamicImport",
  "exportDefaultFrom",
  "exportNamespaceFrom",
  "nullishCoalescingOperator",
  "optionalChaining",
  "objectRestSpread",
  "topLevelAwait",
];

function collectFilesFromArgs(args) {
  const files = [];

  for (const arg of args) {
    if (arg === "--") {
      continue;
    }

    const resolved = path.resolve(arg);
    if (!fs.existsSync(resolved)) {
      continue;
    }

    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      walkDirectory(resolved, files);
      continue;
    }

    if (SUPPORTED_EXTENSIONS.has(path.extname(resolved))) {
      files.push(resolved);
    }
  }

  return [...new Set(files)];
}

function walkDirectory(directory, files) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") {
      continue;
    }

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(fullPath, files);
      continue;
    }

    if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
}

function checkFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");

  parser.parse(source, {
    sourceType: "module",
    plugins: BABEL_PLUGINS,
    errorRecovery: false,
  });
}

function main() {
  const args = process.argv.slice(2);
  const files =
    args.length > 0
      ? collectFilesFromArgs(args)
      : collectFilesFromArgs(["components", "pages", "ui", "hooks", "store", "utils", "scripts"]);

  if (!files.length) {
    console.log("check-js-syntax: no files to check");
    return;
  }

  let failed = false;

  for (const filePath of files) {
    try {
      checkFile(filePath);
    } catch (error) {
      failed = true;
      const location = error.loc != null ? `:${error.loc.line}:${error.loc.column + 1}` : "";
      console.error(`Syntax error in ${path.relative(process.cwd(), filePath)}${location}`);
      console.error(error.message);
    }
  }

  if (failed) {
    process.exit(1);
  }

  console.log(`check-js-syntax: OK (${files.length} file${files.length === 1 ? "" : "s"})`);
}

main();
