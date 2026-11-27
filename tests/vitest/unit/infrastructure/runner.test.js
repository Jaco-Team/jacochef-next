import { createRequire } from "node:module";
import { expect, test, vi } from "vitest";

const require = createRequire(import.meta.url);
const { parseArgs, buildCommands, runCommands } = require("../../../../scripts/test.js");

test("the default and all commands run both unit runners and never Playwright", () => {
  for (const args of [[], ["--type=unit"], ["--type=all"]]) {
    const commands = buildCommands(parseArgs(args));
    expect(commands.map(({ name }) => name)).toEqual([
      "Legacy unit tests",
      "Vitest unit and component tests",
    ]);
    expect(commands[0].args[0]).toBe("--test");
    expect(commands[1].args[0]).toContain("vitest.mjs");
  }
});

test("a legacy failure does not prevent Vitest from running and remains a failure", () => {
  const spawn = vi.fn().mockReturnValueOnce({ status: 1 }).mockReturnValueOnce({ status: 0 });
  vi.spyOn(console, "log").mockImplementation(() => {});
  expect(runCommands(buildCommands(parseArgs([])), spawn)).toBe(1);
  expect(spawn).toHaveBeenCalledTimes(2);
});

test("a failed Vitest process and a launch failure are not hidden", () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(
    runCommands(
      buildCommands(parseArgs([])),
      vi.fn().mockReturnValueOnce({ status: 0 }).mockReturnValueOnce({ status: 2 }),
    ),
  ).toBe(1);
  expect(
    runCommands(
      buildCommands(parseArgs([])),
      vi
        .fn()
        .mockReturnValueOnce({ error: new Error("missing"), status: null })
        .mockReturnValueOnce({ status: 0 }),
    ),
  ).toBe(1);
});

test("a scope present in only one runner selects that runner", () => {
  expect(buildCommands(parseArgs(["--scope=auth"]))).toHaveLength(1);
  expect(buildCommands(parseArgs(["--scope=infrastructure"]))[0].name).toContain("Vitest");
  expect(buildCommands(parseArgs(["--scope=staff_schedule"]))[0].name).toContain("Legacy");
  expect(() => buildCommands(parseArgs(["--scope=missing"]))).toThrow("Unknown unit scope");
});

test("browser flags are explicit and scoped Playwright uses its dedicated config", () => {
  expect(() => parseArgs(["--headed"])).toThrow();
  expect(() => parseArgs(["--list"])).toThrow();
  expect(() => parseArgs(["--garbage"])).toThrow();
  const command = buildCommands(parseArgs(["--type=e2e", "--scope=sklad-items", "--list"]))[0];
  expect(command.args).toContain("playwright.sklad.config.js");
  expect(command.args).toContain("--list");
});
