import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  canEditStaffScheduleBonus,
  createStaffScheduleAccess,
  getEditableStaffScheduleBonusRow,
} from "../../../components/staff_schedule/staffScheduleAccess.mjs";

const manager = {
  id: 7,
  app_id: 1,
  smena_id: 10,
  app_type: "manager",
  can_edit_bonus: true,
  dir_bonus: 300,
  my_bonus: 500,
};
const request = { user_id: 7, app_id: 1, smena_id: 10, date: "2026-09" };
const scope = {
  rows: [{ data: manager }],
  request,
  monthId: "2026-09",
  selectedPart: 1,
  access: { bonus_edit: 1 },
};

test("server-approved manager and own director bonuses use edit/access without caller-role gates", () => {
  for (const access of [{ bonus_edit: 1 }, { bonus_access: 1 }]) {
    for (const app_type of ["manager", "dir"]) {
      const row = { ...manager, app_type };
      assert.equal(
        canEditStaffScheduleBonus({
          row,
          selectedPart: 1,
          canEdit: createStaffScheduleAccess(access).canEdit,
        }),
        true,
      );
    }
  }
  assert.equal(getEditableStaffScheduleBonusRow(scope), manager);
});

test("other director, missing/false capability, view-only and first-half bonuses fail closed", () => {
  for (const can_edit_bonus of [false, 0, undefined, "1"]) {
    assert.equal(
      getEditableStaffScheduleBonusRow({
        ...scope,
        rows: [{ data: { ...manager, app_type: "dir", can_edit_bonus } }],
      }),
      null,
    );
  }
  for (const access of [{}, { bonus_view: 1 }, { salary_block_access: 1 }]) {
    assert.equal(getEditableStaffScheduleBonusRow({ ...scope, access }), null);
  }
  assert.equal(getEditableStaffScheduleBonusRow({ ...scope, selectedPart: 0 }), null);
  assert.equal(
    getEditableStaffScheduleBonusRow({
      ...scope,
      rows: [{ data: { ...manager, can_edit_bonus: 1 } }],
    }).id,
    manager.id,
  );
});

test("bonus open/save resolves the complete current graph assignment and current month", () => {
  for (const field of ["user_id", "app_id", "smena_id"]) {
    for (const value of [null, undefined, "", 0, -1, 99]) {
      assert.equal(
        getEditableStaffScheduleBonusRow({ ...scope, request: { ...request, [field]: value } }),
        null,
      );
    }
  }
  assert.equal(getEditableStaffScheduleBonusRow({ ...scope, monthId: "2026-10" }), null);
  assert.equal(getEditableStaffScheduleBonusRow({ ...scope, rows: [] }), null);
  assert.equal(
    getEditableStaffScheduleBonusRow({ ...scope, rows: [{ row: "header", data: manager }] }),
    null,
  );
  const cook = { ...manager, app_id: 2, can_edit_bonus: false };
  assert.equal(
    getEditableStaffScheduleBonusRow({
      ...scope,
      rows: [{ data: manager }, { data: cook }],
      request: { ...request, app_id: 2 },
    }),
    null,
  );
});

test("revoked rights or refreshed server capability reject a previously opened bonus request", () => {
  assert.equal(getEditableStaffScheduleBonusRow(scope), manager);
  assert.equal(getEditableStaffScheduleBonusRow({ ...scope, access: { bonus_edit: 0 } }), null);
  assert.equal(
    getEditableStaffScheduleBonusRow({
      ...scope,
      rows: [{ data: { ...manager, can_edit_bonus: false } }],
    }),
    null,
  );
});

test("both table variants use capability; open/save and modal lifetime use current graph identity", () => {
  const page = readFileSync(
    new URL("../../../components/staff_schedule/useStaffSchedulePage.js", import.meta.url),
    "utf8",
  );
  for (const name of ["StaffScheduleTableSection.jsx", "StaffScheduleMobileTableSection.jsx"]) {
    const source = readFileSync(
      new URL(`../../../components/staff_schedule/sections/${name}`, import.meta.url),
      "utf8",
    );
    assert.match(source, /canEditStaffScheduleBonus\(\{ row: data, canEdit, selectedPart \}\)/);
  }
  assert.equal((page.match(/getEditableStaffScheduleBonusRow\(\{/g) || []).length, 3);
  assert.match(
    page,
    /date: monthId, user_id: row\.id, app_id: row\.app_id, smena_id: row\.smena_id/,
  );
  assert.match(page, /value: currentRow\?\.dir_bonus/);
  assert.match(page, /summaryActionRef\.current\.request !== request/);
  assert.doesNotMatch(page, /Бонус директора/);
});
