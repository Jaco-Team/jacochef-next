import {
  normalizeCategories,
  normalizeHistoryEvent,
  normalizeSummary,
  getReadableError,
} from "./closeBuyUtils";

function unwrapResponse(response, fallbackError) {
  if (!response || response.st !== true) {
    throw new Error(response?.text || fallbackError);
  }

  return response;
}

export function createCloseBuyApi(request) {
  return {
    async getAll() {
      const response = unwrapResponse(
        await request("get_all", {}),
        "Не удалось загрузить точки Close Buy",
      );

      return {
        moduleName: String(response?.module_info?.name || "Управление товарами"),
        points: Array.isArray(response?.points)
          ? response.points.map((point) => ({
              id: Number(point?.id) || 0,
              name: String(point?.name || ""),
              base: point?.base || null,
              city_id: point?.city_id ?? null,
            }))
          : [],
        access:
          response?.access && typeof response.access === "object" ? { ...response.access } : {},
      };
    },

    async getItems(payload) {
      const response = unwrapResponse(
        await request("get_items", payload),
        "Не удалось загрузить категории",
      );
      const categories = normalizeCategories(response?.categories);

      return {
        point_id: Number(response?.point_id ?? payload?.point_id) || 0,
        categories,
        summary: normalizeSummary(response?.summary, categories),
      };
    },

    async getHistory(payload) {
      const response = unwrapResponse(
        await request("get_history", payload),
        "Не удалось загрузить историю",
      );

      return {
        history: Array.isArray(response?.history)
          ? response.history.map(normalizeHistoryEvent)
          : [],
        pagination:
          response?.pagination && typeof response.pagination === "object"
            ? {
                page: Number(response.pagination.page) || 1,
                per_page: Number(response.pagination.per_page) || payload?.per_page || 20,
                total: Number(response.pagination.total) || 0,
                last_page: Number(response.pagination.last_page) || 1,
              }
            : {
                page: Number(payload?.page) || 1,
                per_page: Number(payload?.per_page) || 20,
                total: 0,
                last_page: 1,
              },
      };
    },

    async saveItem(payload) {
      const response = unwrapResponse(
        await request("save_item", payload),
        "Не удалось сохранить товар",
      );

      return {
        point_id: Number(response?.point_id ?? payload?.point_id) || 0,
        category_id: Number(response?.category_id) || null,
        history_id: Number(response?.history_id) || null,
        changed_items: Array.isArray(response?.changed_items) ? [...response.changed_items] : [],
        categories: normalizeCategories(response?.categories),
        text: response?.text || "Состояние товара обновлено",
      };
    },

    async saveCategory(payload) {
      const response = unwrapResponse(
        await request("save_category", payload),
        "Не удалось сохранить категорию",
      );

      return {
        point_id: Number(response?.point_id ?? payload?.point_id) || 0,
        category_id: Number(response?.category_id ?? payload?.category_id) || 0,
        history_id: Number(response?.history_id) || null,
        changed_items: Array.isArray(response?.changed_items) ? [...response.changed_items] : [],
        categories: normalizeCategories(response?.categories),
        text: response?.text || "Состояние категории обновлено",
      };
    },
  };
}

export { getReadableError };
