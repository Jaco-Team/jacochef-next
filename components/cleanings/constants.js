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
  {
    value: "templates",
    label: "Уборки",
    href: "/cleanings",
    description: "Шаблоны уборок, расписание, роли и статус активности.",
  },
  {
    value: "categories",
    label: "Категории",
    href: "/cleanings/categories",
    description: "Категории и инструкции, которыми группируются уборки.",
  },
  {
    value: "cafes",
    label: "Кафе",
    href: "/cleanings/cafes",
    description: "Привязка уборок к точкам и дополнительное время.",
  },
  {
    value: "control",
    label: "Контроль",
    href: "/cleanings/control",
    description: "Проверка выполненных уборок и заготовок по точке и периоду.",
  },
  {
    value: "lamps",
    label: "Лампы",
    href: "/cleanings/lamps",
    description: "Журнал работы бактерицидных ламп, активации и экспорт XLS.",
  },
];

export const controlKindTabs = [
  {
    value: "cleanings",
    label: "Уборки",
    href: "/cleanings/control/cleanings",
    description: "Выполненные уборки и действия подтверждения.",
  },
  {
    value: "preparations",
    label: "Заготовки",
    href: "/cleanings/control/preparations",
    description: "Объемы заготовок, отходы и подтверждение заготовок.",
  },
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
