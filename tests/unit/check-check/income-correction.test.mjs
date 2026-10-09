import test from "node:test";
import assert from "node:assert/strict";
import {
  ACCOUNTING_CORRECTION_NOTICE,
  canAddIncomeCorrection,
  hasAccountingCorrection,
  isIncomeCorrectionPreview,
} from "../../../components/check_check/incomeCorrection.mjs";

const context = { point: { id: 1, base: "jaco_rolls_1" }, order_id: 934411 };
const preview = {
  point_id: 1,
  base: "jaco_rolls_1",
  order_id: 934411,
  amount: 2614,
  kassa: 2,
  smena: 362,
  version: "version",
  accounting_only: true,
};

test("accounting correction requires both detailed rights", () => {
  assert.equal(canAddIncomeCorrection({ check_access: "1", resolve_access: 1 }), true);
  assert.equal(canAddIncomeCorrection({ check_access: 1 }), false);
  assert.equal(canAddIncomeCorrection({ resolve_access: 1 }), false);
  assert.equal(canAddIncomeCorrection(null), false);
});

test("server preview must match the selected order and accounting-only contract", () => {
  assert.equal(isIncomeCorrectionPreview(preview, context), true);
  assert.equal(isIncomeCorrectionPreview({ ...preview, kassa: 6 }, context), true);
  for (const changed of [
    { point_id: 2 },
    { base: "jaco_rolls_2" },
    { order_id: 934412 },
    { accounting_only: false },
    { accounting_only: "true" },
    { amount: 0 },
    { amount: -1 },
    { amount: Infinity },
    { kassa: 0 },
    { kassa: 1.5 },
    { version: "" },
    { version: null },
    { smena: null },
    { smena: 0 },
  ])
    assert.equal(isIncomeCorrectionPreview({ ...preview, ...changed }, context), false);
  assert.equal(isIncomeCorrectionPreview(null, context), false);
});

test("accounting records are identified separately from fiscal receipts", () => {
  const issues = [
    { code: "receipt_missing", order_id: 934411 },
    { code: "receipt_accounting_correction", order_id: 934411 },
  ];
  assert.equal(hasAccountingCorrection(issues, "934411"), true);
  assert.equal(hasAccountingCorrection(issues, 934412), false);
  assert.equal(hasAccountingCorrection(issues.slice(0, 1), 934411), false);
  assert.equal(hasAccountingCorrection(null, 934411), false);
  assert.match(ACCOUNTING_CORRECTION_NOTICE, /не подтверждение фискализации/);
});
