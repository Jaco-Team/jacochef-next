import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getScheduleRowFocusKey,
  getSelectedScheduleRows,
} from "../../../components/staff_schedule/staffScheduleHelpers.js";
import { buildFastActionRequests } from "../../../components/staff_schedule/staffScheduleFastActionsCore.mjs";

const manager = { id: 7, app_id: 1, smena_id: 10 };
const cook = { ...manager, app_id: 2 };
const otherShift = { ...manager, smena_id: 20 };
const rows = [manager, cook, otherShift].map((data) => ({ row: "data", data }));

test("checkbox selection targets only the chosen employee assignment in the bulk payload", () => {
  const selected = getSelectedScheduleRows(rows, [getScheduleRowFocusKey(cook)]);
  assert.deepEqual(selected, [cook]);
  const [request] = buildFastActionRequests({
    users: selected,
    mode: "bulk",
    access: { fast_hours_access: 1 },
    referenceDate: "2026-09-01",
    draft: { scheduleScope: "month", scheduleType: 1 },
    monthId: "2026-09",
    selectedPart: 0,
  });
  assert.deepEqual(request.payload.users, [{ user_id: 7, app_id: 2, smena_id: 10 }]);
});

test("the same role in different shifts is selected independently", () => {
  assert.deepEqual(getSelectedScheduleRows(rows, [getScheduleRowFocusKey(otherShift)]), [
    otherShift,
  ]);
  assert.deepEqual(
    getSelectedScheduleRows(rows, [getScheduleRowFocusKey(manager), getScheduleRowFocusKey(cook)]),
    [manager, cook],
  );
  assert.deepEqual(getSelectedScheduleRows(rows, [String(manager.id)]), []);
});

test("display-only Free, missing identities, headers and duplicate assignment rows are excluded", () => {
  const free = { ...manager, smena_id: -1 };
  const malformed = { id: 7, smena_id: 10 };
  assert.deepEqual(
    getSelectedScheduleRows(
      [
        { row: "header", data: manager },
        { data: manager },
        { data: manager },
        { data: free },
        { data: malformed },
        {},
      ],
      [getScheduleRowFocusKey(manager), getScheduleRowFocusKey(free), null],
    ),
    [manager],
  );
  assert.deepEqual(getSelectedScheduleRows(), []);
});

test("checkbox extraction does not mutate focus identity or assignment data", () => {
  const focusKey = getScheduleRowFocusKey(manager);
  const selectedKeys = [getScheduleRowFocusKey(cook)];
  getSelectedScheduleRows(rows, selectedKeys);
  assert.equal(focusKey, getScheduleRowFocusKey(manager));
  assert.deepEqual(selectedKeys, ["10:7:2"]);
  assert.equal(manager.smena_id, 10);
  assert.equal(cook.app_id, 2);
});

test("desktop and mobile highlighting and financial visibility depend on focus, not checkboxes", () => {
  const desktop = readFileSync(
    new URL(
      "../../../components/staff_schedule/sections/StaffScheduleTableSection.jsx",
      import.meta.url,
    ),
    "utf8",
  );
  const mobile = readFileSync(
    new URL(
      "../../../components/staff_schedule/sections/StaffScheduleMobileTableSection.jsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(desktop, /setHoverMode\("row"\)/);
  // Выбранная строка серая, но цвета дней и отметки сотрудника не перекрываются; рамок нет.
  for (const source of [desktop, mobile]) {
    assert.match(source, /const rowSurfaceColor = isFocused\s*\?\s*uiTableColors\.rowSelected/);
    assert.match(source, /isFocused && baseColors\.backgroundColor === "#ffffff"/);
    assert.doesNotMatch(source, /inset 0 0 0 2px \$\{uiColors\.primary\}/);
  }
  assert.doesNotMatch(mobile, /!row\?\.color && !isFocused/);
  for (const source of [desktop, mobile]) {
    assert.match(source, /const isFinancialBlurred = blurFinancials && !isFocused;/);
    assert.match(source, /selectedRowIds\.includes\(focusKey\)/);
    assert.match(source, /onToggleRowSelection\(focusKey\)/);
  }
});

test("mobile shift creation receives the detailed-right capability returned by the page hook", () => {
  const hook = readFileSync(
    new URL("../../../components/staff_schedule/useStaffSchedulePage.js", import.meta.url),
    "utf8",
  );
  const page = readFileSync(
    new URL("../../../components/staff_schedule/StaffSchedulePage.jsx", import.meta.url),
    "utf8",
  );
  assert.match(
    hook.slice(hook.lastIndexOf("  return {")),
    /canManageSmena: dayAccess\.canManageSmena/,
  );
  assert.match(page, /canCreateSmena=\{page\.canManageSmena\}/);
});
