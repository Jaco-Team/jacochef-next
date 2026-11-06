const EVENT_LABELS = {
  create: "Создание категории",
  update: "Изменение категории",
  delete: "Удаление категории",
};

function parseDiff(value) {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function displayValue(field, value, sourceType) {
  if (value === null || value === undefined || value === "") return null;
  if (field === "parent_id") {
    const numeric = Number(value);
    if (Number.isInteger(numeric)) {
      if (numeric === -1 && sourceType === "warehouse_item") return "Группа категорий";
      if (numeric === 0) return "Без родительской категории";
      if (numeric > 0) return `ID категории ${numeric}`;
    }
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function presentCategoryHistory(events, sourceType) {
  if (!Array.isArray(events)) return [];
  return events.map((event) => {
    const diff = parseDiff(event?.diff_json);
    const result = {
      Действие: { from: null, to: EVENT_LABELS[event?.event_type] || "Событие категории" },
    };
    if (diff) {
      for (const [field, change] of Object.entries(diff)) {
        if (!change || typeof change !== "object") continue;
        const label =
          field === "name"
            ? "Название"
            : field === "parent_id"
              ? sourceType === "warehouse_item"
                ? "Родительская группа"
                : "Родительская категория"
              : `Поле «${field}»`;
        const from = displayValue(field, change.from, sourceType);
        const to = displayValue(field, change.to, sourceType);
        result[label] = { from, to: to ?? "—" };
      }
    } else {
      result["Подробности"] = { from: null, to: "Недоступны" };
    }
    return { ...event, actor_name: event?.actor_name || "Неизвестно", diff_json: result };
  });
}
