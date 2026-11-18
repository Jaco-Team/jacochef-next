import test from "node:test";
import assert from "node:assert/strict";
import {
  allowsIngredient,
  canEditCatalogNode,
  canSaveNode,
  categoriesForObjectType,
  hasChildren,
  initialDraft,
  isInheritedNode,
  nodeRules,
  parentOptions,
  preferredCategory,
  scopePointId,
  stageOptions,
} from "../../../components/errors_management/sections/settings/catalogModel.mjs";

const globalDish = { id: 1, kind: "category", point_id: null, is_active: true, rules: { object_types: ["dish"] } };
const cafeDish = { id: 2, kind: "category", point_id: 5, is_active: true, rules: { object_types: ["dish"] } };
const globalOrder = { id: 3, kind: "category", point_id: null, is_active: true, rules: { object_types: ["order"] } };

test("scope point id is null for the global scope", () => {
  assert.equal(scopePointId(""), null);
  assert.equal(scopePointId("none"), null);
  assert.equal(scopePointId(0), null);
  assert.equal(scopePointId("5"), 5);
});

test("global nodes are inherited only inside a cafe scope", () => {
  assert.equal(isInheritedNode(globalDish, null), false);
  assert.equal(isInheritedNode(globalDish, 5), true);
  assert.equal(isInheritedNode(cafeDish, 5), false);
});

test("global scope edits only global nodes, cafe scope only its own nodes", () => {
  assert.equal(canEditCatalogNode(globalDish, null, true), true);
  assert.equal(canEditCatalogNode(cafeDish, null, true), false);
  assert.equal(canEditCatalogNode(globalDish, 5, true), false);
  assert.equal(canEditCatalogNode(cafeDish, 5, true), true);
  assert.equal(canEditCatalogNode(cafeDish, 6, true), false);
  assert.equal(canEditCatalogNode(globalDish, null, false), false);
});

test("a cafe category wins over the inherited global one for the same object type", () => {
  const nodes = [globalDish, cafeDish, globalOrder];
  const dish = categoriesForObjectType(nodes, "dish");
  assert.deepEqual(
    dish.map((node) => node.id),
    [1, 2],
  );
  assert.equal(preferredCategory(dish, 5)?.id, 2);
  assert.equal(preferredCategory(dish, null)?.id, 1);
  assert.equal(preferredCategory(categoriesForObjectType(nodes, "delivery"), 5), null);
});

test("new nodes take the scope point id, global scope creates point_id null", () => {
  assert.equal(initialDraft(null, { kind: "stage", pointId: null }).point_id, null);
  assert.equal(initialDraft(null, { kind: "stage", pointId: 5 }).point_id, 5);
  assert.equal(initialDraft(globalDish, { pointId: 5 }).point_id, null);
});

test("rules keep only supported keys and omit empty optional lists", () => {
  assert.deepEqual(nodeRules("error", { stage_ids: ["2", 2, 0, "x"], extra: 1 }), {
    requires_ingredient: false,
    stage_ids: [2],
  });
  assert.deepEqual(nodeRules("category", { object_types: ["extra"], site_category_ids: [], item_ids: [] }), {
    object_types: ["extra"],
  });
  assert.deepEqual(
    nodeRules("category", { object_types: ["extra"], site_category_ids: ["7", 7], item_ids: [15, "16"] }),
    { object_types: ["extra"], site_category_ids: [7], item_ids: [15, 16] },
  );
  assert.deepEqual(nodeRules("stage", { stage_ids: [1] }), {});
});

test("an error cannot be saved without at least one stage", () => {
  assert.equal(canSaveNode({ kind: "error", name: "Холодное", rules: { stage_ids: [] } }), false);
  assert.equal(canSaveNode({ kind: "error", name: "Холодное", rules: {} }), false);
  assert.equal(canSaveNode({ kind: "error", name: "Холодное", rules: { stage_ids: [3] } }), true);
  assert.equal(canSaveNode({ kind: "stage", name: " ", rules: {} }), false);
  assert.equal(canSaveNode({ kind: "stage", name: "Кухня", rules: {} }), true);
});

const tree = [
  globalDish,
  cafeDish,
  globalOrder,
  { id: 10, kind: "error_type", point_id: null, parent_id: 1, is_active: true, name: "Качество" },
  { id: 11, kind: "error_type", point_id: 5, parent_id: 2, is_active: true, name: "Кафе 5" },
  { id: 12, kind: "error_type", point_id: 6, parent_id: 1, is_active: true, name: "Кафе 6" },
  { id: 13, kind: "error_type", point_id: null, parent_id: 3, is_active: false, name: "Отключён" },
  { id: 14, kind: "error_type", point_id: null, parent_id: 3, is_active: true, name: "Заказ" },
  { id: 20, kind: "error", point_id: null, parent_id: 10, is_active: true, name: "Холодное" },
];
const stages = [
  { id: 30, kind: "stage", point_id: null, is_active: true, name: "Кухня" },
  { id: 31, kind: "stage", point_id: 5, is_active: true, name: "Кухня 5" },
  { id: 32, kind: "stage", point_id: null, is_active: false, name: "Старый" },
  { id: 33, kind: "stage", point_id: 6, is_active: true, name: "Кухня 6" },
];

test("parents are offered only from a compatible scope", () => {
  const globalError = { id: 0, kind: "error", point_id: null, parent_id: 10 };
  assert.deepEqual(
    parentOptions(tree, globalError).map((node) => node.id),
    [14, 10],
  );
  const cafeError = { id: 0, kind: "error", point_id: 5, parent_id: 11 };
  assert.deepEqual(
    parentOptions(tree, cafeError)
      .map((node) => node.id)
      .sort((a, b) => a - b),
    [10, 11, 14],
  );
  const inactiveParent = { id: 0, kind: "error", point_id: null, parent_id: 13 };
  assert.ok(parentOptions(tree, inactiveParent).some((node) => node.id === 13));
  assert.deepEqual(
    parentOptions(tree, { id: 0, kind: "error_type", point_id: null, parent_id: 1 }).map(
      (node) => node.id,
    ),
    [1, 3],
  );
  assert.deepEqual(parentOptions(tree, { kind: "stage", point_id: null }), []);
});

test("stages are active and from the node scope", () => {
  assert.deepEqual(
    stageOptions(stages, { point_id: null }).map((stage) => stage.id),
    [30],
  );
  assert.deepEqual(
    stageOptions(stages, { point_id: 5 })
      .map((stage) => stage.id)
      .sort((a, b) => a - b),
    [30, 31],
  );
});

test("the ingredient rule is offered only for dish errors and dropped otherwise", () => {
  assert.equal(allowsIngredient(tree, { kind: "error", parent_id: 10 }), true);
  assert.equal(allowsIngredient(tree, { kind: "error", parent_id: 14 }), false);
  assert.deepEqual(
    nodeRules("error", { requires_ingredient: true, stage_ids: [30, 32] }, {
      allowIngredient: false,
      stageIds: [30],
    }),
    { stage_ids: [30] },
  );
  assert.deepEqual(nodeRules("error", { requires_ingredient: false, stage_ids: [] }), {
    requires_ingredient: false,
  });
});

test("save needs a parent from the offered list and a visible active stage", () => {
  const draft = { kind: "error", name: "Холодное", parent_id: 10, rules: { stage_ids: [32] } };
  assert.equal(canSaveNode(draft, { stageIds: [30], parentIds: [10] }), false);
  assert.equal(
    canSaveNode({ ...draft, rules: { stage_ids: [30] } }, { stageIds: [30], parentIds: [10] }),
    true,
  );
  assert.equal(
    canSaveNode({ ...draft, rules: { stage_ids: [30] } }, { stageIds: [30], parentIds: [14] }),
    false,
  );
  assert.equal(hasChildren(tree, { id: 10 }), true);
  assert.equal(hasChildren(tree, { id: 20 }), false);
  assert.equal(hasChildren(tree, null), false);
});
