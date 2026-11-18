import test from "node:test";
import assert from "node:assert/strict";
import { sortAllergens } from "../../../components/sklad_items/allergens/sortAllergens.mjs";

const rows = [
  { id: 1, name: "Яйца", sort: 2 },
  { id: 2, name: "Молоко", sort: 0 },
  { id: 3, name: "Арахис", sort: 2 },
  { id: 4, name: "Банан", sort: 1 },
  { id: 5, name: "Молоко", sort: 0 },
];
const ids = (result) => result.map((row) => row.id);

test("sorts by effective numeric order, Russian name and ID; zero retains backend sentinel", () => {
  assert.deepEqual(ids(sortAllergens(rows)), [4, 3, 1, 2, 5]);
  assert.deepEqual(ids(sortAllergens(rows, { 1: "1", 3: "0" })), [4, 1, 3, 2, 5]);
  assert.deepEqual(ids(rows), [1, 2, 3, 4, 5]);
});

test("empty and invalid drafts retain stored sort until input is valid", () => {
  assert.deepEqual(ids(sortAllergens(rows, { 1: "", 3: "1.5", 4: "-1" })), [4, 3, 1, 2, 5]);
  assert.deepEqual(ids(sortAllergens(rows, { 2: "2" })), [4, 3, 2, 1, 5]);
});

test("zero and 999999 use the same rank as the API", () => {
  const items = [
    { id: 10, name: "Яблоко", sort: 0 },
    { id: 11, name: "Арахис", sort: 999999 },
  ];
  assert.deepEqual(ids(sortAllergens(items)), [11, 10]);
});
