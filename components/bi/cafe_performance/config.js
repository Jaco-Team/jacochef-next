"use client";

export const CAFE_PERFORMANCE_TABS = [
  { id: 0, key: "dashboard", label: "Дашборд", method: "get_dashboard" },
  { id: 1, key: "kitchen", label: "Кухня", method: "get_kitchen" },
  { id: 2, key: "leaders", label: "Лидеры", method: "get_leaders" },
  { id: 3, key: "quality", label: "Качество", method: "get_quality" },
  { id: 4, key: "delivery", label: "Доставка", method: "get_delivery" },
];

export const TAB_BY_KEY = CAFE_PERFORMANCE_TABS.reduce((acc, tab) => {
  acc[tab.key] = tab;
  return acc;
}, {});

export const ORDER_TYPE_COLORS = {
  DELIVERY: "#2E7D32",
  TAKEAWAY: "#1565C0",
  HALL: "#EF6C00",
};

export const CATEGORY_COLORS = ["#16324F", "#2E7D32", "#EF6C00", "#00838F", "#8E24AA", "#6D4C41"];
