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
  assert.match(desktop, /const isFullRowHighlighted = isFocused;/);
  assert.doesNotMatch(desktop, /setHoverMode\("row"\)/);
  assert.match(mobile, /const rowSurfaceColor = isFocused\s*\?/);
  assert.match(mobile, /const employeeCellColor = isFocused \?/);
  for (const source of [desktop, mobile]) {
    assert.match(source, /const isFinancialBlurred = blurFinancials && !isFocused;/);
    assert.match(source, /selectedRowIds\.includes\(focusKey\)/);
    assert.match(source, /onToggleRowSelection\(focusKey\)/);
  }
});

test("desktop and mobile hide quick controls and checkboxes without access; revoked selection is cleared", () => {
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
  const page = readFileSync(
    new URL("../../../components/staff_schedule/useStaffSchedulePage.js", import.meta.url),
    "utf8",
  );
  const hook = readFileSync(
    new URL("../../../components/staff_schedule/useStaffScheduleFastActions.js", import.meta.url),
    "utf8",
  );
  const dialog = readFileSync(
    new URL(
      "../../../components/staff_schedule/modals/StaffScheduleFastActionsDialog.jsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(
    desktop,
    /showFastActions \? <col style=\{\{ width: SELECTION_COLUMN_WIDTH \}\} \/> : null/,
  );
  assert.match(mobile, /!hideSelectionColumn && String\(data\?\.smena_id/);
  assert.match(mobile, /hideSelectionColumn=\{!showFastActions \|\| isHorizontallyScrolled\}/);
  assert.match(
    page,
    /if \(!canUseFastActions \|\| !canUseStaffScheduleFastActionsPeriod\(monthId, selectedPart\) \|\| !rowId\)/,
  );
  assert.match(
    page,
    /setSelectedRowIds\(\[\]\);\s*\}, \[quickAccessSignature, canUseFastActions\]\)/,
  );
  assert.match(hook, /if \(!canOpen \|\| !isCurrentPeriodAvailable\(\) \|\| !row\?\.id/);
  assert.match(hook, /access: accessRef\.current/);
  assert.match(dialog, /open=\{Boolean\(state\?\.open\) && hasAccess\}/);
});

test("quick controls and mutation lifecycle share the selected-half date guard", () => {
  const desktop = readFileSync(
    new URL(
      "../../../components/staff_schedule/sections/StaffScheduleTableSection.jsx",
      import.meta.url,
    ),
    "utf8",
  );
  const page = readFileSync(
    new URL("../../../components/staff_schedule/StaffSchedulePage.jsx", import.meta.url),
    "utf8",
  );
  const hook = readFileSync(
    new URL("../../../components/staff_schedule/useStaffScheduleFastActions.js", import.meta.url),
    "utf8",
  );
  assert.match(page, /monthId=\{page\.monthId\}/);
  assert.match(
    desktop,
    /const showFastActions = hasFastActionsAccess\(access\) &&\s*canUseStaffScheduleFastActionsPeriod\(monthId, selectedPart\)/,
  );
  assert.match(hook, /contextRef\.current = \{ monthId, selectedPart \}/);
  assert.match(hook, /contextChanged \|\| !canOpen/);
  assert.match(hook, /previousContext\.current\.monthId !== monthId/);
  assert.match(hook, /previousContext\.current\.selectedPart !== selectedPart/);
  assert.match(
    hook,
    /if \(generation !== draftGeneration\.current \|\| !isCurrentPeriodAvailable\(\)\)/,
  );
  assert.match(
    hook,
    /canUseStaffScheduleFastActionsPeriod\(current\.monthId, current\.selectedPart\)/,
  );
  assert.match(hook, /await reloadRef\.current\(\)/);
});

test("finance, month and export entry/save handlers recheck rights without caller-role authority", () => {
  const page = readFileSync(
    new URL("../../../components/staff_schedule/useStaffSchedulePage.js", import.meta.url),
    "utf8",
  );
  const desktop = readFileSync(
    new URL(
      "../../../components/staff_schedule/sections/StaffScheduleTableSection.jsx",
      import.meta.url,
    ),
    "utf8",
  );
  const exportHook = readFileSync(
    new URL("../../../components/staff_schedule/useStaffScheduleExport.js", import.meta.url),
    "utf8",
  );
  assert.match(page, /canEditSummaryAction\(key\)/);
  assert.match(page, /canEditSummaryAction\(mode\)/);
  assert.match(page, /canEditSummaryAction\("dop_bonus_user"\)/);
  assert.match(page, /!dayAccess\.canOpenMonthCard \|\| !row\?\.id/);
  assert.match(page, /Нет доступа к сохранению месяца/);
  assert.match(page, /summaryActionRef\.current\.request !== request/);
  assert.match(exportHook, /if \(!canExport \|\| !\["ws", "hj"\]\.includes\(mode\)\)/);
  assert.match(
    exportHook,
    /!createStaffSchedulePolicy\(accessRef\.current\)\.canExportWorkSchedule \|\| !dialog\.open/,
  );
  assert.match(exportHook, /generation !== exportGeneration\.current/);
  assert.doesNotMatch(desktop, /graphKind !== "other"/);
  assert.doesNotMatch(desktop, /!isDriver/);
  assert.match(desktop, /const canOpenDirectorLevel = canEdit\("director_level"\)/);
});

test("revoking finance reads closes cached financial modals and invalidates pending day/month reads", () => {
  const page = readFileSync(
    new URL("../../../components/staff_schedule/useStaffSchedulePage.js", import.meta.url),
    "utf8",
  );
  assert.match(
    page,
    /hasRevokedFinancialReadPermission\(previousFinancialReadSignature\.current, financialReadSignature\)/,
  );
  assert.match(
    page,
    /dayRequestGeneration\.current \+= 1;\s*monthRequestGeneration\.current \+= 1;\s*dayModalState\.close\(\);/,
  );
  assert.match(
    page,
    /if \(summaryActionRef\.current\.mode !== "dir_lv"\) summaryActionState\.close\(\)/,
  );
  assert.match(page, /generation !== dayRequestGeneration\.current/);
  assert.match(page, /generation !== monthRequestGeneration\.current/);
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

test("normal/sticky and mobile team-bonus headers reuse the period modal and obey edit/blur gates", () => {
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
  const header = desktop.slice(
    desktop.indexOf("function ScheduleTableHeaderRow("),
    desktop.indexOf("function ScheduleTableColGroup("),
  );
  const gate =
    /const canOpenTeamBonus = column\.key === "dop_bonus" && canEditTeamBonus && !blurFinancials && Boolean\(onOpenSummaryAction\)/g;
  assert.equal((header.match(gate) || []).length, 1);
  assert.equal((mobile.match(gate) || []).length, 2);
  for (const source of [header, mobile]) {
    assert.match(source, /\{canOpenTeamBonus \? \(/);
    assert.match(source, /component="button"/);
    assert.match(source, /type="button"/);
    assert.match(source, /aria-label="Изменить командный бонус за выбранный период"/);
    assert.match(source, /onClick=\{\(\) => onOpenSummaryAction\(null, "dop_bonus_toggle"\)\}/);
    assert.match(source, /const label = \(\s*<SmallFont/);
    assert.match(source, /\{label\}\s*<\/Box>\s*\) : label\}/);
  }
  const desktopHeaders = [...desktop.matchAll(/<ScheduleTableHeaderRow\s[\s\S]*?\/>/g)];
  assert.equal(desktopHeaders.length, 2);
  for (const [props] of desktopHeaders) {
    assert.match(props, /onOpenSummaryAction=\{onOpenSummaryAction\}/);
    assert.match(props, /canEditTeamBonus=\{canEditTeamBonus\}/);
    assert.match(props, /blurFinancials=\{blurFinancials\}/);
  }
  assert.match(desktop, /const canEditTeamBonus = canEdit\("com_bonus"\)/);
  assert.match(desktop, /onOpenSummaryAction\?\.\(null, "dop_bonus_toggle"\)/);
  assert.match(mobile, /onOpenSummaryAction\?\.\(null, "dop_bonus_toggle"\)/);
});
