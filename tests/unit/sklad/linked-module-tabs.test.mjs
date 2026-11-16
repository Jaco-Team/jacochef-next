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

test("storage and allergens tabs require their own sklad_items rights", () => {
  const access = { units_view: 1 };
  assert.deepEqual(
    getVisibleSkladTabs({ access }).map(({ key }) => key),
    ["units"],
  );
  assert.deepEqual(
    getVisibleSkladTabs({ access, linkedModules: { allergens: true, sklad_storage: true } }).map(
      ({ key }) => key,
    ),
    ["units"],
  );
  assert.deepEqual(
    getVisibleSkladTabs({ access: { ...access, allergen_catalog_view: 1 } }).map(({ key }) => key),
    ["units", "allergens"],
  );
  assert.deepEqual(
    getVisibleSkladTabs({ access: { ...access, storage_places_edit: 1 } }).map(({ key }) => key),
    ["units", "storage"],
  );
});
