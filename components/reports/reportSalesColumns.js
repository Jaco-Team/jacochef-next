export const REPORT_SALES_COLUMNS_STORAGE_KEY = "reports_sales_visible_columns";

export const REPORT_SALES_COLUMN_OPTIONS = [
  { key: "num", label: "№ п/п", alwaysVisible: true },
  { key: "name", label: "Наименование товара", alwaysVisible: true },
  {
    key: "count",
    label: "Количество проданных товаров за выбранный период",
  },
  {
    key: "unit_cost",
    label: "Себестоимость одного проданного товара",
  },
  {
    key: "cost",
    label: "Общая себестоимость проданных товаров за выбранный период",
  },
  {
    key: "avg_price",
    label: "Средняя розничная цена продажи одного товара",
  },
  {
    key: "price",
    label: "Выручка за выбранный период",
  },
  {
    key: "gross_profit",
    label: "Валовая прибыль за выбранный период",
  },
  {
    key: "markup_percent",
    label: "Торговая наценка (%)",
  },
  {
    key: "margin_percent",
    label: "Маржинальность (%)",
  },
];

export const DEFAULT_REPORT_SALES_VISIBLE_COLUMNS = REPORT_SALES_COLUMN_OPTIONS.reduce(
  (acc, item) => {
    acc[item.key] = true;
    return acc;
  },
  {},
);

export const REPORT_SALES_TOGGLEABLE_COLUMNS = REPORT_SALES_COLUMN_OPTIONS.filter(
  (item) => !item.alwaysVisible,
);
