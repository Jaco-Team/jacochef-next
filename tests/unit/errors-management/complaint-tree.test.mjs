import test from "node:test";
import assert from "node:assert/strict";
import {
  acceptPhotoFiles,
  buildLeaves,
  canResolveErrors,
  errorSolutionOptions,
  errorsCountLabel,
  findLeafById,
  idList,
  leafGroupTitle,
  leafPickerOptions,
  leavesForPosition,
  matchesQuery,
  missingLabel,
  newClientRequestId,
  photoFileError,
  pickLeaf,
  resolutionDrafts,
  resolutionPayload,
  solutionOptionsForLeaf,
  stageIdsForLeaf,
  stageOptionsForLeaf,
  stepQuantity,
  treeErrorDraft,
  treeErrorIssues,
  treeErrorPayload,
  validQuantity,
} from "../../../components/errors_management/complaintTree.mjs";

const node = (id, parent_id, name, extra = {}) => ({
  id,
  parent_id,
  name,
  is_active: 1,
  need_img: 0,
  site_cats: "",
  stage_1: "",
  stage_2: "",
  stage_3: "",
  solution_ids: [],
  sort: 0,
  ...extra,
});

const tree = [
  node(1, null, "Блюдо", { site_cats: "9,10,14", sort: 1 }),
  node(2, 1, "Качество"),
  node(3, 2, "Холодное", { stage_1: "1,2", stage_2: [3], solution_ids: [5, 6], need_img: 1 }),
  node(4, 2, "Подгорело"),
  node(40, 2, "Отключённый", { is_active: 0 }),
  node(10, null, "Допы", { site_cats: [7], sort: 2 }),
  node(11, 10, "Не положили", { stage_3: "9" }),
  node(20, null, "Столовые приборы", { site_cats: "7", sort: 3 }),
  node(21, 20, "Не положили приборы"),
  node(30, null, "Заказ", { sort: 0 }),
  node(31, 30, "Опоздание", { stage_1: "4", stage_2: "6", stage_3: "" }),
  node(50, null, "Старый раздел", { is_active: "0" }),
  node(51, 50, "Активный под отключённым"),
  node(60, null, "Глубокий", { site_cats: "13" }),
  node(61, 60, "Уровень 2"),
  node(62, 61, "Уровень 3"),
  node(63, 62, "Уровень 4", { stage_1: "1" }),
  node(70, 999, "Сирота"),
];
const leaves = buildLeaves(tree);
const stages = [
  { id: 1, name: "1 Этап", description: "Роллы: приготовление" },
  { id: 2, name: "2 Этап" },
  { id: 3, name: "3 Этап" },
  { id: 4, name: "Доставка" },
  { id: 6, name: "Контакт-центр" },
  { id: 9, name: "Кассир" },
];
const solutions = [
  { id: 5, name: "Промокод" },
  { id: 6, name: "Замена" },
  { id: 7, name: "Возврат" },
];

test("CSV and array id lists are parsed into unique positive ids", () => {
  assert.deepEqual(idList("1, 2,,x,2,-3"), [1, 2]);
  assert.deepEqual(idList([3, "4", 0, null]), [3, 4]);
  assert.deepEqual(idList(null), []);
});

test("selectable errors are active leaves with an active path of any depth", () => {
  assert.deepEqual(
    leaves.map((leaf) => leaf.id).sort((a, b) => a - b),
    [3, 4, 11, 21, 31, 63],
  );
  const deep = leaves.find((leaf) => leaf.id === 63);
  assert.deepEqual(deep.pathIds, [60, 61, 62, 63]);
  assert.equal(deep.name, "Глубокий / Уровень 2 / Уровень 3 / Уровень 4");
  assert.deepEqual(deep.siteCats, [13]);
  const cold = leaves.find((leaf) => leaf.id === 3);
  assert.equal(cold.needImg, true);
  assert.deepEqual(cold.siteCats, [9, 10, 14]);
});

test("positions get leaves by inherited site categories; delivery and order get the rest", () => {
  const sauce = { site_category_id: 7 };
  assert.deepEqual(
    leavesForPosition(leaves, sauce)
      .map((leaf) => leaf.id)
      .sort((a, b) => a - b),
    [11, 21],
  );
  assert.deepEqual(
    leavesForPosition(leaves, { type: "delivery", site_category_id: null }).map((leaf) => leaf.id),
    [31],
  );
  assert.deepEqual(
    leavesForPosition(leaves, null).map((leaf) => leaf.id),
    [31],
  );
  assert.equal(leavesForPosition(leaves, { type: "dish", site_category_id: null }).length, leaves.length);
  assert.deepEqual(
    leavesForPosition(leaves, { type: "dish", category_id: 13 }).map((leaf) => leaf.id),
    [63],
  );
});

test("one searchable list groups leaves by category and middle path", () => {
  const dish = leavesForPosition(leaves, { site_category_id: 14 });
  const options = leafPickerOptions(dish);
  assert.deepEqual(
    options.map((option) => [option.name, option.group, option.needImg]),
    [
      ["Подгорело", "Блюдо · Качество", false],
      ["Холодное", "Блюдо · Качество", true],
    ],
  );
  const deep = leaves.find((leaf) => leaf.id === 63);
  assert.equal(leafGroupTitle(deep), "Глубокий · Уровень 2 / Уровень 3");
  assert.equal(leafGroupTitle(leaves.find((leaf) => leaf.id === 31)), "Заказ");
  assert.equal(matchesQuery(options[1].search, "холод"), true);
  assert.equal(matchesQuery(options[1].search, "блюдо качество"), true);
  assert.equal(matchesQuery(options[1].search, "упаковка"), false);
  assert.equal(matchesQuery("Ёжик в тумане", "ежик"), true);
  assert.equal(findLeafById(dish, "3")?.id, 3);
  assert.equal(findLeafById(dish, "31"), null);
});

test("picking a leaf auto-selects a single stage and never a solution", () => {
  const draft = treeErrorDraft("dish", { position_key: "dish:1" });
  const cold = leaves.find((leaf) => leaf.id === 3);
  const pizza = pickLeaf({ ...draft, solution_id: "5" }, cold, "pizza");
  assert.equal(pizza.leaf_id, "3");
  assert.equal(pizza.stage_id, "3");
  assert.equal(pizza.solution_id, "");
  assert.equal(pickLeaf(draft, cold, "rolls").stage_id, "");
  assert.equal(pickLeaf(draft, null, "rolls").leaf_id, "");
});

test("stages follow the product kind and fall back to the union", () => {
  const cold = leaves.find((leaf) => leaf.id === 3);
  assert.deepEqual(stageIdsForLeaf(cold, "rolls"), [1, 2]);
  assert.deepEqual(stageIdsForLeaf(cold, "pizza"), [3]);
  assert.deepEqual(stageIdsForLeaf(cold, "drinks_extras"), [1, 2, 3]);
  assert.deepEqual(stageIdsForLeaf(cold, null), [1, 2, 3]);
  const late = leaves.find((leaf) => leaf.id === 31);
  assert.deepEqual(stageIdsForLeaf(late, null), [4, 6]);
  assert.deepEqual(stageIdsForLeaf(leaves.find((leaf) => leaf.id === 4), "rolls"), []);
  assert.deepEqual(
    stageOptionsForLeaf(cold, "rolls", stages).map((stage) => stage.description ?? null),
    ["Роллы: приготовление", null],
  );
});

test("solutions come from the leaf list and are hidden when it is empty", () => {
  const cold = leaves.find((leaf) => leaf.id === 3);
  assert.deepEqual(
    solutionOptionsForLeaf(cold, solutions).map((solution) => solution.id),
    [5, 6],
  );
  assert.deepEqual(solutionOptionsForLeaf(leaves.find((leaf) => leaf.id === 4), solutions), []);
  assert.deepEqual(solutionOptionsForLeaf(null, solutions), []);
});

test("a draft is complete with a leaf, a resolved stage and required photos; solution is optional", () => {
  const positions = [
    { position_key: "dish:3", type: "dish", site_category_id: 14, product_kind: "pizza", total_count: 2 },
  ];
  const context = { leaves, positions };
  const draft = treeErrorDraft("dish", positions[0]);
  assert.deepEqual(treeErrorIssues(draft, context), ["leaf"]);
  assert.equal(missingLabel(treeErrorIssues(draft, context)), "Осталось: выберите проблему");
  const chosen = { ...draft, leaf_id: "3", stage_id: "" };
  assert.deepEqual(treeErrorIssues(chosen, context), ["stage", "photos_required"]);
  assert.equal(
    missingLabel(treeErrorIssues(chosen, context)),
    "Осталось: выберите этап, добавьте фото",
  );
  const uploading = { ...chosen, stage_id: "3", photos: [{ key: "a", status: "uploading" }] };
  assert.deepEqual(treeErrorIssues(uploading, context), ["photos_pending", "photos_required"]);
  const ready = {
    ...chosen,
    stage_id: "3",
    quantity: 2,
    comment: "  ",
    photos: [
      { key: "a", status: "done", id: 70 },
      { key: "b", status: "error", error: "big" },
    ],
  };
  assert.deepEqual(treeErrorIssues(ready, context), []);
  assert.equal(missingLabel([]), "");
  assert.deepEqual(treeErrorIssues({ ...ready, stage_id: "1" }, context), ["stage"]);
  assert.deepEqual(treeErrorIssues({ ...ready, solution_id: "7" }, context), ["solution"]);
  assert.deepEqual(treeErrorIssues({ ...ready, quantity: 3 }, context), ["quantity"]);
  assert.deepEqual(treeErrorPayload({ ...ready, solution_id: "5" }, leaves, positions), {
    object_type: "dish",
    position_key: "dish:3",
    error_id: 3,
    stage_id: 3,
    solution_id: 5,
    photo_ids: [70],
    quantity: 2,
    comment: null,
  });
});

test("the quantity stepper stays within 1 and the position count", () => {
  const position = { total_count: 3 };
  const draft = treeErrorDraft("dish", { position_key: "dish:1" });
  assert.equal(stepQuantity(draft, position, -1).quantity, 1);
  assert.equal(stepQuantity({ ...draft, quantity: 2 }, position, 1).quantity, 3);
  assert.equal(stepQuantity({ ...draft, quantity: 3 }, position, 1).quantity, 3);
  assert.equal(stepQuantity(draft, null, 1).quantity, 1);
});

test("a leaf without stages needs no stage; order errors use the leaves without site categories", () => {
  const positions = [{ position_key: "dish:4", type: "dish", site_category_id: 14 }];
  const noStage = { ...treeErrorDraft("dish", positions[0]), leaf_id: "4" };
  assert.deepEqual(treeErrorIssues(noStage, { leaves, positions }), []);
  const order = { ...treeErrorDraft("order", null), leaf_id: "31", stage_id: "6" };
  assert.equal(order.position_key, null);
  assert.deepEqual(treeErrorIssues(order, { leaves, positions }), []);
  assert.equal(treeErrorPayload(order, leaves, positions).error_id, 31);
  assert.deepEqual(treeErrorIssues({ ...order, leaf_id: "3" }, { leaves, positions }), ["leaf"]);
  assert.equal(validQuantity({ quantity: 2 }, null), false);
});

test("the register button counts errors in Russian", () => {
  assert.equal(errorsCountLabel(1), "1 ошибка");
  assert.equal(errorsCountLabel(3), "3 ошибки");
  assert.equal(errorsCountLabel(5), "5 ошибок");
  assert.equal(errorsCountLabel(11), "11 ошибок");
  assert.equal(errorsCountLabel(22), "22 ошибки");
});

test("photo files are checked by type, size and the per-error limit", () => {
  const jpeg = { name: "a.jpg", type: "image/jpeg", size: 1024 };
  assert.equal(photoFileError(jpeg), null);
  assert.match(photoFileError({ type: "image/gif", size: 10 }), /JPEG/);
  assert.match(photoFileError({ type: "image/png", size: 10 * 1024 * 1024 + 1 }), /10 МБ/);
  const { accepted, rejected } = acceptPhotoFiles(
    [jpeg, { ...jpeg, name: "b.jpg" }, { name: "c.gif", type: "image/gif", size: 1 }],
    4,
  );
  assert.deepEqual(
    accepted.map((file) => file.name),
    ["a.jpg"],
  );
  assert.deepEqual(
    rejected.map((item) => item.file.name),
    ["b.jpg", "c.gif"],
  );
});

test("client request id is a v4 uuid even without crypto.randomUUID", () => {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  assert.match(newClientRequestId(), pattern);
  assert.match(newClientRequestId({ getRandomValues: (bytes) => bytes.fill(255) }), pattern);
  assert.equal(newClientRequestId({ randomUUID: () => "fixed" }), "fixed");
});

test("resolve offers each error only its leaf solutions and keeps an empty list optional", () => {
  const errors = [
    { id: 11, solution_ids: [5, 6], solution_id: 6 },
    { id: 12, solution_ids: [], solution_id: 7 },
    { id: 13, solution_ids: [5], solution_id: 7 },
  ];
  assert.deepEqual(
    errorSolutionOptions(errors[0], solutions).map((solution) => solution.id),
    [5, 6],
  );
  assert.deepEqual(errorSolutionOptions(errors[1], solutions), []);
  const drafts = resolutionDrafts(errors);
  assert.deepEqual(
    drafts.map((entry) => entry.solution_id),
    ["6", "", ""],
  );
  assert.equal(canResolveErrors(drafts, errors), false);
  const ready = drafts.map((entry) => (entry.id === 13 ? { ...entry, solution_id: "5" } : entry));
  assert.equal(canResolveErrors(ready, errors), true);
  assert.deepEqual(resolutionPayload(ready, errors), [
    { id: 11, solution_id: "6" },
    { id: 12 },
    { id: 13, solution_id: "5" },
  ]);
});
