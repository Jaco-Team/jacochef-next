import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hook = readFileSync(new URL("../../../components/staff_schedule/useStaffSchedulePage.js", import.meta.url), "utf8");
const body = (name) => hook.slice(hook.indexOf(`const ${name} = useCallback`), hook.indexOf("[applyFilters", hook.indexOf(`const ${name} = useCallback`)));

test("changing cafe or month loads the graph, reselecting the same value does not", () => {
  assert.match(body("handlePointChange"), /String\(nextPointId\) !== String\(draftPointId\)[\s\S]*applyFilters\(nextPointId, draftMonthId\)/);
  assert.match(body("handleMonthChange"), /nextMonthId !== draftMonthId[\s\S]*applyFilters\(draftPointId, nextMonthId\)/);
});

test("only the latest graph request is applied", () => {
  const load = hook.slice(hook.indexOf("const loadGraph = useCallback"), hook.indexOf("[api, pickAccessMap]"));
  const stale = load.indexOf("generation !== graphRequestGeneration.current");
  assert.ok(stale > load.indexOf("await api.getGraph"));
  assert.ok(stale < load.indexOf("setGraph(buildGraphState(response))"));
  assert.match(load, /finally \{\s+if \(generation === graphRequestGeneration\.current\) \{\s+setIsGraphLoading\(false\);/);
});
