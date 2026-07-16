export const SKLAD_TAB_DEFINITIONS = [
  {
    key: "units",
    sections: ["units"],
    label: "Единицы измерения",
    accessKeys: ["units"],
    summaryKey: null,
    description: "Справочник единиц измерения и их базовые CRUD-операции.",
  },
  {
    key: "categories",
    sections: ["categories"],
    label: "Категории",
    accessKeys: ["categories"],
    summaryKey: null,
    description: "Source-aware категории для production family и связанных сущностей.",
  },
  {
    key: "production",
    sections: ["recipes", "semi-finished"],
    label: "Рецепты и полуфабрикаты",
    accessKeys: ["recipes", "semi_finished"],
    summaryKey: "recipes_active",
    description: "Общий production contour для recipes и semi-finished на canonical API.",
  },
  {
    key: "site-items",
    sections: ["site-items"],
    label: "Товары сайта",
    accessKeys: ["site_items"],
    summaryKey: "site_items_active",
    description: "Site-facing товарный контур, теги, маркировка, картинки и derived-поля.",
  },
  {
    key: "history",
    sections: ["history"],
    label: "История",
    accessKeys: ["history"],
    summaryKey: null,
    description: "Unified history browser для canonical entity families.",
  },
  {
    key: "archive",
    sections: ["archive"],
    label: "Архив",
    accessKeys: ["archive"],
    summaryKey: "archive_total",
    description: "Archive contour для поддерживаемых entity types.",
  },
];

export function getVisibleSkladTabs({ sections = [], access = {} } = {}) {
  return SKLAD_TAB_DEFINITIONS.filter((tab) => {
    const hasSection = tab.sections.some((section) => sections.includes(section));
    const canView = tab.accessKeys.some((key) => Number(access[`${key}_view`]) === 1);

    return hasSection && canView;
  });
}
