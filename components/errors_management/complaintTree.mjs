export const PRODUCT_KIND_STAGE_KEYS = {
  rolls: "stage_1",
  pizza: "stage_2",
  drinks_extras: "stage_3",
};
export const STAGE_KEYS = ["stage_1", "stage_2", "stage_3"];

export const PHOTO_LIMIT = 5;
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function idList(value) {
  const values = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(",")
        .map((item) => item.trim());
  return [
    ...new Set(
      values.map((item) => Number(item)).filter((id) => Number.isInteger(id) && id > 0),
    ),
  ];
}

function flag(value) {
  return value === true || value === 1 || value === "1";
}

export function normalizeTreeNode(node) {
  const parentId = Number(node?.parent_id);
  return {
    id: Number(node?.id),
    parent_id: Number.isInteger(parentId) && parentId > 0 ? parentId : null,
    name: String(node?.name ?? ""),
    is_active: flag(node?.is_active),
    need_img: flag(node?.need_img),
    site_cats: idList(node?.site_cats),
    stage_1: idList(node?.stage_1),
    stage_2: idList(node?.stage_2),
    stage_3: idList(node?.stage_3),
    solution_ids: idList(node?.solution_ids ?? node?.solutions),
    sort: Number(node?.sort) || 0,
  };
}

function compareNodes(left, right) {
  return (
    left.sort - right.sort ||
    left.name.localeCompare(right.name, "ru") ||
    left.id - right.id
  );
}

export function buildLeaves(tree) {
  const nodes = (Array.isArray(tree) ? tree : [])
    .map(normalizeTreeNode)
    .filter((node) => Number.isInteger(node.id) && node.id > 0);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const parentsWithActiveChildren = new Set(
    nodes.filter((node) => node.is_active && node.parent_id).map((node) => node.parent_id),
  );
  const leaves = [];
  nodes
    .filter((node) => node.is_active && !parentsWithActiveChildren.has(node.id))
    .forEach((leaf) => {
      const path = [];
      const visited = new Set();
      let current = leaf;
      while (current && !visited.has(current.id)) {
        visited.add(current.id);
        path.unshift(current);
        current = current.parent_id ? byId.get(current.parent_id) : null;
        if (current === undefined) return;
      }
      if (current || path.some((node) => !node.is_active)) return;
      leaves.push({
        id: leaf.id,
        name: path.map((node) => node.name).join(" / "),
        path: path.map(({ id, name, sort }) => ({ id, name, sort })),
        pathIds: path.map((node) => node.id),
        siteCats: [...new Set(path.flatMap((node) => node.site_cats))],
        needImg: leaf.need_img,
        stage_1: leaf.stage_1,
        stage_2: leaf.stage_2,
        stage_3: leaf.stage_3,
        solutionIds: leaf.solution_ids,
      });
    });
  return leaves;
}

export function positionSiteCategory(position) {
  const id = Number(position?.site_category_id ?? position?.category_id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function leavesForPosition(leaves, position) {
  if (!position || position.type === "delivery") {
    return leaves.filter((leaf) => leaf.siteCats.length === 0);
  }
  const siteCategoryId = positionSiteCategory(position);
  return siteCategoryId ? leaves.filter((leaf) => leaf.siteCats.includes(siteCategoryId)) : leaves;
}

function samePrefix(leaf, pathIds, length) {
  return pathIds.slice(0, length).every((id, index) => leaf.pathIds[index] === Number(id));
}

export function cascadeLevels(leaves, pathIds = []) {
  const levels = [];
  for (let level = 0; ; level += 1) {
    if (level > 0 && !pathIds[level - 1]) break;
    const options = new Map();
    leaves.forEach((leaf) => {
      const node = leaf.path[level];
      if (node && samePrefix(leaf, pathIds, level) && !options.has(node.id)) {
        options.set(node.id, node);
      }
    });
    if (!options.size) break;
    levels.push([...options.values()].sort(compareNodes));
    if (!pathIds[level]) break;
  }
  return levels;
}

export function cascadeLevelLabel(level, isLast) {
  if (level === 0) return "Категория проблемы";
  return isLast ? "Проблема" : "Подраздел";
}

export function autoRootPath(leaves) {
  const roots = new Set(leaves.map((leaf) => leaf.pathIds[0]));
  return roots.size === 1 ? [...roots] : [];
}

export function findLeaf(leaves, pathIds = []) {
  const ids = pathIds.map(Number);
  return (
    leaves.find(
      (leaf) =>
        leaf.pathIds.length === ids.length && leaf.pathIds.every((id, index) => id === ids[index]),
    ) || null
  );
}

export function stageIdsForLeaf(leaf, productKind) {
  if (!leaf) return [];
  const union = [...new Set(STAGE_KEYS.flatMap((key) => leaf[key] || []))];
  const key = PRODUCT_KIND_STAGE_KEYS[productKind];
  if (!key) return union;
  return (leaf[key] || []).length ? leaf[key] : union;
}

export function stageOptionsForLeaf(leaf, productKind, stages = []) {
  const ids = stageIdsForLeaf(leaf, productKind);
  return ids
    .map((id) => stages.find((stage) => Number(stage.id) === id))
    .filter(Boolean);
}

export function solutionOptionsForLeaf(leaf, solutions = []) {
  if (!leaf?.solutionIds?.length) return [];
  return solutions.filter((solution) => leaf.solutionIds.includes(Number(solution.id)));
}

let draftCounter = 0;

export function treeErrorDraft(leaves, objectType, position = null) {
  draftCounter += 1;
  return {
    uid: `error-${Date.now()}-${draftCounter}`,
    object_type: objectType,
    position_key: position?.position_key ?? null,
    path_ids: autoRootPath(leavesForPosition(leaves, position)),
    stage_id: "",
    solution_id: "",
    ingredient_id: "",
    error_amount: "",
    comment: "",
    quantity: 1,
    photos: [],
  };
}

export function changeTreePath(draft, level, nodeId) {
  const pathIds = (draft.path_ids || []).slice(0, level);
  if (nodeId) pathIds[level] = Number(nodeId);
  return { ...draft, path_ids: pathIds, stage_id: "", solution_id: "" };
}

export function positionQuantityLimit(position) {
  const count = Number(position?.total_count);
  return Number.isInteger(count) && count > 1 ? count : 1;
}

export function validQuantity(error, position) {
  const raw = error?.quantity;
  const quantity = raw === undefined || raw === null ? 1 : Number(raw);
  return (
    String(raw ?? "1").trim() !== "" &&
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= positionQuantityLimit(position)
  );
}

export function uploadedPhotoIds(draft) {
  return (draft?.photos || [])
    .filter((photo) => photo.status === "done" && Number(photo.id) > 0)
    .map((photo) => Number(photo.id));
}

export function keptPhotos(draft) {
  return (draft?.photos || []).filter((photo) => photo.status !== "error");
}

export function photosPending(draft) {
  return (draft?.photos || []).some((photo) => photo.status === "uploading");
}

export function treeErrorIssues(draft, context) {
  const leaves = context?.leaves || [];
  const position = (context?.positions || []).find(
    (item) => item.position_key === draft.position_key,
  );
  const allowed = leavesForPosition(leaves, draft.position_key ? position : null);
  const leaf = findLeaf(allowed, draft.path_ids);
  const issues = [];
  if (!leaf) return ["leaf"];
  const stageIds = stageIdsForLeaf(leaf, position?.product_kind ?? null);
  if (stageIds.length && !stageIds.includes(Number(draft.stage_id))) issues.push("stage");
  if (draft.solution_id && !leaf.solutionIds.includes(Number(draft.solution_id))) {
    issues.push("solution");
  }
  if (!validQuantity(draft, position)) issues.push("quantity");
  if (photosPending(draft)) issues.push("photos_pending");
  if (keptPhotos(draft).length > PHOTO_LIMIT) issues.push("photos_limit");
  if (leaf.needImg && uploadedPhotoIds(draft).length === 0) issues.push("photos_required");
  return issues;
}

export function treeErrorPayload(draft, leaves, positions = []) {
  const position = positions.find((item) => item.position_key === draft.position_key);
  const leaf = findLeaf(leavesForPosition(leaves, draft.position_key ? position : null), draft.path_ids);
  return {
    object_type: draft.object_type,
    position_key: draft.position_key,
    error_id: leaf?.id ?? null,
    stage_id: draft.stage_id ? Number(draft.stage_id) : null,
    solution_id: draft.solution_id ? Number(draft.solution_id) : null,
    ingredient_id: draft.ingredient_id ? Number(draft.ingredient_id) : null,
    photo_ids: uploadedPhotoIds(draft),
    quantity: Number(draft.quantity) || 1,
    error_amount: draft.error_amount === "" ? null : draft.error_amount,
    comment: draft.comment || null,
  };
}

export function photoFileError(file) {
  if (!file) return "Файл не выбран.";
  if (!PHOTO_TYPES.includes(file.type)) return "Допустимы только JPEG, PNG и WebP.";
  if (Number(file.size) > PHOTO_MAX_BYTES) return "Файл больше 10 МБ.";
  return null;
}

export function acceptPhotoFiles(files, currentCount) {
  const accepted = [];
  const rejected = [];
  Array.from(files || []).forEach((file) => {
    const error = photoFileError(file);
    if (error) {
      rejected.push({ file, error });
    } else if (currentCount + accepted.length >= PHOTO_LIMIT) {
      rejected.push({ file, error: `Не больше ${PHOTO_LIMIT} фотографий на ошибку.` });
    } else {
      accepted.push(file);
    }
  });
  return { accepted, rejected };
}

function hex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function newClientRequestId(cryptoApi = globalThis.crypto) {
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === "function") {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = hex(bytes);
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export function errorSolutionIds(error) {
  return idList(error?.solution_ids);
}

export function errorSolutionOptions(error, solutions = []) {
  const ids = errorSolutionIds(error);
  return solutions.filter((solution) => ids.includes(Number(solution.id)));
}

export function resolutionDrafts(errors = []) {
  return errors.map((error) => {
    const registered = Number(error?.solution_id);
    return {
      id: error.id,
      solution_id: errorSolutionIds(error).includes(registered) ? String(registered) : "",
      changed_amount: error?.changed_amount ?? "",
    };
  });
}

export function canResolveErrors(resolutions = [], errors = []) {
  return errors.every((error) => {
    if (!errorSolutionIds(error).length) return true;
    const entry = resolutions.find((item) => Number(item.id) === Number(error.id));
    return Boolean(entry?.solution_id);
  });
}

export function resolutionPayload(resolutions = [], errors = []) {
  return errors.map((error) => {
    const entry = resolutions.find((item) => Number(item.id) === Number(error.id)) || {};
    return {
      id: error.id,
      changed_amount: entry.changed_amount ?? "",
      ...(errorSolutionIds(error).length ? { solution_id: entry.solution_id || null } : {}),
    };
  });
}
