export const END_ANALYTICS_COLUMNS_STORAGE_KEY = "end_analytics_visible_columns";

export const END_ANALYTICS_COLUMN_GROUPS = [
  { key: "main", label: "Основные показатели" },
  { key: "clients", label: "Клиенты и заказы" },
  { key: "additional", label: "Дополнительные показатели" },
];

export const END_ANALYTICS_COLUMNS = [
  { key: "visits", label: "ВИЗИТЫ", settingLabel: "Визиты", group: "main", width: 110 },
  { key: "clicks", label: "КЛИКИ", settingLabel: "Клики", group: "main", width: 110 },
  { key: "cost", label: "РАСХОД (₽)", settingLabel: "Расход", group: "main", width: 130 },
  { key: "orders", label: "ЗАКАЗЫ", settingLabel: "Заказы", group: "main", width: 110 },
  {
    key: "conversion",
    label: "КОНВЕРСИЯ (%)",
    settingLabel: "Конверсия",
    group: "main",
    width: 150,
  },
  {
    key: "costPerOrder",
    label: "СТОИМОСТЬ ЗАКАЗА (₽)",
    settingLabel: "Стоимость заказа",
    group: "main",
    width: 205,
  },
  {
    key: "revenue",
    label: "СУММА ЗАКАЗОВ (₽)",
    settingLabel: "Сумма заказов",
    group: "main",
    width: 180,
  },
  {
    key: "averageCheck",
    label: "СРЕДНИЙ ЧЕК (₽)",
    settingLabel: "Средний чек",
    group: "main",
    width: 160,
  },
  { key: "roi", label: "ROI (%)", settingLabel: "ROI", group: "main", width: 110 },
  {
    key: "newClients",
    label: "НОВЫЕ КЛИЕНТЫ",
    settingLabel: "Новые клиенты",
    group: "clients",
    width: 165,
  },
  {
    key: "existingClients",
    label: "ДЕЙСТВУЮЩИЕ КЛИЕНТЫ",
    settingLabel: "Действующие клиенты",
    group: "clients",
    width: 210,
  },
  {
    key: "primaryOrders",
    label: "ПЕРВИЧНЫЕ ЗАКАЗЫ",
    settingLabel: "Первичные заказы",
    group: "clients",
    width: 190,
  },
  {
    key: "repeatOrders",
    label: "ПОВТОРНЫЕ ЗАКАЗЫ",
    settingLabel: "Повторные заказы",
    group: "clients",
    width: 190,
  },
  { key: "drr", label: "ДРР (%)", settingLabel: "ДРР", group: "additional", width: 110 },
  { key: "ltv", label: "LTV (₽)", settingLabel: "LTV", group: "additional", width: 110 },
];

export const DEFAULT_END_ANALYTICS_VISIBLE_COLUMNS = END_ANALYTICS_COLUMNS.reduce(
  (result, column) => {
    result[column.key] = true;
    return result;
  },
  {},
);
