export const excelOperationsAvailable = (result) => Array.isArray(result?.excel?.operations);

const inScope = (row, scope) =>
  (!scope?.date || row.date === scope.date) &&
  (scope?.kassa == null || (row.kassa != null && Number(row.kassa) === Number(scope.kassa))) &&
  (scope?.smena == null || (row.smena != null && Number(row.smena) === Number(scope.smena)));

export function scopedExcelOperations(result, scope = {}) {
  const used = Array.isArray(result?.excel?.operations) ? result.excel.operations : [];
  const unknown = Array.isArray(result?.warnings?.unknown_operations)
    ? result.warnings.unknown_operations
    : [];
  return [
    ...used.filter((row) => inScope(row, scope)).map((row) => ({ ...row, included: true })),
    ...unknown.filter((row) => inScope(row, scope)).map((row) => ({ ...row, included: false })),
  ].sort((a, b) => Number(a.row_number) - Number(b.row_number));
}

const searchable = (value) =>
  String(value ?? "")
    .toLocaleLowerCase("ru-RU")
    .replace(/\s/g, "")
    .replace(/,/g, ".");

export function filterExcelOperations(rows, search, onlyUnknown = false) {
  const query = searchable(search);
  return rows.filter((row) => {
    if (onlyUnknown && row.included) return false;
    if (!query) return true;
    return [
      row.amount,
      Number(row.amount).toFixed(2),
      row.rrn,
      row.terminal,
      row.date_time,
      row.date,
      row.operation_type,
      row.row_number,
    ].some((value) => searchable(value).includes(query));
  });
}

export function excelOperationTotals(rows) {
  const total = (included) =>
    Math.round(
      rows
        .filter((row) => row.included === included)
        .reduce((sum, row) => sum + (Number(row.amount) || 0), 0) * 100,
    ) / 100;
  return { included: total(true), unknown: total(false) };
}
