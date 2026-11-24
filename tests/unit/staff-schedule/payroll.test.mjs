import test from "node:test";
import assert from "node:assert/strict";
import {
  computePremiumSheet,
  computeToPaySum,
  computeTotalSum,
  getAvailablePayoutAmount,
  toNumber,
} from "../../../components/staff_schedule/staffSchedulePayroll.mjs";

test("toNumber keeps finite values and falls back for invalid ones", () => {
  assert.equal(toNumber("12.5"), 12.5);
  assert.equal(toNumber(null), 0);
  assert.equal(toNumber(undefined, 7), 7);
  assert.equal(toNumber("abc", 9), 9);
});

test("computeTotalSum aggregates the payroll row fields", () => {
  const row = {
    dop_bonus: "100",
    dir_price: 200,
    register_price: "50",
    dir_price_dop: 25,
    h_price: "1000",
    my_bonus: 75,
    err_price: "20",
  };

  assert.equal(computeTotalSum(row), 1430);
});

test("computeToPaySum subtracts transfers and withheld amount", () => {
  const row = {
    h_price: 1000,
    my_bonus: 200,
    given_cart: 300,
    withheld: 50,
  };

  assert.equal(computeToPaySum(row), 850);
});

test("computeToPaySum stays empty for drivers", () => {
  assert.equal(computeToPaySum({ app_type: "driver", h_price: 1000 }), "");
});

test("computePremiumSheet returns everything above or below base wage", () => {
  const positivePremium = {
    h_price: 1000,
    my_bonus: 200,
    dir_price: 50,
    err_price: 20,
  };
  const negativePremium = {
    h_price: 1000,
    err_price: 150,
  };

  assert.equal(computePremiumSheet(positivePremium), 230);
  assert.equal(computePremiumSheet(negativePremium), -150);
});

test("authoritative aggregates preserve zero and empty values instead of deriving hidden operands", () => {
  const row = { total_sum: 0, to_pay_sum: "", premium_sheet: 0, h_price: 1000, my_bonus: 200 };
  assert.equal(computeTotalSum(row), 0);
  assert.equal(computeToPaySum(row), "");
  assert.equal(computePremiumSheet(row), 0);
  assert.equal(computeTotalSum({ total_sum: "", h_price: 500 }), "");
  assert.equal(computeTotalSum({ total_sum: "900", h_price: "" }), "900");
  assert.equal(computeToPaySum({ to_pay_sum: 777, h_price: "", given_cart: "" }), 777);
  assert.equal(computePremiumSheet({ premium_sheet: -25, h_price: "" }), -25);
});

test("full payout shortcut requires readable real operands but manual edit right stays independent", () => {
  const row = { total_sum: 1000, given_cart: 200, withheld: 50 };
  const flags = { all_price_view: 1, given_cart_view: 1, withheld_view: 1 };
  assert.equal(getAvailablePayoutAmount(row, flags, "given"), 750);
  assert.equal(getAvailablePayoutAmount(row, flags, "given_cart"), 950);
  assert.equal(getAvailablePayoutAmount(row, { given_edit: 1 }, "given"), null);
  assert.equal(getAvailablePayoutAmount(row, { given_cart_access: 1 }, "given_cart"), null);
  assert.equal(getAvailablePayoutAmount(row, { ...flags, salary_block_view: 0 }, "given"), 750);
  assert.equal(getAvailablePayoutAmount({ ...row, withheld: "" }, flags, "given"), null);
  assert.equal(getAvailablePayoutAmount({ ...row, given_cart: "" }, flags, "given"), null);
  assert.equal(
    getAvailablePayoutAmount({ ...row, total_sum: 0, withheld: 0, given_cart: 0 }, flags, "given"),
    0,
  );
});
