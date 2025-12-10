"use client";

import { useState } from "react";

export default function useSortTable(data, defaultColumn = "id") {
  const safeData = Array.isArray(data) ? [...data] : [];

  if (!safeData) {
    console.log(safeData, defaultColumn);
    throw new Error("Sorting table hook got wrong params");
  }

  const [orderBy, setOrderBy] = useState(defaultColumn);
  const [order, setOrder] = useState("desc");

  const handleSort = (field) => {
    const isAsc = orderBy === field && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(field);
  };

  const sortedRows = safeData.sort((a, b) => {
    const aVal = a[orderBy];
    const bVal = b[orderBy];

    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (typeof aVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal;
    }

    return order === "asc"
      ? String(aVal).localeCompare(String(bVal), "ru")
      : String(bVal).localeCompare(String(aVal), "ru");
  });

  return { order, orderBy, handleSort, sortedRows };
}
