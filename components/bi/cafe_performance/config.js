"use client";

export const ORDER_TYPE_COLORS = {
  DELIVERY: "#2E7D32",
  PICKUP: "#1565C0",
  TAKEAWAY: "#1565C0",
  HALL: "#EF6C00",
  HALL_TAKEAWAY: "#8E24AA",
};

export const ORDER_TYPE_FALLBACK_COLORS = [
  "#2E7D32",
  "#1565C0",
  "#EF6C00",
  "#8E24AA",
  "#00838F",
  "#6D4C41",
];

export const CATEGORY_COLORS = ["#16324F", "#2E7D32", "#EF6C00", "#00838F", "#8E24AA", "#6D4C41"];

export const buildOrderTypeNameMap = (orderTypes = []) =>
  orderTypes.reduce((acc, item) => {
    const key = item?.id == null ? "" : String(item.id);
    if (!key) return acc;

    acc[key] = item?.name || item?.label || key;
    return acc;
  }, {});

export const getOrderTypeLabel = (orderType, orderTypeNameMap = {}) => {
  const key = orderType == null ? "" : String(orderType);
  if (!key) return "—";

  return orderTypeNameMap[key] || key;
};

export const getOrderTypeColor = (orderType, index = 0) => {
  const key = orderType == null ? "" : String(orderType);
  return (
    ORDER_TYPE_COLORS[key] || ORDER_TYPE_FALLBACK_COLORS[index % ORDER_TYPE_FALLBACK_COLORS.length]
  );
};

export const sortByOrderTypes = (items = [], orderTypes = []) => {
  const orderIndex = orderTypes.reduce((acc, item, index) => {
    const key = item?.id == null ? "" : String(item.id);
    if (key) acc[key] = index;
    return acc;
  }, {});

  return [...items].sort((a, b) => {
    const left = orderIndex[String(a?.order_type ?? "")];
    const right = orderIndex[String(b?.order_type ?? "")];

    if (left == null && right == null) return 0;
    if (left == null) return 1;
    if (right == null) return -1;
    return left - right;
  });
};

export const STAGE_TYPE_LABELS = {
  ROLL: "Крутка",
  PACK: "Упаковка",
  OVEN: "Печь",
};

export const getStageTypeLabel = (stageType) => {
  const key = stageType == null ? "" : String(stageType);
  if (!key) return "—";

  return STAGE_TYPE_LABELS[key] || key;
};
