import test from "node:test";
import assert from "node:assert/strict";

import { applyBannerAutocomplete } from "../../../components/site_setting/banners/bannerFieldsCore.mjs";

const promo = { id: 17, name: "ВКУСНО" };
const items = [{ id: 1, name: "Морской сет" }];

test("choosing a promo keeps the selected items", () => {
  const next = applyBannerAutocomplete({ items, promo_id: null }, "promo_id", promo);

  assert.deepEqual(next.items, items);
  assert.deepEqual(next.promo_id, promo);
});

test("choosing items keeps the selected promo", () => {
  const next = applyBannerAutocomplete({ items: [], promo_id: promo }, "items", items);

  assert.deepEqual(next.items, items);
  assert.deepEqual(next.promo_id, promo);
});

test("clearing one field does not touch the other", () => {
  const next = applyBannerAutocomplete({ items, promo_id: promo }, "promo_id", null);

  assert.equal(next.promo_id, null);
  assert.deepEqual(next.items, items);
});
