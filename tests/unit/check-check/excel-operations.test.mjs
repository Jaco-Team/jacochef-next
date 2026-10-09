import test from "node:test";
import assert from "node:assert/strict";
import {
  excelOperationsAvailable,
  excelOperationTotals,
  filterExcelOperations,
  scopedExcelOperations,
} from "../../../components/check_check/excelOperations.mjs";

const result = {
  excel: {
    operations: [
      {
        row_number: 18,
        date: "2026-09-18",
        date_time: "2026-09-18 17:04:05",
        amount: 295,
        operation_type: "Цифровой рубль",
        rrn: "000123",
        terminal: "00789",
        kassa: 1,
        smena: 380,
      },
      {
        row_number: 19,
        date: "2026-09-18",
        amount: -105,
        operation_type: "Возврат",
        rrn: "",
        kassa: 1,
        smena: 380,
      },
      { row_number: 20, date: "2026-09-19", amount: 100.5, kassa: null, smena: null },
    ],
  },
  warnings: {
    unknown_operations: [
      {
        row_number: 21,
        date: "2026-09-18",
        amount: 19,
        operation_type: "Неизвестная",
        kassa: null,
        smena: null,
      },
    ],
  },
};

test("legacy response never pretends to provide operation details", () => {
  assert.equal(excelOperationsAvailable(null), false);
  assert.equal(excelOperationsAvailable({ excel: {} }), false);
  assert.equal(excelOperationsAvailable({ excel: { operations: [] } }), true);
  assert.deepEqual(scopedExcelOperations(null), []);
});

test("date detail includes unknown rows but shift does not assign their missing metadata", () => {
  assert.equal(scopedExcelOperations(result, { date: "2026-09-18" }).length, 3);
  const shift = scopedExcelOperations(result, { date: "2026-09-18", kassa: "1", smena: "380" });
  assert.deepEqual(
    shift.map((row) => row.row_number),
    [18, 19],
  );
  assert.deepEqual(scopedExcelOperations(result, { kassa: 0 }), []);
});

test("search finds signed decimal amounts, source rows, RRN with zeroes and operation time", () => {
  const rows = scopedExcelOperations(result);
  for (const query of ["295", "000123", "00789", "17:04", "18", "Цифровой"])
    assert.equal(
      filterExcelOperations(rows, query).some((row) => row.row_number === 18),
      true,
    );
  assert.equal(filterExcelOperations(rows, "100,50")[0].row_number, 20);
  assert.equal(filterExcelOperations(rows, "100,5")[0].row_number, 20);
  assert.equal(filterExcelOperations(rows, "-105")[0].row_number, 19);
  assert.deepEqual(
    filterExcelOperations(rows, "", true).map((row) => row.row_number),
    [21],
  );
});

test("returns reduce counted sum while ignored sums stay separate", () => {
  assert.deepEqual(excelOperationTotals(scopedExcelOperations(result, { date: "2026-09-18" })), {
    included: 190,
    unknown: 19,
  });
  assert.deepEqual(excelOperationTotals([]), { included: 0, unknown: 0 });
});
