export const REPORT_DISHES_COLUMNS_STORAGE_KEY = "reports_dishes_visible_columns";

export const REPORT_DISHES_COLUMN_OPTIONS = [
  { key: "num", label: "№ п/п", alwaysVisible: true },
  { key: "name", label: "Наименование товара", alwaysVisible: true },
  {
    key: "produced_count",
    label: "Количество изготовленных блюд",
  },
  {
    key: "unit_cost",
    label: "Себестоимость изготовленного одного блюда",
  },
  {
    key: "produced_cost",
    label: "Общая себестоимость изготовленных блюд за выбранный период",
  },
  {
    key: "sold_count",
    label: "Продано",
  },
  {
    key: "sold_cost",
    label: "Себестоимость продаж, ₽",
  },
  {
    key: "write_off_count",
    label: "Списано",
  },
  {
    key: "write_off_cost",
    label: "Себестоимость списаний, ₽",
  },
  {
    key: "avg_price",
    label: "Средняя розничная цена продажи одного блюда",
  },
  {
    key: "price",
    label: "Выручка за выбранный период",
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

export const DEFAULT_REPORT_DISHES_VISIBLE_COLUMNS = REPORT_DISHES_COLUMN_OPTIONS.reduce(
  (acc, item) => {
    acc[item.key] = true;
    return acc;
  },
  {},
);

export const REPORT_DISHES_TOGGLEABLE_COLUMNS = REPORT_DISHES_COLUMN_OPTIONS.filter(
  (item) => !item.alwaysVisible,
);
