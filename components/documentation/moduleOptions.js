export function unwrapDocumentationPayload(response) {
  if (response?.full_menu) {
    return response;
  }

  if (response?.data?.full_menu) {
    return response.data;
  }

  return response ?? {};
}

export function unwrapArticlePayload(response) {
  if (response?.data !== undefined) {
    return response.data ?? {};
  }

  return response ?? {};
}

export function buildHistoryLogItems(history) {
  return (Array.isArray(history) ? history : [])
    .filter((item) => item?.id != null)
    .map((item) => ({
      id: item.id,
      created_at: item.created_at,
      actor_name: item.user_name || "",
      event_type: item.action || "update",
      diff_json: JSON.stringify({
        text: { from: item.html_before || "", to: item.html_after || "" },
      }),
    }));
}

function compareRu(left, right) {
  return String(left || "").localeCompare(String(right || ""), "ru");
}

export function groupArticlesBySection(articles, modules) {
  const moduleByKey = new Map(
    (Array.isArray(modules) ? modules : []).map((module) => [module.key_query, module]),
  );
  const sections = new Map();

  (Array.isArray(articles) ? articles : []).forEach((article) => {
    if (!article?.module_key) {
      return;
    }

    const module = moduleByKey.get(article.module_key);
    const sectionName = module?.group || "Без раздела";
    const moduleName = module?.name || article.module_key;
    const articleGroup = String(article.group_name || "").trim() || "Без группы";
    const item = {
      ...article,
      title: String(article.title || moduleName).trim(),
      group: articleGroup,
      moduleName,
      module: module || null,
    };

    if (!sections.has(sectionName)) {
      sections.set(sectionName, {
        name: sectionName,
        sort: module?.groupSort ?? 999,
        modules: new Map(),
      });
    }

    const section = sections.get(sectionName);
    if (!section.modules.has(article.module_key)) {
      section.modules.set(article.module_key, {
        key: article.module_key,
        name: moduleName,
        sort: module?.sort ?? 999,
        groups: new Map(),
      });
    }

    const moduleBucket = section.modules.get(article.module_key);
    if (!moduleBucket.groups.has(articleGroup)) {
      moduleBucket.groups.set(articleGroup, { name: articleGroup, items: [] });
    }

    moduleBucket.groups.get(articleGroup).items.push(item);
  });

  return [...sections.values()]
    .map((section) => ({
      ...section,
      modules: [...section.modules.values()]
        .map((module) => ({
          ...module,
          groups: [...module.groups.values()]
            .map((group) => ({
              ...group,
              items: group.items.sort((left, right) => compareRu(left.title, right.title)),
            }))
            .sort((left, right) => {
              if (left.name === "Без группы") {
                return 1;
              }
              if (right.name === "Без группы") {
                return -1;
              }
              return compareRu(left.name, right.name);
            }),
        }))
        .sort((left, right) => left.sort - right.sort || compareRu(left.name, right.name)),
    }))
    .sort((left, right) => left.sort - right.sort || compareRu(left.name, right.name));
}

export function buildModuleOptions(fullMenu) {
  const items = Array.isArray(fullMenu) ? fullMenu : [];
  const parents = new Map();

  items.forEach((item) => {
    if (Number(item?.parent_id) !== 0) {
      return;
    }

    parents.set(Number(item.id), {
      name: String(item?.name || "").trim() || "Без раздела",
      sort: Number(item?.sort) || 0,
    });
  });

  return items
    .filter((item) => item?.key_query && Number(item?.parent_id) !== 0)
    .map((item) => {
      const parent = parents.get(Number(item.parent_id));
      const navs = Array.isArray(item.navs_id)
        ? item.navs_id
            .map((nav) => ({
              id: nav?.id,
              name: String(nav?.name || "").trim(),
            }))
            .filter((nav) => nav.name)
        : [];

      return {
        id: item.id,
        name: String(item.name || "").trim(),
        key_query: item.key_query,
        group: parent?.name || "Без раздела",
        groupSort: parent?.sort ?? 999,
        sort: Number(item.sort) || 0,
        navs,
      };
    })
    .filter((item) => item.name)
    .sort((left, right) => {
      if (left.groupSort !== right.groupSort) {
        return left.groupSort - right.groupSort;
      }

      const groupCompare = left.group.localeCompare(right.group, "ru");
      if (groupCompare !== 0) {
        return groupCompare;
      }

      if (left.sort !== right.sort) {
        return left.sort - right.sort;
      }

      return left.name.localeCompare(right.name, "ru");
    });
}

export function hasDocumentationAccess(access, key) {
  return Number(access?.[key]) === 1;
}

export function getDocumentationTitle(fullMenu) {
  const items = Array.isArray(fullMenu) ? fullMenu : [];
  const current = items.find((item) => item?.key_query === "documentation");
  const name = String(current?.name || "").trim();

  return name || "Документирование модулей";
}

export function getModulePath(option) {
  return option?.key_query ? `/${option.key_query}` : "";
}

export function filterModuleOptions(options, { inputValue }) {
  const query = String(inputValue || "")
    .trim()
    .toLowerCase();

  if (!query) {
    return options;
  }

  return options.filter((option) => {
    const name = String(option?.name || "").toLowerCase();
    const key = String(option?.key_query || "").toLowerCase();
    const group = String(option?.group || "").toLowerCase();

    return name.includes(query) || key.includes(query) || group.includes(query);
  });
}
