import handleUserAccess from "@/src/helpers/access/handleUserAccess";

export const SKLAD_TAB_DEFINITIONS = [
  {
    key: "categories",
    sections: ["categories"],
    label: "Категории",
    accessKeys: ["cats"],
    summaryKey: null,
    description: "Source-aware категории для production family и связанных сущностей.",
    hidden: true,
  },
  {
    key: "production",
    sections: ["recipes", "semi-finished"],
    label: "Рецепты и заготовки",
    accessKeys: ["production_list_view"],
    summaryKey: "recipes_active",
    description: "Общий production contour для recipes и semi-finished на canonical API.",
  },
  {
    key: "site-items",
    sections: ["site-items"],
    label: "Товары сайта",
    accessKeys: ["site_item_list_view"],
    summaryKey: "site_items_active",
    description: "Site-facing товарный контур, теги, маркировка, картинки и derived-поля.",
  },
  {
    key: "units",
    sections: ["units"],
    label: "Единицы измерения",
    accessKeys: ["unit_list_view"],
    summaryKey: null,
    description: "Справочник единиц измерения и их базовые CRUD-операции.",
  },
  {
    key: "archive",
    sections: ["archive"],
    label: "Архив",
    accessKeys: ["archive_list_view"],
    summaryKey: "archive_total",
    description: "Archive contour для поддерживаемых entity types.",
  },
];

export function getVisibleSkladTabs({ sections = [], access = {} } = {}) {
  const accessApi = handleUserAccess(access);

  return SKLAD_TAB_DEFINITIONS.filter((tab) => {
    if (tab.hidden) {
      return false;
    }

    const hasSection = tab.sections.some((section) => sections.includes(section));
    const canView = tab.accessKeys.some((key) => accessApi.userCan("view", key));

    return hasSection && canView;
  });
}
