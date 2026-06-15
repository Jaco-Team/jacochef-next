import { days, locations } from "./constants";

export function getScheduleText(item) {
  const dayLabels =
    item.days?.length === days.length
      ? "Ежедневно"
      : item.days?.map((day) => days.find((d) => d.value === day)?.label).join(", ");
  return `${dayLabels || "Без дней"} · ${(item.times || []).join(", ") || "Без времени"}`;
}

export function getCategoryName(categories, categoryId) {
  return categories.find((category) => category.id === categoryId)?.name || "Без категории";
}

export function getTemplateLocationNames(locationIds = []) {
  return locations
    .filter((location) => locationIds.includes(location.id))
    .map(getLocationName)
    .join(", ");
}

export function buildCleaningHistory(item, categories) {
  if (!item) {
    return [];
  }

  const categoryName = getCategoryName(categories, item.categoryId);
  const locationsText = getTemplateLocationNames(item.locationIds) || "Не выбраны";

  return [
    {
      id: `${item.id}-schedule`,
      created_at: "2026-06-12T14:20:00",
      actor_name: "Винокуров М. Ю.",
      event_type: "update",
      diff_json: JSON.stringify({
        Расписание: {
          from: "Черновик",
          to: getScheduleText(item),
        },
        Длительность: {
          from: "",
          to: `${item.duration} мин`,
        },
      }),
    },
    {
      id: `${item.id}-locations`,
      created_at: "2026-06-12T13:40:00",
      actor_name: "Беседина Г. М.",
      event_type: "update",
      diff_json: JSON.stringify({
        Локации: {
          from: "Не выбраны",
          to: locationsText,
        },
      }),
    },
    {
      id: `${item.id}-created`,
      created_at: "2026-06-12T12:55:00",
      actor_name: "Система",
      event_type: "create",
      diff_json: JSON.stringify({
        Название: {
          from: "",
          to: item.name,
        },
        Категория: {
          from: "",
          to: categoryName,
        },
        Роль: {
          from: "",
          to: item.role,
        },
      }),
    },
  ];
}

export function getLocationName(location) {
  return `${location.name} — ${location.city}`;
}

export function formatControlTime(value) {
  if (!value) {
    return "—";
  }

  const time = String(value).split(" ").pop();
  const [hours, minutes] = time.split(":");

  return hours && minutes ? `${hours}:${minutes}` : value;
}

export function getControlStatusMeta(status) {
  const meta = {
    pending: {
      label: "Ожидает подтверждения",
      color: "#b45309",
      bgcolor: "#fff7ed",
      borderColor: "#fed7aa",
    },
    active: {
      label: "Активно",
      color: "#2563eb",
      bgcolor: "#eff6ff",
      borderColor: "#bfdbfe",
    },
    in_progress: {
      label: "В процессе",
      color: "#7c3aed",
      bgcolor: "#f5f3ff",
      borderColor: "#ddd6fe",
    },
    approved: {
      label: "Подтверждено",
      color: "#059669",
      bgcolor: "#ecfdf5",
      borderColor: "#a7f3d0",
    },
  };

  return meta[status] || meta.active;
}

export const tableHeaderSx = {
  bgcolor: "surface.muted",
  "& .MuiTableCell-root": {
    py: 1.25,
    color: "text.secondary",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: "uppercase",
    borderBottom: "1px solid",
    borderColor: "divider",
  },
};

export const tableRowSx = {
  "& .MuiTableCell-root": {
    py: 1.5,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  "&:hover": {
    bgcolor: "surface.muted",
  },
  "&:hover .cleaning-name-cell": {
    borderLeftColor: "primary.main",
  },
};
