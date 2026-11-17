import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readSource = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), "utf8");

test("financial headers keep complete words and existing font sizes on desktop and mobile", () => {
  const desktop = readSource(
    "../../../components/staff_schedule/sections/StaffScheduleTableSection.jsx",
  );
  const mobile = readSource(
    "../../../components/staff_schedule/sections/StaffScheduleMobileTableSection.jsx",
  );
  const header = desktop.slice(
    desktop.indexOf("function ScheduleTableHeaderRow("),
    desktop.indexOf("function ScheduleTableColGroup("),
  );
  for (const source of [header, mobile]) {
    assert.match(source, /data-salary-header-cell/);
    assert.match(source, /wordBreak: "normal"/);
    assert.match(source, /overflowWrap: "normal"/);
    assert.match(source, /hyphens: "none"/);
  }
  assert.doesNotMatch(header, /wordBreak: "break-word"|overflowWrap: "anywhere"/);
  assert.match(desktop, /SALARY_HEADER_FONT_SIZE = "0\.75rem"/);
  assert.match(mobile, /MOBILE_MIN_FONT_SIZE = 13/);
});

test("financial column geometry stays shared by headers, rows, totals and sticky clone", () => {
  const constants = readSource("../../../components/staff_schedule/staffScheduleConstants.js");
  const desktop = readSource(
    "../../../components/staff_schedule/sections/StaffScheduleTableSection.jsx",
  );
  const mobile = readSource(
    "../../../components/staff_schedule/sections/StaffScheduleMobileTableSection.jsx",
  );
  assert.match(constants, /SUMMARY_COLUMN_WIDTH = 84/);
  assert.match(constants, /WORKED_HOURS_COLUMN_WIDTH = 100/);
  assert.match(constants, /column\?\.key === "worked_hours" \? WORKED_HOURS_COLUMN_WIDTH : SUMMARY_COLUMN_WIDTH/);
  assert.match(desktop, /style=\{\{ width: getSummaryColumnWidth\(column\) \}\}/);
  assert.match(desktop, /getSummaryColumnsWidth\(summaryColumns\)/);
  assert.doesNotMatch(desktop, /summaryColumns\.length \* SUMMARY_COLUMN_WIDTH/);
  assert.equal((desktop.match(/<ScheduleTableHeaderRow\s/g) || []).length, 2);
  assert.equal((desktop.match(/<ScheduleTableColGroup[^>]*summaryColumns=\{summaryColumns\}/gs) || []).length, 2);
  assert.doesNotMatch(mobile, /MOBILE_SUMMARY_COLUMN_WIDTH/);
  assert.equal((mobile.match(/getSummaryColumnsWidth\(summaryColumns\)/g) || []).length, 2);
  assert.equal((mobile.match(/getMobileFixedColumnSx\(getSummaryColumnWidth\(column\)\)/g) || []).length, 2);
});
