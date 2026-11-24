import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const asModule = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const constants = await readFile(new URL("../../../components/cleanings/constants.js", import.meta.url), "utf8");
const tokens = await readFile(new URL("../../../design-system/shared/tokens/index.js", import.meta.url), "utf8");
const helpers = await readFile(new URL("../../../components/cleanings/helpers.js", import.meta.url), "utf8");
const { getVisibleSectionTabs, resolveCleaningsRoute, getSectionSegments, getRouteSegments } = await import(
  asModule(
    helpers
      .replace('from "./constants"', `from "${asModule(constants)}"`)
      .replace('from "@/design-system/shared/ui"', `from "${asModule(tokens)}"`),
  )
);

const access = (...keys) => (key) => keys.includes(key);

test("lamp visibility requires lamp access", () => {
  assert.deepEqual(getVisibleSectionTabs(access("lamps")).map((tab) => tab.value), ["lamps"]);
  assert.equal(getVisibleSectionTabs(access("categories", "control_cleanings")).some((tab) => tab.value === "lamps"), false);
});

test("lamp navigation coexists with categories and control routes", () => {
  const canView = access("lamps", "categories", "control_cleanings", "control_pf");
  assert.deepEqual(resolveCleaningsRoute(["lamps"], canView), { section: "lamps", controlKind: null, segments: ["lamps"] });
  assert.deepEqual(getSectionSegments("lamps"), ["lamps"]);
  assert.deepEqual(resolveCleaningsRoute(["categories"], canView), { section: "categories", controlKind: null, segments: ["categories"] });
  assert.deepEqual(resolveCleaningsRoute(["control", "preparations"], canView), { section: "control", controlKind: "preparations", segments: ["control", "preparations"] });
});

test("an inaccessible lamps route falls back to an accessible section or no route", () => {
  assert.deepEqual(resolveCleaningsRoute(["lamps"], access("categories")), { section: "categories", controlKind: null, segments: ["categories"] });
  assert.equal(resolveCleaningsRoute(["lamps"], access()), null);
});

test("direct navigation uses the visible URL when catch-all query is not hydrated", () => {
  const canView = access("categories", "lamps");
  const segments = getRouteSegments(undefined, "/cleanings/lamps?from=test#journal");
  assert.deepEqual(segments, ["lamps"]);
  assert.equal(resolveCleaningsRoute(segments, canView).section, "lamps");
  assert.deepEqual(getRouteSegments(["categories"], "/cleanings/lamps"), ["lamps"]);
  assert.deepEqual(getRouteSegments(["lamps"], "/cleanings/[[...section]]"), ["lamps"]);
  assert.deepEqual(getRouteSegments(undefined, "/cleanings"), []);
});
