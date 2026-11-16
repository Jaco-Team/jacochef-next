import test from "node:test";
import assert from "node:assert/strict";
import { useSkladStore } from "../../../components/sklad_items/useSkladStore.js";

test("stale requests cannot hide a newer list loader or another section", () => {
  const { beginListLoad, finishListLoad } = useSkladStore.getState();
  const oldRequest = beginListLoad("production");
  const newRequest = beginListLoad("production");
  const unitsRequest = beginListLoad("units");

  finishListLoad("production", oldRequest);
  assert.equal(useSkladStore.getState().listLoading.production.pending, true);
  finishListLoad("production", newRequest);
  assert.equal(useSkladStore.getState().listLoading.production.pending, false);
  assert.equal(useSkladStore.getState().listLoading.units.pending, true);
  finishListLoad("units", unitsRequest);
  assert.equal(useSkladStore.getState().listLoading.units.pending, false);
});
