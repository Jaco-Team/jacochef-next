import handleUserAccess from "@/src/helpers/access/handleUserAccess";

export const SKLAD_TAB_DEFINITIONS = [
  {
    key: "units",
    sections: ["units"],
    label: "Единицы измерения",
    accessKeys: ["ed_izmer"],
    summaryKey: null,
    description: "Справочник единиц измерения и их базовые CRUD-операции.",
  },
  {
    key: "categories",
    sections: ["categories"],
    label: "Категории",
    accessKeys: ["cats"],
    summaryKey: null,
    description: "Source-aware категории для production family и связанных сущностей.",
  },
  {
    key: "production",
    sections: ["recipes", "semi-finished"],
    label: "Рецепты и заготовки",
    accessKeys: ["name", "items", "create_rec", "create_pol", "change_rec_pf"],
    summaryKey: "recipes_active",
    description: "Общий production contour для recipes и semi-finished на canonical API.",
  },
  {
    key: "site-items",
    sections: ["site-items"],
    label: "Товары сайта",
    accessKeys: [
      "create_new",
      "is_show",
      "show_site",
      "show_program",
      "category_id",
      "short_name",
      "tmp_desc",
    ],
    summaryKey: "site_items_active",
    description: "Site-facing товарный контур, теги, маркировка, картинки и derived-поля.",
  },
  {
    key: "history",
    sections: ["history"],
    label: "История",
    accessKeys: ["name", "items", "create_new", "is_show"],
    summaryKey: null,
    description: "Unified history browser для canonical entity families.",
  },
  {
    key: "archive",
    sections: ["archive"],
    label: "Архив",
    accessKeys: ["is_show", "active"],
    summaryKey: "archive_total",
    description: "Archive contour для поддерживаемых entity types.",
  },
];

export function getVisibleSkladTabs({ sections = [], access = {} } = {}) {
  const accessApi = handleUserAccess(access);

  return SKLAD_TAB_DEFINITIONS.filter((tab) => {
    const hasSection = tab.sections.some((section) => sections.includes(section));
    const canView = tab.accessKeys.some((key) => accessApi.userCan("view", key));

    return hasSection && canView;
  });
}
