export const days = [
  { value: "mon", label: "Понедельник" },
  { value: "tue", label: "Вторник" },
  { value: "wed", label: "Среда" },
  { value: "thu", label: "Четверг" },
  { value: "fri", label: "Пятница" },
  { value: "sat", label: "Суббота" },
  { value: "sun", label: "Воскресенье" },
];

export const cleaningSectionTabs = [
  { value: "templates", label: "Уборки", href: "/cleanings" },
  { value: "categories", label: "Категории", href: "/cleanings/categories" },
  { value: "cafes", label: "Кафе", href: "/cleanings/cafes" },
  { value: "control", label: "Контроль", href: "/cleanings/control" },
];

export const controlKindTabs = [
  { value: "cleanings", label: "Уборки", href: "/cleanings/control/cleanings" },
  { value: "preparations", label: "Заготовки", href: "/cleanings/control/preparations" },
];

export const defaultForm = {
  name: "",
  categoryId: null,
  role: "",
  roleId: null,
  duration: "",
  dopTime: "",
  activationCount: "",
  additionType: "",
  confirmation: false,
  scheduleType: "",
  triggerCleaningId: null,
  days: [],
  times: [],
  deleteTimes: [],
  is_not_del: false,
  is_need: false,
  locationIds: [],
  status: "active",
};
