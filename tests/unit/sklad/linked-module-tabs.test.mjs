import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../../../components/sklad_items/skladTabs.js", import.meta.url),
  "utf8",
);
const { getVisibleSkladTabs } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);

test("allergens tab requires explicit linked-module access", () => {
  const access = { units_view: 1 };
  assert.deepEqual(
    getVisibleSkladTabs({ access }).map(({ key }) => key),
    ["units"],
  );
  assert.deepEqual(
    getVisibleSkladTabs({ access, linkedModules: { allergens: false } }).map(({ key }) => key),
    ["units"],
  );
  assert.deepEqual(
    getVisibleSkladTabs({ access, linkedModules: { allergens: true } }).map(({ key }) => key),
    ["units", "allergens"],
  );
});
