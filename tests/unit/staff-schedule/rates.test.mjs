import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createStaffSchedulePolicy } from "../../../components/staff_schedule/staffScheduleAccess.mjs";
import {
  buildRatesSavePayload,
  formatChange,
  formatLegacyPrices,
  formatRatesPeriodLabel,
  getDefaultExpandedUnitIds,
  groupPositionsByUnit,
  isValidMoneyInput,
} from "../../../components/staff_schedule/rates/staffScheduleRates.mjs";

test("rates page opens with any rates read right and edits only with edit/access", () => {
  assert.equal(createStaffSchedulePolicy({}).canViewRates, false);
  assert.equal(createStaffSchedulePolicy({ rates: 1 }).canViewRates, false);
  assert.equal(createStaffSchedulePolicy({ full_month_access: 1 }).canViewRates, false);

  const viewer = createStaffSchedulePolicy({ rates_view: 1 });
  assert.deepEqual([viewer.canViewRates, viewer.canEditRates], [true, false]);
  for (const access of [{ rates_edit: 1 }, { rates_access: 1 }]) {
    const editor = createStaffSchedulePolicy(access);
    assert.deepEqual([editor.canViewRates, editor.canEditRates], [true, true]);
  }
});

test("save payload sends one rate per position, ids of cafes and normalized decimals", () => {
  assert.deepEqual(
    buildRatesSavePayload({
      dateStart: "2026-11-01",
      points: [{ id: 1, name: "Самара" }, { id: "2" }, null],
      positions: [
        { app_id: "5", app_name: "Повар", price: "210,5", legacy_prices: {} },
        { app_id: 6, price: "" },
      ],
      coefficients: { k_rolls: " 1,7 ", k_pizza: "2" },
    }),
    {
      date_start: "2026-11-01",
      points: [1, 2],
      positions: [
        { app_id: 5, price: "210.5" },
        { app_id: 6, price: "" },
      ],
      k_rolls: "1.7",
      k_pizza: "2",
    },
  );
});

test("money input accepts empty, integers and two decimals only", () => {
  for (const value of ["", "0", "210", "210,5", "210.55"]) assert.equal(isValidMoneyInput(value), true);
  for (const value of ["-1", "abc", "210.555", "1e3"]) assert.equal(isValidMoneyInput(value), false);
});

const positions = [
  { app_id: 8, unit_id: 2, unit_name: "Офис", is_graph: 0, price: "" },
  { app_id: 5, unit_id: 1, unit_name: "Кафе", is_graph: 1, price: "210" },
  { app_id: 6, unit_id: 1, unit_name: "Кафе", is_graph: 1, price: "" },
  { app_id: 7, unit_id: 1, unit_name: "Кафе", is_graph: 0, price: "100" },
  { app_id: 9, unit_id: 0, unit_name: "", is_graph: 0, price: "" },
];

test("positions are grouped by department in backend order with counts", () => {
  assert.deepEqual(
    groupPositionsByUnit(positions).map((group) => [
      group.unitName,
      group.positions.map((position) => position.app_id),
      group.filledCount,
      group.inGraphCount,
    ]),
    [
      ["Офис", [8], 0, 0],
      ["Кафе", [5, 6, 7], 2, 2],
      ["Без отдела", [9], 0, 0],
    ],
  );
});

test("graph filter keeps only matching positions and drops empty departments", () => {
  const ids = (filter) =>
    groupPositionsByUnit(positions, filter).map((group) => [
      group.unitId,
      group.positions.map((position) => position.app_id),
    ]);
  assert.deepEqual(ids("graph"), [[1, [5, 6]]]);
  assert.deepEqual(ids("no_graph"), [
    [2, [8]],
    [1, [7]],
    [0, [9]],
  ]);
});

test("departments with graph positions or filled rates start expanded", () => {
  assert.deepEqual(getDefaultExpandedUnitIds(positions), [1]);
});

test("legacy spread is explained", () => {
  assert.equal(
    formatLegacyPrices({ has_legacy_spread: true, legacy_prices: { min: 180, avg: 200, max: 220 } }),
    "В старом app_per_h три ставки: 180 / 200 / 220",
  );
  assert.equal(formatLegacyPrices({ has_legacy_spread: false }), "");
});

test("history change and period labels are readable", () => {
  assert.equal(formatChange(200, 210), "200 → 210");
  assert.equal(formatChange(null, 210.5), "210,5");
  assert.equal(
    formatRatesPeriodLabel({ value: "2026-10-16", end_date: "2026-10-31" }),
    "с 16 по 31 октября 2026 г.",
  );
  assert.equal(
    formatRatesPeriodLabel({ value: "2026-11-01", end_date: "2026-11-15" }),
    "с 1 по 15 ноября 2026 г.",
  );
});

test("schedule header links to rates only for users with rates read right", () => {
  const source = readFileSync(
    new URL("../../../components/staff_schedule/sections/StaffScheduleHeaderSection.jsx", import.meta.url),
    "utf8",
  );
  assert.equal((source.match(/\{page\.canOpenRates \? \(/g) ?? []).length, 2);
  assert.match(source, /STAFF_SCHEDULE_RATES_HREF = "\/staff_schedule\/rates"/);
});
