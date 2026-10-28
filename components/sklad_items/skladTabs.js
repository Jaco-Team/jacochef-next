export const SKLAD_TAB_DEFINITIONS = [
  {
    key: "warehouse-items",
    label: "Товары склада",
    accessGroup: "warehouse_items",
    description: "Справочник товаров склада с периодами действия и полной историей.",
  },
  {
    key: "production",
    label: "Рецепты и полуфабрикаты",
    accessGroup: "production",
    description: "Общий production contour для recipes и semi-finished на canonical API.",
  },
  {
    key: "site-items",
    label: "Товары сайта",
    accessGroup: "site_items",
    description: "Site-facing товарный контур, теги, маркировка, картинки и derived-поля.",
  },
  {
    key: "units",
    label: "Единицы измерения",
    accessGroup: "units",
    description: "Справочник единиц измерения и их базовые CRUD-операции.",
  },
  { key: "allergens", label: "Аллергены", linkedModule: "allergens" },
];

export function getVisibleSkladTabs({ access = {}, linkedModules = {} } = {}) {
  return SKLAD_TAB_DEFINITIONS.filter((tab) => {
    if (tab.linkedModule) return linkedModules[tab.linkedModule] === true;
    return (
      Number(access?.[`${tab.accessGroup}_view`]) === 1 ||
      Number(access?.[`${tab.accessGroup}_edit`]) === 1
    );
  });
}
