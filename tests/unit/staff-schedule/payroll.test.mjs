import test from "node:test";
import assert from "node:assert/strict";
import {
  computePremiumSheet,
  computeToPaySum,
  computeTotalSum,
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
