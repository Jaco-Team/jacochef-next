function unwrapResponse(response, fallbackError) {
  if (!response || response.st !== true) {
    throw new Error(response?.text || fallbackError);
  }

  return response;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function createKitchenQueueApi(request) {
  return {
    async getAll() {
      const response = unwrapResponse(await request("get_all", {}), "Не удалось загрузить модуль");
      const rights = asObject(response.rights);

      return {
        moduleName: String(response?.module_info?.name || "Настройки распределения заказов"),
        rights: {
          settings_view: rights.settings_view === true,
          settings_edit: rights.settings_edit === true,
          settings_all_edit: rights.settings_all_edit === true,
          slots_view: rights.slots_view === true,
          slots_edit: rights.slots_edit === true,
        },
        points: asArray(response.points).map((point) => ({
          id: Number(point?.id) || 0,
          name: String(point?.name || ""),
        })),
        groups: asArray(response.groups),
        days: asArray(response.days),
        step: Number(response.step) || 15,
        maxCount: Number(response.max_count) || 99,
      };
    },

    async getSettings(pointId) {
      const response = unwrapResponse(
        await request("get_settings", { point_id: pointId }),
        "Не удалось загрузить параметры",
      );

      return { groups: asArray(response.groups), settings: asArray(response.settings) };
    },

    async getOverview() {
      const response = unwrapResponse(
        await request("get_overview", {}),
        "Не удалось загрузить сводку",
      );

      return {
        points: asArray(response.points).map((point) => ({
          id: Number(point?.id) || 0,
          name: String(point?.name || ""),
        })),
        groups: asArray(response.groups),
        rows: asArray(response.rows),
      };
    },

    async saveSettings(pointId, items, comment) {
      const response = unwrapResponse(
        await request("save_settings", { point_id: pointId, items, comment }),
        "Не удалось сохранить параметры",
      );

      return { changed: Number(response.changed) || 0 };
    },

    async getSettingsHistory(pointId) {
      const response = unwrapResponse(
        await request("get_settings_history", { point_id: pointId, limit: 200 }),
        "Не удалось загрузить историю",
      );

      return asArray(response.history);
    },

    async getSlots(pointId) {
      const response = unwrapResponse(
        await request("get_slots", { point_id: pointId }),
        "Не удалось загрузить лимиты слотов",
      );
      const defaultLimit = asObject(response.default_limit);

      return {
        slots: asArray(response.slots).map(String),
        enabled: response.enabled !== false,
        defaultLimit: {
          delivery: Number(defaultLimit.delivery) || 0,
          other: Number(defaultLimit.other) || 0,
        },
        week: asObject(response.week),
        dates: asArray(response.dates).map((item) => ({
          date: String(item?.date || ""),
          slots: asObject(item?.slots),
        })),
      };
    },

    async saveSlots(pointId, items) {
      const response = unwrapResponse(
        await request("save_slots", { point_id: pointId, items }),
        "Не удалось сохранить лимиты слотов",
      );

      return { changed: Number(response.changed) || 0 };
    },

    async deleteSlotsDate(pointId, date) {
      const response = unwrapResponse(
        await request("delete_slots_date", { point_id: pointId, date }),
        "Не удалось удалить дату",
      );

      return { changed: Number(response.changed) || 0 };
    },

    async getSlotsHistory(pointId) {
      const response = unwrapResponse(
        await request("get_slots_history", { point_id: pointId, limit: 200 }),
        "Не удалось загрузить историю",
      );

      return asArray(response.history);
    },
  };
}
