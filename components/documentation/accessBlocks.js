export const ACCESS_BLOCK_ATTR = "data-doc-access";

export const MATCH_OPTIONS = [
  { id: "any", name: "Хотя бы одно условие" },
  { id: "all", name: "Все условия" },
];

export const ACCESS_ERROR_TEXT = {
  empty: "Выделите фрагмент статьи.",
  overlap: "Блоки не могут пересекаться.",
  outside: "Поставьте курсор в розовый блок или выделите его часть.",
};

function fragmentToHtml(fragment) {
  if (typeof document === "undefined" || !fragment) {
    return "";
  }

  const host = document.createElement("div");
  host.appendChild(fragment);
  return host.innerHTML;
}

function normalizeCompareText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function createAccessBlockId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `block-${crypto.randomUUID()}`;
  }

  return `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeEntityId(id) {
  if (typeof id === "number") {
    return id;
  }

  const text = String(id ?? "");
  if (/^\d+$/.test(text)) {
    const numeric = Number(text);
    if (Number.isSafeInteger(numeric)) {
      return numeric;
    }
  }

  return id;
}

function readAccessNodes(html) {
  if (!html || typeof DOMParser === "undefined") {
    return [];
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  return [...doc.querySelectorAll(`.doc-access-block[${ACCESS_BLOCK_ATTR}]`)];
}

export function readAccessBlockIds(html) {
  const ids = [];

  readAccessNodes(html).forEach((node) => {
    const id = node.getAttribute(ACCESS_BLOCK_ATTR);
    if (id && !ids.includes(id)) {
      ids.push(id);
    }
  });

  return ids;
}

export function readAccessBlockExcerpt(html, id) {
  const node = readAccessNodes(html).find((item) => item.getAttribute(ACCESS_BLOCK_ATTR) === id);
  const text = String(node?.textContent || "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= 140) {
    return text;
  }

  return `${text.slice(0, 140)}…`;
}

export function normalizeAccessOption(item) {
  if (item == null || item === "") {
    return null;
  }

  if (typeof item === "string" || typeof item === "number") {
    return { id: item, name: String(item) };
  }

  const id = item.id ?? item.code;
  if (id == null || id === "") {
    return null;
  }

  const name = String(item.name || item.label || id).trim();
  if (!name) {
    return null;
  }

  return { id, name };
}

export function normalizeAccessOptions(objects, ids) {
  const source = Array.isArray(objects) && objects.length ? objects : ids;
  const unique = new Map();

  (Array.isArray(source) ? source : []).forEach((item) => {
    const option = normalizeAccessOption(item);
    if (option) {
      unique.set(String(option.id), option);
    }
  });

  return [...unique.values()];
}

export function normalizeAccessBlocks(blocks) {
  return (Array.isArray(blocks) ? blocks : [])
    .filter((block) => block?.id != null && block.id !== "")
    .map((block, index) => ({
      id: String(block.id),
      name: String(block.name || `Блок ${index + 1}`).trim() || `Блок ${index + 1}`,
      users: normalizeAccessOptions(block.users, block.user_ids),
      positions: normalizeAccessOptions(block.positions, block.position_ids),
      rights: normalizeAccessOptions(block.rights, block.right_codes),
      match: block.match === "all" ? "all" : "any",
    }));
}

export function replaceAccessBlockId(html, fromId, toId) {
  const from = String(fromId ?? "");
  const to = String(toId ?? "");
  if (!html || !from || !to || from === to) {
    return html || "";
  }

  return String(html)
    .split(`${ACCESS_BLOCK_ATTR}="${from}"`)
    .join(`${ACCESS_BLOCK_ATTR}="${to}"`)
    .split(`${ACCESS_BLOCK_ATTR}='${from}'`)
    .join(`${ACCESS_BLOCK_ATTR}='${to}'`);
}

export function syncArticleAccess(html, accessBlocks) {
  const source = html || "";
  const blocks = normalizeAccessBlocks(accessBlocks);
  if (!blocks.length) {
    return { html: source, blocks };
  }

  const htmlIds = readAccessBlockIds(source);
  let nextHtml = source;
  const limit = Math.min(htmlIds.length, blocks.length);

  for (let index = 0; index < limit; index += 1) {
    nextHtml = replaceAccessBlockId(nextHtml, htmlIds[index], blocks[index].id);
  }

  return { html: nextHtml, blocks };
}

export function reconcileAccessBlocks(current, html) {
  const ids = readAccessBlockIds(html);
  const currentBlocks = Array.isArray(current) ? current : [];
  const currentIds = currentBlocks.map((block) => String(block.id));

  if (ids.length === currentIds.length && ids.every((id, index) => id === currentIds[index])) {
    return currentBlocks;
  }

  const byId = new Map(currentBlocks.map((block) => [String(block.id), block]));

  return ids.map((id, index) => {
    const existing = byId.get(id);
    if (existing) {
      return existing;
    }

    return {
      id,
      name: `Блок ${index + 1}`,
      users: [],
      positions: [],
      rights: [],
      match: "any",
    };
  });
}

export function serializeAccessBlocks(blocks) {
  return (Array.isArray(blocks) ? blocks : []).map((block) => ({
    id: block.id,
    name: String(block.name || "").trim() || "Блок",
    user_ids: (block.users || []).map((item) => item.id),
    position_ids: (block.positions || []).map((item) => item.id),
    right_codes: (block.rights || []).map((item) => String(item.id)),
    match: block.match === "all" ? "all" : "any",
  }));
}

export function accessBlockHasRules(block) {
  return Boolean(block?.users?.length || block?.positions?.length || block?.rights?.length);
}

export function findAccessNode(editor, id) {
  if (!editor) {
    return null;
  }

  return (
    editor.dom
      .select(`.doc-access-block[${ACCESS_BLOCK_ATTR}]`)
      .find((node) => node.getAttribute(ACCESS_BLOCK_ATTR) === String(id)) || null
  );
}

export function getAccessBlockAtSelection(editor) {
  if (!editor?.selection) {
    return null;
  }

  const selector = `.doc-access-block[${ACCESS_BLOCK_ATTR}]`;
  const start = editor.dom.getParent(editor.selection.getStart(), selector);
  const end = editor.dom.getParent(editor.selection.getEnd(), selector);

  if (start && (!end || start === end)) {
    return start;
  }

  return start || end || null;
}

export function wrapSelectionAsAccessBlock(editor) {
  const selection = editor?.selection;
  if (!selection || selection.isCollapsed()) {
    return { ok: false, reason: "empty" };
  }

  const start = selection.getStart();
  const end = selection.getEnd();
  const insideBlock =
    editor.dom.getParent(start, `.doc-access-block[${ACCESS_BLOCK_ATTR}]`) ||
    editor.dom.getParent(end, `.doc-access-block[${ACCESS_BLOCK_ATTR}]`);
  const html = selection.getContent();

  if (insideBlock || html.includes(ACCESS_BLOCK_ATTR)) {
    return { ok: false, reason: "overlap" };
  }

  const text = normalizeCompareText(selection.getContent({ format: "text" }));

  if (!text && !html.includes("<img")) {
    return { ok: false, reason: "empty" };
  }

  const id = createAccessBlockId();
  selection.setContent(`<div class="doc-access-block" ${ACCESS_BLOCK_ATTR}="${id}">${html}</div>`);

  return { ok: true, id, mode: "wrap" };
}

export function removeAccessBlockFromEditor(editor, id) {
  if (!editor) {
    return "";
  }

  const node = findAccessNode(editor, id);
  if (node) {
    editor.undoManager.transact(() => {
      editor.dom.remove(node, true);
    });
    editor.nodeChanged();
    editor.fire("change");
  }

  return editor.getContent();
}

function unwrapWholeAccessBlock(editor, node) {
  const id = node.getAttribute(ACCESS_BLOCK_ATTR);
  editor.undoManager.transact(() => {
    editor.dom.remove(node, true);
  });
  editor.nodeChanged();
  editor.fire("change");
  return { ok: true, id, mode: "all", html: editor.getContent() };
}

export function unwrapAccessAtSelection(editor) {
  const selection = editor?.selection;
  if (!selection) {
    return { ok: false, reason: "outside" };
  }

  const node = getAccessBlockAtSelection(editor);
  if (!node) {
    return { ok: false, reason: "outside" };
  }

  const id = node.getAttribute(ACCESS_BLOCK_ATTR);
  const rng = selection.getRng();
  const selectionInside = node.contains(rng.startContainer) && node.contains(rng.endContainer);

  if (selection.isCollapsed() || !selectionInside) {
    return unwrapWholeAccessBlock(editor, node);
  }

  const blockText = normalizeCompareText(node.textContent);
  const selectedText = normalizeCompareText(selection.getContent({ format: "text" }));
  const selectedHtml = selection.getContent();

  if (!selectedText || selectedText === blockText) {
    return unwrapWholeAccessBlock(editor, node);
  }

  const beforeRange = node.ownerDocument.createRange();
  beforeRange.setStart(node, 0);
  beforeRange.setEnd(rng.startContainer, rng.startOffset);

  const afterRange = node.ownerDocument.createRange();
  afterRange.setStart(rng.endContainer, rng.endOffset);
  afterRange.setEnd(node, node.childNodes.length);

  const beforeHtml = fragmentToHtml(beforeRange.cloneContents());
  const afterHtml = fragmentToHtml(afterRange.cloneContents());
  const afterId = createAccessBlockId();

  let replacement = "";
  if (normalizeCompareText(beforeHtml) || beforeHtml.includes("<img")) {
    replacement += `<div class="doc-access-block" ${ACCESS_BLOCK_ATTR}="${id}">${beforeHtml}</div>`;
  }
  replacement += selectedHtml;
  if (normalizeCompareText(afterHtml) || afterHtml.includes("<img")) {
    replacement += `<div class="doc-access-block" ${ACCESS_BLOCK_ATTR}="${afterId}">${afterHtml}</div>`;
  }

  editor.undoManager.transact(() => {
    editor.dom.setOuterHTML(node, replacement || selectedHtml);
  });
  editor.nodeChanged();
  editor.fire("change");

  return {
    ok: true,
    id,
    mode: "partial",
    splitId: afterHtml ? afterId : null,
    html: editor.getContent(),
  };
}

export function toggleAccessAtSelection(editor) {
  if (getAccessBlockAtSelection(editor)) {
    return unwrapAccessAtSelection(editor);
  }

  return wrapSelectionAsAccessBlock(editor);
}

export function focusAccessBlockInEditor(editor, id) {
  const node = findAccessNode(editor, id);
  if (!editor || !node) {
    return;
  }

  editor.selection.select(node, true);
  node.scrollIntoView({ block: "center", inline: "nearest" });
}
