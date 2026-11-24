import test from "node:test";
import assert from "node:assert/strict";
import { getScheduleRowFocusKey } from "../../../components/staff_schedule/staffScheduleHelpers.js";

test("schedule focus distinguishes assignments and shifts for the same employee", () => {
  assert.equal(getScheduleRowFocusKey({ smena_id: 1, id: 7, app_id: 1 }), "1:7:1");
  assert.equal(getScheduleRowFocusKey({ smena_id: 1, id: 7, app_id: 2 }), "1:7:2");
  assert.equal(getScheduleRowFocusKey({ smena_id: 2, id: 7, app_id: 1 }), "2:7:1");
  assert.equal(getScheduleRowFocusKey({ smena_id: 1, id: 7 }), null);
});

test("missing assignment identities never produce a focus or checkbox key", () => {
  for (const row of [
    null,
    undefined,
    {},
    { id: 7, app_id: 1 },
    { smena_id: 1, id: "", app_id: 1 },
    { smena_id: 1, id: 7, app_id: " " },
  ]) {
    assert.equal(getScheduleRowFocusKey(row), null);
  }
});
