import assert from "node:assert/strict";
import test from "node:test";
import {
  formatRevisionSavedAt,
  revisionSavedAt,
} from "../../../components/sklad_items/history/revisionSavedAt.mjs";

test("only known mutation revisions expose a valid original save time", () => {
  const revision_saved_at = "2026-10-30 15:42:00";
  for (const revision_source of ["user", "flag", "image", "image_restore"]) {
    assert.equal(revisionSavedAt({ revision_source, revision_saved_at }), revision_saved_at);
    assert.equal(formatRevisionSavedAt({ revision_source, revision_saved_at }), "30.10.2026 15:42");
  }
  for (const revision_source of ["bootstrap", "legacy", null, undefined, "other"]) {
    assert.equal(formatRevisionSavedAt({ revision_source, revision_saved_at }), "Неизвестно");
  }
  assert.equal(
    formatRevisionSavedAt({ revision_source: "user", revision_saved_at: "invalid" }),
    "Неизвестно",
  );
  assert.equal(formatRevisionSavedAt({ revision_source: "user" }), "Неизвестно");
  assert.equal(formatRevisionSavedAt(null), "Неизвестно");
});
