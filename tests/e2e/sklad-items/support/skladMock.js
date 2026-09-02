const FULL_ACCESS = {
  production_view: 1,
  production_edit: 1,
  production_create: 1,
  production_delete: 1,
  production_past_date: 1,
  production_convert: 1,
  warehouse_items_view: 1,
  warehouse_items_edit: 1,
  warehouse_items_create: 1,
  warehouse_items_delete: 1,
  warehouse_items_past_date: 1,
  site_items_view: 1,
  site_items_edit: 1,
  site_items_create: 1,
  site_items_delete: 1,
  site_items_past_date: 1,
  site_items_sync_vk: 1,
  kassa_view: 1,
  kassa_edit: 1,
  site_kc_view: 1,
  site_kc_edit: 1,
  sort_view: 1,
  sort_edit: 1,
  change_tag_access: 1,
  name_view: 1,
  name_edit: 1,
  date_start_view: 1,
  date_start_edit: 1,
  date_end_view: 1,
  date_end_edit: 1,
  short_name_view: 1,
  short_name_edit: 1,
  art_view: 1,
  art_edit: 1,
  category_id_view: 1,
  category_id_edit: 1,
  stol_view: 1,
  stol_edit: 1,
  marc_view: 1,
  marc_edit: 1,
  dropzone_view: 1,
  dropzone_edit: 1,
  portion_view: 1,
  portion_edit: 1,
  bju_view: 1,
  bju_edit: 1,
  description_view: 1,
  description_edit: 1,
  tags_view: 1,
  tags_edit: 1,
  activity_view: 1,
  activity_edit: 1,
  composition_view: 1,
  composition_edit: 1,
  units_view: 1,
  units_edit: 1,
  units_create: 1,
  units_delete: 1,
  archive_view: 1,
  archive_edit: 1,
  history_view: 1,
  ...Object.fromEntries(
    [
      "name",
      "name_for_vendor",
      "mark_name",
      "categories",
      "unit",
      "date_start",
      "date_end",
      "art",
      "pq",
      "percent",
      "vend_percent",
      "min_count",
      "max_count_in_m",
      "composition",
      "time",
      "properties",
      "activity",
      "order",
      "revision",
      "allergens",
      "allergens_possible",
      "storages",
      "apps",
      "accounting_systems",
    ].flatMap((field) => [
      [`warehouse_items_${field}_view`, 1],
      [`warehouse_items_${field}_edit`, 1],
    ]),
  ),
  ...Object.fromEntries(
    [
      "name",
      "shelf_life",
      "unit",
      "activity",
      "two_user",
      "show_in_rev",
      "date_start",
      "date_end",
      "time",
      "dop_time",
      "apps",
      "storages",
      "items",
      "allergens",
      "allergens_diff",
      "structure",
      "categories",
    ].flatMap((field) => [
      [`production_${field}_view`, 1],
      [`production_${field}_edit`, 1],
    ]),
  ),
  ...Object.fromEntries(
    [
      "kassa",
      "site_kc",
      "sort",
      "name",
      "date_start",
      "date_end",
      "short_name",
      "art",
      "category_id",
      "stol",
      "marc",
      "dropzone",
      "portion",
      "bju",
      "description",
      "tags",
      "activity",
      "composition",
    ].flatMap((field) => [
      [`site_items_${field}_view`, 1],
      [`site_items_${field}_edit`, 1],
    ]),
  ),
};

function unit(id, name, overrides = {}) {
  return {
    id,
    name,
    con_id: 0,
    main_count: 1,
    con_count: 1,
    delete_state: "allowed",
    delete_usage: {
      can_delete: true,
      active_relations: [],
      history_relations: [],
    },
    ...overrides,
  };
}

function bootstrap(access) {
  return {
    st: true,
    module_info: { name: "Склад" },
    access,
    units: [unit(1, "Грамм")],
    categories: [
      { id: 10, name: "E2E_SKLAD_Категория производства", source_type: "semi_finished" },
      {
        id: 41,
        name: "E2E_SKLAD_Упаковка",
        parent_id: 40,
        parent_name: "E2E_SKLAD_Хозтовары",
        category_key: "warehouse_item:41",
        source_type: "warehouse_item",
      },
    ],
    allergens: [],
    storages: [],
    apps: [],
    tags: [{ id: 20, name: "E2E_SKLAD_Тег" }],
    accounting_systems: [],
  };
}

async function installSkladMock(page, options = {}) {
  const state = {
    access: options.access || FULL_ACCESS,
    requests: [],
    units: [
      unit(1, "Грамм"),
      unit(2, "Используемая единица", {
        delete_state: "blocked",
        delete_usage: {
          can_delete: false,
          active_relations: [{ source: "recipe", label: "Рецепты", count: 1, items: [] }],
          history_relations: [],
        },
      }),
    ],
    nextUnitId: 100,
    nextProductionId: 200,
    nextSiteItemId: 300,
    nextWarehouseItemId: 400,
    warehouseItems: [
      {
        id: 51,
        name: "E2E_SKLAD_Коробка для пиццы",
        category_id: 41,
        category_name: "E2E_SKLAD_Упаковка",
        ed_izmer_id: 1,
        ed_izmer_name: "Грамм",
        is_show: 1,
        is_active: 1,
        show_in_order: 1,
        show_in_rev: 0,
        effective_date_start: "2026-08-01",
        effective_date_end: "",
        revision_status: "active",
        delete_state: "allowed",
      },
    ],
    recipes: [
      {
        id: 11,
        name: "E2E_SKLAD_Очень длинное название рецепта для проверки адаптивной таблицы",
        shelf_life: "48 часов",
        date_start: "2026-08-01",
        date_end: "",
        is_active: 1,
        is_show: 1,
        is_archived: 0,
        categories: [{ id: 10, name: "E2E_SKLAD_Категория производства" }],
        delete_usage: { can_delete: true, active_relations: [], history_relations: [] },
      },
    ],
    semiFinished: [],
    siteItems: [
      {
        id: 21,
        name: "E2E_SKLAD_Товар сайта с длинным названием для визуальной проверки",
        short_name: "E2E товар",
        category_id: 7,
        category_id2: 30,
        category_name: "E2E_SKLAD_Салаты и закуски",
        art: "E2E-1C-21",
        sort: 10,
        date_update: "2026-08-30 12:00:00",
        date_start: "2026-08-01",
        date_end: "",
        protein: "10.1",
        fat: "4.2",
        carbohydrates: "18.3",
        kkal: "151",
        kkal_preview: "151",
        is_show: 1,
        show_site: 1,
        show_program: 1,
        is_new: 1,
        is_archived: 0,
        tags: [{ id: 20, name: "E2E_SKLAD_Тег" }],
        can_delete: true,
      },
    ],
    archived: [
      {
        id: 31,
        entity_type: "recipe",
        name: "E2E_SKLAD_Архивный рецепт",
        is_archived: 1,
      },
    ],
    productionHistory: [
      {
        entity_type: "recipe",
        entity_id: 11,
        history_id: 102,
        revision_key: "102",
        revision_status: "scheduled",
        effective_date_start: "2026-09-10",
        effective_date_end: null,
        changed_at: "2026-08-31 12:00:00",
        changed_by: "E2E Редактор",
        can_cancel_schedule: true,
      },
      {
        entity_type: "recipe",
        entity_id: 11,
        history_id: 101,
        revision_key: "101",
        revision_status: "active",
        effective_date_start: "2026-08-01",
        effective_date_end: "2026-09-09",
        changed_at: "2026-08-01 10:00:00",
        changed_by: "E2E Автор",
      },
      {
        entity_type: "recipe",
        entity_id: 11,
        history_id: 100,
        revision_key: "100",
        revision_status: "superseded",
        effective_date_start: "2026-07-01",
        effective_date_end: "2026-07-31",
        changed_at: "2026-07-01 09:00:00",
        changed_by: "E2E Старый автор",
      },
    ],
    siteItemHistory: [
      {
        entity_type: "site_item",
        entity_id: 21,
        history_id: 202,
        revision_key: "202",
        revision_status: "active",
        effective_date_start: "2026-08-15",
        effective_date_end: null,
        changed_at: "2026-08-15 11:30:00",
        changed_by: "E2E Редактор товара",
        previous_revision_key: "201",
      },
      {
        entity_type: "site_item",
        entity_id: 21,
        history_id: 201,
        revision_key: "201",
        revision_status: "expired",
        effective_date_start: "2026-08-01",
        effective_date_end: "2026-08-14",
        changed_at: "2026-08-01 09:00:00",
        changed_by: "E2E Автор товара",
      },
    ],
    historySnapshots: {
      101: {
        id: 11,
        type: "recipe",
        name: "E2E_SKLAD_Рецепт",
        date_start: "2026-08-01",
        date_end: "2026-09-09",
        items: [
          {
            id: 501,
            item_id: 1,
            type: "item",
            sort: 0,
            name: "Изменяемый компонент",
            brutto: "1.000",
          },
          {
            id: 502,
            item_id: 3,
            type: "item",
            sort: 1,
            name: "Удалённый компонент",
            brutto: "1.000",
          },
        ],
      },
      102: {
        id: 11,
        type: "recipe",
        name: "E2E_SKLAD_Рецепт будущий",
        date_start: "2026-09-10",
        date_end: "",
        items: [
          {
            id: 701,
            item_id: 1,
            type: "item",
            sort: 0,
            name: "Изменяемый компонент",
            brutto: "2.000",
          },
          {
            id: 702,
            item_id: 2,
            type: "item",
            sort: 1,
            name: "Новый компонент",
            brutto: "1.000",
          },
        ],
      },
      201: {
        id: 21,
        name: "E2E_SKLAD_Товар сайта",
        short_name: "E2E товар",
        category_name: "E2E_SKLAD_Салаты и закуски",
        date_start: "2026-08-01",
        date_end: "2026-08-14",
        protein: "10.100",
        fat: "4.200",
        carbohydrates: "18.300",
        is_show: 1,
        tags: [{ id: 20, name: "E2E_SKLAD_Тег" }],
        item_items: {
          this_items: [
            {
              id: 801,
              item_id: { id: 1, name: "Удалённая позиция товара" },
              brutto: "1.000",
              netto: "1.000",
              res: "1.000",
            },
          ],
        },
      },
      202: {
        id: 21,
        name: "E2E_SKLAD_Товар сайта обновлённый",
        short_name: "E2E товар",
        category_name: "E2E_SKLAD_Салаты и закуски",
        date_start: "2026-08-15",
        date_end: "",
        protein: "11.500",
        fat: "4.200",
        carbohydrates: "18.300",
        is_show: 1,
        tags: [{ id: 20, name: "E2E_SKLAD_Тег" }],
        item_items: {
          this_items: [
            {
              id: 802,
              item_id: { id: 2, name: "Новая позиция товара" },
              brutto: "2.000",
              netto: "2.000",
              res: "2.000",
            },
          ],
        },
      },
    },
  };

  page.on("pageerror", (error) => console.error(`[pageerror] ${error.message}`));
  page.on("requestfailed", (request) =>
    console.error(
      `[requestfailed] ${request.method()} ${request.url()} ${request.failure()?.errorText || ""}`,
    ),
  );

  await page.addInitScript(() => {
    window.localStorage.setItem("chef_auth_token", "E2E_SKLAD_TOKEN");
  });

  await page.route(/\/api\/header\/get_all\/?(?:\?.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          st: true,
          left_menu: [],
          full_menu: [],
          my: { short_name: "E2E" },
        },
      }),
    }),
  );

  await page.route("**/api/sklad_items/**", async (route) => {
    const request = route.request();
    const marker = "/api/sklad_items/";
    const pathname = new URL(request.url()).pathname;
    const method = pathname.includes(marker) ? pathname.split(marker)[1] : "";
    const contentType = request.headers()["content-type"] || "";
    let data = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(request.postData() || "");
      try {
        data = JSON.parse(params.get("data") || "{}");
      } catch {
        data = {};
      }
    }

    state.requests.push({ method, data });

    const respond = (body) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: body }),
      });

    if (method === "get_all") {
      return respond(bootstrap(state.access));
    }

    if (method === "units/list") {
      return respond({ st: true, list: state.units });
    }

    if (method === "units/save_new") {
      const created = unit(state.nextUnitId++, data.name, data);
      state.units.push(created);
      return respond({ st: true, text: "Успешно сохранено", id: created.id });
    }

    if (method === "units/save_edit") {
      const index = state.units.findIndex((row) => Number(row.id) === Number(data.id));
      if (index >= 0) {
        state.units[index] = { ...state.units[index], ...data };
      }
      return respond({ st: true, text: "Успешно сохранено", id: data.id });
    }

    if (method === "units/delete") {
      state.units = state.units.filter((row) => Number(row.id) !== Number(data.id));
      return respond({ st: true, text: "Успешное удаление", usage: {} });
    }

    if (method === "recipes/list") {
      const search = String(data.search || "")
        .trim()
        .toLocaleLowerCase("ru");
      return respond({
        st: true,
        list: state.recipes.filter(
          (row) => !search || row.name.toLocaleLowerCase("ru").includes(search),
        ),
      });
    }

    if (method === "semi-finished/list") {
      const search = String(data.search || "")
        .trim()
        .toLocaleLowerCase("ru");
      return respond({
        st: true,
        list: state.semiFinished.filter(
          (row) => !search || row.name.toLocaleLowerCase("ru").includes(search),
        ),
      });
    }

    if (method === "recipes/get_one" || method === "semi-finished/get_one") {
      const source = method.startsWith("recipes/") ? state.recipes : state.semiFinished;
      const entity = source.find((row) => Number(row.id) === Number(data.id)) || {};
      return respond({
        st: true,
        entity,
        units: [unit(1, "Грамм")],
        categories: bootstrap(state.access).categories,
        allergens: [],
        all_storages: [],
        apps: [],
        all_items_list: [
          { id: 1, id_name: "1-item", type: "item", name: "Рис вареный НЕЗАПРАВЛЕННЫЙ" },
          { id: 2, id_name: "2-item", type: "item", name: "Коробка для пиццы 35 см" },
          { id: 3, id_name: "3-item", type: "item", name: "Пакет для пиццы" },
          { id: 4, un_id: "4-pf", type: "pf", name: "Пицца Маргарита" },
          { id: 5, un_id: "5-pf", type: "pf", name: "Салат Айсберг нарезанный П/Ф" },
          { id: 6, id_name: "6-item", type: "item", name: "Салат Айсберг" },
          { id: 7, id_name: "7-item", type: "item", name: "Салатник 750 мл" },
          { id: 8, id_name: "8-item", type: "item", name: "Стикер для салатника" },
        ],
        history: {
          rows: method.startsWith("recipes/") ? state.productionHistory : [],
          capabilities: {},
          meta: {
            entity_type: method.startsWith("recipes/") ? "recipe" : "semi_finished",
            entity_id: data.id,
          },
        },
      });
    }

    if (method === "recipes/save_new" || method === "semi-finished/save_new") {
      const created = {
        ...data,
        id: state.nextProductionId++,
        is_active: Number(data.is_show ?? 1),
        is_archived: 0,
        categories: [],
        delete_usage: { can_delete: true, active_relations: [], history_relations: [] },
      };
      (method.startsWith("recipes/") ? state.recipes : state.semiFinished).push(created);
      return respond({ st: true, text: "Успешно сохранено", id: created.id });
    }

    if (method === "recipes/save_edit" || method === "semi-finished/save_edit") {
      const source = method.startsWith("recipes/") ? state.recipes : state.semiFinished;
      const index = source.findIndex((row) => Number(row.id) === Number(data.id));
      if (index >= 0) source[index] = { ...source[index], ...data };
      return respond({ st: true, text: "Успешно сохранено", id: data.id });
    }

    if (method === "items/list") {
      const search = String(data.search || "")
        .trim()
        .toLocaleLowerCase("ru");
      return respond({
        st: true,
        list: state.warehouseItems.filter(
          (row) => !search || row.name.toLocaleLowerCase("ru").includes(search),
        ),
      });
    }

    if (method === "items/get_all_for_new" || method === "items/get_one") {
      const item =
        method === "items/get_one"
          ? state.warehouseItems.find((row) => Number(row.id) === Number(data.id)) || {}
          : { date_start: "2026-09-01", date_end: "", is_show: 1 };
      return respond({
        st: true,
        item,
        categories: bootstrap(state.access).categories,
        units: state.units,
        allergens: [],
        storages: [],
        apps: [],
        accounting_systems: [],
        history: {
          rows: [],
          capabilities: {},
          meta: { entity_type: "item", entity_id: item.id || null },
        },
      });
    }

    if (method === "items/save_new") {
      const created = {
        ...data,
        id: state.nextWarehouseItemId++,
        category_name: "E2E_SKLAD_Упаковка",
        ed_izmer_name: "Грамм",
        is_active: Number(data.is_show || 0),
        revision_status: "active",
        delete_state: "allowed",
      };
      state.warehouseItems.push(created);
      return respond({ st: true, text: "Успешно сохранено", id: created.id });
    }

    if (method === "items/save_edit") {
      const index = state.warehouseItems.findIndex((row) => Number(row.id) === Number(data.id));
      if (index >= 0) state.warehouseItems[index] = { ...state.warehouseItems[index], ...data };
      return respond({ st: true, text: "Успешно сохранено", id: data.id });
    }

    if (method === "items/delete") {
      state.warehouseItems = state.warehouseItems.filter(
        (row) => Number(row.id) !== Number(data.id),
      );
      return respond({ st: true, text: "Успешно удалено" });
    }

    if (method === "site-items/list") {
      const search = String(data.search || "")
        .trim()
        .toLocaleLowerCase("ru");
      return respond({
        st: true,
        categories: [{ id: 30, name: "E2E_SKLAD_Салаты и закуски" }],
        legacy_categories: [{ id: 7, name: "E2E_SKLAD_Старая категория" }],
        tags: bootstrap(state.access).tags,
        list: state.siteItems.filter(
          (row) =>
            !search ||
            row.name.toLocaleLowerCase("ru").includes(search) ||
            String(row.short_name || "")
              .toLocaleLowerCase("ru")
              .includes(search),
        ),
      });
    }

    if (method === "site-items/get_all_for_new") {
      return respond({
        st: true,
        item: {
          category_id: null,
          category_id2: null,
          date_start: "2026-08-01",
          is_show: 1,
          show_site: 1,
          show_program: 1,
        },
        cat_list: [{ id: 30, name: "E2E_SKLAD_Салаты и закуски" }],
        cat_list_legacy: [{ id: 7, name: "E2E_SKLAD_Старая категория" }],
        tags_all: bootstrap(state.access).tags,
      });
    }

    if (method === "site-items/get_one") {
      const item = state.siteItems.find((row) => Number(row.id) === Number(data.id)) || {};
      const warehouseOptions = [
        ...Array.from({ length: 120 }, (_, index) => ({
          id: 1000 + index,
          un_id: `${1000 + index}-item`,
          type: "item",
          name: `Служебная позиция ${String(index + 1).padStart(3, "0")}`,
          ei_name: "шт.",
        })),
        { id: 1, un_id: "1-item", type: "item", name: "Рис вареный П/Ф", ei_name: "кг." },
        {
          id: 2,
          un_id: "2-item",
          type: "item",
          name: "Сахар пакетированный (5гр) П/Ф",
          ei_name: "шт.",
        },
        {
          id: 3,
          un_id: "3-item",
          type: "item",
          name: "Крышка прозрачная для салатника",
          ei_name: "шт.",
        },
        { id: 4, un_id: "4-item", type: "item", name: "Салатник 750 мл", ei_name: "шт." },
        {
          id: 5,
          un_id: "5-item",
          type: "item",
          name: "Стикер для салатника",
          ei_name: "шт.",
        },
        {
          id: 6,
          un_id: "6-item",
          type: "item",
          name: "Коробка для пиццы 35 см",
          ei_name: "шт.",
        },
        {
          id: 7,
          un_id: "7-item",
          type: "item",
          name: "Пакет для пиццы",
          ei_name: "шт.",
        },
      ];
      return respond({
        st: true,
        item,
        cat_list: [{ id: 30, name: "E2E_SKLAD_Салаты и закуски" }],
        cat_list_legacy: [{ id: 7, name: "E2E_SKLAD_Старая категория" }],
        items_stage: { stage_1: [], stage_2: [], stage_3: [], all: warehouseOptions },
        item_items: { this_items: [], all_items: [] },
        composition_source: { item_items: [], items_stage: [] },
        composition_derived: { item_items: [], items_stage: [] },
        history: {
          rows: Number(data.id) === 21 ? state.siteItemHistory : [],
          capabilities: {},
          meta: { entity_type: "site_item", entity_id: data.id },
        },
        image_history: { rows: [], capabilities: {}, current: {} },
      });
    }

    if (method === "site-items/save_new") {
      const created = {
        ...data,
        id: state.nextSiteItemId++,
        category_name: "E2E_SKLAD_Салаты и закуски",
        is_archived: 0,
        tags: [],
        can_delete: true,
      };
      state.siteItems.push(created);
      return respond({ st: true, text: "Успешно сохранено", id: created.id });
    }

    if (method === "site-items/save_edit") {
      const index = state.siteItems.findIndex((row) => Number(row.id) === Number(data.id));
      if (index >= 0) state.siteItems[index] = { ...state.siteItems[index], ...data };
      return respond({ st: true, text: "Успешно сохранено", id: data.id });
    }

    if (method === "site-items/save_flag") {
      const index = state.siteItems.findIndex((row) => Number(row.id) === Number(data.id));
      if (index >= 0) {
        state.siteItems[index] = {
          ...state.siteItems[index],
          [data.type]: Number(data.value),
          ...(data.type === "is_show"
            ? {
                is_archived: Number(data.value) === 1 ? 0 : 1,
                is_active: Number(data.value),
              }
            : {}),
        };
      }
      return respond({ st: true, text: "Успешно сохранено", id: data.id });
    }

    if (method === "site-items/tags/save_edit") {
      return respond({
        st: true,
        text: "Тег обновлен",
        tags_all: [{ id: Number(data.tag_id), name: data.name }],
      });
    }

    if (method === "entities/archive") {
      const sources = {
        recipe: state.recipes,
        semi_finished: state.semiFinished,
        site_item: state.siteItems,
      };
      const source = sources[data.entity_type] || [];
      const index = source.findIndex((row) => Number(row.id) === Number(data.id));
      if (index >= 0) source[index] = { ...source[index], is_archived: Number(data.value) };
      return respond({ st: true, text: "Успешно сохранено", id: data.id });
    }

    if (method === "entities/archive_list") {
      return respond({
        st: true,
        entity_types: [data.entity_type].filter(Boolean),
        list: state.archived.filter((row) => row.entity_type === data.entity_type),
      });
    }

    if (method === "site-items/upload_image") {
      return respond({
        st: true,
        text: "Успешно сохранено",
        image_version: "E2E_SKLAD_VERSION",
        current_fields: {
          img_new: "E2E_SKLAD_2000x2000.jpg",
          img_new_update: "E2E_SKLAD_2000x2000.webp",
          img_app: "E2E_SKLAD",
        },
        urls: {
          jpg: ["https://storage.yandexcloud.net/mock/E2E_SKLAD_2000x2000.jpg"],
          webp: ["https://storage.yandexcloud.net/mock/E2E_SKLAD_2000x2000.webp"],
        },
      });
    }

    if (method === "history/get_one") {
      const snapshot = state.historySnapshots[Number(data.revision_key)] || null;
      const historyRows =
        data.entity_type === "site_item" ? state.siteItemHistory : state.productionHistory;
      return respond({
        st: Boolean(snapshot),
        revision: snapshot
          ? {
              ...historyRows.find((row) => Number(row.revision_key) === Number(data.revision_key)),
              snapshot,
            }
          : null,
      });
    }

    if (method === "history/schedule/cancel") {
      return respond({ st: true, revision_status: "cancelled" });
    }

    return respond({ st: true, list: [] });
  });

  return state;
}

module.exports = {
  FULL_ACCESS,
  installSkladMock,
};
