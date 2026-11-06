import test from "node:test";
import assert from "node:assert/strict";
import { getDeleteError } from "../../../components/sklad_items/site-items/siteItemDeleteFeedback.mjs";

test("explains current and historical composition blockers alongside other relations", () => {
  const message = getDeleteError({
    text: "Удаление запрещено",
    usage: {
      active_relations: [
        { source: "items_items_new", count: 2 },
        { source: "city_items", count: 1 },
      ],
      history_relations: [{ source: "items_items_hist_new", count: 3 }],
    },
  });
  assert.match(message, /используется в составе других товаров сайта/);
  assert.match(message, /есть в истории состава других товаров сайта/);
  assert.match(message, /активные связи: 2/);
  assert.match(message, /история: 1/);
});

test("preserves fallback and existing feedback for unrelated blockers", () => {
  assert.equal(getDeleteError({ text: "Нет доступа" }), "Нет доступа");
  assert.equal(
    getDeleteError({ usage: { active_relations: [{ source: "city_items" }] } }),
    "Удаление запрещено (активные связи: 1)",
  );
  assert.equal(getDeleteError(null), "Удаление запрещено");
});
