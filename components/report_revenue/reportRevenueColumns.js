export const REPORT_REVENUE_COLUMNS_STORAGE_KEY = "report_revenue_visible_columns";

export const REPORT_REVENUE_COLUMN_OPTIONS = [
  { key: "month_count", label: "Кол-во по месяцам" },
  { key: "month_price", label: "Выручка по месяцам" },
  { key: "total_count", label: "Итого кол-во" },
  { key: "total_price", label: "Итого выручка" },
  { key: "segment_price", label: "Цена" },
  { key: "no_discount_count", label: "кол-во без скидок" },
  { key: "no_discount_price", label: "Выручка без скидки" },
  { key: "discount_count", label: "кол-во со скидками или бесплатно" },
  { key: "discount_price", label: "Выручка со скидками" },
  { key: "lost_price", label: "Недополученная выручка" },
];

export const DEFAULT_REPORT_REVENUE_VISIBLE_COLUMNS = REPORT_REVENUE_COLUMN_OPTIONS.reduce(
  (acc, item) => {
    acc[item.key] = true;
    return acc;
  },
  {},
);
