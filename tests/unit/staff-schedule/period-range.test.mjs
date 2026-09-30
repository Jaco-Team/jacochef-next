import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPeriodRangeLabels,
  canUseStaffScheduleFastActionsPeriod,
} from "../../../components/staff_schedule/staffSchedulePeriodRange.mjs";

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

test("fast actions use the selected half, including its final day", () => {
  for (const referenceDate of ["2026-09-14", "2026-09-15"]) {
    assert.equal(canUseStaffScheduleFastActionsPeriod("2026-09", 0, referenceDate), true);
  }
  assert.equal(canUseStaffScheduleFastActionsPeriod("2026-09", 0, "2026-09-16"), false);
  assert.equal(canUseStaffScheduleFastActionsPeriod("2026-09", 1, "2026-09-30"), true);
  assert.equal(canUseStaffScheduleFastActionsPeriod("2026-09", 1, "2026-10-01"), false);
  assert.equal(canUseStaffScheduleFastActionsPeriod("2026-10", 0, "2026-09-30"), true);
  for (const part of [0, 1]) {
    assert.equal(canUseStaffScheduleFastActionsPeriod("2026-08", part, "2026-09-30"), false);
  }
});

test("fast action date guard handles February and year transitions", () => {
  assert.equal(canUseStaffScheduleFastActionsPeriod("2028-02", 1, "2028-02-29"), true);
  assert.equal(canUseStaffScheduleFastActionsPeriod("2028-02", 1, "2028-03-01"), false);
  assert.equal(canUseStaffScheduleFastActionsPeriod("2026-02", 1, "2026-02-28"), true);
  assert.equal(canUseStaffScheduleFastActionsPeriod("2026-02", 1, "2026-03-01"), false);
  assert.equal(canUseStaffScheduleFastActionsPeriod("2026-12", 1, "2026-12-31"), true);
  assert.equal(canUseStaffScheduleFastActionsPeriod("2026-12", 1, "2027-01-01"), false);
  assert.equal(canUseStaffScheduleFastActionsPeriod("2027-01", "0", "2026-12-31"), true);
});

test("invalid period contexts fail closed", () => {
  for (const monthId of ["", undefined, null, "2026-13", "2026-00", "2026-9", "2026-09-01"]) {
    assert.equal(canUseStaffScheduleFastActionsPeriod(monthId, 1, "2026-09-30"), false);
  }
  for (const selectedPart of [undefined, null, "", false, true, -1, 2, "01", "1.0"]) {
    assert.equal(
      canUseStaffScheduleFastActionsPeriod("2026-10", selectedPart, "2026-09-30"),
      false,
    );
  }
  for (const referenceDate of ["not-a-date", "2026-02-30", null]) {
    assert.equal(canUseStaffScheduleFastActionsPeriod("2026-10", 1, referenceDate), false);
  }
});
