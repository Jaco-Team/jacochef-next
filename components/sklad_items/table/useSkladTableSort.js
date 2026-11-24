"use client";

import { useCallback, useMemo, useState } from "react";

function compareValues(left, right) {
  if (left === right) return 0;
  if (left === null || left === undefined || left === "") return 1;
  if (right === null || right === undefined || right === "") return -1;

  const leftNumber = Number(left);
  const rightNumber = Number(right);
  if (
    String(left).trim() !== "" &&
    String(right).trim() !== "" &&
    !Number.isNaN(leftNumber) &&
    !Number.isNaN(rightNumber)
  ) {
    return leftNumber - rightNumber;
  }

  const leftDate = Date.parse(left);
  const rightDate = Date.parse(right);
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate;
  }

  return String(left).localeCompare(String(right), "ru", {
    numeric: true,
    sensitivity: "base",
  });
}

export default function useSkladTableSort(rows, accessors, initialKey = "name") {
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
    const getValue = accessors?.[sortBy] || ((row) => row?.[sortBy]);
    const direction = sortDirection === "asc" ? 1 : -1;

    return [...(rows || [])].sort(
      (left, right) => direction * compareValues(getValue(left), getValue(right)),
    );
  }, [accessors, rows, sortBy, sortDirection]);

  return { sortedRows, sortBy, sortDirection, requestSort };
}
