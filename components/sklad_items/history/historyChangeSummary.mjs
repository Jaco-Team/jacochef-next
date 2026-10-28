export function collectVisibleChanges(currentRows, previousRows) {
  const previous = new Map(previousRows.map((row) => [row.field, row]));
  return currentRows.flatMap((row) => {
    const old = previous.get(row.field);
    if (!old || old.value === row.value) return [];
    return [{ field: row.field, label: row.label, from: old.value, to: row.value }];
  });
}
