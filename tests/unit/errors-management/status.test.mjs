import test from "node:test";
import assert from "node:assert/strict";
import {
  COMPLAINT_STATUSES,
  complaintStatusAppearance,
  complaintStatusOptions,
} from "../../../components/errors_management/complaintStatusModel.mjs";

const TONES = new Set(["success", "danger", "warning", "neutral"]);
const VARIANTS = new Set(["filled", "soft", "outlined"]);

test("every workflow status has one distinct JacoStatusChip appearance", () => {
  const ids = COMPLAINT_STATUSES.map((status) => status.id);
  assert.deepEqual(ids, ["registered", "sent_to_cafe", "accepted_by_cafe", "resolved", "cancelled"]);
  const appearances = new Set();
  for (const id of ids) {
    const appearance = complaintStatusAppearance(id);
    assert.ok(TONES.has(appearance.tone), id);
    assert.ok(VARIANTS.has(appearance.variant), id);
    appearances.add(`${appearance.tone}:${appearance.variant}`);
  }
  assert.equal(appearances.size, ids.length);
});

test("resolved is success and cancelled is danger", () => {
  assert.equal(complaintStatusAppearance("resolved").tone, "success");
  assert.equal(complaintStatusAppearance("cancelled").tone, "danger");
});

test("unknown and removed draft status fall back to a neutral outline", () => {
  assert.deepEqual(complaintStatusAppearance("draft"), { tone: "neutral", variant: "outlined" });
  assert.deepEqual(complaintStatusAppearance(undefined), { tone: "neutral", variant: "outlined" });
});

test("status filter options do not offer the draft status", () => {
  const options = complaintStatusOptions();
  assert.equal(options.some((option) => option.id === "draft"), false);
  assert.deepEqual(Object.keys(options[0]).sort(), ["id", "name"]);
});
