import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../../../components/staff_schedule/modals/StaffScheduleMonthModal.jsx", import.meta.url),
  "utf8",
);

test("employee click opens hour filling directly and overview only on demand", () => {
  assert.match(source, /const isFillMode = modal\.open && !isOverviewMode;/);
  assert.match(source, /open=\{modal\.open && isOverviewMode\}/);
  assert.match(source, /open=\{isAssignmentOpen \|\| isFillMode\}/);
  assert.match(source, /onShowOverview=\{isFillMode \? showOverview : null\}/);
  assert.match(source, /Обзор и расчёт/);
});

test("closing hour filling in direct mode closes the whole card after discard confirmation", () => {
  assert.match(source, /const closeAssignmentDialog = \(\) =>\s+confirmDiscardAssignment\(/);
  assert.match(source, /if \(isFillMode\) \{\s+onClose\?\.\(\);/);
});

test("hour range choice is an explicit radio with a selected state and hint", () => {
  assert.match(source, /role="radiogroup"/);
  assert.match(source, /role="radio"\s+aria-checked=\{selected\}/);
  assert.match(source, /visibility: selected \? "visible" : "hidden"/);
  assert.match(source, /flexDirection: "column"/);
  assert.match(source, /Свой промежуток/);
  assert.match(source, /Нажмите на день в календаре, чтобы поставить эти часы\./);
});
