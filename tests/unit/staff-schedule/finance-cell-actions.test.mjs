import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  canEditStaffScheduleFinanceValue,
  createStaffScheduleAccess,
} from "../../../components/staff_schedule/staffScheduleAccess.mjs";

const columns = { price_p_h: "1h", given: "given", given_cart: "given_cart", withheld: "withheld" };

test("each financial cell requires its own detailed edit/access permission", () => {
  for (const [columnKey, permission] of Object.entries(columns)) {
    for (const suffix of ["view", "edit", "access"]) {
      const { canEdit } = createStaffScheduleAccess({ [`${permission}_${suffix}`]: 1 });
      assert.equal(
        canEditStaffScheduleFinanceValue({ columnKey, row: { price_arr: [300] }, canEdit }),
        suffix !== "view",
      );
      for (const otherColumn of Object.keys(columns)) {
        if (otherColumn !== columnKey)
          assert.equal(
            canEditStaffScheduleFinanceValue({
              columnKey: otherColumn,
              row: { price_arr: [300] },
              canEdit,
            }),
            false,
          );
      }
    }
    assert.equal(
      canEditStaffScheduleFinanceValue({
        columnKey,
        row: { price_arr: [300] },
        canEdit: createStaffScheduleAccess({}).canEdit,
      }),
      false,
    );
  }
});

test("rate editing retains the requirement for available rate options", () => {
  const canEdit = createStaffScheduleAccess({ "1h_edit": 1 }).canEdit;
  for (const row of [
    undefined,
    null,
    {},
    { price_arr: null },
    { price_arr: [] },
    { price_arr: { 0: 300 } },
  ]) {
    assert.equal(canEditStaffScheduleFinanceValue({ columnKey: "price_p_h", row, canEdit }), false);
  }
  assert.equal(
    canEditStaffScheduleFinanceValue({
      columnKey: "price_p_h",
      row: { price_arr: [300] },
      canEdit,
    }),
    true,
  );
});

test("cash, cards and withholding remain editable for zero values and past financial periods", () => {
  const canEdit = createStaffScheduleAccess({
    given_edit: 1,
    given_cart_edit: 1,
    withheld_edit: 1,
  }).canEdit;
  for (const columnKey of ["given", "given_cart", "withheld"]) {
    for (const row of [
      undefined,
      { [columnKey]: 0 },
      { [columnKey]: "0.00", check_period: 0, kind: "other" },
    ]) {
      assert.equal(canEditStaffScheduleFinanceValue({ columnKey, row, canEdit }), true);
    }
  }
});

test("base financial gate does not grant bonuses or read-only calculated columns", () => {
  const canEdit = () => true;
  for (const columnKey of [
    "my_bonus",
    "dop_bonus",
    "all_price",
    "test_all_price",
    "full_h",
    "errors",
    "unknown",
    undefined,
  ]) {
    assert.equal(
      canEditStaffScheduleFinanceValue({ columnKey, row: { price_arr: [300] }, canEdit }),
      false,
    );
  }
  assert.equal(canEditStaffScheduleFinanceValue(), false);
});

test("desktop and mobile use the same gate, accessible whole-cell actions and editable-only cues", () => {
  for (const filename of ["StaffScheduleTableSection.jsx", "StaffScheduleMobileTableSection.jsx"]) {
    const source = readFileSync(
      new URL(`../../../components/staff_schedule/sections/${filename}`, import.meta.url),
      "utf8",
    );
    assert.match(
      source,
      /canEditStaffScheduleFinanceValue\(\{ columnKey: column\.key, row: data, canEdit \}\)/,
    );
    assert.match(source, /isClickable = !isFinancialBlurred/);
    assert.match(source, /role=\{isClickable \? "button" : undefined\}/);
    assert.match(source, /tabIndex=\{isClickable \? 0 : undefined\}/);
    assert.match(source, /onClick=\{isClickable \? handleClick : undefined\}/);
    assert.match(source, /event\.key === "Enter" \|\| event\.key === " "/);
    assert.match(source, /onOpenSummaryAction\?\.\(data, column\.key\)/);
    assert.match(source, /isClickable \? staffScheduleFinancialValueStyle : null/);
    assert.match(source, /isClickable \? staffScheduleFinancialFocusSx : null/);
    assert.match(source, /canEditStaffScheduleBonus\(\{ row: data, canEdit, selectedPart \}\)/);
    assert.match(source, /data\?\.user_name.*data\?\.full_app_name/);
  }
});
