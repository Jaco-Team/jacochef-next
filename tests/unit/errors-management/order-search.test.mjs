import test from "node:test";
import assert from "node:assert/strict";
import {
  journalOrderFilters,
  orderNumberLookup,
  orderSearchPeriod,
} from "../../../components/errors_management/orderSearchModel.mjs";

const period = { dateFrom: "2026-11-18", dateTo: "2026-11-18" };

test("only an all-digit order number is an exact lookup", () => {
  assert.deepEqual(orderNumberLookup(" 990001 "), { text: "990001", exact: true, invalid: false });
  assert.deepEqual(orderNumberLookup("99-01"), { text: "99-01", exact: false, invalid: true });
  assert.deepEqual(orderNumberLookup(""), { text: "", exact: false, invalid: false });
  assert.deepEqual(orderNumberLookup(null), { text: "", exact: false, invalid: false });
});

test("order search drops the period only for an exact number", () => {
  assert.deepEqual(orderSearchPeriod({ ...period, orderNumber: "990001" }), {
    date_from: "",
    date_to: "",
  });
  assert.deepEqual(orderSearchPeriod({ ...period, orderNumber: "99a" }), {
    date_from: "2026-11-18",
    date_to: "2026-11-18",
  });
  assert.deepEqual(orderSearchPeriod({ ...period, orderNumber: "" }), {
    date_from: "2026-11-18",
    date_to: "2026-11-18",
  });
});

test("journal sends order_id only for digits and keeps the period otherwise", () => {
  assert.deepEqual(journalOrderFilters({ ...period, orderNumber: "990001" }), {
    order_id: "990001",
    date_from: null,
    date_to: null,
  });
  assert.deepEqual(journalOrderFilters({ ...period, orderNumber: "№990001" }), {
    order_id: null,
    date_from: "2026-11-18",
    date_to: "2026-11-18",
  });
  assert.deepEqual(journalOrderFilters({ orderNumber: "", dateFrom: "", dateTo: "" }), {
    order_id: null,
    date_from: null,
    date_to: null,
  });
});
