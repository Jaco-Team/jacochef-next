const UNSORTED_ORDER = 999999;
const nameCollator = new Intl.Collator("ru", { sensitivity: "base" });

function sortOrder(row, draft) {
  const candidate = draft === undefined ? row?.sort : draft;
  const text = String(candidate ?? "").trim();
  const persisted = String(row?.sort ?? "").trim();
  const resolved = /^\d+$/.test(text) ? Number(text) : Number(persisted);
  const value = Number.isFinite(resolved) ? resolved : 0;
  return value === 0 ? UNSORTED_ORDER : value;
}

export function sortAllergens(rows, drafts = {}) {
  return [...rows].sort((left, right) => {
    const order = sortOrder(left, drafts[left.id]) - sortOrder(right, drafts[right.id]);
    if (order) return order;
    const name = nameCollator.compare(String(left.name ?? ""), String(right.name ?? ""));
    if (name) return name;
    return Number(left.id) - Number(right.id);
  });
}
