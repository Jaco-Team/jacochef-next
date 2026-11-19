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

export function leafGroupTitle(leaf) {
  const names = (leaf?.path || []).map((node) => node.name);
  if (names.length <= 1) return names[0] || "";
  const middle = names.slice(1, -1).join(" / ");
  return middle ? `${names[0]} · ${middle}` : names[0];
}

function searchText(value) {
  return String(value ?? "")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е");
}

export function matchesQuery(text, query) {
  const needle = searchText(query).trim();
  if (!needle) return true;
  const haystack = searchText(text);
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

export function leafPickerOptions(leaves) {
  return leaves
    .map((leaf) => ({
      id: leaf.id,
      name: leaf.path[leaf.path.length - 1]?.name || leaf.name,
      group: leafGroupTitle(leaf),
      // Search only the problem name: matching the category or subsection would pull in its whole group.
      search: leaf.path[leaf.path.length - 1]?.name || leaf.name,
      needImg: leaf.needImg,
      sortKey: leaf.path.map((node) => [node.sort, node.name]),
    }))
    .sort((left, right) => {
      for (let index = 0; index < Math.max(left.sortKey.length, right.sortKey.length); index += 1) {
        const a = left.sortKey[index];
        const b = right.sortKey[index];
        if (!a || !b) return a ? 1 : -1;
        if (a[0] !== b[0]) return a[0] - b[0];
        const byName = a[1].localeCompare(b[1], "ru");
        if (byName) return byName;
      }
      return left.id - right.id;
    })
    .map(({ sortKey, ...option }) => option);
}

export function findLeafById(leaves, id) {
  const leafId = Number(id);
  return leafId > 0 ? leaves.find((leaf) => leaf.id === leafId) || null : null;
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

export function treeErrorDraft(objectType, position = null) {
  draftCounter += 1;
  return {
    uid: `error-${Date.now()}-${draftCounter}`,
    object_type: objectType,
    position_key: position?.position_key ?? null,
    leaf_id: "",
    stage_id: "",
    solution_id: "",
    comment: "",
    show_comment: false,
    quantity: 1,
    photos: [],
  };
}

export function pickLeaf(draft, leaf, productKind) {
  if (!leaf) return { ...draft, leaf_id: "", stage_id: "", solution_id: "" };
  const stageIds = stageIdsForLeaf(leaf, productKind);
  return {
    ...draft,
    leaf_id: String(leaf.id),
    stage_id: stageIds.length === 1 ? String(stageIds[0]) : "",
    solution_id: "",
  };
}

export function positionQuantityLimit(position) {
  const count = Number(position?.total_count);
  return Number.isInteger(count) && count > 1 ? count : 1;
}

export function stepQuantity(draft, position, step) {
  const current = Number(draft?.quantity) || 1;
  const next = Math.min(positionQuantityLimit(position), Math.max(1, current + step));
  return { ...draft, quantity: next };
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

export const ISSUE_LABELS = {
  leaf: "выберите проблему",
  stage: "выберите этап",
  solution: "выберите решение из списка",
  quantity: "укажите количество",
  photos_pending: "дождитесь загрузки фото",
  photos_limit: "оставьте не больше 5 фото",
  photos_required: "добавьте фото",
};

function draftPosition(draft, positions) {
  return draft.position_key
    ? positions.find((item) => item.position_key === draft.position_key) || null
    : null;
}

export function treeErrorIssues(draft, context) {
  const leaves = context?.leaves || [];
  const position = draftPosition(draft, context?.positions || []);
  const leaf = findLeafById(leavesForPosition(leaves, position), draft.leaf_id);
  const issues = [];
  if (!leaf) issues.push("leaf");
  if (leaf) {
    const stageIds = stageIdsForLeaf(leaf, position?.product_kind ?? null);
    if (stageIds.length && !stageIds.includes(Number(draft.stage_id))) issues.push("stage");
    if (draft.solution_id && !leaf.solutionIds.includes(Number(draft.solution_id))) {
      issues.push("solution");
    }
  }
  if (!validQuantity(draft, position)) issues.push("quantity");
  if (photosPending(draft)) issues.push("photos_pending");
  if (keptPhotos(draft).length > PHOTO_LIMIT) issues.push("photos_limit");
  if (leaf?.needImg && uploadedPhotoIds(draft).length === 0) issues.push("photos_required");
  return issues;
}

export function missingLabel(issues) {
  const labels = issues.map((issue) => ISSUE_LABELS[issue]).filter(Boolean);
  return labels.length ? `Осталось: ${labels.join(", ")}` : "";
}

export function treeErrorPayload(draft, leaves, positions = []) {
  const position = draftPosition(draft, positions);
  const leaf = findLeafById(leavesForPosition(leaves, position), draft.leaf_id);
  return {
    object_type: draft.object_type,
    position_key: draft.position_key,
    error_id: leaf?.id ?? null,
    stage_id: draft.stage_id ? Number(draft.stage_id) : null,
    solution_id: draft.solution_id ? Number(draft.solution_id) : null,
    photo_ids: uploadedPhotoIds(draft),
    quantity: Number(draft.quantity) || 1,
    comment: draft.comment?.trim() ? draft.comment : null,
  };
}

export function errorsCountLabel(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? "ошибка"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)
        ? "ошибки"
        : "ошибок";
  return `${count} ${word}`;
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
      ...(errorSolutionIds(error).length ? { solution_id: entry.solution_id || null } : {}),
    };
  });
}
