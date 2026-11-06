import assert from "node:assert/strict";
import test from "node:test";
import { getAvailablePayoutAmount } from "../../../components/staff_schedule/staffSchedulePayroll.mjs";
import {
  getVisibleSummaryColumns,
  isNegativeBalanceValue,
} from "../../../components/staff_schedule/staffScheduleHelpers.js";

const access = { all_price_view: 1, withheld_view: 1, given_cart_view: 1, given_view: 1 };
const row = { total_sum: 1200, withheld: 50, given_cart: 100 };

test("full payout amount includes opening balance, positive or negative", () => {
  assert.equal(getAvailablePayoutAmount(row, access, "given"), 1050);
  assert.equal(getAvailablePayoutAmount({ ...row, opening_balance: 500 }, access, "given"), 1550);
  assert.equal(getAvailablePayoutAmount({ ...row, opening_balance: -300 }, access, "given"), 750);
  assert.equal(getAvailablePayoutAmount({ ...row, opening_balance: "" }, access, "given_cart"), 1150);
});

test("balance columns sit around to-pay and difference is the last column", () => {
  const keys = getVisibleSummaryColumns({ ...access, test_all_price_view: 1, given_cart_view: 1 }).map(
    (column) => column.key,
  );
  assert.ok(keys.indexOf("opening_balance") === keys.indexOf("to_pay_sum") - 1);
  assert.equal(keys.at(-1), "salary_difference");
  assert.equal(keys.includes("test_all_price"), false);
});

test("only negative balance values are highlighted", () => {
  assert.equal(isNegativeBalanceValue({ key: "salary_difference" }, -10), true);
  assert.equal(isNegativeBalanceValue({ key: "opening_balance" }, "-1"), true);
  assert.equal(isNegativeBalanceValue({ key: "salary_difference" }, 0), false);
  assert.equal(isNegativeBalanceValue({ key: "to_pay_sum" }, -10), false);
  assert.equal(isNegativeBalanceValue({ key: "opening_balance" }, ""), false);
});

test("worked hours column is first, public and formatted in hours", async () => {
  const { WORKED_HOURS_COLUMN, formatWorkedMinutes, getSummaryCellValue } = await import(
    "../../../components/staff_schedule/staffScheduleHelpers.js"
  );
  for (const access of [{}, { test_all_price_view: 1 }]) {
    assert.equal(getVisibleSummaryColumns(access)[0], WORKED_HOURS_COLUMN);
  }
  assert.equal(WORKED_HOURS_COLUMN.public, true);
  const plain = (value) => value.replace(/\u00A0/g, " ");
  assert.equal(plain(formatWorkedMinutes(1080)), "18 ч");
  assert.equal(plain(formatWorkedMinutes(1050)), "17 ч 30 мин");
  assert.equal(plain(formatWorkedMinutes(8745)), "145 ч 45 мин");
  assert.equal(plain(formatWorkedMinutes(65)), "1 ч 5 мин");
  assert.equal(plain(formatWorkedMinutes(30)), "0 ч 30 мин");
  assert.equal(plain(formatWorkedMinutes(0)), "0 ч");
  assert.equal(formatWorkedMinutes(""), "");
  assert.equal(WORKED_HOURS_COLUMN.label, "Отработано");
  const { formatDayHoursTitle } = await import("../../../components/staff_schedule/staffScheduleHelpers.js");
  assert.equal(plain(formatDayHoursTitle("7:45")), "7 ч 45 мин");
  assert.equal(plain(formatDayHoursTitle("12")), "12 ч");
  assert.equal(plain(formatDayHoursTitle(6)), "6 ч");
  assert.equal(formatDayHoursTitle(""), undefined);
  assert.equal(formatDayHoursTitle(undefined), undefined);
  assert.equal(plain(getSummaryCellValue(WORKED_HOURS_COLUMN, { worked_min: 90 })), "1 ч 30 мин");
  assert.equal(getSummaryCellValue(WORKED_HOURS_COLUMN, {}), "");
});

test("period sum shows whole rubles in full; rates and payouts drop kopecks; positions are full", async () => {
  const { formatDayAmount, formatFullAmount, getSummaryCellValue, toWholeRubles, getPositionName } = await import(
    "../../../components/staff_schedule/staffScheduleHelpers.js"
  );
  const plain = (value) => value.replace(/\s/g, " ");
  assert.equal(plain(formatDayAmount(53789.6)), "53 790");
  assert.equal(plain(formatDayAmount(-4600)), "-4 600");
  assert.equal(formatDayAmount(999.4), "999");
  assert.equal(formatDayAmount(""), "");
  assert.equal(plain(formatFullAmount(53789.6)), "53 790 ₽");
  assert.equal(formatFullAmount(""), "");

  for (const key of ["price_p_h", "given", "given_cart", "withheld"]) {
    assert.equal(getSummaryCellValue({ key }, { [key]: "44794.00" }), "44794");
  }
  assert.equal(getSummaryCellValue({ key: "dop_bonus" }, { dop_bonus: "320.00" }), "320");
  assert.equal(getSummaryCellValue({ key: "dop_bonus" }, { dop_bonus: "320.50" }), "320.50");
  assert.equal(toWholeRubles("300.00"), "300");
  assert.equal(toWholeRubles(""), "");

  assert.equal(getPositionName({ app_name: "Рег. упр.", full_app_name: "Региональный управляющий" }), "Региональный управляющий");
  assert.equal(getPositionName({ app_name: "Повар" }), "Повар");
});

test("rows of one person get the same subtle tint and a tooltip with the other rows", async () => {
  const { SAME_PERSON_TINTS, getSamePersonTint, getSamePersonTitle } = await import(
    "../../../components/staff_schedule/staffScheduleHelpers.js"
  );
  assert.equal(getSamePersonTint({ same_person_group: 0 }), null);
  assert.equal(getSamePersonTint({}), null);
  assert.equal(getSamePersonTint({ same_person_group: 1 }), SAME_PERSON_TINTS[0]);
  assert.equal(getSamePersonTint({ same_person_group: 2 }), SAME_PERSON_TINTS[1]);
  assert.equal(
    getSamePersonTint({ same_person_group: SAME_PERSON_TINTS.length + 1 }),
    SAME_PERSON_TINTS[0],
  );
  assert.equal(
    getSamePersonTitle({ same_person_with: ["ФРолов С. В. · Курьер"] }),
    "Этот же человек в графике: ФРолов С. В. · Курьер",
  );
  assert.equal(getSamePersonTitle({ same_person_with: [] }), undefined);
});
