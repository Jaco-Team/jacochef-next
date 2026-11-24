const NAMED_ENTITIES = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  laquo: "«",
  raquo: "»",
  ndash: "–",
  mdash: "—",
  hellip: "…",
};
const LINE_BREAK_TAG_PATTERN =
  /<\s*(?:br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/blockquote|\/pre|\/ul|\/ol|\/table)\b[^>]*>/gi;
const LIST_ITEM_TAG_PATTERN = /<\s*li\b[^>]*>/gi;
const LINE_BREAK_BETWEEN_TAGS_PATTERN = />[ \t\n\f]*\n[ \t\n\f]*</g;

function decodeEntity(entity, code) {
  if (code[0] !== "#") {
    return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
  }

  const isHex = code[1] === "x" || code[1] === "X";
  const value = parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);

  return Number.isInteger(value) && value > 0 && value <= 0x10ffff
    ? String.fromCodePoint(value)
    : entity;
}

// Readable text of editor HTML: one line per block, list items as «• …».
export function htmlToText(html) {
  const source = html == null ? "" : String(html);

  if (!source) {
    return "";
  }

  return source
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/\s+/g, " ")
    .replace(LIST_ITEM_TAG_PATTERN, "\n• ")
    .replace(LINE_BREAK_TAG_PATTERN, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, decodeEntity)
    .split("\n")
    .map((line) => line.replace(/[\s ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function toHtml(value) {
  return value == null ? "" : String(value);
}

// Exact comparison up to line breaks between tags (the editor puts one after every block) and outer whitespace.
export function isSameRichText(left, right) {
  const normalize = (value) =>
    toHtml(value).replace(/\r\n?/g, "\n").replace(LINE_BREAK_BETWEEN_TAGS_PATTERN, "><").trim();

  return normalize(left) === normalize(right);
}

function isBaselineOf(baseline, key, stored) {
  return Boolean(baseline) && baseline.key === key && baseline.stored === toHtml(stored);
}

// The editor re-serializes stored HTML when it loads it and emits the result without user input.
// The first emission for a stored value settles its baseline: that value when it came from the load,
// the stored value itself when the user edited first (stored HTML already canonical, nothing emitted on load).
export function settleRichTextBaseline(baseline, { key, stored, value, userEdit }) {
  if (isBaselineOf(baseline, key, stored)) {
    return baseline;
  }

  return { key, stored: toHtml(stored), value: toHtml(userEdit ? stored : value) };
}

export function getRichTextBaseline(baseline, key, stored) {
  return isBaselineOf(baseline, key, stored) ? baseline.value : toHtml(stored);
}

// An edited value is unchanged when it matches the stored HTML or the editor's load re-serialization of it.
export function isRichTextChanged(value, stored, baseline = stored) {
  return !isSameRichText(value, stored) && !isSameRichText(value, baseline);
}
