const FULL_ACCESS = {
  production_view: 1,
  production_edit: 1,
  production_create: 1,
  production_delete: 1,
  site_items_view: 1,
  site_items_edit: 1,
  site_items_create: 1,
  site_items_delete: 1,
  units_view: 1,
  units_edit: 1,
  units_create: 1,
  units_delete: 1,
  archive_view: 1,
  archive_edit: 1,
  history_view: 1,
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
        category_id: 30,
        category_name: "E2E_SKLAD_Салаты и закуски",
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
        all_items_list: [],
        history: { rows: [], capabilities: {}, meta: {} },
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

    if (method === "site-items/list") {
      const search = String(data.search || "")
        .trim()
        .toLocaleLowerCase("ru");
      return respond({
        st: true,
        categories: [{ id: 30, name: "E2E_SKLAD_Салаты и закуски" }],
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
        item: { date_start: "2026-08-01", is_show: 1, show_site: 1, show_program: 1 },
        cat_list: [{ id: 30, name: "E2E_SKLAD_Салаты и закуски" }],
        tags_all: bootstrap(state.access).tags,
      });
    }

    if (method === "site-items/get_one") {
      const item = state.siteItems.find((row) => Number(row.id) === Number(data.id)) || {};
      return respond({
        st: true,
        item,
        composition_source: { item_items: [], items_stage: [] },
        composition_derived: { item_items: [], items_stage: [] },
        history: { rows: [], capabilities: {}, meta: {} },
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

    return respond({ st: true, list: [] });
  });

  return state;
}

module.exports = {
  FULL_ACCESS,
  installSkladMock,
};
