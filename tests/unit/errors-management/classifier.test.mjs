import test from "node:test";
import assert from "node:assert/strict";
import {
  classifierDraft,
  validComplaintError,
} from "../../../components/errors_management/complaintClassifier.mjs";

const catalog = [
  { id: 1, kind: "category", is_active: 1, rules: { object_types: ["dish"] } },
  { id: 2, kind: "error_type", parent_id: 1, is_active: 1 },
  {
    id: 3,
    kind: "error",
    parent_id: 2,
    is_active: 1,
    rules: { stage_ids: [20], requires_ingredient: true },
  },
  { id: 4, kind: "category", is_active: 1, rules: { object_types: ["order"] } },
  { id: 5, kind: "error_type", parent_id: 4, is_active: 1 },
  {
    id: 6,
    kind: "error",
    parent_id: 5,
    is_active: 1,
    rules: { stage_ids: [20], requires_ingredient: false },
  },
];
const positions = [
  {
    position_key: "log:100",
    type: "dish",
    ingredients: [{ id: 30, name: "Ингредиент" }],
  },
];
const stages = [{ id: 20 }, { id: 21 }];

test("sole active category, type and error are selected for a dish", () => {
  const draft = classifierDraft(catalog, "dish", "log:100");
  assert.equal(draft.category_id, "1");
  assert.equal(draft.error_type_id, "2");
  assert.equal(draft.error_id, "3");
  assert.equal(draft.position_key, "log:100");
});

test("multiple choices remain blank until an operator selects them", () => {
  const twoCategories = [
    ...catalog,
    { id: 7, kind: "category", is_active: 1, rules: { object_types: ["dish"] } },
  ];
  assert.equal(classifierDraft(twoCategories, "dish", "log:100").category_id, "");

  const twoTypes = [...catalog, { id: 8, kind: "error_type", parent_id: 1, is_active: 1 }];
  const draft = classifierDraft(twoTypes, "dish", "log:100");
  assert.equal(draft.category_id, "1");
  assert.equal(draft.error_type_id, "");
  assert.equal(draft.error_id, "");

  const twoErrors = [
    ...catalog,
    { id: 9, kind: "error", parent_id: 2, is_active: 1, rules: { stage_ids: [20] } },
  ];
  assert.equal(classifierDraft(twoErrors, "dish", "log:100").error_id, "");
});

test("dish error needs an allowed stage and selected ingredient", () => {
  const draft = classifierDraft(catalog, "dish", "log:100");
  assert.equal(validComplaintError(draft, catalog, positions, stages), false);
  assert.equal(
    validComplaintError(
      { ...draft, stage_id: "21", ingredient_id: "30" },
      catalog,
      positions,
      stages,
    ),
    false,
  );
  assert.equal(
    validComplaintError({ ...draft, stage_id: "20" }, catalog, positions, stages),
    false,
  );
  assert.equal(
    validComplaintError(
      { ...draft, stage_id: "20", ingredient_id: "31" },
      catalog,
      positions,
      stages,
    ),
    false,
  );
  assert.equal(
    validComplaintError(
      { ...draft, stage_id: "20", ingredient_id: "30" },
      catalog,
      positions,
      stages,
    ),
    true,
  );
});

test("order error is valid without position and rejects dish category", () => {
  const draft = { ...classifierDraft(catalog, "order"), stage_id: "20" };
  assert.equal(draft.position_key, null);
  assert.equal(validComplaintError(draft, catalog, positions, stages), true);
  assert.equal(
    validComplaintError({ ...draft, position_key: "log:100" }, catalog, positions, stages),
    false,
  );
  assert.equal(
    validComplaintError(
      { ...draft, category_id: "1", error_type_id: "2", error_id: "3", ingredient_id: "30" },
      catalog,
      positions,
      stages,
    ),
    false,
  );
});

test("cutlery requires its own saved order position", () => {
  const cutleryCatalog = [
    { id: 1, kind: "category", is_active: 1, rules: { object_types: ["cutlery"] } },
    { id: 2, kind: "error_type", parent_id: 1, is_active: 1 },
    { id: 3, kind: "error", parent_id: 2, is_active: 1, rules: { stage_ids: [20] } },
  ];
  const draft = { ...classifierDraft(cutleryCatalog, "cutlery", "cutlery:300"), stage_id: "20" };

  assert.equal(
    validComplaintError(
      draft,
      cutleryCatalog,
      [{ position_key: "cutlery:300", type: "cutlery" }],
      stages,
    ),
    true,
  );
  assert.equal(
    validComplaintError(
      draft,
      cutleryCatalog,
      [{ position_key: "cutlery:300", type: "dish" }],
      stages,
    ),
    false,
  );
});

test("inactive classifier nodes are not auto-selected or accepted", () => {
  const inactiveCategory = catalog.map((node) =>
    node.id === 1 ? { ...node, is_active: 0 } : node,
  );
  assert.equal(classifierDraft(inactiveCategory, "dish", "log:100").category_id, "");

  const validDraft = {
    ...classifierDraft(catalog, "dish", "log:100"),
    stage_id: "20",
    ingredient_id: "30",
  };
  for (const id of [1, 2, 3]) {
    const inactive = catalog.map((node) => (node.id === id ? { ...node, is_active: 0 } : node));
    assert.equal(validComplaintError(validDraft, inactive, positions, stages), false);
  }
});
