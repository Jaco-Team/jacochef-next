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

export const SLA_COLOR_STOPS = [
  { value: 0, color: "#CC0033" },
  { value: 40, color: "#CC0033" },
  { value: 55, color: "#D8433E" },
  { value: 70, color: "#E85D04" },
  { value: 82, color: "#EF6C00" },
  { value: 92, color: "#8BC34A" },
  { value: 98, color: "#2E7D32" },
  { value: 100, color: "#2E7D32" },
];

const normalizeHex = (color) => color.replace("#", "");

const hexToRgb = (color) => {
  const normalized = normalizeHex(color);
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};

const componentToHex = (component) => component.toString(16).padStart(2, "0");

const rgbToHex = ({ r, g, b }) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

const interpolateColor = (fromColor, toColor, ratio) => {
  const from = hexToRgb(fromColor);
  const to = hexToRgb(toColor);

  return rgbToHex({
    r: Math.round(from.r + (to.r - from.r) * ratio),
    g: Math.round(from.g + (to.g - from.g) * ratio),
    b: Math.round(from.b + (to.b - from.b) * ratio),
  });
};

export const getSlaColor = (value, stops = SLA_COLOR_STOPS) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return stops[0].color;

  const sortedStops = [...stops].sort((a, b) => a.value - b.value);
  const firstStop = sortedStops[0];
  const lastStop = sortedStops[sortedStops.length - 1];

  if (numericValue <= firstStop.value) return firstStop.color;
  if (numericValue >= lastStop.value) return lastStop.color;

  const nextStopIndex = sortedStops.findIndex((stop) => numericValue <= stop.value);
  const previousStop = sortedStops[nextStopIndex - 1];
  const nextStop = sortedStops[nextStopIndex];
  const range = nextStop.value - previousStop.value;
  const ratio = range === 0 ? 1 : (numericValue - previousStop.value) / range;

  return interpolateColor(previousStop.color, nextStop.color, ratio);
};

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
