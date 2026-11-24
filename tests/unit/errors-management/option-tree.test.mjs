import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCategoryTree,
  canSaveCategory,
  categoryDraft,
  categoryHasChildren,
  categoryPayload,
  categorySummary,
  flattenCategoryTree,
} from "../../../components/errors_management/optionTreeModel.mjs";

const errCats = [
  { id: 1, parent_id: null, name: "Заказ", is_active: 1, site_cats: null, sort: 2 },
  { id: 2, parent_id: null, name: "Блюдо", is_active: 1, site_cats: "9,14", sort: 1 },
  { id: 3, parent_id: 2, name: "Качество", is_active: 0, site_cats: "9,14", sort: 0 },
  {
    id: 4,
    parent_id: 3,
    name: "Холодное",
    is_active: 1,
    need_img: 1,
    site_cats: "9,14",
    stage_1: "1,2",
    stage_2: "3",
    stage_3: null,
    solutions: "5",
    sort: 0,
  },
];

test("the editable tree keeps nesting and sort order", () => {
  const tree = buildCategoryTree(errCats);
  assert.deepEqual(
    tree.map((node) => node.name),
    ["Блюдо", "Заказ"],
  );
  assert.equal(tree[0].children[0].children[0].name, "Холодное");
  assert.equal(tree[0].children[0].is_active, false);
  assert.deepEqual(
    flattenCategoryTree(tree).map((item) => [item.id, item.depth, item.name]),
    [
      [2, 0, "Блюдо"],
      [3, 1, "Блюдо / Качество"],
      [4, 2, "Блюдо / Качество / Холодное"],
      [1, 0, "Заказ"],
    ],
  );
  assert.equal(categoryHasChildren(errCats, 3), true);
  assert.equal(categoryHasChildren(errCats, 4), false);
});

test("a new child inherits the parent site categories; a root edits its own", () => {
  const child = categoryDraft(null, errCats[1]);
  assert.equal(child.parent_id, 2);
  assert.deepEqual(child.site_cats, [9, 14]);
  assert.equal(child.is_active, true);
  const root = categoryDraft(null, null);
  assert.equal(root.parent_id, null);
  assert.deepEqual(root.site_cats, []);
  assert.equal(canSaveCategory(root), false);
  assert.equal(canSaveCategory({ ...root, name: " Новый " }), true);
});

test("the payload uses the legacy CSV columns of err_desc_cats", () => {
  const leaf = categoryDraft(errCats[3]);
  assert.deepEqual(categoryPayload({ ...leaf, stage_3: [9, 9], sort: "4" }), {
    id: 4,
    name: "Холодное",
    parent_id: 3,
    sort: 4,
    is_active: 1,
    need_img: 1,
    site_cats: "9,14",
    solutions: "5",
    stage_1: "1,2",
    stage_2: "3",
    stage_3: "9",
  });
  const newRoot = categoryPayload({
    ...categoryDraft(null),
    name: "Новый",
    need_img: true,
    solution_ids: [5],
    stage_1: [1],
  });
  assert.equal(newRoot.need_img, 0);
  assert.equal(newRoot.solutions, null);
  assert.equal(newRoot.stage_1, null);
  assert.equal(newRoot.site_cats, null);
  assert.equal("id" in categoryPayload({ ...categoryDraft(null), name: "Новый" }), false);
});

test("the summary names stages and solutions of a node", () => {
  const leaf = buildCategoryTree(errCats)[0].children[0].children[0];
  const summary = categorySummary(
    leaf,
    new Map([
      [1, "1 Этап"],
      [3, "3 Этап"],
    ]),
    new Map([[5, "Промокод"]]),
  );
  assert.deepEqual(summary, { stageNames: ["1 Этап", "3 Этап"], solutionNames: ["Промокод"] });
});

test("saving a root keeps the leaf fields err_desc_cats already stores", () => {
  const storedRoot = {
    id: 9,
    parent_id: null,
    name: "Опоздание",
    is_active: 1,
    need_img: 1,
    site_cats: "",
    stage_1: "4",
    stage_2: "4,6",
    stage_3: null,
    solutions: "5,7",
    sort: 3,
  };
  const edited = { ...categoryDraft(storedRoot), name: "Опоздание курьера", sort: "1" };
  assert.deepEqual(categoryPayload({ ...edited, need_img: false, stage_1: [] }, storedRoot), {
    id: 9,
    name: "Опоздание курьера",
    parent_id: null,
    sort: 1,
    is_active: 1,
    need_img: 1,
    site_cats: null,
    solutions: "5,7",
    stage_1: "4",
    stage_2: "4,6",
    stage_3: null,
  });
});
