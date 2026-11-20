import { STAGE_KEYS, idList, normalizeTreeNode } from "./complaintTree.mjs";

export const STAGE_FIELDS = [
  { key: "stage_1", label: "Этапы ошибки роллы" },
  { key: "stage_2", label: "Этапы ошибки пицца" },
  { key: "stage_3", label: "Этапы ошибки напитки / допы" },
];

function compareNodes(left, right) {
  return (
    left.sort - right.sort || left.name.localeCompare(right.name, "ru") || left.id - right.id
  );
}

export function buildCategoryTree(errCats) {
  const nodes = (Array.isArray(errCats) ? errCats : [])
    .map(normalizeTreeNode)
    .filter((node) => Number.isInteger(node.id) && node.id > 0);
  const byId = new Map(nodes.map((node) => [node.id, { ...node, children: [] }]));
  const roots = [];
  byId.forEach((node) => {
    const parent = node.parent_id ? byId.get(node.parent_id) : null;
    if (parent && parent.id !== node.id) parent.children.push(node);
    else roots.push(node);
  });
  const sortDeep = (list) => {
    list.sort(compareNodes);
    list.forEach((node) => sortDeep(node.children));
    return list;
  };
  return sortDeep(roots);
}

export function flattenCategoryTree(roots, depth = 0, prefix = []) {
  return roots.flatMap((node) => {
    const path = [...prefix, node.name];
    return [
      { id: node.id, name: path.join(" / "), depth, node },
      ...flattenCategoryTree(node.children, depth + 1, path),
    ];
  });
}

export function categoryHasChildren(errCats, id) {
  return (Array.isArray(errCats) ? errCats : []).some(
    (node) => Number(node?.parent_id) === Number(id) && Number(id) > 0,
  );
}

export function categoryDraft(node, parent = null) {
  const source = node ? normalizeTreeNode(node) : null;
  const parentNode = parent ? normalizeTreeNode(parent) : null;
  return {
    id: source?.id || 0,
    parent_id: source ? source.parent_id : (parentNode?.id ?? null),
    name: source?.name ?? "",
    sort: String(source?.sort ?? 0),
    is_active: source ? source.is_active : true,
    need_img: source ? source.need_img : false,
    site_cats: source ? source.site_cats : (parentNode?.site_cats ?? []),
    solution_ids: source?.solution_ids ?? [],
    stage_1: source?.stage_1 ?? [],
    stage_2: source?.stage_2 ?? [],
    stage_3: source?.stage_3 ?? [],
  };
}

function csv(ids) {
  const list = idList(ids);
  return list.length ? list.join(",") : null;
}

export function categoryPayload(draft, stored = null) {
  const isRoot = !draft.parent_id;
  // The root editor does not show these fields: send back what err_desc_cats already stores.
  const kept = isRoot ? categoryDraft(stored) : draft;
  return {
    ...(draft.id ? { id: Number(draft.id) } : {}),
    name: String(draft.name || "").trim(),
    parent_id: draft.parent_id ? Number(draft.parent_id) : null,
    sort: Math.max(0, Number.parseInt(draft.sort, 10) || 0),
    is_active: draft.is_active ? 1 : 0,
    need_img: kept.need_img ? 1 : 0,
    site_cats: csv(draft.site_cats),
    solutions: csv(kept.solution_ids),
    ...Object.fromEntries(STAGE_KEYS.map((key) => [key, csv(kept[key])])),
  };
}

export function canSaveCategory(draft) {
  return String(draft?.name || "").trim() !== "";
}

export function categorySummary(node, stagesById = new Map(), solutionsById = new Map()) {
  const stageNames = [
    ...new Set(STAGE_KEYS.flatMap((key) => node[key] || [])),
  ]
    .map((id) => stagesById.get(id))
    .filter(Boolean);
  const solutionNames = (node.solution_ids || [])
    .map((id) => solutionsById.get(id))
    .filter(Boolean);
  return { stageNames, solutionNames };
}
