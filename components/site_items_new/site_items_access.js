export const SITE_ITEMS_NEW_MODULE_KEY = "site_items_new";

export const SITE_ITEMS_MODAL_SECTIONS = [
  {
    id: "main",
    value: "0",
    label: "Основные",
    description: "Наименование, категория и изображение",
    titles: ["основные", "основная", "основное"],
    fields: [
      "name",
      "short_name",
      "art",
      "date_start",
      "date_end",
      "category_id",
      "stol",
      "marc",
      "dropzone",
    ],
    featureNames: [
      "наименование",
      "короткое название",
      "код 1с",
      "действует с",
      "действует по",
      "категория",
      "стол",
      "маркировка",
      "код маркировки",
      "изображение",
      "картинка",
      "фото",
      "dropzone",
    ],
  },
  {
    id: "nutrition",
    value: "1",
    label: "БЖУ",
    description: "Вес, порция и пищевая ценность",
    titles: ["бжу", "пищевая ценность"],
    fields: ["count_part", "weight", "protein", "fat", "carbohydrates"],
    featureNames: [
      "порция",
      "бжу",
      "кусочков или размер",
      "вес",
      "белки",
      "жиры",
      "углеводы",
      "калорийность",
    ],
  },
  {
    id: "description",
    value: "2",
    label: "Описание",
    description: "Тексты для карточки и списка",
    titles: ["описание"],
    fields: ["tmp_desc", "marc_desc_full", "marc_desc"],
    featureNames: ["описание", "состав", "полное описание", "короткое описание"],
  },
  {
    id: "tags",
    value: "3",
    label: "Теги",
    description: "Теги и промо-маркеры",
    titles: ["теги", "тэги"],
    fields: ["tags", "is_new", "is_updated", "is_hit", "is_spicy"],
    featureNames: ["теги", "тэги", "новинка", "обновлено", "хит", "острый"],
  },
  {
    id: "activity",
    value: "4",
    label: "Активность",
    description: "Публикация и продажи",
    titles: ["активность"],
    fields: ["is_price", "is_show", "show_site", "show_program"],
    featureNames: [
      "активность",
      "установить цену",
      "на сайте и кц",
      "на кассе",
      "сайт и кц",
      "касса",
    ],
  },
  {
    id: "composition",
    value: "5",
    label: "Состав",
    description: "Тайминги, заготовки и позиции",
    titles: ["состав"],
    fields: ["time_stage_1", "time_stage_2", "time_stage_3", "stage", "items"],
    featureNames: ["состав", "время на 1 этап", "время на 2 этап", "время на 3 этап", "позиции"],
  },
];

export const SITE_ITEMS_MODAL_FIELD_KEYS = SITE_ITEMS_MODAL_SECTIONS.flatMap(
  (section) => section.fields,
);

/** Field → permission keys to check (section key first, then field). */
export const FIELD_ACCESS_ALIASES = {
  count_part: ["portion", "count_part"],
  weight: ["portion", "weight"],
  protein: ["bju", "protein"],
  fat: ["bju", "fat"],
  carbohydrates: ["bju", "carbohydrates"],
  tmp_desc: ["description", "tmp_desc"],
  marc_desc_full: ["description", "marc_desc_full"],
  marc_desc: ["description", "marc_desc"],
  tags: ["tags"],
  is_new: ["tags", "is_new"],
  is_updated: ["tags", "is_updated"],
  is_hit: ["tags", "is_hit"],
  is_spicy: ["tags", "is_spicy"],
  is_price: ["activity", "is_price"],
  is_show: ["activity", "is_show"],
  show_site: ["activity", "show_site"],
  show_program: ["activity", "show_program"],
  time_stage_1: ["composition", "time_stage_1"],
  time_stage_2: ["composition", "time_stage_2"],
  time_stage_3: ["composition", "time_stage_3"],
  stage: ["composition", "stage"],
  items: ["composition", "items"],
};

const HIDDEN_FEATURE_NAMES = new Set([
  "маркетинговое название",
  "дата обновления",
  "история изменений",
  "история",
]);

const NUTRITION_FEATURE_ORDER = [
  "порция",
  "бжу",
  "кусочков или размер",
  "вес",
  "белки",
  "жиры",
  "углеводы",
];

export function hasAccessValue(value) {
  return value === true || value === 1 || value === "1";
}

function getAliasKeys(field) {
  return FIELD_ACCESS_ALIASES[field] || [field];
}

export function canViewAccess(access, field, fallback = false) {
  const aliases = getAliasKeys(field);
  const raw = access || {};
  let found = false;

  for (const alias of aliases) {
    const viewKey = `${alias}_view`;
    const editKey = `${alias}_edit`;

    if (viewKey in raw || editKey in raw) {
      found = true;
      if (hasAccessValue(raw[viewKey]) || hasAccessValue(raw[editKey])) {
        return true;
      }
    }
  }

  return found ? false : fallback;
}

export function canEditAccess(access, field, fallback = false) {
  const aliases = getAliasKeys(field);
  const raw = access || {};
  let found = false;

  for (const alias of aliases) {
    const editKey = `${alias}_edit`;

    if (editKey in raw) {
      found = true;
      if (hasAccessValue(raw[editKey])) {
        return true;
      }
    }
  }

  return found ? false : fallback;
}

export function canViewSection(access, sectionId, fallback = false) {
  const section = SITE_ITEMS_MODAL_SECTIONS.find((item) => item.id === sectionId);
  if (!section) {
    return fallback;
  }

  return section.fields.some((field) => canViewAccess(access, field, fallback));
}

export function canEditSection(access, sectionId, fallback = false) {
  const section = SITE_ITEMS_MODAL_SECTIONS.find((item) => item.id === sectionId);
  if (!section) {
    return fallback;
  }

  return section.fields.some((field) => canEditAccess(access, field, fallback));
}

export function normalizeCategoryDisplayName(name) {
  return String(name ?? "")
    .replace(/модалка[\s\-–—:]*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function isHiddenSiteItemsFeature(feature) {
  const name = String(feature?.name ?? "")
    .trim()
    .toLowerCase();

  return HIDDEN_FEATURE_NAMES.has(name);
}

function normalizeMatchValue(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getSectionOrderIndex(group) {
  const name = normalizeMatchValue(normalizeCategoryDisplayName(group.name || group.key));

  const index = SITE_ITEMS_MODAL_SECTIONS.findIndex((section) =>
    section.titles.some((title) => name === title || name.includes(title)),
  );

  return index === -1 ? SITE_ITEMS_MODAL_SECTIONS.length : index;
}

function getFeatureOrderIndex(feature, sectionIndex) {
  const name = normalizeMatchValue(feature?.name);
  const section = SITE_ITEMS_MODAL_SECTIONS[sectionIndex];

  if (!section) {
    return Number.MAX_SAFE_INTEGER;
  }

  if (section.id === "nutrition") {
    const nutritionIndex = NUTRITION_FEATURE_ORDER.findIndex(
      (item) => name === item || name.includes(item),
    );
    if (nutritionIndex !== -1) {
      return nutritionIndex;
    }
  }

  const index = section.featureNames.findIndex((item) => name === item || name.includes(item));
  return index === -1 ? section.featureNames.length : index;
}

export function prepareSiteItemsFeatureGroups(features = []) {
  const groups = [];
  const groupsByKey = new Map();

  (features || []).forEach((feature, featureIndex) => {
    if (isHiddenSiteItemsFeature(feature)) {
      return;
    }

    const category = String(feature.category ?? "").trim();
    const key = category || "__plain__";
    const rawName = category ? String(feature.category_name || category) : "";
    const name = normalizeCategoryDisplayName(rawName);

    if (!groupsByKey.has(key)) {
      const group = {
        key,
        name,
        items: [],
      };
      groupsByKey.set(key, group);
      groups.push(group);
    }

    groupsByKey.get(key).items.push({ feature, featureIndex });
  });

  groups.sort((left, right) => getSectionOrderIndex(left) - getSectionOrderIndex(right));

  groups.forEach((group) => {
    const sectionIndex = getSectionOrderIndex(group);
    group.items.sort(
      (left, right) =>
        getFeatureOrderIndex(left.feature, sectionIndex) -
        getFeatureOrderIndex(right.feature, sectionIndex),
    );
  });

  return groups;
}

export function isItemActive(item) {
  return Number(item?.is_show) === 1;
}

export function filterCatsByActivity(cats = [], archive = false) {
  return (cats || [])
    .map((cat) => ({
      ...cat,
      items: (cat.items || []).filter((item) => {
        const active = isItemActive(item);
        return archive ? !active : active;
      }),
    }))
    .filter((cat) => (cat.items || []).length > 0);
}

export function filterCatsByName(cats = [], search = "") {
  const query = String(search ?? "")
    .trim()
    .toLocaleLowerCase("ru-RU");

  if (!query) {
    return cats;
  }

  return (cats || [])
    .map((cat) => ({
      ...cat,
      items: (cat.items || []).filter((item) =>
        String(item?.name ?? "")
          .toLocaleLowerCase("ru-RU")
          .includes(query),
      ),
    }))
    .filter((cat) => (cat.items || []).length > 0);
}
