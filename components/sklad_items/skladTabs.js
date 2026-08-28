export const SKLAD_TAB_DEFINITIONS = [
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
  {
    key: "archive",
    label: "Архив",
    accessGroup: "archive",
    description: "Archive contour для поддерживаемых entity types.",
  },
];

export function getVisibleSkladTabs({ access = {} } = {}) {
  return SKLAD_TAB_DEFINITIONS.filter((tab) => {
    return (
      Number(access?.[`${tab.accessGroup}_view`]) === 1 ||
      Number(access?.[`${tab.accessGroup}_edit`]) === 1
    );
  });
}
