import test from "node:test";
import assert from "node:assert/strict";
import { buildPeriodRangeLabels } from "../../../components/staff_schedule/staffSchedulePeriodRange.mjs";

test("buildPeriodRangeLabels uses the selected calendar month", () => {
  assert.deepEqual(buildPeriodRangeLabels("2026-09"), ["01.09–15.09", "16.09–30.09"]);
  assert.deepEqual(buildPeriodRangeLabels("2026-10"), ["01.10–15.10", "16.10–31.10"]);
});

test("buildPeriodRangeLabels handles leap-year February", () => {
  assert.deepEqual(buildPeriodRangeLabels("2028-02"), ["01.02–15.02", "16.02–29.02"]);
});

test("buildPeriodRangeLabels keeps legacy labels without a valid month", () => {
  assert.deepEqual(buildPeriodRangeLabels(""), ["с 1 по 15 число", "с 16 по конец месяца"]);
});
