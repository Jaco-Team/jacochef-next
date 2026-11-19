import { useCallback, useMemo, useState } from "react";

function isEmptyValue(value) {
  return value === null || value === undefined || value === "";
}

function compareValues(left, right) {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), "ru", { numeric: true, sensitivity: "base" });
}

// Client-side column sort; `accessors[key]` maps a row to a number or string. Rows keep their order until a column is picked.
export default function useTableSort(rows, accessors, initialKey = null) {
  const [sortBy, setSortBy] = useState(initialKey);
  const [sortDirection, setSortDirection] = useState("asc");

  const requestSort = useCallback(
    (key) => {
      if (key === sortBy) {
        setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
        return;
      }

      setSortBy(key);
      setSortDirection("asc");
    },
    [sortBy],
  );

  const sortedRows = useMemo(() => {
    const getValue = sortBy ? accessors?.[sortBy] : null;
    if (!getValue) {
      return rows || [];
    }

    const direction = sortDirection === "asc" ? 1 : -1;

    return [...(rows || [])].sort((left, right) => {
      const leftValue = getValue(left);
      const rightValue = getValue(right);

      if (isEmptyValue(leftValue) || isEmptyValue(rightValue)) {
        return Number(isEmptyValue(leftValue)) - Number(isEmptyValue(rightValue));
      }

      return direction * compareValues(leftValue, rightValue);
    });
  }, [accessors, rows, sortBy, sortDirection]);

  return { sortedRows, sortBy, sortDirection, requestSort };
}
